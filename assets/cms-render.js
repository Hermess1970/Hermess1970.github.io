(function () {
  const body = document.body;
  const pageId = body.getAttribute("data-page");
  if (!pageId) return;
  const root = body.getAttribute("data-root") || "";
  const bookId = body.getAttribute("data-book") || "";
  const builderMode = /(?:\?|&)builder=1(?:&|$)/.test(location.search);
  const TYPE_IT = {
    heading: "Intestazione", text: "Testo", hero: "Hero", gallery: "Galleria", video: "Video",
    columns: "Colonne", quote: "Citazione", divider: "Separatore", featuredBook: "Romanzo",
    bookList: "Romanzi", upcomingProjects: "Prossimi progetti", pressQuote: "Stampa", encounters: "Incontri", bio: "Biografia",
    eventsList: "Agenda", pressList: "Rassegna", pressHighlight: "Articolo in evidenza", resources: "Schede", purchases: "Acquista",
    cta: "Pulsanti", imageText: "Immagine e testo",
  };

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function rich(v) {
    return esc(v).replace(/\n/g, "<br>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  }
  function paras(v) {
    return String(v || "").split(/\n\n+/).filter(Boolean).map((p) =>
      `<p>${esc(p).replace(/\n/g, "<br>").replace(/\*(.+?)\*/g, "<em>$1</em>")}</p>`
    ).join("");
  }
  function href(path) {
    if (!path) return root + "index.html";
    if (/^(https?:|mailto:|#)/i.test(path)) return path;
    const hash = path.includes("#") ? "#" + path.split("#").slice(1).join("#") : "";
    const p = path.split("#")[0].replace(/^\//, "");
    if (/^assets\//.test(p) || /\.(html|pdf|txt|jpg|jpeg|png|webp|svg)$/i.test(p)) return root + p + hash;
    if (!p) return root + "index.html" + hash;
    return root + p.replace(/\/?$/, "/") + "index.html" + hash;
  }
  function buyAnchor(book) {
    return "acquista-" + (book.slug || book.id);
  }
  function buyHref(book) {
    return book.amazon || book.publisherUrl || ("acquista/#" + buyAnchor(book));
  }
  function buyLink(book, label) {
    const url = buyHref(book);
    const outside = /^(https?:)/i.test(url);
    return `<a class="text-link" href="${outside ? esc(url) : href(url)}"${outside ? ext(url) : ""}>${esc(label)}<span class="arrow" aria-hidden="true">${outside ? "↗" : "→"}</span>${outside ? `<span class="sr-only"> (si apre in una nuova scheda)</span>` : ""}</a>`;
  }
  function asset(path) {
    if (!path) return "";
    if (/^https?:/i.test(path)) return path;
    return root + path.replace(/^\//, "");
  }
  function ext(hrefVal) {
    return /^(https?:)/i.test(hrefVal) ? ' target="_blank" rel="noopener noreferrer"' : "";
  }
  function arrow(h) {
    return /^(https?:)/i.test(h) ? "↗" : "→";
  }
  function find(list, id) {
    return (list || []).find((x) => x.id === id);
  }
  function bookPath(book) {
    return "romanzi/" + (book.slug || book.id) + "/";
  }
  function bookLive(book) {
    return !!(book && book.status === "published");
  }
  function pressVisible(p, content) {
    if (!p) return false;
    if (builderMode) return true;
    if (!p.bookId) return true;
    const book = find(content.books, p.bookId);
    return !book || bookLive(book);
  }
  function pressItems(content, d = {}) {
    return (content.press || []).filter((p) => {
      if (!pressVisible(p, content)) return false;
      if (d.bookId && p.bookId !== d.bookId) return false;
      if (d.topic && (p.topic || "libro") !== d.topic) return false;
      if (d.eventId && p.eventId !== d.eventId) return false;
      return true;
    });
  }
  function pressArticle(p) {
    return vbItem("press", p.id, "Articolo", `<article class="press-item">
      <div class="press-source">${esc(p.source || "")}${p.dateLabel ? `<span>${esc(p.dateLabel)}</span>` : ""}</div>
      <div><h3>${esc(p.title)}</h3>${p.summary ? `<p>${esc(p.summary)}</p>` : ""}</div>
      <a class="text-link" href="${href(p.href)}"${ext(p.href || "")} aria-label="${esc(p.title)}"><span class="arrow" aria-hidden="true">↗</span></a>
    </article>`);
  }
  function pressFeatureCard(p, content, opts = {}) {
    if (!p) return "";
    const book = find(content.books, p.bookId);
    const cover = book && book.cover ? `<div class="press-feature-cover">${coverStage(book)}</div>` : "";
    const quote = p.quote ? `<p class="press-feature-quote">${rich(p.quote)}</p>` : "";
    const bookLink = (!opts.hideBook && book)
      ? `<a class="text-link" href="${href(bookPath(book))}">Il romanzo<span class="arrow" aria-hidden="true">→</span></a>`
      : "";
    const sourceName = (p.source || "ANSA").split("·")[0].trim() || "ANSA";
    return vbItem("press", p.id, "Articolo", `<article class="press-feature">
      ${cover}
      <div class="press-feature-copy">
        <div class="press-source">${esc(p.source || "")}${p.dateLabel ? `<span>${esc(p.dateLabel)}</span>` : ""}</div>
        ${quote}
        <h3>${esc(p.title)}</h3>
        ${p.summary ? `<p>${esc(p.summary)}</p>` : ""}
        <div class="actions">
          <a class="button" href="${href(p.href)}"${ext(p.href || "")}>Leggi su ${esc(sourceName)}<span class="arrow" aria-hidden="true">↗</span><span class="sr-only"> (si apre in una nuova scheda)</span></a>
          ${bookLink}
        </div>
      </div>
    </article>`);
  }
  function renderPressHighlight(d, content) {
    const p = find(content.press, d.pressId) || (content.press || []).find((x) => x.featured);
    if (!p || (!builderMode && !pressVisible(p, content))) return "";
    return `<section class="section press-highlight"><div class="container">
      ${d.eyebrow ? `<div class="eyebrow">${esc(d.eyebrow)}</div>` : ""}
      ${d.title ? `<h2>${rich(d.title)}</h2>` : ""}
      ${pressFeatureCard(p, content)}
    </div></section>`;
  }

  function hexOk(v) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v || "");
  }

  function applyTheme(site) {
    const rootEl = document.documentElement;
    const map = { colorInk: "--ink", colorPaper: "--paper", colorRed: "--red", colorCoral: "--coral" };
    Object.entries(map).forEach(([key, cssVar]) => {
      if (hexOk(site[key])) rootEl.style.setProperty(cssVar, site[key]);
      else rootEl.style.removeProperty(cssVar);
    });
    document.body.classList.remove("btn-rounded", "btn-pill");
    if (site.buttonStyle === "rounded") document.body.classList.add("btn-rounded");
    if (site.buttonStyle === "pill") document.body.classList.add("btn-pill");
  }

  function waDigits(v) {
    let d = String(v || "").replace(/\D/g, "");
    if (d.startsWith("00")) d = d.slice(2);
    if (d && !d.startsWith("39") && d.length === 10) d = "39" + d;
    return d;
  }
  function waHref(site) {
    const n = waDigits(site.whatsapp);
    if (!n) return "";
    const msg = site.whatsappMessage || "Buongiorno, le scrivo dal sito di Erasmo Stasolla.";
    return "https://wa.me/" + n + "?text=" + encodeURIComponent(msg);
  }
  function waPretty(site) {
    const d = waDigits(site.whatsapp);
    const local = d.startsWith("39") ? d.slice(2) : d;
    return local.replace(/(\d{3})(\d{3})(\d+)/, "$1 $2 $3") || local;
  }
  const WA_ICON = '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.28-.14-1.65-.81-1.9-.91-.26-.09-.44-.14-.63.14-.19.28-.72.91-.88 1.1-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.63-1.51-.86-2.07-.23-.55-.46-.47-.63-.48h-.54c-.19 0-.49.07-.74.35-.26.28-.97.95-.97 2.31s1 2.68 1.13 2.86c.14.19 1.96 2.99 4.75 4.19.66.29 1.18.46 1.59.58.67.21 1.27.18 1.75.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.11-.26-.18-.54-.32zM12.04 21.8h-.01c-1.81 0-3.6-.49-5.16-1.41L3.3 21.4l1.05-3.5a9.87 9.87 0 0 1-1.52-5.32C2.83 7.06 6.93 3 12.04 3c2.43 0 4.71.94 6.43 2.66A8.96 8.96 0 0 1 21.15 12.2c0 5.11-4.1 9.6-9.11 9.6zm0-19.6C6.27 2.2 1.63 6.8 1.63 12.58c0 1.86.49 3.67 1.43 5.27L1.2 22.8l5.1-1.34a10.9 10.9 0 0 0 5.73 1.55h.01c5.77 0 10.47-4.66 10.47-10.4 0-2.78-1.09-5.39-3.06-7.35A10.4 10.4 0 0 0 12.04 2.2z"/></svg>';

  function placeWhatsApp(site) {
    document.querySelectorAll(".wa-fab").forEach((el) => el.remove());
    const url = waHref(site);
    if (!url || builderMode) return;
    const num = waPretty(site);
    const a = document.createElement("a");
    a.className = "wa-fab";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", "Scrivi su WhatsApp" + (num ? " al " + num : ""));
    a.innerHTML = `${WA_ICON}<span>WhatsApp${num ? " " + num : ""}</span>`;
    document.body.appendChild(a);
  }

  function chrome(content, currentSlug) {
    const site = content.site || {};
    applyTheme(site);
    document.querySelectorAll(".brand").forEach((el) => {
      el.href = href("");
      el.innerHTML = `${esc(site.name || "Erasmo Stasolla")}<small>${esc(site.tagline || "")}</small>`;
    });
    const nav = document.getElementById("main-nav");
    if (nav) {
      nav.innerHTML = (content.menu || []).map((item) => {
        const raw = item.href || "";
        const slug = raw.split("#")[0].replace(/\/$/, "");
        const hash = raw.includes("#") ? raw.split("#").slice(1).join("#") : "";
        let current = "";
        if (hash) {
          if ((currentSlug === slug || currentSlug.startsWith(slug + "/")) && location.hash === "#" + hash) current = ' aria-current="page"';
        } else if (slug && (currentSlug === slug || currentSlug.startsWith(slug + "/"))) {
          current = ' aria-current="page"';
        }
        const cls = item.style === "buy" ? ' class="nav-buy"' : item.style === "button" ? ' class="nav-btn"' : "";
        return `<a href="${href(item.href)}"${cls}${current}>${esc(item.label)}</a>`;
      }).join("");
    }
    const footer = document.querySelector(".site-footer");
    if (footer) {
      const footerItems = Array.isArray(content.footer)
        ? content.footer
        : (content.menu || []).filter((m) => m.style !== "buy").slice(0, 3);
      const links = footerItems.map((m) => `<a href="${href(m.href)}">${esc(m.label)}</a>`).join("");
      footer.innerHTML = `<div class="container"><div class="footer-top">
        <a class="brand" href="${href("")}">${esc(site.name || "")}<small>${esc(site.tagline || "")}</small></a>
        <p>${esc(site.footerText || "")}</p>
        ${waHref(site) ? `<p class="footer-wa">Per presentazioni e richieste: <a href="${esc(waHref(site))}" target="_blank" rel="noopener noreferrer">WhatsApp ${esc(waPretty(site))}</a></p>` : ""}
        <nav class="footer-links" aria-label="Navigazione nel piè di pagina">${links}</nav>
      </div>
      ${shareBar()}
      <div class="footer-bottom">
        <span>${esc(site.copyright || "")}</span>
        <a href="${href("crediti/")}">Crediti e fonti</a>
        <a class="footer-access" href="${href("admin/")}">Accesso</a>
        <a href="#contenuto">Torna all’inizio ↑</a>
      </div></div>`;
      bindShare(footer);
      const access = footer.querySelector(".footer-access");
      if (access && !builderMode) {
        fetch("/api/session", { credentials: "same-origin" }).then((r) => r.json()).then((d) => {
          if (d && d.ok) access.textContent = "Pannello";
        }).catch(() => {});
      }
    }
    placeWhatsApp(site);
  }

  function pageShare() {
    const url = document.querySelector('link[rel="canonical"]')?.href
      || document.querySelector('meta[property="og:url"]')?.content
      || location.href.split(/[?#]/)[0];
    const title = document.querySelector('meta[property="og:title"]')?.content || document.title;
    return { url, title };
  }

  const SHARE_ICONS = {
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.28-.14-1.65-.81-1.9-.91-.26-.09-.44-.14-.63.14-.19.28-.72.91-.88 1.1-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.63-1.51-.86-2.07-.23-.55-.46-.47-.63-.48h-.54c-.19 0-.49.07-.74.35-.26.28-.97.95-.97 2.31s1 2.68 1.13 2.86c.14.19 1.96 2.99 4.75 4.19.66.29 1.18.46 1.59.58.67.21 1.27.18 1.75.11.53-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.11-.26-.18-.54-.32zM12.04 21.8h-.01c-1.81 0-3.6-.49-5.16-1.41L3.3 21.4l1.05-3.5a9.87 9.87 0 0 1-1.52-5.32C2.83 7.06 6.93 3 12.04 3c2.43 0 4.71.94 6.43 2.66A8.96 8.96 0 0 1 21.15 12.2c0 5.11-4.1 9.6-9.11 9.6zm0-19.6C6.27 2.2 1.63 6.8 1.63 12.58c0 1.86.49 3.67 1.43 5.27L1.2 22.8l5.1-1.34a10.9 10.9 0 0 0 5.73 1.55h.01c5.77 0 10.47-4.66 10.47-10.4 0-2.78-1.09-5.39-3.06-7.35A10.4 10.4 0 0 0 12.04 2.2z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.4V9.84c0-2.37 1.4-3.69 3.56-3.69 1.03 0 2.11.19 2.11.19v2.32h-1.19c-1.17 0-1.54.73-1.54 1.48v1.78h2.62l-.42 2.91h-2.2V22c4.78-.75 8.44-4.91 8.44-9.93z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.24 2.25h3.31l-7.23 8.26 8.51 11.24h-6.66l-4.71-6.23-5.4 6.23H2.74l7.73-8.84L1.25 2.25h6.83l4.25 5.62 6.91-5.62zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.7A2.1 2.1 0 1 0 14.1 12 2.1 2.1 0 0 0 12 9.9zM17.35 6.65a1.05 1.05 0 1 1-1.05 1.05 1.05 1.05 0 0 1 1.05-1.05z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 1 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  };

  function shareBar() {
    const { url, title } = pageShare();
    const text = encodeURIComponent(title + " " + url);
    const enc = encodeURIComponent(url);
    const encTitle = encodeURIComponent(title);
    return `<div class="footer-share">
      <p class="footer-share-label">Condividi questa pagina</p>
      <nav class="share-links" aria-label="Condividi questa pagina">
        <a class="share-btn share-wa" href="https://wa.me/?text=${text}" target="_blank" rel="noopener noreferrer" aria-label="Condividi su WhatsApp">${SHARE_ICONS.wa}</a>
        <a class="share-btn share-fb" href="https://www.facebook.com/sharer/sharer.php?u=${enc}" target="_blank" rel="noopener noreferrer" aria-label="Condividi su Facebook">${SHARE_ICONS.fb}</a>
        <a class="share-btn share-x" href="https://twitter.com/intent/tweet?text=${encTitle}&amp;url=${enc}" target="_blank" rel="noopener noreferrer" aria-label="Condividi su X">${SHARE_ICONS.x}</a>
        <button class="share-btn share-ig" type="button" data-share="instagram" aria-label="Copia il link per Instagram">${SHARE_ICONS.ig}</button>
        <button class="share-btn share-copy" type="button" data-share="copy" aria-label="Copia link">${SHARE_ICONS.copy}</button>
      </nav>
      <p class="share-note" hidden></p>
    </div>`;
  }

  function copyText(value, note, message) {
    const done = (ok) => {
      note.hidden = false;
      note.textContent = ok ? message : value;
    };
    const fallback = () => {
      const field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch {}
      field.remove();
      done(ok);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(() => done(true)).catch(fallback);
      return;
    }
    fallback();
  }

  function bindShare(footer) {
    const note = footer.querySelector(".share-note");
    if (!note) return;
    footer.querySelectorAll("[data-share]").forEach((el) => {
      el.addEventListener("click", () => {
        const { url } = pageShare();
        if (el.dataset.share === "instagram") {
          copyText(url, note, "Link copiato. Incollalo su Instagram.");
        } else {
          copyText(url, note, "Link copiato.");
        }
      });
    });
  }

  function imageFocus(focus) {
    const map = { center: "center", top: "center top", bottom: "center bottom", left: "left center", right: "right center" };
    return map[focus] || "center";
  }
  function imageOrient(w, h, stored) {
    if (stored) return stored;
    const nw = Number(w), nh = Number(h);
    if (!nw || !nh) return "";
    const r = nw / nh;
    if (r > 0.92 && r < 1.08) return "square";
    return nw > nh ? "landscape" : "portrait";
  }
  function imgMeta(d, prefix) {
    prefix = prefix || "image";
    const w = d[prefix + "Width"];
    const h = d[prefix + "Height"];
    const orient = imageOrient(w, h, d[prefix + "Orient"]);
    const fit = d[prefix + "Fit"] || "";
    const dim = w && h ? ` width="${esc(w)}" height="${esc(h)}"` : "";
    const frameCls = [orient ? "orient-" + orient : "", fit ? "fit-" + fit : ""].filter(Boolean).join(" ");
    return { w, h, orient, fit, dim, frameCls };
  }
  function photoFig(d, extraClass) {
    if (!d.image) return "";
    const pos = imageFocus(d.imageFocus);
    const meta = imgMeta(d, "image");
    const cls = ["sec-photo", extraClass || "", meta.frameCls].filter(Boolean).join(" ");
    return `<figure class="${cls}"${meta.orient ? ` data-orient="${esc(meta.orient)}"` : ""}><img class="smart-img" src="${asset(d.image)}" alt="${esc(d.imageAlt || d.alt || d.caption || "")}" style="object-position:${pos}" loading="lazy" decoding="async"${meta.dim}${meta.orient ? ` data-orient="${esc(meta.orient)}"` : ""}${meta.fit ? ` data-fit="${esc(meta.fit)}"` : ""}></figure>`;
  }
  function withPhoto(d, copyHtml) {
    if (!d.image) return copyHtml;
    const side = d.imageSide || "right";
    const fig = photoFig(d);
    const meta = imgMeta(d, "image");
    const wrap = `sec-with-image side-${side}${meta.orient ? " orient-" + meta.orient : ""}`;
    if (side === "top") return `<div class="${wrap}">${fig}<div class="sec-photo-copy">${copyHtml}</div></div>`;
    if (side === "bottom") return `<div class="${wrap}"><div class="sec-photo-copy">${copyHtml}</div>${fig}</div>`;
    if (side === "left") return `<div class="${wrap}">${fig}<div class="sec-photo-copy">${copyHtml}</div></div>`;
    return `<div class="${wrap}"><div class="sec-photo-copy">${copyHtml}</div>${fig}</div>`;
  }
  function coverStage(book) {
    if (!book) return "";
    const meta = imgMeta(book, "cover");
    const fit = meta.fit || (meta.orient === "landscape" ? "contain" : "");
    const cls = ["cover-stage", meta.orient ? "orient-" + meta.orient : "", fit ? "fit-" + fit : ""].filter(Boolean).join(" ");
    const pos = book.coverFocus ? ` style="object-position:${imageFocus(book.coverFocus)}"` : "";
    return `<div class="${cls}">${book.cover ? `<img class="smart-img" src="${asset(book.cover)}" alt="Copertina di ${esc(book.title)}" loading="lazy" decoding="async"${meta.dim}${pos}${meta.orient ? ` data-orient="${esc(meta.orient)}"` : ""}>` : ""}
        ${book.coverNote ? `<span class="stage-note">${esc(book.coverNote)}</span>` : ""}</div>`;
  }
  function bookPromo(book) {
    if (!book || !book.promoImage) return "";
    const meta = imgMeta(book, "promoImage");
    const cap = book.promoCaption || ("Erasmo Stasolla con " + (book.title || "il romanzo"));
    return `<figure class="book-promo fade-in">
      <img class="smart-img" src="${asset(book.promoImage)}" alt="${esc(cap)}" loading="lazy" decoding="async"${meta.dim}${meta.orient ? ` data-orient="${esc(meta.orient)}"` : ""}>
      <figcaption>${esc(cap)}</figcaption>
    </figure>`;
  }
  function vbItem(kind, id, label, html) {
    if (!builderMode) return html;
    return `<div class="vb-item" data-vb-kind="${esc(kind)}" data-vb-id="${esc(id)}">
      <div class="vb-item-bar">${esc(label)}</div>${html}
    </div>`;
  }

  function actions(d) {
    const parts = [];
    if (d.buttonLabel) parts.push(`<a class="button${d.buttonLight ? " light" : ""}" href="${href(d.buttonHref)}"${ext(d.buttonHref || "")}>${esc(d.buttonLabel)}<span class="arrow" aria-hidden="true">${arrow(d.buttonHref || "")}</span></a>`);
    if (d.linkLabel) {
      const download = /\.(pdf|txt|jpg|jpeg|png)$/i.test(d.linkHref || "") ? " download" : "";
      parts.push(`<a class="text-link" href="${href(d.linkHref)}"${ext(d.linkHref || "")}${download}>${esc(d.linkLabel)}<span class="arrow" aria-hidden="true">${arrow(d.linkHref || "")}</span></a>`);
    }
    if (d.link2Label) parts.push(`<a class="text-link" href="${href(d.link2Href)}"${ext(d.link2Href || "")}>${esc(d.link2Label)}<span class="arrow" aria-hidden="true">${arrow(d.link2Href || "")}</span></a>`);
    return parts.length ? `<div class="actions">${parts.join("")}</div>` : "";
  }

  function renderHero(d, content) {
    const site = content.site || {};
    const custom = !!d.image;
    const src = d.image || site.portrait;
    const meta = custom ? imgMeta(d, "image") : imgMeta(site, "portrait");
    const pos = d.imageFocus ? imageFocus(d.imageFocus) : "center 32%";
    const cls = ["portrait-wrap", "fade-in", meta.frameCls].filter(Boolean).join(" ");
    return `<section class="hero"><div class="container"><div class="hero-grid${meta.orient ? " orient-" + meta.orient : ""}"><div class="fade-in">
      ${d.eyebrow ? `<p class="eyebrow">${esc(d.eyebrow)}</p>` : ""}
      <h1>${rich(d.title || "")}</h1>
      ${d.copy ? `<p class="hero-copy">${esc(d.copy)}</p>` : ""}
      ${actions({ ...d, buttonLight: true })}
    </div><figure class="${cls}"${meta.orient ? ` data-orient="${esc(meta.orient)}"` : ""}>
      <img class="smart-img" src="${asset(src)}" alt="${esc(d.imageAlt || site.portraitCaption || site.name || "")}" fetchpriority="high" decoding="async" style="object-position:${pos}"${meta.dim}${meta.orient ? ` data-orient="${esc(meta.orient)}"` : ""}>
      <figcaption><strong>${esc(site.portraitCaption || "")}</strong><span>${esc(site.portraitNote || "")}</span></figcaption>
    </figure></div>
    <div class="hero-bottom"><span>${esc(d.barLeft || "")}</span><span>${esc(d.barRight || "")}</span></div>
    </div></section>`;
  }

  function renderFeatured(d, content) {
    const book = find(content.books, d.bookId);
    if (!book || (!builderMode && !bookLive(book))) return "";
    const cls = d.catalog ? "book-feature catalog-feature" : "book-feature";
    const pad = d.catalog ? ' style="padding-top:0"' : "";
    const extraBtn = buyLink(book, d.catalog ? "Acquista" : "Dove acquistarlo");
    const meta = !d.catalog && (book.publisher || book.year || book.pages)
      ? `<div class="meta-line">${[book.publisher, book.year, book.pages ? book.pages + " pagine" : ""].filter(Boolean).map((x) => `<span>${esc(x)}</span>`).join("")}</div>`
      : "";
    const featured = `<section class="section cms-featured"${pad}><div class="container"><div class="${cls}">
      ${coverStage(book)}
      <div class="book-content">
        ${d.eyebrow ? `<div class="eyebrow">${esc(d.eyebrow)}</div>` : ""}
        <h2>${rich(book.title)}</h2>
        <p>${esc(book.summary || "")}</p>
        ${meta}
        <div class="actions">
          <a class="button" href="${href(bookPath(book))}">${d.catalog ? "Scopri il romanzo" : "Entra nel libro"}<span class="arrow" aria-hidden="true">→</span></a>
          ${extraBtn}
        </div>
      </div></div></div></section>`;
    return vbItem("book", book.id, "Romanzo", featured);
  }

  function renderBookList(d, content) {
    let books = content.books || [];
    if (d.filter === "upcoming") books = books.filter((b) => !bookLive(b));
    if (d.filter === "published") books = books.filter((b) => bookLive(b) && !b.featured);
    if (!builderMode) {
      if (d.filter === "upcoming") books = [];
      else books = books.filter(bookLive);
    }
    if (!books.length && !builderMode) return "";
    const head = `<div class="section-head"><div>
      ${d.eyebrow ? `<div class="eyebrow">${esc(d.eyebrow)}</div>` : ""}
      ${d.title ? `<h2>${rich(d.title)}</h2>` : ""}
    </div>${d.linkLabel ? `<a class="text-link" href="${href(d.linkHref)}">${esc(d.linkLabel)} <span class="arrow" aria-hidden="true">→</span></a>` : ""}</div>`;
    const rows = books.map((b) => {
      const coverMeta = b.cover ? imgMeta(b, "cover") : { orient: "", frameCls: "" };
      return vbItem("book", b.id, "Romanzo", `<a class="work-row${b.cover ? " has-cover" : ""}${coverMeta.orient ? " orient-" + coverMeta.orient : ""}" href="${href(bookPath(b))}">
      ${b.cover ? `<img class="work-cover smart-img" src="${asset(b.cover)}" alt=""${b.coverFocus ? ` style="object-position:${imageFocus(b.coverFocus)}"` : ""}${coverMeta.dim}${coverMeta.orient ? ` data-orient="${esc(coverMeta.orient)}"` : ""}>` : `<span class="work-number">${esc(b.number || "")}</span>`}
      <div><span class="eyebrow">${esc(b.eyebrow || "")}</span><h3>${esc(b.title)}</h3></div>
      <p>${esc(b.summary || "")}</p>
      <span class="arrow" aria-hidden="true">→</span>
    </a>`);
    }).join("");
    return `<section class="section" style="padding-top:0"><div class="container">${withPhoto(d, head + `<div class="works">${rows}</div>`)}</div></section>`;
  }

  function upcomingBooks(content) {
    return (content.books || [])
      .filter((b) => (b.status || "") === "upcoming")
      .sort((a, b) => (Number(a.upcomingOrder) || 99) - (Number(b.upcomingOrder) || 99));
  }

  function upcomingCover(book) {
    if (book.cover) return `<div class="upcoming-media">${coverStage(book)}</div>`;
    return `<div class="upcoming-cover" aria-hidden="true"><span>${esc(book.title)}</span></div>`;
  }

  function upcomingCard(book) {
    const sub = book.subtitle ? `<p class="upcoming-sub">${esc(book.subtitle)}</p>` : "";
    return `<article class="upcoming-card">
      ${upcomingCover(book)}
      <div class="upcoming-copy">
        <div class="eyebrow">${esc(book.statusLabel || "Prossimamente")}</div>
        <h3>${esc(book.title)}</h3>
        ${sub}
        ${paras(book.body || book.summary || "")}
      </div>
    </article>`;
  }

  function renderUpcomingProjects(d, content) {
    const books = upcomingBooks(content);
    if (!books.length && !builderMode) return "";
    if (d.teaser) {
      const items = books.map((b) => `<li><strong>${esc(b.title)}</strong>${b.subtitle ? `<em>${esc(b.subtitle)}</em>` : ""}</li>`).join("");
      return `<section class="section upcoming-teaser"><div class="container">
        ${d.eyebrow ? `<div class="eyebrow">${esc(d.eyebrow)}</div>` : ""}
        ${d.title ? `<h2>${rich(d.title)}</h2>` : ""}
        ${d.subtitle ? `<p class="upcoming-lead">${esc(d.subtitle)}</p>` : ""}
        <ol class="upcoming-index">${items}</ol>
        <div class="actions">
          <a class="text-link" href="${href(d.linkHref || "romanzi/#prossimi-progetti")}">${esc(d.linkLabel || "Tutti i progetti")}<span class="arrow" aria-hidden="true">→</span></a>
        </div>
      </div></section>`;
    }
    const intro = d.intro ? `<div class="upcoming-intro">${paras(d.intro)}</div>` : "";
    const close = d.closing ? `<div class="upcoming-close">${paras(d.closing)}</div>` : "";
    const head = `${d.eyebrow ? `<div class="eyebrow">${esc(d.eyebrow)}</div>` : ""}
      ${d.title ? `<h2>${rich(d.title)}</h2>` : ""}
      ${d.subtitle ? `<p class="upcoming-lead">${esc(d.subtitle)}</p>` : ""}
      ${intro}`;
    return `<section class="section upcoming-projects" id="prossimi-progetti"><div class="container">
      ${withPhoto(d, head)}
      <div class="upcoming-grid">${books.map(upcomingCard).join("")}</div>
      ${close}
    </div></section>`;
  }

  function renderPressQuote(d) {
    const strip = `<div class="press-strip">
      <span class="press-mark">${esc(d.source || "")}</span>
      <div><p>${rich(d.quote || "")}</p>${d.note ? `<p class="small">${esc(d.note)}</p>` : ""}</div>
      ${d.linkLabel ? `<a class="text-link" href="${href(d.linkHref)}"${ext(d.linkHref || "")}>${esc(d.linkLabel)}<span class="arrow" aria-hidden="true">↗</span><span class="sr-only"> (si apre in una nuova scheda)</span></a>` : ""}
    </div>`;
    return `<section class="section press-section" style="padding-top:0"><div class="container">${withPhoto(d, strip)}</div></section>`;
  }

  function renderEncounters(d, content) {
    const ev = find(content.events, d.eventId);
    const eventHtml = ev ? vbItem("event", ev.id, "Incontro", `<div class="home-event">
      ${ev.homeEyebrow ? `<span class="eyebrow">${esc(ev.homeEyebrow)}</span>` : ""}
      <div class="home-event-date">${esc(ev.day || "")}<span>${esc(ev.month || "")}</span></div>
      <h3>${esc(ev.city || ev.place || "")}</h3>
      <p>${esc(ev.homeLine || ev.summary || "")}</p>
      <a href="${href("incontri/")}#archivio" class="text-link">Ripercorri la presentazione <span class="arrow" aria-hidden="true">→</span></a>
    </div>`) : "";
    return `<section class="section dark-section"><div class="container encounters"><div class="encounter-text">${d.image ? photoFig(d, "encounter-photo") : ""}
      ${d.eyebrow ? `<div class="eyebrow">${esc(d.eyebrow)}</div>` : ""}
      <h2>${rich(d.title || "")}</h2>
      ${d.copy ? `<p>${esc(d.copy)}</p>` : ""}
      ${actions({ ...d, buttonLight: true })}
    </div>${eventHtml}</div></section>`;
  }

  function renderHeading(d) {
    const copy = `${d.eyebrow ? `<div class="eyebrow">${esc(d.eyebrow)}</div>` : ""}
      <h1>${rich(d.title || "")}</h1>
      ${d.subtitle ? `<p>${esc(d.subtitle)}</p>` : ""}`;
    return `<div class="container page-heading fade-in">${withPhoto(d, copy)}</div>`;
  }

  function renderText(d) {
    const extra = [];
    if (d.link2Label) extra.push(`<p><a class="text-link" href="${href(d.link2Href)}"${ext(d.link2Href || "")}>${esc(d.link2Label)} ${arrow(d.link2Href || "")}</a></p>`);
    const copy = `${d.title ? `<h2>${rich(d.title)}</h2>` : ""}
      ${paras(d.body || "")}
      ${d.linkLabel ? `<p><a class="text-link" href="${href(d.linkHref)}"${ext(d.linkHref || "")}>${esc(d.linkLabel)} ${arrow(d.linkHref || "")}</a></p>` : ""}
      ${extra.join("")}
      ${actions(d)}`;
    return `<div class="container legal-copy" style="padding-bottom:40px">${withPhoto(d, copy)}</div>`;
  }

  function renderBio(d) {
    const side = d.imageSide || "left";
    const pos = d.imageFocus ? ` style="object-position:${imageFocus(d.imageFocus)}"` : "";
    const meta = imgMeta(d, "image");
    return `<div class="container bio-layout${side === "right" ? " bio-flip" : ""}${meta.orient ? " orient-" + meta.orient : ""}">
      <figure class="bio-image ${meta.frameCls}"${meta.orient ? ` data-orient="${esc(meta.orient)}"` : ""}>${d.image ? `<img class="smart-img" src="${asset(d.image)}" alt="${esc(d.caption || d.imageAlt || "")}" loading="lazy" decoding="async"${meta.dim}${pos}${meta.orient ? ` data-orient="${esc(meta.orient)}"` : ""}>` : ""}
        ${d.caption ? `<figcaption>${esc(d.caption)}</figcaption>` : ""}</figure>
      <div class="bio-copy">
        ${d.lead ? `<p class="lead">${esc(d.lead)}</p>` : ""}
        ${paras(d.body || "")}
        ${d.heading ? `<h2>${esc(d.heading)}</h2>` : ""}
        ${paras(d.body2 || "")}
        ${actions(d)}
      </div>
    </div>`;
  }

  function renderEvents(d, content) {
    const upcoming = (content.events || []).filter((e) => e.status === "upcoming");
    const past = (content.events || []).filter((e) => e.status !== "upcoming");
    const upcomingHtml = `<section class="agenda-intro" aria-labelledby="prossimi">
      <h2 id="prossimi">${esc(d.upcomingTitle || "I prossimi incontri.")}</h2>
      <div>${upcoming.length ? upcoming.map((e) => vbItem("event", e.id, "Incontro", `<p class="empty-date">${esc(e.title)}</p><p class="muted">${esc(e.summary || "")}</p>`)).join("")
        : `<p class="empty-date">${esc(d.upcomingEmpty || "")}</p><p class="muted">${esc(d.upcomingNote || "")}</p>`}</div>
    </section>`;
    const pastHtml = past.map((e) => vbItem("event", e.id, "Incontro", `<article class="event-row">
      <time class="event-date" datetime="${esc(e.date || "")}"><strong>${esc(e.day || "")}</strong><span>${esc(e.monthShort || "")}<br>${esc(e.year || "")}</span></time>
      <div>
        ${e.place ? `<div class="eyebrow">${esc(e.place)}</div>` : ""}
        <h3>${esc(e.title)}</h3>
        ${e.summary ? `<p>${esc(e.summary)}</p>` : ""}
        ${e.note ? `<p class="small">${esc(e.note)}</p>` : ""}
        ${e.linkLabel ? `<a class="text-link" href="${href(e.linkHref)}"${ext(e.linkHref || "")}>${esc(e.linkLabel)}<span class="arrow" aria-hidden="true">↗</span></a>` : ""}
      </div>
      <span class="event-status">${e.status === "upcoming" ? "In programma" : "Evento concluso"}</span>
    </article>${e.contextTitle ? `<div class="event-context"><h3>${esc(e.contextTitle)}</h3><p>${esc(e.contextBody || "")}</p>
      ${e.contextLinkLabel ? `<a class="text-link" href="${href(e.contextLinkHref)}"${ext(e.contextLinkHref || "")}>${esc(e.contextLinkLabel)} <span aria-hidden="true">↗</span></a>` : ""}</div>` : ""}`)).join("");
    const body = `${upcomingHtml}
      <section id="archivio"><div class="section-head"><div>
        ${d.archiveEyebrow ? `<div class="eyebrow">${esc(d.archiveEyebrow)}</div>` : ""}
        ${d.archiveTitle ? `<h2>${rich(d.archiveTitle)}</h2>` : ""}
      </div></div>${pastHtml}</section>
      <div class="actions"><a class="button outline" href="${href("materiali/")}">Rassegna stampa <span aria-hidden="true">→</span></a></div>`;
    return `<div class="container" style="padding-bottom:70px">${withPhoto(d, body)}</div>`;
  }

  function renderPressList(d, content) {
    const items = pressItems(content, d);
    if (!items.length && !builderMode) return "";
    let body;
    if (d.groupByBook) {
      const groups = [];
      const seen = new Set();
      items.forEach((p) => {
        const key = p.bookId || "altro";
        if (seen.has(key)) return;
        seen.add(key);
        groups.push(key);
      });
      body = groups.map((key) => {
        const book = find(content.books, key);
        const list = items.filter((p) => (p.bookId || "altro") === key);
        const heading = book
          ? `<h3 class="press-book-title"><a href="${href(bookPath(book))}">${esc(book.title)}</a></h3>`
          : `<h3 class="press-book-title">Altri articoli</h3>`;
        return `<div class="press-book">${heading}${list.map(pressArticle).join("")}</div>`;
      }).join("");
    } else {
      body = items.map(pressArticle).join("");
    }
    const list = `<div class="section-head"><div>
        ${d.eyebrow ? `<div class="eyebrow">${esc(d.eyebrow)}</div>` : ""}
        ${d.title ? `<h2>${rich(d.title)}</h2>` : ""}
      </div></div>${body || `<p class="muted">Nessun articolo in questo elenco.</p>`}`;
    return `<section id="${d.topic === "presentazione" ? "articoli-presentazioni" : "rassegna"}" class="container" style="padding-bottom:70px">${withPhoto(d, list)}</section>`;
  }

  function renderResources(d, content) {
    const groups = {};
    (content.resources || []).forEach((r) => {
      const key = r.group || "altri";
      (groups[key] = groups[key] || { title: r.groupTitle || key, items: [] }).items.push(r);
      if (r.groupTitle) groups[key].title = r.groupTitle;
    });
    const cols = Object.values(groups).map((g) => `<section><h2>${esc(g.title)}</h2>${g.items.map((r) =>
      vbItem("resource", r.id, "Materiale", `<div class="resource"><div><h3>${esc(r.title)}</h3><p>${esc(r.description || "").replace(/\n/g, "<br>")}</p></div>
      <a href="${asset(r.href)}" ${r.download ? "download" : ""} aria-label="${esc(r.title)}"><span aria-hidden="true">↓</span></a></div>`)
    ).join("")}</section>`).join("");
    const inner = `<div class="material-grid">${cols}</div>
      ${d.note ? `<p class="small muted" style="margin-top:8px;padding-bottom:20px">${esc(d.note)}</p>` : ""}`;
    return `<div class="container">${withPhoto(d, inner)}</div>`;
  }

  function renderPurchases(d, content) {
    const book = find(content.books, d.bookId);
    if (book && !builderMode && !bookLive(book)) return "";
    const links = (content.purchases || []).filter((p) => {
      if (d.bookId && p.bookId !== d.bookId) return false;
      if (builderMode) return true;
      const owned = find(content.books, p.bookId);
      return !owned || bookLive(owned);
    });
    const list = links.map((p) => vbItem("purchase", p.id, "Libreria", `<a class="purchase-link" href="${href(p.href)}"${ext(p.href || "")}>
      <span><span class="seller-name">${esc(p.name)}</span><span class="seller-type">${esc(p.type || "")}</span></span>
      <span>Vai al libro ↗<span class="sr-only"> (nuova scheda)</span></span></a>`)).join("");
    if (!book) return `<div class="container"><div class="purchase-list">${list}</div></div>`;
    return `<div class="container purchase-block" id="${esc(buyAnchor(book))}"><div class="detail-grid">
      ${coverStage(book)}
      <div class="detail-copy">
        <div class="eyebrow">${esc(book.statusLabel || "Disponibile")}</div>
        <h2 style="margin-top:15px">${esc(book.title)}</h2>
        <p class="purchase-intro">${esc([book.publisher, book.year, book.pages ? book.pages + " pagine" : ""].filter(Boolean).join(" · "))}${book.isbn ? `<br>ISBN ${esc(book.isbn)}` : ""}</p>
        <div class="purchase-list">${list}</div>
        ${d.note ? `<p class="purchase-note">${esc(d.note)}</p>` : ""}
      </div></div></div>`;
  }

  function renderCta(d) {
    return `<div class="container" style="padding-bottom:50px">${withPhoto(d, actions(d))}</div>`;
  }

  function renderImageText(d) {
    const copy = `${d.title ? `<h2>${rich(d.title)}</h2>` : ""}${paras(d.body || "")}`;
    if (d.image) return `<div class="container" style="padding-bottom:70px">${withPhoto(d, `<div class="detail-copy">${copy}</div>`)}</div>`;
    return `<div class="container detail-grid" style="padding-bottom:70px"><div class="detail-copy">${copy}</div></div>`;
  }

  function renderGallery(d) {
    const items = (d.items || []).filter((it) => it.src);
    const layout = d.layout || "grid";
    const figs = items.map((it) => {
      const orient = imageOrient(it.width, it.height, it.orient);
      return `<button type="button" class="gallery-cell${orient ? " orient-" + orient : ""}" data-lightbox="${esc(asset(it.src))}" data-caption="${esc(it.caption || it.alt || "")}"${orient ? ` data-orient="${esc(orient)}"` : ""}>
      <img class="smart-img" src="${asset(it.src)}" alt="${esc(it.alt || "")}" loading="lazy" decoding="async"${it.width && it.height ? ` width="${esc(it.width)}" height="${esc(it.height)}"` : ""}${orient ? ` data-orient="${esc(orient)}"` : ""}>
      ${it.caption ? `<span>${esc(it.caption)}</span>` : ""}
    </button>`;
    }).join("");
    return `<section class="container cms-gallery-wrap">
      ${d.eyebrow ? `<div class="eyebrow">${esc(d.eyebrow)}</div>` : ""}
      ${d.title ? `<h2>${rich(d.title)}</h2>` : ""}
      ${d.caption ? `<p class="muted">${esc(d.caption)}</p>` : ""}
      <div class="cms-gallery layout-${esc(layout)}">${figs}</div>
    </section>`;
  }

  function videoEmbed(url) {
    const yt = String(url || "").match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
    if (yt) return "https://www.youtube-nocookie.com/embed/" + yt[1];
    const vimeo = String(url || "").match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) return "https://player.vimeo.com/video/" + vimeo[1];
    return "";
  }

  function renderVideo(d) {
    const src = videoEmbed(d.url || "");
    return `<section class="container cms-video">
      ${d.title ? `<h2>${rich(d.title)}</h2>` : ""}
      ${src ? `<div class="cms-video-frame"><iframe src="${esc(src)}" title="${esc(d.title || "Video")}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : ""}
      ${d.caption ? `<p class="muted">${esc(d.caption)}</p>` : ""}
      ${paras(d.body || "")}
    </section>`;
  }

  function renderColumns(d) {
    const cols = [d.col1, d.col2, d.col3].filter(Boolean);
    return `<section class="container cms-columns">
      ${d.title ? `<h2>${rich(d.title)}</h2>` : ""}
      <div class="cms-cols n-${cols.length}">${cols.map((c) => `<div>${paras(c)}</div>`).join("")}</div>
    </section>`;
  }

  function renderQuoteBlock(d) {
    return `<section class="container cms-quote">
      <blockquote><p>${esc(d.quote || "")}</p>${d.cite ? `<cite>${esc(d.cite)}</cite>` : ""}</blockquote>
      ${d.note ? `<p class="muted">${esc(d.note)}</p>` : ""}
    </section>`;
  }

  function renderDivider(d) {
    return d.kind === "space" ? `<div class="cms-space" aria-hidden="true"></div>` : `<hr class="cms-rule">`;
  }

  function styleWrap(d, html) {
    if (!html) return "";
    const cls = ["cms-styled"];
    if (d.styleTheme) cls.push("theme-" + d.styleTheme);
    if (d.stylePad) cls.push("pad-" + d.stylePad);
    if (d.styleAlign) cls.push("align-" + d.styleAlign);
    if (d.styleWidth) cls.push("width-" + d.styleWidth);
    const st = [];
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(d.styleBg || "")) st.push("--sec-bg:" + d.styleBg);
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(d.styleColor || "")) st.push("--sec-ink:" + d.styleColor);
    return `<div class="${cls.join(" ")}"${st.length ? ` style="${st.join(";")}"` : ""}>${html}</div>`;
  }

  function renderSection(section, content) {
    if (section.visible === false && !builderMode) return "";
    const d = section.data || {};
    const map = {
      hero: renderHero, featuredBook: renderFeatured, bookList: renderBookList, upcomingProjects: renderUpcomingProjects,
      pressQuote: renderPressQuote, pressHighlight: renderPressHighlight, encounters: renderEncounters, heading: renderHeading,
      text: renderText, bio: renderBio, eventsList: renderEvents, pressList: renderPressList,
      resources: renderResources, purchases: renderPurchases, cta: renderCta, imageText: renderImageText,
      gallery: renderGallery, video: renderVideo, columns: renderColumns, quote: renderQuoteBlock, divider: renderDivider,
    };
    const fn = map[section.type];
    const html = fn ? styleWrap(d, fn(d, content)) : "";
    if (!builderMode) return html;
    return `<div class="vb-block${section.visible === false ? " is-hidden" : ""}" data-vb-section="${esc(section.id)}" data-vb-page="${esc(pageId)}">
      <div class="vb-toolbar">
        <button type="button" class="vb-drag" data-vb-drag draggable="true" title="Trascina per riordinare">⋮⋮</button>
        <span class="vb-label">${esc(TYPE_IT[section.type] || section.type)}</span>
        <button type="button" data-vb-act="add-before" title="Inserisci una sezione sopra">+ sopra</button>
        <button type="button" data-vb-act="add-after" title="Inserisci una sezione sotto">+ sotto</button>
        <button type="button" data-vb-act="clone" title="Clona questa sezione">Clona</button>
        <button type="button" data-vb-act="up" title="Sposta su">Su</button>
        <button type="button" data-vb-act="down" title="Sposta giù">Giù</button>
        <button type="button" data-vb-act="hide" title="${section.visible === false ? "Mostra" : "Nascondi"}">${section.visible === false ? "Mostra" : "Nascondi"}</button>
        <button type="button" data-vb-act="delete" title="Elimina">Elimina</button>
      </div>
      ${html || `<div class="container" style="padding:40px 0"><p class="muted">Sezione ancora vuota. Clicca per compilare.</p></div>`}
    </div>`;
  }

  function pressBlock(content, book) {
    const items = pressItems(content, { bookId: book.id });
    if (!items.length) return "";
    const featured = items.filter((p) => p.featured);
    const reviews = items.filter((p) => (p.topic || "libro") !== "presentazione" && !p.featured);
    const events = items.filter((p) => p.topic === "presentazione");
    const block = (title, list) => list.length ? `<div class="press-book"><h3 class="press-book-title">${esc(title)}</h3>${list.map(pressArticle).join("")}</div>` : "";
    const feats = featured.map((p) => pressFeatureCard(p, content, { hideBook: true })).join("");
    return `<section class="subsection book-press" id="rassegna" style="padding-bottom:70px">
      <h2>Rassegna stampa.</h2>
      ${feats}
      ${block("Sul romanzo", reviews)}
      ${block("Sulle presentazioni", events)}
    </section>`;
  }

  function renderBookPage(content, id) {
    const book = find(content.books, id) || content.books.find((b) => b.slug === id);
    if (!book || (!builderMode && !bookLive(book))) {
      return `<div class="container page-heading fade-in"><h1>Questa scheda non è pubblica.</h1><p>Torna all’elenco dei romanzi quando il libro sarà in libreria.</p><div class="actions"><a class="button" href="${href("romanzi/")}">I romanzi<span class="arrow" aria-hidden="true">→</span></a></div></div>`;
    }
    const heading = `<div class="container page-heading fade-in">
      <div class="breadcrumb"><a href="${href("romanzi/")}">I romanzi</a> / ${esc(book.title)}</div>
      ${book.eyebrow ? `<div class="eyebrow">${esc(book.eyebrow)}</div>` : ""}
      <h1>${esc(book.title)}</h1>
      ${book.intro ? `<p>${esc(book.intro)}</p>` : ""}
    </div>`;
    if (book.status === "published") {
      return heading + `<div class="container"><div class="detail-grid">
        ${coverStage(book)}
        <div class="detail-copy">
          ${book.heading ? `<h2>${rich(book.heading)}</h2>` : ""}
          ${paras(book.body || "")}
          <dl class="book-data">
            <div><dt>Autore</dt><dd>Erasmo Stasolla</dd></div>
            ${book.publisher ? `<div><dt>Editore</dt><dd>${esc(book.publisher)}</dd></div>` : ""}
            ${book.year ? `<div><dt>Pubblicazione</dt><dd>${esc(book.year)}</dd></div>` : ""}
            ${book.pages ? `<div><dt>Pagine</dt><dd>${esc(book.pages)}</dd></div>` : ""}
            ${book.isbn ? `<div><dt>ISBN</dt><dd>${esc(book.isbn)}</dd></div>` : ""}
            ${book.language ? `<div><dt>Lingua</dt><dd>${esc(book.language)}</dd></div>` : ""}
          </dl>
          <div class="actions">
            ${book.amazon ? `<a class="button" href="${esc(book.amazon)}" target="_blank" rel="noopener noreferrer">Acquista su Amazon<span class="arrow" aria-hidden="true">↗</span></a>` : ""}
            ${book.sheetPdf ? `<a class="text-link" href="${asset(book.sheetPdf)}" download>Scarica la scheda<span class="arrow" aria-hidden="true">↓</span></a>` : ""}
            ${book.publisherUrl ? `<a class="text-link" href="${esc(book.publisherUrl)}" target="_blank" rel="noopener noreferrer">Dal sito dell’editore<span class="arrow" aria-hidden="true">↗</span></a>` : ""}
          </div>
        </div></div>
        ${bookPromo(book)}
        <section class="subsection" style="padding-bottom:36px"><h2>Intorno al libro.</h2>
          <div class="actions">
            <a class="text-link" href="${href("incontri/")}#archivio">Le presentazioni<span class="arrow" aria-hidden="true">→</span></a>
            <a class="text-link" href="${href("materiali/")}">Rassegna stampa e schede<span class="arrow" aria-hidden="true">→</span></a>
          </div>
        </section>
        ${pressBlock(content, book)}</div>`;
    }
    return heading + `<section class="container" style="padding-bottom:75px"><div class="project-intro">
      <span class="chapter-number" aria-hidden="true">${esc(book.number || "")}</span>
      <div>
        ${book.heading ? `<h2>${rich(book.heading)}</h2>` : ""}
        ${paras(book.body || "")}
        ${book.themes ? `<div class="info-line">${esc(book.themes)}</div>` : ""}
        <p class="publication-note">Il romanzo è in preparazione. La data di uscita e i collegamenti per l’acquisto saranno comunicati alla pubblicazione.</p>
        <div class="actions"><a class="text-link" href="${href("romanzi/")}">Torna ai romanzi<span class="arrow" aria-hidden="true">→</span></a></div>
      </div></div></section>`;
  }

  async function boot() {
    let content;
    try {
      const res = await fetch(root + "data/content.json", { cache: "no-store" });
      if (!res.ok) return;
      content = await res.json();
    } catch {
      return;
    }
    const page = (content.pages || []).find((p) => p.id === pageId);
    const slug = page ? (page.slug || "") : pageId === "book" ? "romanzi/" + bookId : "";
    chrome(content, slug);
    if (page && page.seoTitle) document.title = page.seoTitle;
    const main = document.getElementById("contenuto");
    if (!main) return;
    if (pageId === "book") {
      const book = find(content.books, bookId);
      if (book && (builderMode || bookLive(book))) document.title = book.title + " | Erasmo Stasolla";
      else document.title = "Scheda non pubblica | Erasmo Stasolla";
      main.innerHTML = renderBookPage(content, bookId);
      bindLightbox();
      smartImages(main);
      jumpHash();
      if (typeof window.initSiteMotion === "function") window.initSiteMotion();
      return;
    }
    if (!page) return;
    main.innerHTML = page.sections.map((s) => renderSection(s, content)).join("");
    bindLightbox();
    smartImages(main);
    jumpHash();
    if (builderMode) bindBuilder(page, main);
    else showAdminBar(page);
    if (typeof window.initSiteMotion === "function") window.initSiteMotion();
  }

  function jumpHash() {
    const id = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (!id) return;
    const go = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    go();
    requestAnimationFrame(go);
    setTimeout(go, 120);
  }

  function smartImages(root) {
    const scope = root || document;
    scope.querySelectorAll(".sec-photo img, .gallery-cell img, .portrait-wrap img, .bio-image img, .cover-stage img, .work-cover, .encounter-photo img, img.smart-img").forEach((img) => {
      const apply = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return;
        const stored = img.getAttribute("data-orient");
        const r = w / h;
        const orient = stored || ((r > 0.92 && r < 1.08) ? "square" : (w > h ? "landscape" : "portrait"));
        img.dataset.orient = orient;
        img.classList.remove("orient-landscape", "orient-portrait", "orient-square");
        img.classList.add("orient-" + orient);
        const frame = img.closest(".sec-photo, .gallery-cell, .portrait-wrap, .bio-image, .cover-stage, .work-row");
        if (frame) {
          frame.classList.remove("orient-landscape", "orient-portrait", "orient-square");
          frame.classList.add("orient-" + orient);
        }
        const wrap = img.closest(".sec-with-image, .hero-grid, .bio-layout");
        if (wrap) {
          wrap.classList.remove("orient-landscape", "orient-portrait", "orient-square");
          wrap.classList.add("orient-" + orient);
        }
        if (frame && frame.classList.contains("cover-stage") && orient === "landscape" && !frame.classList.contains("fit-cover")) {
          frame.classList.add("fit-contain");
        }
      };
      if (img.complete && img.naturalWidth) apply();
      else img.addEventListener("load", apply, { once: true });
    });
  }

  function bindLightbox() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-lightbox]");
      if (!a) return;
      e.preventDefault();
      let box = document.getElementById("cms-lightbox");
      if (!box) {
        box = document.createElement("div");
        box.id = "cms-lightbox";
        box.className = "cms-lightbox";
        box.innerHTML = '<button type="button" class="cms-lightbox-close" aria-label="Chiudi">×</button><img alt=""><p></p>';
        document.body.appendChild(box);
        box.addEventListener("click", (ev) => {
          if (ev.target === box || ev.target.closest(".cms-lightbox-close")) box.hidden = true;
        });
      }
      box.querySelector("img").src = a.getAttribute("data-lightbox");
      box.querySelector("img").alt = a.getAttribute("data-caption") || "";
      box.querySelector("p").textContent = a.getAttribute("data-caption") || "";
      box.hidden = false;
    });
  }

  function bindBuilder(page, main) {
    document.body.classList.add("is-builder");
    document.querySelectorAll("a[href]").forEach((a) => {
      const raw = a.getAttribute("href");
      if (!raw || /^(https?:|mailto:|#)/i.test(raw)) return;
      try {
        const u = new URL(a.href, location.href);
        if (u.origin !== location.origin) return;
        u.searchParams.set("builder", "1");
        a.setAttribute("href", u.pathname + u.search + u.hash);
      } catch {}
    });
    document.addEventListener("click", (e) => {
      const act = e.target.closest("[data-vb-act]");
      if (act) {
        e.preventDefault();
        e.stopPropagation();
        const block = act.closest(".vb-block");
        const sectionId = act.getAttribute("data-vb-section") || block?.dataset.vbSection || "";
        if (window.parent !== window) {
          window.parent.postMessage({
            type: "cms-section",
            action: act.dataset.vbAct,
            pageId: page.id,
            sectionId,
          }, location.origin);
        }
        return;
      }
      const add = e.target.closest("[data-vb-add]");
      if (add) {
        e.preventDefault();
        if (window.parent !== window) window.parent.postMessage({ type: "cms-add", pageId: page.id }, location.origin);
        return;
      }
      const item = e.target.closest(".vb-item");
      if (item) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll(".vb-item").forEach((el) => el.classList.toggle("is-on", el === item));
        if (window.parent !== window) {
          window.parent.postMessage({ type: "cms-item", pageId: page.id, kind: item.dataset.vbKind, id: item.dataset.vbId }, location.origin);
        }
        return;
      }
      const block = e.target.closest(".vb-block");
      if (!block) return;
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll(".vb-block").forEach((el) => el.classList.toggle("is-on", el === block));
      if (window.parent !== window) {
        window.parent.postMessage({ type: "cms-select", pageId: block.dataset.vbPage, sectionId: block.dataset.vbSection }, location.origin);
      }
    });
    let dragId = "";
    main.addEventListener("dragstart", (e) => {
      const handle = e.target.closest("[data-vb-drag]");
      const block = handle && handle.closest(".vb-block");
      if (!block) {
        e.preventDefault();
        return;
      }
      dragId = block.dataset.vbSection;
      block.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", dragId);
    });
    main.addEventListener("dragend", () => {
      main.querySelectorAll(".is-dragging,.drag-over,.drag-over-after").forEach((el) => el.classList.remove("is-dragging", "drag-over", "drag-over-after"));
      dragId = "";
    });
    main.addEventListener("dragover", (e) => {
      const over = e.target.closest(".vb-block");
      if (!over || over.dataset.vbSection === dragId) return;
      e.preventDefault();
      main.querySelectorAll(".drag-over,.drag-over-after").forEach((el) => el.classList.remove("drag-over", "drag-over-after"));
      const rect = over.getBoundingClientRect();
      over.classList.add(e.clientY < rect.top + rect.height / 2 ? "drag-over" : "drag-over-after");
    });
    main.addEventListener("drop", (e) => {
      const over = e.target.closest(".vb-block");
      if (!over) return;
      e.preventDefault();
      const fromId = e.dataTransfer.getData("text/plain") || dragId;
      const rect = over.getBoundingClientRect();
      const where = e.clientY < rect.top + rect.height / 2 ? "before" : "after";
      main.querySelectorAll(".is-dragging,.drag-over,.drag-over-after").forEach((el) => el.classList.remove("is-dragging", "drag-over", "drag-over-after"));
      if (fromId && fromId !== over.dataset.vbSection && window.parent !== window) {
        window.parent.postMessage({
          type: "cms-section",
          action: "reorder",
          pageId: page.id,
          fromId,
          toId: over.dataset.vbSection,
          where,
        }, location.origin);
      }
    });
    window.addEventListener("message", (e) => {
      if (e.origin !== location.origin || e.data?.type !== "cms-highlight") return;
      document.querySelectorAll(".vb-block").forEach((el) => {
        el.classList.toggle("is-on", el.dataset.vbSection === e.data.sectionId);
      });
      document.querySelectorAll(".vb-item").forEach((el) => {
        el.classList.toggle("is-on", !!(e.data.itemKind && el.dataset.vbKind === e.data.itemKind && el.dataset.vbId === e.data.itemId));
      });
      const on = document.querySelector(".vb-item.is-on") || document.querySelector(".vb-block.is-on");
      on?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    if (window.parent !== window) {
      window.parent.postMessage({ type: "cms-ready", pageId: page.id, path: location.pathname }, location.origin);
    }
    const blocks = [...main.querySelectorAll(".vb-block")];
    if (blocks[0]) {
      blocks[0].insertAdjacentHTML("beforebegin", '<button type="button" class="vb-gap" data-vb-act="add-start"><span>Aggiungi in cima</span></button>');
    }
    blocks.forEach((block) => {
      block.insertAdjacentHTML("afterend", `<button type="button" class="vb-gap" data-vb-act="add-after" data-vb-section="${esc(block.dataset.vbSection)}"><span>Aggiungi sezione</span></button>`);
    });
    main.insertAdjacentHTML("beforeend", '<button type="button" class="vb-add" data-vb-act="add">+ Aggiungi sezione in fondo</button>');
  }

  async function showAdminBar(page) {
    try {
      const res = await fetch("/api/session", { credentials: "same-origin" });
      const s = await res.json();
      if (!s.ok) return;
    } catch {
      return;
    }
    const bar = document.createElement("div");
    bar.className = "cms-admin-bar";
    bar.innerHTML = `<span>Sito in modifica</span>
      <a class="vb-enter" href="/admin/#/costruttore/${esc(page.id)}">Modifica visiva</a>
      <a href="/admin/#/pagine/${esc(page.id)}">Pannello</a>
      <a href="/admin/#/impostazioni">Social e SEO</a>`;
    document.body.prepend(bar);
    document.body.classList.add("has-admin-bar");
  }

  boot();
})();
