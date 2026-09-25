#!/usr/bin/env python3
"""Pannello di controllo locale del sito di Erasmo Stasolla."""
from __future__ import annotations

import hashlib
import json
import os
import posixpath
import re
import secrets
import subprocess
import sys
import threading
import time
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from html import escape as h
from urllib.parse import parse_qs, urlparse

from render import PublicRenderer, inject_main

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
CONTENT_FILE = DATA / "content.json"
ADMIN_FILE = DATA / "admin.json"
UPLOADS = ROOT / "assets" / "uploads"
PORT = int(os.environ.get("CMS_PORT", "8787"))
DEFAULT_USER = "admin"
DEFAULT_PASSWORD = "Stasolla2026"
SESSION_HOURS = 12

sessions: dict[str, float] = {}
login_attempts: dict[str, list[float]] = {}
lock = threading.Lock()


def hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 180_000).hex()


def load_admin() -> dict:
    if not ADMIN_FILE.exists():
        salt = secrets.token_hex(16)
        data = {
            "user": DEFAULT_USER,
            "salt": salt,
            "password_hash": hash_password(DEFAULT_PASSWORD, salt),
            "must_change": True,
        }
        ADMIN_FILE.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        return data
    return json.loads(ADMIN_FILE.read_text(encoding="utf-8"))


def save_admin(data: dict) -> None:
    ADMIN_FILE.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def new_session() -> str:
    token = secrets.token_hex(32)
    sessions[token] = time.time() + SESSION_HOURS * 3600
    return token


def valid_session(token: str | None) -> bool:
    if not token:
        return False
    exp = sessions.get(token)
    if not exp:
        return False
    if exp < time.time():
        sessions.pop(token, None)
        return False
    return True


def cookie_token(handler) -> str | None:
    raw = handler.headers.get("Cookie", "")
    for part in raw.split(";"):
        if "=" in part:
            k, v = part.strip().split("=", 1)
            if k == "cms_session":
                return v
    return None


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = value.replace("à", "a").replace("è", "e").replace("é", "e")
    value = value.replace("ì", "i").replace("ò", "o").replace("ù", "o")
    value = value.replace("’", "").replace("'", "")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:80] or "pagina"


def depth_of(slug: str) -> int:
    slug = (slug or "").strip("/")
    if not slug:
        return 0
    return slug.count("/") + 1


def page_shell(page_id: str, slug: str, book: str = "") -> str:
    root = "../" * depth_of(slug)
    book_attr = f' data-book="{book}"' if book else ""
    return f"""<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#141b21"><title>Erasmo Stasolla</title><link rel="icon" href="{root}assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="{root}assets/editorial.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="{root}assets/styles.css?v=share18"><script src="{root}assets/site.js?v=share18" defer></script><script src="{root}assets/cms-render.js?v=share18" defer></script></head>
<body data-page="{page_id}"{book_attr} data-root="{root}"><!-- pagina gestita dal pannello --><a class="skip" href="#contenuto">Vai al contenuto</a><header class="site-header"><div class="container header-inner"><a class="brand" href="{root}index.html">Erasmo Stasolla<small>Romanzi · Storia · Memoria</small></a><button class="menu-button" type="button" aria-controls="main-nav" aria-expanded="false">Menu</button><nav class="nav" id="main-nav" aria-label="Navigazione principale"></nav></div></header><main id="contenuto"></main><footer class="site-footer"></footer></body></html>
"""


def site_base(content: dict) -> str:
    return ((content.get("site") or {}).get("baseUrl") or "https://erasmostasolla.it").rstrip("/")


def abs_url(content: dict, path: str = "") -> str:
    path = (path or "").lstrip("/")
    return f"{site_base(content)}/{path}" if path else site_base(content) + "/"


def image_abs(content: dict, path: str | None) -> str:
    site = content.get("site") or {}
    chosen = path or site.get("shareImage") or "assets/og-share.jpg"
    if str(chosen).startswith("http"):
        return str(chosen)
    return abs_url(content, str(chosen).lstrip("/"))


def _book_cover(content: dict, book_id: str | None) -> str:
    if not book_id:
        return ""
    for book in content.get("books") or []:
        if book.get("id") == book_id and book.get("status") == "published":
            return str(book.get("cover") or "")
    return ""


