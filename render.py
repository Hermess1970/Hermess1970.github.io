"""HTML pubblico delle pagine, allineato a cms-render.js (builderMode = false)."""
from __future__ import annotations

import re


def esc(v) -> str:
    return (
        str(v if v is not None else "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def rich(v) -> str:
    return re.sub(r"\*(.+?)\*", r"<em>\1</em>", esc(v).replace("\n", "<br>"))


def paras(v) -> str:
    chunks = [p for p in re.split(r"\n\n+", str(v or "")) if p]
    out = []
    for p in chunks:
        inner = esc(p).replace("\n", "<br>")
        inner = re.sub(r"\*(.+?)\*", r"<em>\1</em>", inner)
        out.append(f"<p>{inner}</p>")
    return "".join(out)


def find(lst, item_id):
    for x in lst or []:
        if x.get("id") == item_id:
            return x
    return None


def book_live(book) -> bool:
    return bool(book and book.get("status") == "published")


def image_focus(focus: str | None) -> str:
    return {
        "center": "center",
        "top": "center top",
        "bottom": "center bottom",
        "left": "left center",
        "right": "right center",
    }.get(focus or "", "center")


def image_orient(w, h, stored=None) -> str:
    if stored:
        return str(stored)
    try:
        nw, nh = float(w), float(h)
    except (TypeError, ValueError):
        return ""
    if not nw or not nh:
        return ""
    r = nw / nh
    if 0.92 < r < 1.08:
        return "square"
    return "landscape" if nw > nh else "portrait"


def video_embed(url: str) -> str:
    yt = re.search(r"(?:youtu\.be/|v=|embed/)([\w-]{11})", str(url or ""))
    if yt:
        return "https://www.youtube-nocookie.com/embed/" + yt.group(1)
    vimeo = re.search(r"vimeo\.com/(?:video/)?(\d+)", str(url or ""))
    if vimeo:
        return "https://player.vimeo.com/video/" + vimeo.group(1)
    return ""


def inject_main(html: str, inner: str) -> str:
    updated, n = re.subn(
        r'(<main\s+id=["\']contenuto["\'][^>]*>).*?(</main>)',
        lambda m: m.group(1) + inner + m.group(2),
        html,
        count=1,
        flags=re.I | re.S,
    )
    return updated if n else html


class PublicRenderer:
    def __init__(self, content: dict, root: str = ""):
        self.content = content or {}
        self.root = root or ""

    def href(self, path: str | None) -> str:
        root = self.root
        if not path:
            return root + "index.html"
        if re.match(r"^(https?:|mailto:|#)", path, re.I):
            return path
        hash_part = "#" + "#".join(path.split("#")[1:]) if "#" in path else ""
        p = path.split("#")[0].lstrip("/")
        if re.match(r"^assets/", p) or re.search(r"\.(html|pdf|txt|jpg|jpeg|png|webp|svg)$", p, re.I):
            return root + p + hash_part
        if not p:
            return root + "index.html" + hash_part
        return root + p.rstrip("/") + "/index.html" + hash_part

    def asset(self, path: str | None) -> str:
        if not path:
            return ""
        if re.match(r"^https?:", path, re.I):
            return path
        return self.root + str(path).lstrip("/")

    def ext(self, href_val: str | None) -> str:
        return ' target="_blank" rel="noopener noreferrer"' if re.match(r"^https?:", href_val or "", re.I) else ""

    def arrow(self, href_val: str | None) -> str:
        return "↗" if re.match(r"^https?:", href_val or "", re.I) else "→"

    def book_path(self, book: dict) -> str:
        return "romanzi/" + (book.get("slug") or book.get("id") or "") + "/"

    def buy_anchor(self, book: dict) -> str:
        return "acquista-" + (book.get("slug") or book.get("id") or "")

    def buy_href(self, book: dict) -> str:
        return book.get("amazon") or book.get("publisherUrl") or ("acquista/#" + self.buy_anchor(book))

    def buy_link(self, book: dict, label: str) -> str:
        url = self.buy_href(book)
        outside = bool(re.match(r"^https?:", url, re.I))
        extra = self.ext(url) if outside else ""
        sr = '<span class="sr-only"> (si apre in una nuova scheda)</span>' if outside else ""
        dest = esc(url) if outside else self.href(url)
        mark = "↗" if outside else "→"
        return (
            f'<a class="text-link" href="{dest}"{extra}>{esc(label)}'
            f'<span class="arrow" aria-hidden="true">{mark}</span>{sr}</a>'
        )

    def press_visible(self, item: dict | None) -> bool:
        if not item:
            return False
        if not item.get("bookId"):
            return True
        book = find(self.content.get("books"), item.get("bookId"))
        return not book or book_live(book)

    def press_items(self, d: dict | None = None) -> list:
        d = d or {}
        out = []
        for p in self.content.get("press") or []:
            if not self.press_visible(p):
                continue
            if d.get("bookId") and p.get("bookId") != d.get("bookId"):
                continue
            if d.get("topic") and (p.get("topic") or "libro") != d.get("topic"):
                continue
            if d.get("eventId") and p.get("eventId") != d.get("eventId"):
                continue
            out.append(p)
        return out

    def press_article(self, p: dict) -> str:
        date = f'<span>{esc(p.get("dateLabel"))}</span>' if p.get("dateLabel") else ""
        summary = f'<p>{esc(p.get("summary"))}</p>' if p.get("summary") else ""
        return (
            f'<article class="press-item">'
            f'<div class="press-source">{esc(p.get("source") or "")}{date}</div>'
            f'<div><h3>{esc(p.get("title"))}</h3>{summary}</div>'
            f'<a class="text-link" href="{self.href(p.get("href"))}"{self.ext(p.get("href") or "")} '
            f'aria-label="{esc(p.get("title"))}"><span class="arrow" aria-hidden="true">↗</span></a>'
            f"</article>"
        )

    def img_meta(self, d: dict, prefix: str = "image") -> dict:
        w = d.get(prefix + "Width")
        h = d.get(prefix + "Height")
        orient = image_orient(w, h, d.get(prefix + "Orient"))
        fit = d.get(prefix + "Fit") or ""
        dim = f' width="{esc(w)}" height="{esc(h)}"' if w and h else ""
        frame_cls = " ".join(x for x in ((("orient-" + orient) if orient else ""), (("fit-" + fit) if fit else "")) if x)
        return {"w": w, "h": h, "orient": orient, "fit": fit, "dim": dim, "frameCls": frame_cls}

    def photo_fig(self, d: dict, extra_class: str = "") -> str:
        if not d.get("image"):
            return ""
        pos = image_focus(d.get("imageFocus"))
        meta = self.img_meta(d, "image")
        cls = " ".join(x for x in ("sec-photo", extra_class, meta["frameCls"]) if x)
        orient_attr = f' data-orient="{esc(meta["orient"])}"' if meta["orient"] else ""
        fit_attr = f' data-fit="{esc(meta["fit"])}"' if meta["fit"] else ""
        alt = esc(d.get("imageAlt") or d.get("alt") or d.get("caption") or "")
        return (
            f'<figure class="{cls}"{orient_attr}>'
            f'<img class="smart-img" src="{self.asset(d.get("image"))}" alt="{alt}" '
            f'style="object-position:{pos}" loading="lazy" decoding="async"'
            f'{meta["dim"]}{orient_attr}{fit_attr}></figure>'
        )

    def with_photo(self, d: dict, copy_html: str) -> str:
        if not d.get("image"):
            return copy_html
        side = d.get("imageSide") or "right"
        fig = self.photo_fig(d)
        meta = self.img_meta(d, "image")
        wrap = f'sec-with-image side-{side}{(" orient-" + meta["orient"]) if meta["orient"] else ""}'
        if side == "top":
            return f'<div class="{wrap}">{fig}<div class="sec-photo-copy">{copy_html}</div></div>'
        if side == "bottom":
            return f'<div class="{wrap}"><div class="sec-photo-copy">{copy_html}</div>{fig}</div>'
        if side == "left":
            return f'<div class="{wrap}">{fig}<div class="sec-photo-copy">{copy_html}</div></div>'
        return f'<div class="{wrap}"><div class="sec-photo-copy">{copy_html}</div>{fig}</div>'

    def cover_stage(self, book: dict | None) -> str:
        if not book:
            return ""
        meta = self.img_meta(book, "cover")
        fit = meta["fit"] or ("contain" if meta["orient"] == "landscape" else "")
        cls = " ".join(x for x in (
            "cover-stage",
            ("orient-" + meta["orient"]) if meta["orient"] else "",
            ("fit-" + fit) if fit else "",
        ) if x)
        pos = f' style="object-position:{image_focus(book.get("coverFocus"))}"' if book.get("coverFocus") else ""
        img = ""
        if book.get("cover"):
            orient_attr = f' data-orient="{esc(meta["orient"])}"' if meta["orient"] else ""
            img = (
                f'<img class="smart-img" src="{self.asset(book.get("cover"))}" '
                f'alt="Copertina di {esc(book.get("title"))}" loading="lazy" decoding="async"'
                f'{meta["dim"]}{pos}{orient_attr}>'
            )
        note = f'<span class="stage-note">{esc(book.get("coverNote"))}</span>' if book.get("coverNote") else ""
        return f'<div class="{cls}">{img}{note}</div>'

    def book_promo(self, book: dict | None) -> str:
        if not book or not book.get("promoImage"):
            return ""
        meta = self.img_meta(book, "promoImage")
        cap = book.get("promoCaption") or ("Erasmo Stasolla con " + (book.get("title") or "il romanzo"))
        orient_attr = f' data-orient="{esc(meta["orient"])}"' if meta.get("orient") else ""
        return (
            f'<figure class="book-promo fade-in">'
            f'<img class="smart-img" src="{self.asset(book.get("promoImage"))}" alt="{esc(cap)}" '
            f'loading="lazy" decoding="async"{meta["dim"]}{orient_attr}>'
            f'<figcaption>{esc(cap)}</figcaption></figure>'
        )

    def actions(self, d: dict) -> str:
        parts = []
        if d.get("buttonLabel"):
            light = " light" if d.get("buttonLight") else ""
            parts.append(
                f'<a class="button{light}" href="{self.href(d.get("buttonHref"))}"{self.ext(d.get("buttonHref") or "")}>'
                f'{esc(d.get("buttonLabel"))}<span class="arrow" aria-hidden="true">{self.arrow(d.get("buttonHref") or "")}</span></a>'
            )
        if d.get("linkLabel"):
            download = ' download' if re.search(r"\.(pdf|txt|jpg|jpeg|png)$", d.get("linkHref") or "", re.I) else ""
            parts.append(
                f'<a class="text-link" href="{self.href(d.get("linkHref"))}"{self.ext(d.get("linkHref") or "")}{download}>'
                f'{esc(d.get("linkLabel"))}<span class="arrow" aria-hidden="true">{self.arrow(d.get("linkHref") or "")}</span></a>'
            )
        if d.get("link2Label"):
            parts.append(
                f'<a class="text-link" href="{self.href(d.get("link2Href"))}"{self.ext(d.get("link2Href") or "")}>'
                f'{esc(d.get("link2Label"))}<span class="arrow" aria-hidden="true">{self.arrow(d.get("link2Href") or "")}</span></a>'
            )
        return f'<div class="actions">{"".join(parts)}</div>' if parts else ""

    def render_hero(self, d: dict) -> str:
        site = self.content.get("site") or {}
        custom = bool(d.get("image"))
        src = d.get("image") or site.get("portrait")
        meta = self.img_meta(d if custom else site, "image" if custom else "portrait")
        pos = image_focus(d.get("imageFocus")) if d.get("imageFocus") else "center 32%"
        cls = " ".join(x for x in ("portrait-wrap", "fade-in", meta["frameCls"]) if x)
        grid = f' hero-grid{(" orient-" + meta["orient"]) if meta["orient"] else ""}'
        orient_attr = f' data-orient="{esc(meta["orient"])}"' if meta["orient"] else ""
        eyebrow = f'<p class="eyebrow">{esc(d.get("eyebrow"))}</p>' if d.get("eyebrow") else ""
        copy = f'<p class="hero-copy">{esc(d.get("copy"))}</p>' if d.get("copy") else ""
        alt = esc(d.get("imageAlt") or site.get("portraitCaption") or site.get("name") or "")
        return (
            f'<section class="hero"><div class="container"><div class="{grid.strip()}"><div class="fade-in">'
            f"{eyebrow}<h1>{rich(d.get('title') or '')}</h1>{copy}"
            f"{self.actions({**d, 'buttonLight': True})}"
            f'</div><figure class="{cls}"{orient_attr}>'
            f'<img class="smart-img" src="{self.asset(src)}" alt="{alt}" fetchpriority="high" decoding="async" '
            f'style="object-position:{pos}"{meta["dim"]}{orient_attr}>'
            f'<figcaption><strong>{esc(site.get("portraitCaption") or "")}</strong>'
            f'<span>{esc(site.get("portraitNote") or "")}</span></figcaption>'
            f"</figure></div>"
            f'<div class="hero-bottom"><span>{esc(d.get("barLeft") or "")}</span>'
            f'<span>{esc(d.get("barRight") or "")}</span></div>'
            f"</div></section>"
        )

    def render_featured(self, d: dict) -> str:
        book = find(self.content.get("books"), d.get("bookId"))
        if not book or not book_live(book):
            return ""
        cls = "book-feature catalog-feature" if d.get("catalog") else "book-feature"
        pad = ' style="padding-top:0"' if d.get("catalog") else ""
        extra_btn = self.buy_link(book, "Acquista" if d.get("catalog") else "Dove acquistarlo")
        bits = [book.get("publisher"), book.get("year"), (str(book.get("pages")) + " pagine") if book.get("pages") else ""]
        meta = ""
        if not d.get("catalog") and any(bits):
            spans = "".join(f"<span>{esc(x)}</span>" for x in bits if x)
            meta = f'<div class="meta-line">{spans}</div>'
        eyebrow = f'<div class="eyebrow">{esc(d.get("eyebrow"))}</div>' if d.get("eyebrow") else ""
        label = "Scopri il romanzo" if d.get("catalog") else "Entra nel libro"
        return (
            f'<section class="section cms-featured"{pad}><div class="container"><div class="{cls}">'
            f"{self.cover_stage(book)}"
            f'<div class="book-content">{eyebrow}<h2>{rich(book.get("title"))}</h2>'
            f'<p>{esc(book.get("summary") or "")}</p>{meta}'
            f'<div class="actions">'
            f'<a class="button" href="{self.href(self.book_path(book))}">{label}'
            f'<span class="arrow" aria-hidden="true">→</span></a>{extra_btn}'
            f"</div></div></div></div></section>"
        )

    def render_book_list(self, d: dict) -> str:
        books = list(self.content.get("books") or [])
        if d.get("filter") == "upcoming":
            return ""
        if d.get("filter") == "published":
            books = [b for b in books if book_live(b) and not b.get("featured")]
        books = [b for b in books if book_live(b)]
        if not books:
            return ""
        brow = f'<div class="eyebrow">{esc(d.get("eyebrow"))}</div>' if d.get("eyebrow") else ""
        title = f'<h2>{rich(d.get("title"))}</h2>' if d.get("title") else ""
        more = (
            f'<a class="text-link" href="{self.href(d.get("linkHref"))}">{esc(d.get("linkLabel"))} '
            f'<span class="arrow" aria-hidden="true">→</span></a>'
            if d.get("linkLabel") else ""
        )
        head = f'<div class="section-head"><div>{brow}{title}</div>{more}</div>'
        rows = []
        for b in books:
            cover_meta = self.img_meta(b, "cover") if b.get("cover") else {"orient": "", "dim": ""}
            orient_cls = (" orient-" + cover_meta["orient"]) if cover_meta.get("orient") else ""
            if b.get("cover"):
                focus = f' style="object-position:{image_focus(b.get("coverFocus"))}"' if b.get("coverFocus") else ""
                orient_attr = f' data-orient="{esc(cover_meta["orient"])}"' if cover_meta.get("orient") else ""
                media = (
                    f'<img class="work-cover smart-img" src="{self.asset(b.get("cover"))}" alt=""'
                    f'{focus}{cover_meta["dim"]}{orient_attr}>'
                )
            else:
                media = f'<span class="work-number">{esc(b.get("number") or "")}</span>'
            rows.append(
                f'<a class="work-row{" has-cover" if b.get("cover") else ""}{orient_cls}" href="{self.href(self.book_path(b))}">'
                f"{media}"
                f'<div><span class="eyebrow">{esc(b.get("eyebrow") or "")}</span><h3>{esc(b.get("title"))}</h3></div>'
                f'<p>{esc(b.get("summary") or "")}</p>'
                f'<span class="arrow" aria-hidden="true">→</span></a>'
            )
        works = '<div class="works">' + "".join(rows) + "</div>"
        return (
            '<section class="section" style="padding-top:0"><div class="container">'
            f"{self.with_photo(d, head + works)}"
            "</div></section>"
        )

    def render_press_quote(self, d: dict) -> str:
        note = f'<p class="small">{esc(d.get("note"))}</p>' if d.get("note") else ""
        link = ""
        if d.get("linkLabel"):
            link = (
                f'<a class="text-link" href="{self.href(d.get("linkHref"))}"{self.ext(d.get("linkHref") or "")}>'
                f'{esc(d.get("linkLabel"))}<span class="arrow" aria-hidden="true">↗</span>'
                f'<span class="sr-only"> (si apre in una nuova scheda)</span></a>'
            )
        strip = (
            f'<div class="press-strip"><span class="press-mark">{esc(d.get("source") or "")}</span>'
            f"<div><p>{rich(d.get('quote') or '')}</p>{note}</div>{link}</div>"
        )
        return f'<section class="section press-section" style="padding-top:0"><div class="container">{self.with_photo(d, strip)}</div></section>'

    def render_encounters(self, d: dict) -> str:
        ev = find(self.content.get("events"), d.get("eventId"))
        event_html = ""
        if ev:
            brow = f'<span class="eyebrow">{esc(ev.get("homeEyebrow"))}</span>' if ev.get("homeEyebrow") else ""
            event_html = (
                f'<div class="home-event">{brow}'
                f'<div class="home-event-date">{esc(ev.get("day") or "")}<span>{esc(ev.get("month") or "")}</span></div>'
                f'<h3>{esc(ev.get("city") or ev.get("place") or "")}</h3>'
                f'<p>{esc(ev.get("homeLine") or ev.get("summary") or "")}</p>'
                f'<a href="{self.href("incontri/")}#archivio" class="text-link">Ripercorri la presentazione '
                f'<span class="arrow" aria-hidden="true">→</span></a></div>'
            )
        photo = self.photo_fig(d, "encounter-photo") if d.get("image") else ""
        brow = f'<div class="eyebrow">{esc(d.get("eyebrow"))}</div>' if d.get("eyebrow") else ""
        copy = f'<p>{esc(d.get("copy"))}</p>' if d.get("copy") else ""
        return (
            f'<section class="section dark-section"><div class="container encounters">'
            f'<div class="encounter-text">{photo}{brow}<h2>{rich(d.get("title") or "")}</h2>{copy}'
            f'{self.actions({**d, "buttonLight": True})}</div>{event_html}</div></section>'
        )

    def render_heading(self, d: dict) -> str:
        brow = f'<div class="eyebrow">{esc(d.get("eyebrow"))}</div>' if d.get("eyebrow") else ""
        sub = f'<p>{esc(d.get("subtitle"))}</p>' if d.get("subtitle") else ""
        copy = f'{brow}<h1>{rich(d.get("title") or "")}</h1>{sub}'
        return f'<div class="container page-heading fade-in">{self.with_photo(d, copy)}</div>'

    def render_text(self, d: dict) -> str:
        extra = ""
        if d.get("link2Label"):
            extra = (
                f'<p><a class="text-link" href="{self.href(d.get("link2Href"))}"{self.ext(d.get("link2Href") or "")}>'
                f'{esc(d.get("link2Label"))} {self.arrow(d.get("link2Href") or "")}</a></p>'
            )
        link = ""
        if d.get("linkLabel"):
            link = (
                f'<p><a class="text-link" href="{self.href(d.get("linkHref"))}"{self.ext(d.get("linkHref") or "")}>'
                f'{esc(d.get("linkLabel"))} {self.arrow(d.get("linkHref") or "")}</a></p>'
            )
        title = f'<h2>{rich(d.get("title"))}</h2>' if d.get("title") else ""
        copy = f"{title}{paras(d.get('body') or '')}{link}{extra}{self.actions(d)}"
        return f'<div class="container legal-copy" style="padding-bottom:40px">{self.with_photo(d, copy)}</div>'

    def render_bio(self, d: dict) -> str:
        side = d.get("imageSide") or "left"
        pos = f' style="object-position:{image_focus(d.get("imageFocus"))}"' if d.get("imageFocus") else ""
        meta = self.img_meta(d, "image")
        flip = " bio-flip" if side == "right" else ""
        orient_cls = f' orient-{meta["orient"]}' if meta["orient"] else ""
        orient_attr = f' data-orient="{esc(meta["orient"])}"' if meta["orient"] else ""
        img = ""
        if d.get("image"):
            img = (
                f'<img class="smart-img" src="{self.asset(d.get("image"))}" '
                f'alt="{esc(d.get("caption") or d.get("imageAlt") or "")}" loading="lazy" decoding="async"'
                f'{meta["dim"]}{pos}{orient_attr}>'
            )
        cap = f'<figcaption>{esc(d.get("caption"))}</figcaption>' if d.get("caption") else ""
        lead = f'<p class="lead">{esc(d.get("lead"))}</p>' if d.get("lead") else ""
        heading = f'<h2>{esc(d.get("heading"))}</h2>' if d.get("heading") else ""
        return (
            f'<div class="container bio-layout{flip}{orient_cls}">'
            f'<figure class="bio-image {meta["frameCls"]}"{orient_attr}>{img}{cap}</figure>'
            f'<div class="bio-copy">{lead}{paras(d.get("body") or "")}{heading}{paras(d.get("body2") or "")}'
            f"{self.actions(d)}</div></div>"
        )

    def render_events(self, d: dict) -> str:
        upcoming = [e for e in (self.content.get("events") or []) if e.get("status") == "upcoming"]
        past = [e for e in (self.content.get("events") or []) if e.get("status") != "upcoming"]
        if upcoming:
            up_inner = "".join(
                f'<p class="empty-date">{esc(e.get("title"))}</p><p class="muted">{esc(e.get("summary") or "")}</p>'
                for e in upcoming
            )
        else:
            up_inner = (
                f'<p class="empty-date">{esc(d.get("upcomingEmpty") or "")}</p>'
                f'<p class="muted">{esc(d.get("upcomingNote") or "")}</p>'
            )
        upcoming_html = (
            f'<section class="agenda-intro" aria-labelledby="prossimi">'
            f'<h2 id="prossimi">{esc(d.get("upcomingTitle") or "I prossimi incontri.")}</h2>'
            f"<div>{up_inner}</div></section>"
        )
        past_html = []
        for e in past:
            link = ""
            if e.get("linkLabel"):
                link = (
                    f'<a class="text-link" href="{self.href(e.get("linkHref"))}"{self.ext(e.get("linkHref") or "")}>'
                    f'{esc(e.get("linkLabel"))}<span class="arrow" aria-hidden="true">↗</span></a>'
                )
            ctx = ""
            if e.get("contextTitle"):
                ctx_link = ""
                if e.get("contextLinkLabel"):
                    ctx_link = (
                        f'<a class="text-link" href="{self.href(e.get("contextLinkHref"))}"{self.ext(e.get("contextLinkHref") or "")}>'
                        f'{esc(e.get("contextLinkLabel"))} <span aria-hidden="true">↗</span></a>'
                    )
                ctx = (
                    f'<div class="event-context"><h3>{esc(e.get("contextTitle"))}</h3>'
                    f'<p>{esc(e.get("contextBody") or "")}</p>{ctx_link}</div>'
                )
            place = f'<div class="eyebrow">{esc(e.get("place"))}</div>' if e.get("place") else ""
            summary = f'<p>{esc(e.get("summary"))}</p>' if e.get("summary") else ""
            note = f'<p class="small">{esc(e.get("note"))}</p>' if e.get("note") else ""
            status = "In programma" if e.get("status") == "upcoming" else "Evento concluso"
            past_html.append(
                f'<article class="event-row">'
                f'<time class="event-date" datetime="{esc(e.get("date") or "")}">'
                f'<strong>{esc(e.get("day") or "")}</strong><span>{esc(e.get("monthShort") or "")}<br>{esc(e.get("year") or "")}</span></time>'
                f"<div>{place}<h3>{esc(e.get('title'))}</h3>{summary}{note}{link}</div>"
                f'<span class="event-status">{status}</span></article>{ctx}'
            )
        archive_brow = f'<div class="eyebrow">{esc(d.get("archiveEyebrow"))}</div>' if d.get("archiveEyebrow") else ""
        archive_title = f'<h2>{rich(d.get("archiveTitle"))}</h2>' if d.get("archiveTitle") else ""
        body = (
            f"{upcoming_html}"
            f'<section id="archivio"><div class="section-head"><div>{archive_brow}{archive_title}</div></div>'
            f'{"".join(past_html)}</section>'
            f'<div class="actions"><a class="button outline" href="{self.href("materiali/")}">'
            f'Rassegna stampa <span aria-hidden="true">→</span></a></div>'
        )
        return f'<div class="container" style="padding-bottom:70px">{self.with_photo(d, body)}</div>'

    def render_press_list(self, d: dict) -> str:
        items = self.press_items(d)
        if not items:
            return ""
        if d.get("groupByBook"):
            groups, seen = [], set()
            for p in items:
                key = p.get("bookId") or "altro"
                if key in seen:
                    continue
                seen.add(key)
                groups.append(key)
            chunks = []
            for key in groups:
                book = find(self.content.get("books"), key)
                lst = [p for p in items if (p.get("bookId") or "altro") == key]
                if book:
                    heading = f'<h3 class="press-book-title"><a href="{self.href(self.book_path(book))}">{esc(book.get("title"))}</a></h3>'
                else:
                    heading = '<h3 class="press-book-title">Altri articoli</h3>'
                chunks.append(f'<div class="press-book">{heading}{"".join(self.press_article(p) for p in lst)}</div>')
            body = "".join(chunks)
        else:
            body = "".join(self.press_article(p) for p in items)
        brow = f'<div class="eyebrow">{esc(d.get("eyebrow"))}</div>' if d.get("eyebrow") else ""
        title = f'<h2>{rich(d.get("title"))}</h2>' if d.get("title") else ""
        empty = '<p class="muted">Nessun articolo in questo elenco.</p>'
        lst = f'<div class="section-head"><div>{brow}{title}</div></div>{body or empty}'
        sid = "articoli-presentazioni" if d.get("topic") == "presentazione" else "rassegna"
        return f'<section id="{sid}" class="container" style="padding-bottom:70px">{self.with_photo(d, lst)}</section>'

    def render_resources(self, d: dict) -> str:
        groups: dict[str, dict] = {}
        for r in self.content.get("resources") or []:
            key = r.get("group") or "altri"
            groups.setdefault(key, {"title": r.get("groupTitle") or key, "items": []})
            groups[key]["items"].append(r)
            if r.get("groupTitle"):
                groups[key]["title"] = r.get("groupTitle")
        cols = []
        for g in groups.values():
            items = []
            for r in g["items"]:
                desc = esc(r.get("description") or "").replace("\n", "<br>")
                dl = "download" if r.get("download") else ""
                items.append(
                    f'<div class="resource"><div><h3>{esc(r.get("title"))}</h3><p>{desc}</p></div>'
                    f'<a href="{self.asset(r.get("href"))}" {dl} aria-label="{esc(r.get("title"))}">'
                    f'<span aria-hidden="true">↓</span></a></div>'
                )
            cols.append(f'<section><h2>{esc(g["title"])}</h2>{"".join(items)}</section>')
        note = (
            f'<p class="small muted" style="margin-top:8px;padding-bottom:20px">{esc(d.get("note"))}</p>'
            if d.get("note") else ""
        )
        inner = f'<div class="material-grid">{"".join(cols)}</div>{note}'
        return f'<div class="container">{self.with_photo(d, inner)}</div>'

    def render_purchases(self, d: dict) -> str:
        book = find(self.content.get("books"), d.get("bookId"))
        if book and not book_live(book):
            return ""
        links = []
        for p in self.content.get("purchases") or []:
            if d.get("bookId") and p.get("bookId") != d.get("bookId"):
                continue
            owned = find(self.content.get("books"), p.get("bookId"))
            if owned and not book_live(owned):
                continue
            links.append(p)
        lst = "".join(
            f'<a class="purchase-link" href="{self.href(p.get("href"))}"{self.ext(p.get("href") or "")}>'
            f'<span><span class="seller-name">{esc(p.get("name"))}</span>'
            f'<span class="seller-type">{esc(p.get("type") or "")}</span></span>'
            f'<span>Vai al libro ↗<span class="sr-only"> (nuova scheda)</span></span></a>'
            for p in links
        )
        if not book:
            return f'<div class="container"><div class="purchase-list">{lst}</div></div>'
        intro_bits = [book.get("publisher"), book.get("year"), (str(book.get("pages")) + " pagine") if book.get("pages") else ""]
        intro = esc(" · ".join(x for x in intro_bits if x))
        isbn = f'<br>ISBN {esc(book.get("isbn"))}' if book.get("isbn") else ""
        note = f'<p class="purchase-note">{esc(d.get("note"))}</p>' if d.get("note") else ""
        return (
            f'<div class="container purchase-block" id="{esc(self.buy_anchor(book))}"><div class="detail-grid">'
            f"{self.cover_stage(book)}"
            f'<div class="detail-copy">'
            f'<div class="eyebrow">{esc(book.get("statusLabel") or "Disponibile")}</div>'
            f'<h2 style="margin-top:15px">{esc(book.get("title"))}</h2>'
            f'<p class="purchase-intro">{intro}{isbn}</p>'
            f'<div class="purchase-list">{lst}</div>{note}'
            f"</div></div></div>"
        )

    def render_cta(self, d: dict) -> str:
        return f'<div class="container" style="padding-bottom:50px">{self.with_photo(d, self.actions(d))}</div>'

    def render_image_text(self, d: dict) -> str:
        copy = (f'<h2>{rich(d.get("title"))}</h2>' if d.get("title") else "") + paras(d.get("body") or "")
        if d.get("image"):
            wrapped = f'<div class="detail-copy">{copy}</div>'
            return f'<div class="container" style="padding-bottom:70px">{self.with_photo(d, wrapped)}</div>'
        return f'<div class="container detail-grid" style="padding-bottom:70px"><div class="detail-copy">{copy}</div></div>'

    def render_gallery(self, d: dict) -> str:
        items = [it for it in (d.get("items") or []) if it.get("src")]
        layout = d.get("layout") or "grid"
        figs = []
        for it in items:
            orient = image_orient(it.get("width"), it.get("height"), it.get("orient"))
            orient_cls = f" orient-{orient}" if orient else ""
            orient_attr = f' data-orient="{esc(orient)}"' if orient else ""
            dim = f' width="{esc(it.get("width"))}" height="{esc(it.get("height"))}"' if it.get("width") and it.get("height") else ""
            cap = f'<span>{esc(it.get("caption"))}</span>' if it.get("caption") else ""
            figs.append(
                f'<button type="button" class="gallery-cell{orient_cls}" data-lightbox="{esc(self.asset(it.get("src")))}" '
                f'data-caption="{esc(it.get("caption") or it.get("alt") or "")}"{orient_attr}>'
                f'<img class="smart-img" src="{self.asset(it.get("src"))}" alt="{esc(it.get("alt") or "")}" '
                f'loading="lazy" decoding="async"{dim}{orient_attr}>{cap}</button>'
            )
        brow = f'<div class="eyebrow">{esc(d.get("eyebrow"))}</div>' if d.get("eyebrow") else ""
        title = f'<h2>{rich(d.get("title"))}</h2>' if d.get("title") else ""
        caption = f'<p class="muted">{esc(d.get("caption"))}</p>' if d.get("caption") else ""
        return (
            f'<section class="container cms-gallery-wrap">{brow}{title}{caption}'
            f'<div class="cms-gallery layout-{esc(layout)}">{"".join(figs)}</div></section>'
        )

    def render_video(self, d: dict) -> str:
        src = video_embed(d.get("url") or "")
        title = f'<h2>{rich(d.get("title"))}</h2>' if d.get("title") else ""
        frame = (
            f'<div class="cms-video-frame"><iframe src="{esc(src)}" title="{esc(d.get("title") or "Video")}" '
            f'allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" '
            f'allowfullscreen loading="lazy"></iframe></div>'
            if src else ""
        )
        caption = f'<p class="muted">{esc(d.get("caption"))}</p>' if d.get("caption") else ""
        return f'<section class="container cms-video">{title}{frame}{caption}{paras(d.get("body") or "")}</section>'

    def render_columns(self, d: dict) -> str:
        cols = [c for c in (d.get("col1"), d.get("col2"), d.get("col3")) if c]
        title = f'<h2>{rich(d.get("title"))}</h2>' if d.get("title") else ""
        cells = "".join(f"<div>{paras(c)}</div>" for c in cols)
        return f'<section class="container cms-columns">{title}<div class="cms-cols n-{len(cols)}">{cells}</div></section>'

    def render_quote(self, d: dict) -> str:
        cite = f'<cite>{esc(d.get("cite"))}</cite>' if d.get("cite") else ""
        note = f'<p class="muted">{esc(d.get("note"))}</p>' if d.get("note") else ""
        return (
            f'<section class="container cms-quote"><blockquote><p>{esc(d.get("quote") or "")}</p>{cite}</blockquote>'
            f"{note}</section>"
        )

    def render_divider(self, d: dict) -> str:
        return '<div class="cms-space" aria-hidden="true"></div>' if d.get("kind") == "space" else '<hr class="cms-rule">'

    def style_wrap(self, d: dict, html: str) -> str:
        if not html:
            return ""
        cls = ["cms-styled"]
        if d.get("styleTheme"):
            cls.append("theme-" + str(d["styleTheme"]))
        if d.get("stylePad"):
            cls.append("pad-" + str(d["stylePad"]))
        if d.get("styleAlign"):
            cls.append("align-" + str(d["styleAlign"]))
        if d.get("styleWidth"):
            cls.append("width-" + str(d["styleWidth"]))
        st = []
        if re.match(r"^#([0-9a-f]{3}|[0-9a-f]{6})$", str(d.get("styleBg") or ""), re.I):
            st.append("--sec-bg:" + d["styleBg"])
        if re.match(r"^#([0-9a-f]{3}|[0-9a-f]{6})$", str(d.get("styleColor") or ""), re.I):
            st.append("--sec-ink:" + d["styleColor"])
        style = f' style="{";".join(st)}"' if st else ""
        return f'<div class="{" ".join(cls)}"{style}>{html}</div>'

    def render_section(self, section: dict) -> str:
        if section.get("visible") is False:
            return ""
        d = section.get("data") or {}
        mapping = {
            "hero": self.render_hero,
            "featuredBook": self.render_featured,
            "bookList": self.render_book_list,
            "pressQuote": self.render_press_quote,
            "encounters": self.render_encounters,
            "heading": self.render_heading,
            "text": self.render_text,
            "bio": self.render_bio,
            "eventsList": self.render_events,
            "pressList": self.render_press_list,
            "resources": self.render_resources,
            "purchases": self.render_purchases,
            "cta": self.render_cta,
            "imageText": self.render_image_text,
            "gallery": self.render_gallery,
            "video": self.render_video,
            "columns": self.render_columns,
            "quote": self.render_quote,
            "divider": self.render_divider,
        }
        fn = mapping.get(section.get("type"))
        return self.style_wrap(d, fn(d) if fn else "")

    def render_page(self, page: dict) -> str:
        return "".join(self.render_section(s) for s in (page.get("sections") or []))

    def press_block(self, book: dict) -> str:
        items = self.press_items({"bookId": book.get("id")})
        if not items:
            return ""
        reviews = [p for p in items if (p.get("topic") or "libro") != "presentazione"]
        events = [p for p in items if p.get("topic") == "presentazione"]

        def block(title, lst):
            if not lst:
                return ""
            return (
                f'<div class="press-book"><h3 class="press-book-title">{esc(title)}</h3>'
                f'{"".join(self.press_article(p) for p in lst)}</div>'
            )

        return (
            '<section class="subsection book-press" id="rassegna" style="padding-bottom:70px">'
            f"<h2>Rassegna stampa.</h2>{block('Sul romanzo', reviews)}{block('Sulle presentazioni', events)}"
            "</section>"
        )

    def render_book(self, book_id: str) -> str:
        book = find(self.content.get("books"), book_id)
        if not book:
            for b in self.content.get("books") or []:
                if b.get("slug") == book_id:
                    book = b
                    break
        if not book or not book_live(book):
            return (
                '<div class="container page-heading fade-in"><h1>Questa scheda non è pubblica.</h1>'
                f'<p>Torna all’elenco dei romanzi quando il libro sarà in libreria.</p>'
                f'<div class="actions"><a class="button" href="{self.href("romanzi/")}">I romanzi'
                f'<span class="arrow" aria-hidden="true">→</span></a></div></div>'
            )
        brow = f'<div class="eyebrow">{esc(book.get("eyebrow"))}</div>' if book.get("eyebrow") else ""
        intro = f'<p>{esc(book.get("intro"))}</p>' if book.get("intro") else ""
        heading = (
            f'<div class="container page-heading fade-in">'
            f'<div class="breadcrumb"><a href="{self.href("romanzi/")}">I romanzi</a> / {esc(book.get("title"))}</div>'
            f"{brow}<h1>{esc(book.get('title'))}</h1>{intro}</div>"
        )
        if book.get("status") == "published":
            rows = ['<div><dt>Autore</dt><dd>Erasmo Stasolla</dd></div>']
            if book.get("publisher"):
                rows.append(f'<div><dt>Editore</dt><dd>{esc(book.get("publisher"))}</dd></div>')
            if book.get("year"):
                rows.append(f'<div><dt>Pubblicazione</dt><dd>{esc(book.get("year"))}</dd></div>')
            if book.get("pages"):
                rows.append(f'<div><dt>Pagine</dt><dd>{esc(book.get("pages"))}</dd></div>')
            if book.get("isbn"):
                rows.append(f'<div><dt>ISBN</dt><dd>{esc(book.get("isbn"))}</dd></div>')
            if book.get("language"):
                rows.append(f'<div><dt>Lingua</dt><dd>{esc(book.get("language"))}</dd></div>')
            amazon = (
                f'<a class="button" href="{esc(book.get("amazon"))}" target="_blank" rel="noopener noreferrer">'
                f'Acquista su Amazon<span class="arrow" aria-hidden="true">↗</span></a>'
                if book.get("amazon") else ""
            )
            sheet = (
                f'<a class="text-link" href="{self.asset(book.get("sheetPdf"))}" download>'
                f'Scarica la scheda<span class="arrow" aria-hidden="true">↓</span></a>'
                if book.get("sheetPdf") else ""
            )
            pub = (
                f'<a class="text-link" href="{esc(book.get("publisherUrl"))}" target="_blank" rel="noopener noreferrer">'
                f'Dal sito dell’editore<span class="arrow" aria-hidden="true">↗</span></a>'
                if book.get("publisherUrl") else ""
            )
            h2 = f'<h2>{rich(book.get("heading"))}</h2>' if book.get("heading") else ""
            return (
                f'{heading}<div class="container"><div class="detail-grid">'
                f'{self.cover_stage(book)}<div class="detail-copy">{h2}{paras(book.get("body") or "")}'
                f'<dl class="book-data">{"".join(rows)}</dl>'
                f'<div class="actions">{amazon}{sheet}{pub}</div></div></div>'
                f'{self.book_promo(book)}'
                f'<section class="subsection" style="padding-bottom:36px"><h2>Intorno al libro.</h2>'
                f'<div class="actions">'
                f'<a class="text-link" href="{self.href("incontri/")}#archivio">Le presentazioni'
                f'<span class="arrow" aria-hidden="true">→</span></a>'
                f'<a class="text-link" href="{self.href("materiali/")}">Rassegna stampa e schede'
                f'<span class="arrow" aria-hidden="true">→</span></a>'
                f"</div></section>{self.press_block(book)}</div>"
            )
        return heading