def page_featured_image(content: dict, page: dict) -> str:
    """Prima foto in evidenza della pagina (hero, romanzo, bio, galleria)."""
    site = content.get("site") or {}
    for section in page.get("sections") or []:
        if section.get("visible") is False:
            continue
        kind = section.get("type")
        data = section.get("data") or {}
        if kind == "hero":
            return str(data.get("image") or site.get("portrait") or "")
        if kind in {"bio", "imageText", "encounters", "heading", "text", "cta", "pressQuote"}:
            if data.get("image"):
                return str(data["image"])
        if kind in {"featuredBook", "purchases"}:
            cover = _book_cover(content, data.get("bookId"))
            if cover:
                return cover
        if kind == "pressHighlight":
            press = next((p for p in (content.get("press") or []) if p.get("id") == data.get("pressId")), None)
            if not press:
                press = next((p for p in (content.get("press") or []) if p.get("featured")), None)
            if press:
                cover = _book_cover(content, press.get("bookId"))
                if cover:
                    return cover
        if kind == "gallery":
            for item in data.get("items") or []:
                if item.get("src"):
                    return str(item["src"])
    return ""


def social_image(content: dict, share: str | None, featured: str | None) -> tuple[str, bool]:
    """Percorso social esplicito, altrimenti foto in evidenza, altrimenti immagine di sito."""
    if share:
        return image_abs(content, share), True
    if featured:
        return image_abs(content, featured), False
    return image_abs(content, None), True


def social_same_as(site: dict) -> list[str]:
    keys = ("facebook", "instagram", "youtube", "tiktok", "x", "threads", "linkedin")
    return [str(site[k]).strip() for k in keys if site.get(k)]


def isbn_digits(value) -> str:
    return "".join(ch for ch in str(value or "") if ch.isdigit())


def book_json_ld(book: dict, url: str, cover_image: str, same: list[str]) -> dict:
    ld = {
        "@context": "https://schema.org",
        "@type": "Book",
        "name": book.get("title"),
        "author": {"@type": "Person", "name": "Erasmo Stasolla", "sameAs": same},
        "inLanguage": "it",
        "url": url,
        "image": cover_image,
        "bookFormat": "https://schema.org/Paperback",
    }
    if book.get("summary"):
        ld["description"] = book["summary"]
    if book.get("publisher"):
        ld["publisher"] = {"@type": "Organization", "name": book["publisher"]}
    if book.get("year"):
        ld["datePublished"] = str(book["year"])
    pages = str(book.get("pages") or "").strip()
    if pages:
        ld["numberOfPages"] = int(pages) if pages.isdigit() else pages
    if book.get("genre"):
        ld["genre"] = book["genre"]
    isbn = isbn_digits(book.get("isbn"))
    if isbn:
        ld["isbn"] = isbn
    offer_url = book.get("amazon") or book.get("publisherUrl")
    if offer_url:
        ld["offers"] = {
            "@type": "Offer",
            "url": offer_url,
            "availability": "https://schema.org/InStock",
        }
    return ld


def seo_head(title: str, desc: str, url: str, image: str, kind: str = "website", robots: str | None = None, sized: bool = True) -> str:
    title, desc, url, image = h(title), h(desc), h(url), h(image)
    extra = f'<meta name="robots" content="{h(robots)}">' if robots else ""
    dims = '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">' if sized else ""
    return f"""<title>{title}</title><meta name="description" content="{desc}"><link rel="canonical" href="{url}">{extra}<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:type" content="{kind}"><meta property="og:locale" content="it_IT"><meta property="og:site_name" content="Erasmo Stasolla"><meta property="og:url" content="{url}"><meta property="og:image" content="{image}">{dims}<meta property="og:image:alt" content="{title}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{desc}"><meta name="twitter:image" content="{image}">"""


def inject_seo(html: str, block: str, ld: str) -> str:
    html = re.sub(r"<title>.*?</title>", "", html, count=1, flags=re.I | re.S)
    html = re.sub(r'<meta\s+name=["\']robots["\'][^>]*>', "", html, flags=re.I)
    html = re.sub(r'<meta\s+name=["\']description["\'][^>]*>', "", html, flags=re.I)
    html = re.sub(r'<link rel="canonical"[^>]*>', "", html, flags=re.I)
    html = re.sub(r'<meta property="og:[^"]+"[^>]*>', "", html, flags=re.I)
    html = re.sub(r'<meta name="twitter:[^"]+"[^>]*>', "", html, flags=re.I)
    html = re.sub(r'<script type="application/ld\+json">.*?</script>', "", html, flags=re.I | re.S)
    payload = block + ld
    updated, n = re.subn(r'(<meta\s+name=["\']viewport["\'][^>]*>)', r"\1" + payload, html, count=1, flags=re.I)
    if n:
        return updated
    return re.sub(r"(<head[^>]*>)", r"\1" + payload, html, count=1, flags=re.I)


def write_robots_and_sitemap(content: dict) -> None:
    base = site_base(content)
    (ROOT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /data/\nSitemap: {base}/sitemap.xml\n",
        encoding="utf-8",
    )
    urls = [base + "/"]
    for page in content.get("pages", []):
        slug = (page.get("slug") or "").strip("/")
        if slug:
            urls.append(f"{base}/{slug}/")
    for book in content.get("books", []):
        if book.get("status") != "published":
            continue
        slug = slugify(book.get("slug") or book.get("title") or "romanzo")
        urls.append(f"{base}/romanzi/{slug}/")
    body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for u in urls:
        body += f"  <url><loc>{h(u)}</loc></url>\n"
    body += "</urlset>\n"
    (ROOT / "sitemap.xml").write_text(body, encoding="utf-8")


def refresh_seo(content: dict) -> None:
    site = content.get("site") or {}
    default_desc = site.get("tagline") or "Romanzi, storia e memoria."
    same = social_same_as(site)
    person = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": site.get("name") or "Erasmo Stasolla",
        "url": site_base(content) + "/",
        "jobTitle": "Scrittore",
        "image": image_abs(content, site.get("portrait")),
        "sameAs": same,
    }
    wa = "".join(ch for ch in str(site.get("whatsapp") or "") if ch.isdigit())
    if wa.startswith("00"):
        wa = wa[2:]
    if wa and not wa.startswith("39") and len(wa) == 10:
        wa = "39" + wa
    if wa:
        person["telephone"] = "+" + wa
    website = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": site.get("name") or "Erasmo Stasolla",
        "url": site_base(content) + "/",
        "inLanguage": "it-IT",
        "author": {"@type": "Person", "name": site.get("name") or "Erasmo Stasolla", "sameAs": same},
    }
    for page in content.get("pages", []):
        slug = (page.get("slug") or "").strip("/")
        path = ROOT / "index.html" if not slug else ROOT.joinpath(*slug.split("/")) / "index.html"
        if not path.exists():
            continue
        title = page.get("seoTitle") or f"{page.get('title') or 'Pagina'} | Erasmo Stasolla"
        desc = page.get("seoDescription") or default_desc
        url = abs_url(content, slug + "/" if slug else "")
        image, sized = social_image(content, page.get("shareImage"), page_featured_image(content, page))
        ld = f'<script type="application/ld+json">{json.dumps(website if not slug else person, ensure_ascii=False)}</script>'
        renderer = PublicRenderer(content, "../" * depth_of(slug))
        html = inject_main(path.read_text(encoding="utf-8"), renderer.render_page(page))
        html = inject_seo(html, seo_head(title, desc, url, image, sized=sized), ld)
        path.write_text(html, encoding="utf-8")
    for book in content.get("books", []):
        slug = slugify(book.get("slug") or book.get("title") or "romanzo")
        path = ROOT / "romanzi" / slug / "index.html"
        if not path.exists():
            continue
        url = abs_url(content, f"romanzi/{slug}/")
        renderer = PublicRenderer(content, "../" * depth_of(f"romanzi/{slug}"))
        html = inject_main(path.read_text(encoding="utf-8"), renderer.render_book(book.get("id") or slug))
        if book.get("status") != "published":
            html = inject_seo(
                html,
                seo_head("Erasmo Stasolla", default_desc, url, image_abs(content, site.get("shareImage")), "website", "noindex, nofollow"),
                "",
            )
            path.write_text(html, encoding="utf-8")
            continue
        title = f"{book.get('title') or 'Romanzo'} | Erasmo Stasolla"
        desc = book.get("summary") or book.get("intro") or default_desc
        og_image, sized = social_image(content, book.get("shareImage"), book.get("cover"))
        cover_image = image_abs(content, book.get("cover") or site.get("shareImage"))
        book_ld = book_json_ld(book, url, cover_image, same)
        ld = f'<script type="application/ld+json">{json.dumps(book_ld, ensure_ascii=False)}</script>'
        html = inject_seo(html, seo_head(title, desc, url, og_image, "book", sized=sized), ld)
        path.write_text(html, encoding="utf-8")
    write_robots_and_sitemap(content)


def sync_files(content: dict) -> None:
    """Crea le cartelle HTML per pagine e romanzi nuovi e aggiorna la SEO."""
    reserved = {"admin", "data", "assets"}
    for page in content.get("pages", []):
        slug = (page.get("slug") or "").strip("/")
        if not slug or slug.split("/")[0] in reserved:
            continue
        path = ROOT.joinpath(*slug.split("/")) / "index.html"
        if not path.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(page_shell(page["id"], slug), encoding="utf-8")
    for book in content.get("books", []):
        slug = slugify(book.get("slug") or book.get("title") or "romanzo")
        path = ROOT / "romanzi" / slug / "index.html"
        if not path.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(page_shell("book", f"romanzi/{slug}", book.get("id") or slug), encoding="utf-8")
    refresh_seo(content)


def json_response(handler, status: int, payload: dict) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(body)


def read_body(handler) -> bytes:
    length = int(handler.headers.get("Content-Length") or 0)
    if length > 22_000_000:
        raise ValueError("payload troppo grande")
    return handler.rfile.read(length) if length else b""


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_IMAGE_EDGE = 2400


def image_orient(width: int, height: int) -> str:
    if not width or not height:
        return ""
    ratio = width / height
    if 0.92 <= ratio <= 1.08:
        return "square"
    return "landscape" if width > height else "portrait"


def size_from_bytes(blob: bytes) -> tuple[int, int]:
    if len(blob) < 24:
        return 0, 0
    if blob[:8] == b"\x89PNG\r\n\x1a\n":
        return int.from_bytes(blob[16:20], "big"), int.from_bytes(blob[20:24], "big")
    if blob[:6] in (b"GIF87a", b"GIF89a"):
        return int.from_bytes(blob[6:8], "little"), int.from_bytes(blob[8:10], "little")
    if blob[:2] == b"\xff\xd8":
        i, n = 2, len(blob)
        while i < n - 8:
            if blob[i] != 0xFF:
                i += 1
                continue
            marker = blob[i + 1]
            if marker in {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}:
                return int.from_bytes(blob[i + 7 : i + 9], "big"), int.from_bytes(blob[i + 5 : i + 7], "big")
            if marker in {0xD8, 0xD9, 0x01} or 0xD0 <= marker <= 0xD7:
                i += 2
                continue
            if i + 3 >= n:
                break
            i += 2 + int.from_bytes(blob[i + 2 : i + 4], "big")
        return 0, 0
    if blob[:4] == b"RIFF" and blob[8:12] == b"WEBP":
        kind = blob[12:16]
        if kind == b"VP8X" and len(blob) >= 30:
            return 1 + int.from_bytes(blob[24:27], "little"), 1 + int.from_bytes(blob[27:30], "little")
        if kind == b"VP8 " and len(blob) >= 30:
            return int.from_bytes(blob[26:28], "little") & 0x3FFF, int.from_bytes(blob[28:30], "little") & 0x3FFF
        if kind == b"VP8L" and len(blob) >= 25:
            bits = int.from_bytes(blob[21:25], "little")
            return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    return 0, 0


def sips_size(path: Path) -> tuple[int, int]:
    try:
        out = subprocess.run(
            ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
            capture_output=True,
            text=True,
            timeout=20,
        )
        width = height = 0
        for line in out.stdout.splitlines():
            if "pixelWidth" in line:
                width = int(line.split()[-1])
            elif "pixelHeight" in line:
                height = int(line.split()[-1])
        return width, height
    except Exception:
        return 0, 0


def prepare_image(path: Path, blob: bytes) -> tuple[int, int]:
    try:
        subprocess.run(
            ["sips", "-Z", str(MAX_IMAGE_EDGE), str(path)],
            capture_output=True,
            timeout=40,
            check=False,
        )
    except Exception:
        pass
    width, height = sips_size(path)
    if width and height:
        return width, height
    return size_from_bytes(path.read_bytes() if path.exists() else blob)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), format % args))

    def translate_path(self, path: str) -> str:
        parsed = urlparse(path)
        rel = posixpath.normpath(parsed.path.lstrip("/"))
        if rel in {"data/admin.json", "admin.json"} or rel.endswith("/admin.json"):
            return str(ROOT / "data" / ".forbidden")
        return super().translate_path(path)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/session":
            ok = valid_session(cookie_token(self))
            admin = load_admin()
            return json_response(self, 200, {
                "ok": ok,
                "user": admin.get("user") if ok else None,
                "mustChange": bool(admin.get("must_change")) if ok else False,
            })
        if parsed.path == "/api/content":
            if not CONTENT_FILE.exists():
                return json_response(self, 404, {"error": "contenuto assente"})
            data = json.loads(CONTENT_FILE.read_text(encoding="utf-8"))
            return json_response(self, 200, data)
        if parsed.path == "/api/media":
            if not valid_session(cookie_token(self)):
                return json_response(self, 401, {"error": "accesso richiesto"})
            files = []
            for folder in (ROOT / "assets", UPLOADS):
                if not folder.exists():
                    continue
                for p in sorted(folder.iterdir()):
                    if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf", ".txt"} and p.is_file():
                        rel = p.relative_to(ROOT).as_posix()
                        files.append({"path": rel, "name": p.name})
            return json_response(self, 200, {"files": files})
        if parsed.path in {"/admin", "/admin/"}:
            self.path = "/admin/index.html"
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/login":
            return self.handle_login()
        if parsed.path == "/api/logout":
            token = cookie_token(self)
            if token:
                sessions.pop(token, None)
            self.send_response(200)
            self.send_header("Set-Cookie", "cms_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return
        if not valid_session(cookie_token(self)):
            return json_response(self, 401, {"error": "accesso richiesto"})
        if parsed.path == "/api/password":
            return self.handle_password()
        if parsed.path == "/api/upload":
            return self.handle_upload()
        if parsed.path == "/api/content":
            return self.handle_save()
        return json_response(self, 404, {"error": "non trovato"})

    def handle_login(self):
        ip = self.client_address[0]
        now = time.time()
        with lock:
            stamps = [t for t in login_attempts.get(ip, []) if now - t < 600]
            if len(stamps) >= 20:
                return json_response(self, 429, {"error": "Troppi tentativi. Riprova tra qualche minuto."})
            stamps.append(now)
            login_attempts[ip] = stamps
        raw = read_body(self)
        ctype = (self.headers.get("Content-Type") or "").lower()
        is_form = "application/json" not in ctype
        try:
            if is_form:
                parsed_body = parse_qs(raw.decode("utf-8"), keep_blank_values=True)
                payload = {k: (v[0] if v else "") for k, v in parsed_body.items()}
            else:
                payload = json.loads(raw.decode("utf-8"))
        except Exception:
            return json_response(self, 400, {"error": "Richiesta non valida"})
        user = str(payload.get("user") or "").strip()
        password = str(payload.get("password") or "").strip()
        admin = load_admin()
        expected = hash_password(password, admin["salt"])
        stored = admin.get("password_hash") or ""
        user_ok = user.lower() == str(admin.get("user") or "").strip().lower()
        hash_ok = len(expected) == len(stored) and secrets.compare_digest(expected, stored)
        if not user_ok or not hash_ok:
            if is_form:
                self.send_response(303)
                self.send_header("Location", "/#accesso?errore=1")
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                return
            return json_response(self, 401, {"error": "Nome utente o password non corretti"})
        token = new_session()
        cookie = f"cms_session={token}; Path=/; Max-Age={SESSION_HOURS * 3600}; HttpOnly; SameSite=Lax"
        if is_form:
            self.send_response(303)
            self.send_header("Location", "/admin/")
            self.send_header("Set-Cookie", cookie)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return
        body = json.dumps({"ok": True, "mustChange": bool(admin.get("must_change"))}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Set-Cookie", cookie)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_password(self):
        try:
            payload = json.loads(read_body(self).decode("utf-8"))
        except Exception:
            return json_response(self, 400, {"error": "Richiesta non valida"})
        current = str(payload.get("current") or "")
        new = str(payload.get("new") or "")
        if len(new) < 8:
            return json_response(self, 400, {"error": "La nuova password deve avere almeno 8 caratteri"})
        admin = load_admin()
        expected = hash_password(current, admin["salt"])
        if not secrets.compare_digest(expected, admin["password_hash"]):
            return json_response(self, 401, {"error": "Password attuale non corretta"})
        salt = secrets.token_hex(16)
        admin["salt"] = salt
        admin["password_hash"] = hash_password(new, salt)
        admin["must_change"] = False
        if payload.get("user"):
            admin["user"] = str(payload["user"]).strip() or admin["user"]
        save_admin(admin)
        return json_response(self, 200, {"ok": True})

    def handle_save(self):
        try:
            payload = json.loads(read_body(self).decode("utf-8"))
        except Exception:
            return json_response(self, 400, {"error": "JSON non valido"})
        if not isinstance(payload, dict) or "pages" not in payload:
            return json_response(self, 400, {"error": "Struttura contenuti non valida"})
        DATA.mkdir(exist_ok=True)
        CONTENT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        sync_files(payload)
        return json_response(self, 200, {"ok": True})

    def handle_upload(self):
        try:
            payload = json.loads(read_body(self).decode("utf-8"))
        except Exception:
            return json_response(self, 400, {"error": "Richiesta non valida"})
        name = Path(str(payload.get("filename") or "file")).name
        name = re.sub(r"[^A-Za-z0-9._-]", "-", name)
        ext = Path(name).suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf", ".txt"}:
            return json_response(self, 400, {"error": "Formato file non consentito"})
        import base64
        raw = str(payload.get("data") or "")
        if "," in raw:
            raw = raw.split(",", 1)[1]
        try:
            blob = base64.b64decode(raw)
        except Exception:
            return json_response(self, 400, {"error": "File non leggibile"})
        if len(blob) > 16_000_000:
            return json_response(self, 400, {"error": "Il file supera i 16 MB"})
        UPLOADS.mkdir(parents=True, exist_ok=True)
        dest = UPLOADS / name
        if dest.exists():
            dest = UPLOADS / f"{dest.stem}-{secrets.token_hex(3)}{dest.suffix}"
        dest.write_bytes(blob)
        rel = dest.relative_to(ROOT).as_posix()
        width = height = 0
        orientation = ""
        if ext in IMAGE_EXTS:
            width, height = prepare_image(dest, blob)
            orientation = image_orient(width, height)
        return json_response(self, 200, {
            "ok": True,
            "path": rel,
            "width": width or "",
            "height": height or "",
            "orientation": orientation,
        })


def main():
    DATA.mkdir(exist_ok=True)
    UPLOADS.mkdir(parents=True, exist_ok=True)
    load_admin()
    if not CONTENT_FILE.exists():
        print("Manca data/content.json", file=sys.stderr)
        sys.exit(1)
    try:
        refresh_seo(json.loads(CONTENT_FILE.read_text(encoding="utf-8")))
    except Exception as exc:
        print("SEO non aggiornata:", exc, file=sys.stderr)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://127.0.0.1:{PORT}/admin/"
    print()
    print("  Pannello di controllo")
    print(f"  {url}")
    print(f"  Sito:            http://127.0.0.1:{PORT}/")
    print(f"  Utente:          {DEFAULT_USER}")
    print(f"  Password iniziale: {DEFAULT_PASSWORD}")
    print("  (cambiala dopo il primo accesso)")
    print()
    print("  Lascia questa finestra aperta. Chiudila per spegnere il pannello.")
    print()
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nPannello chiuso.")


if __name__ == "__main__":
    main()
