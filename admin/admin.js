const TYPES = {
  heading: { label: "Intestazione", hint: "Titolo e sottotitolo della pagina" },
  text: { label: "Testo", hint: "Titolo, paragrafi e collegamenti" },
  hero: { label: "Hero", hint: "Grande apertura della home" },
  gallery: { label: "Galleria", hint: "Foto da incontri, luoghi, copertine" },
  video: { label: "Video", hint: "YouTube o Vimeo" },
  columns: { label: "Colonne", hint: "Due o tre testi affiancati" },
  quote: { label: "Citazione", hint: "Frase in evidenza, tua o di altri" },
  divider: { label: "Separatore", hint: "Riga o spazio tra le sezioni" },
  featuredBook: { label: "Romanzo in evidenza", hint: "Copertina e scheda di un libro" },
  bookList: { label: "Elenco romanzi", hint: "Lista dei titoli" },
  pressQuote: { label: "Citazione stampa", hint: "Frase in evidenza da un articolo" },
  encounters: { label: "Blocco incontri", hint: "Sezione scura con un appuntamento" },
  bio: { label: "Biografia", hint: "Ritratto e testo sull’autore" },
  eventsList: { label: "Elenco incontri", hint: "Prossime date e archivio" },
  pressList: { label: "Rassegna stampa", hint: "Elenco articoli" },
  resources: { label: "Schede da scaricare", hint: "PDF, biografie, copertine" },
  purchases: { label: "Dove acquistare", hint: "Collegamenti alle librerie" },
  cta: { label: "Pulsanti", hint: "Inviti all’azione" },
  imageText: { label: "Immagine e testo", hint: "Foto accanto a un testo" },
};
const TYPE_GROUPS = [
  ["Racconto", ["heading", "text", "hero", "quote", "columns", "cta"]],
  ["Immagini e media", ["gallery", "imageText", "video", "divider"]],
  ["Libri e incontri", ["featuredBook", "bookList", "bio", "encounters", "eventsList", "pressQuote", "pressList", "purchases", "resources"]],
];
const NO_EXTRA_IMAGE = new Set(["featuredBook", "purchases", "gallery", "video", "columns", "quote", "divider"]);

const IMAGE_POS = [
  ["right", "A destra del testo"],
  ["left", "A sinistra del testo"],
  ["top", "Sopra il testo"],
  ["bottom", "Sotto il testo"],
];
const IMAGE_FOCUS = [
  ["center", "Centro"],
  ["top", "Alto"],
  ["bottom", "Basso"],
  ["left", "Sinistra"],
  ["right", "Destra"],
];
const IMAGE_FIT = [
  ["", "Automatico (consigliato)"],
  ["cover", "Riempi il riquadro, come sui social"],
  ["contain", "Mostra tutta, senza tagli"],
];
const IMAGE_FIELDS = [
  ["image", "Immagine di anteprima", "image"],
  ["imageAlt", "Testo alternativo"],
  ["imageSide", "Posizione dell’immagine", "select", IMAGE_POS],
  ["imageFocus", "Inquadratura (volto, soggetto)", "select", IMAGE_FOCUS],
  ["imageFit", "Come entra nel riquadro", "select", IMAGE_FIT],
];
const IMAGE_NAMES = new Set([
  "image", "imageAlt", "imageSide", "imageFocus", "imageFit",
  "imageWidth", "imageHeight", "imageOrient",
  "alt", "caption", "cover", "coverFocus", "coverNote", "coverFit",
  "coverWidth", "coverHeight", "coverOrient",
]);
const THEME_SWATCHES = [
  ["", "Sito", "#d3d5d3", "#f5f5f1"],
  ["paper", "Carta", "#f5f5f1", "#141b21"],
  ["white", "Bianco", "#ffffff", "#141b21"],
  ["dark", "Scuro", "#141b21", "#f5f5f1"],
  ["red", "Rosso", "#a4372e", "#ffffff"],
];
const PAD_CHIPS = [["", "Normale"], ["compact", "Compatta"], ["large", "Ampia"], ["none", "Nessuna"]];
const ALIGN_CHIPS = [["", "Sinistra"], ["center", "Centro"]];
const WIDTH_CHIPS = [["", "Normale"], ["narrow", "Stretta"], ["wide", "Larga"]];
const BTN_CHIPS = [["", "Angoli netti"], ["rounded", "Morbidi"], ["pill", "Pillola"]];
const SITE_COLORS = [
  ["colorInk", "Testo", "#141b21"],
  ["colorPaper", "Sfondo", "#f5f5f1"],
  ["colorRed", "Pulsanti", "#a4372e"],
  ["colorCoral", "Accento", "#ee9b85"],
];

function contentFieldsFor(type) {
  return (FIELDS[type] || []).filter((f) => !IMAGE_NAMES.has(f[0]));
}

function imageFieldsFor(type) {
  const fromBase = (FIELDS[type] || []).filter((f) => IMAGE_NAMES.has(f[0]));
  if (type === "bio" || type === "imageText") {
    return fromBase.concat([
      ["imageSide", "Posizione dell’immagine", "select", IMAGE_POS],
      ["imageFocus", "Inquadratura (volto, soggetto)", "select", IMAGE_FOCUS],
      ["imageFit", "Come entra nel riquadro", "select", IMAGE_FIT],
    ]);
  }
  if (type === "hero") {
    return [
      ["image", "Immagine (sostituisce il ritratto)", "image"],
      ["imageAlt", "Testo alternativo"],
      ["imageFocus", "Inquadratura", "select", IMAGE_FOCUS],
      ["imageFit", "Come entra nel riquadro", "select", IMAGE_FIT],
    ];
  }
  if (NO_EXTRA_IMAGE.has(type)) return fromBase;
  return fromBase.concat(IMAGE_FIELDS);
}

const FIELDS = {
  heading: [
    ["eyebrow", "Sopratitolo"],
    ["title", "Titolo", "textarea"],
    ["subtitle", "Sottotitolo", "textarea"],
  ],
  text: [
    ["title", "Titolo"],
    ["body", "Testo (paragrafi separati da una riga vuota; *corsivo*)", "textarea"],
    ["linkLabel", "Collegamento"],
    ["linkHref", "Indirizzo del collegamento"],
    ["link2Label", "Secondo collegamento"],
    ["link2Href", "Indirizzo del secondo collegamento"],
  ],
  hero: [
    ["eyebrow", "Sopratitolo"],
    ["title", "Titolo (una riga per riga; *corsivo*)", "textarea"],
    ["copy", "Testo", "textarea"],
    ["buttonLabel", "Pulsante"],
    ["buttonHref", "Indirizzo del pulsante"],
    ["linkLabel", "Collegamento secondario"],
    ["linkHref", "Indirizzo"],
    ["barLeft", "Riga in basso, a sinistra"],
    ["barRight", "Riga in basso, a destra"],
  ],
  featuredBook: [
    ["bookId", "Romanzo", "book"],
    ["eyebrow", "Sopratitolo"],
    ["catalog", "Stile catalogo (pagina Romanzi)", "check"],
  ],
  bookList: [
    ["eyebrow", "Sopratitolo"],
    ["title", "Titolo"],
    ["linkLabel", "Collegamento a destra"],
    ["linkHref", "Indirizzo"],
    ["filter", "Quali romanzi", "select", [
      ["all", "Tutti (nel pannello)"],
      ["published", "Pubblicati, senza quelli in evidenza"],
      ["upcoming", "Solo bozze (non si vedono sul sito)"],
    ]],
  ],
  pressQuote: [
    ["source", "Testata"],
    ["quote", "Citazione", "textarea"],
    ["note", "Nota"],
    ["linkLabel", "Collegamento"],
    ["linkHref", "Indirizzo"],
  ],
  encounters: [
    ["eyebrow", "Sopratitolo"],
    ["title", "Titolo (*corsivo*)", "textarea"],
    ["copy", "Testo", "textarea"],
    ["buttonLabel", "Pulsante"],
    ["buttonHref", "Indirizzo del pulsante"],
    ["linkLabel", "Collegamento"],
    ["linkHref", "Indirizzo"],
    ["eventId", "Incontro in evidenza", "event"],
  ],
  bio: [
    ["image", "Immagine", "image"],
    ["caption", "Didascalia"],
    ["lead", "Frase d’apertura", "textarea"],
    ["body", "Primo testo", "textarea"],
    ["heading", "Titolo interno"],
    ["body2", "Secondo testo", "textarea"],
    ["buttonLabel", "Pulsante"],
    ["buttonHref", "Indirizzo"],
    ["linkLabel", "Collegamento"],
    ["linkHref", "Indirizzo"],
  ],
  eventsList: [
    ["upcomingTitle", "Titolo prossimi incontri"],
    ["upcomingEmpty", "Testo se non ci sono date"],
    ["upcomingNote", "Nota", "textarea"],
    ["archiveEyebrow", "Sopratitolo archivio"],
    ["archiveTitle", "Titolo archivio"],
  ],
  pressList: [
    ["eyebrow", "Sopratitolo"],
    ["title", "Titolo"],
    ["bookId", "Solo un romanzo (vuoto = tutti)", "book"],
    ["topic", "Quali articoli", "select", [
      ["", "Tutti"],
      ["libro", "Sul romanzo"],
      ["presentazione", "Sulle presentazioni"],
    ]],
    ["groupByBook", "Raggruppa sotto ogni libro", "check"],
  ],
  resources: [["note", "Nota a piè di elenco", "textarea"]],
  purchases: [
    ["bookId", "Romanzo", "book"],
    ["note", "Nota", "textarea"],
  ],
  cta: [
    ["buttonLabel", "Pulsante"],
    ["buttonHref", "Indirizzo"],
    ["linkLabel", "Collegamento"],
    ["linkHref", "Indirizzo"],
  ],
  imageText: [
    ["image", "Immagine", "image"],
    ["alt", "Testo alternativo"],
    ["title", "Titolo"],
    ["body", "Testo", "textarea"],
  ],
  gallery: [
    ["eyebrow", "Sopratitolo"],
    ["title", "Titolo"],
    ["caption", "Testo sotto il titolo", "textarea"],
    ["layout", "Disposizione", "select", [
      ["grid", "Griglia"],
      ["mosaic", "Mosaico (prima foto grande)"],
      ["slider", "Scorrimento"],
      ["film", "Striscia larga"],
    ]],
    ["items", "Fotografie", "gallery"],
  ],
  video: [
    ["title", "Titolo"],
    ["url", "Indirizzo YouTube o Vimeo", "url"],
    ["caption", "Didascalia"],
    ["body", "Testo sotto il video", "textarea"],
  ],
  columns: [
    ["title", "Titolo della sezione"],
    ["col1", "Colonna 1", "textarea"],
    ["col2", "Colonna 2", "textarea"],
    ["col3", "Colonna 3 (opzionale)", "textarea"],
  ],
  quote: [
    ["quote", "Citazione", "textarea"],
    ["cite", "Autore o fonte"],
    ["note", "Nota"],
  ],
  divider: [
    ["kind", "Tipo", "select", [["line", "Riga"], ["space", "Solo spazio"]]],
  ],
};

const BOOK_FIELDS = [
  ["title", "Titolo"],
  ["cover", "Copertina / immagine di anteprima", "image"],
  ["coverFocus", "Inquadratura della copertina", "select", IMAGE_FOCUS],
  ["coverFit", "Come entra nel riquadro", "select", IMAGE_FIT],
  ["coverNote", "Nota sotto la copertina"],
  ["promoImage", "Fotografia promozionale", "image", null, "Opzionale. Compare nella scheda del romanzo, sotto la copertina."],
  ["promoCaption", "Didascalia della foto promozionale"],
  ["shareImage", "Immagine per i social", "image", null, "Opzionale. JPG o PNG, 1200 × 630 pixel, orizzontale. Se è vuoto, in condivisione si usa la copertina del romanzo."],
  ["slug", "Indirizzo (es. verita-sepolte)"],
  ["number", "Numero in elenco"],
  ["eyebrow", "Sopratitolo"],
  ["statusLabel", "Etichetta (es. Disponibile)"],
  ["genre", "Genere"],
  ["summary", "Riassunto breve", "textarea"],
  ["intro", "Introduzione in pagina", "textarea"],
  ["heading", "Titolo del testo", "textarea"],
  ["body", "Testo della scheda", "textarea"],
  ["themes", "Temi (per i romanzi in preparazione)"],
  ["publisher", "Editore"],
  ["year", "Anno"],
  ["pages", "Pagine"],
  ["isbn", "ISBN", null, null, "Solo cifre, senza trattini (es. 9791281763579)."],
  ["language", "Lingua"],
  ["amazon", "Collegamento Amazon"],
  ["publisherUrl", "Collegamento editore"],
  ["featured", "Anche in evidenza in home (dopo la pubblicazione)", "check"],
];

const EVENT_FIELDS = [
  ["status", "Stato", "select", [["upcoming", "Prossimo"], ["past", "Concluso"]]],
  ["date", "Data", "date"],
  ["day", "Giorno (es. 09)"],
  ["month", "Mese per esteso"],
  ["monthShort", "Mese breve (es. MAG)"],
  ["year", "Anno"],
  ["place", "Luogo"],
  ["city", "Città"],
  ["title", "Titolo"],
  ["summary", "Descrizione", "textarea"],
  ["note", "Nota"],
  ["linkLabel", "Collegamento"],
  ["linkHref", "Indirizzo"],
  ["contextTitle", "Titolo del riquadro"],
  ["contextBody", "Testo del riquadro", "textarea"],
  ["contextLinkLabel", "Collegamento del riquadro"],
  ["contextLinkHref", "Indirizzo del riquadro"],
  ["homeEyebrow", "Sopratitolo in home"],
  ["homeLine", "Riga in home"],
];

const PRESS_FIELDS = [
  ["source", "Testata"],
  ["dateLabel", "Data"],
  ["title", "Titolo"],
  ["summary", "Sommario", "textarea"],
  ["href", "Indirizzo articolo"],
  ["bookId", "Romanzo di riferimento", "book"],
  ["topic", "Tipo", "select", [
    ["libro", "Sul romanzo"],
    ["presentazione", "Sulla presentazione"],
  ]],
  ["eventId", "Incontro (se è sulla presentazione)", "event"],
];

const BUY_FIELDS = [
  ["bookId", "Romanzo", "book"],
  ["name", "Nome libreria"],
  ["type", "Tipo"],
  ["href", "Indirizzo"],
];

const RES_FIELDS = [
  ["group", "Gruppo (chiave interna, es. presentazioni)"],
  ["groupTitle", "Titolo del gruppo"],
  ["title", "Titolo"],
  ["description", "Descrizione", "textarea"],
  ["href", "Percorso o indirizzo del file"],
  ["download", "Scarica il file", "check"],
];

const MENU_FIELDS = [
  ["label", "Voce"],
  ["href", "Indirizzo (es. romanzi/)"],
  ["style", "Stile", "select", [["link", "Normale"], ["buy", "Pulsante Acquista"]]],
];
const FOOTER_FIELDS = [
  ["label", "Voce"],
  ["href", "Indirizzo (es. romanzi/)"],
];

let content = null;
let session = { ok: false, user: null, mustChange: false };
let toastTimer = 0;
let modal = null;
let insertAt = null;
let editorTab = "content";
const preview = { open: false, mode: "desk", url: "/" };

const $ = (s, el = document) => el.querySelector(s);
const app = () => $("#app");

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function uid(prefix = "id") {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}

const ITEM_KINDS = {
  romanzo: { list: "books", fields: () => BOOK_FIELDS, form: "book-form", label: "Romanzo" },
  incontro: { list: "events", fields: () => EVENT_FIELDS, form: "event-form", label: "Incontro" },
  stampa: { list: "press", fields: () => PRESS_FIELDS, form: "press-form", label: "Articolo" },
  materiale: { list: "resources", fields: () => RES_FIELDS, form: "res-form", label: "Materiale" },
  acquisto: { list: "purchases", fields: () => BUY_FIELDS, form: "buy-form", label: "Libreria" },
};
const ITEM_FROM_CMS = { book: "romanzo", event: "incontro", press: "stampa", resource: "materiale", purchase: "acquisto" };

function route() {
  const hash = (location.hash || "#/bacheca").replace(/^#/, "");
  const parts = hash.split("/").filter(Boolean);
  const extra = parts[2] || "";
  return {
    view: parts[0] || "bacheca",
    id: decodeURIComponent(parts[1] || ""),
    extra,
    sectionId: extra === "sezione" ? decodeURIComponent(parts[3] || "") : "",
    itemKind: ITEM_KINDS[extra] ? extra : "",
    itemId: ITEM_KINDS[extra] ? decodeURIComponent(parts[3] || "") : "",
  };
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== "/api/login" && path !== "/api/session") {
    session.ok = false;
    location.hash = "#/accedi";
    render();
    throw new Error(data.error || "accesso richiesto");
  }
  if (!res.ok) throw new Error(data.error || "Errore di rete");
  return data;
}

function toast(msg) {
  clearTimeout(toastTimer);
  let el = $(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.hidden = false;
  toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
}

async function save() {
  await api("/api/content", { method: "POST", body: JSON.stringify(content) });
  toast("Modifiche pubblicate sul sito.");
  if (preview.open) drawPreview(true);
}

function sitePathFromRoute() {
  const r = route();
  if (r.view === "pagine" && r.id && r.id !== "nuova") {
    const p = byId(content.pages, r.id);
    if (p) return "/" + (p.slug ? p.slug.replace(/\/?$/, "/") : "");
  }
  if (r.view === "romanzi" && r.id && r.id !== "nuovo") {
    const b = byId(content.books, r.id);
    if (b) return "/romanzi/" + (b.slug || b.id) + "/";
  }
  const map = {
    bacheca: "/",
    pagine: "/",
    romanzi: "/romanzi/",
    incontri: "/incontri/",
    stampa: "/materiali/#rassegna",
    acquista: "/acquista/",
    materiali: "/materiali/",
    menu: "/",
    impostazioni: "/",
    media: "/",
  };
  return map[r.view] || "/";
}

function previewTargets() {
  const pages = (content.pages || []).map((p) => ({
    url: "/" + (p.slug ? p.slug.replace(/\/?$/, "/") : ""),
    label: p.title,
  }));
  const books = (content.books || []).map((b) => ({
    url: "/romanzi/" + (b.slug || b.id) + "/",
    label: "Romanzo · " + b.title,
  }));
  return pages.concat(books);
}

function openPreview(mode) {
  preview.open = true;
  preview.mode = mode || preview.mode || "desk";
  preview.url = sitePathFromRoute();
  drawPreview(true);
}

function closePreview() {
  preview.open = false;
  const el = document.getElementById("preview-overlay");
  if (el) el.remove();
}

function drawPreview(reload) {
  if (!preview.open) return closePreview();
  let el = document.getElementById("preview-overlay");
  if (!el) {
    el = document.createElement("div");
    el.id = "preview-overlay";
    document.body.appendChild(el);
  }
  const current = (preview.url || "/").replace(/[?#].*$/, "");
  const opts = previewTargets().map((t) =>
    `<option value="${esc(t.url)}" ${t.url.replace(/[?#].*$/, "") === current ? "selected" : ""}>${esc(t.label)}</option>`
  ).join("");
  const src = preview.url + (preview.url.includes("?") ? "&" : "?") + "anteprima=" + Date.now();
  el.className = "preview-overlay";
  el.innerHTML = `<div class="preview-bar">
      <strong>Anteprima</strong>
      <div class="preview-switch">
        <button type="button" class="${preview.mode === "desk" ? "is-on" : ""}" data-preview="desk">Computer</button>
        <button type="button" class="${preview.mode === "tablet" ? "is-on" : ""}" data-preview="tablet">Tablet</button>
        <button type="button" class="${preview.mode === "mobile" ? "is-on" : ""}" data-preview="mobile">Telefono</button>
      </div>
      <label class="preview-page">Pagina
        <select id="preview-page">${opts}</select>
      </label>
      <a class="preview-open" href="${esc(preview.url)}" target="_blank" rel="noopener">Apri in una scheda ↗</a>
      <button type="button" class="btn btn-secondary" id="preview-close">Chiudi</button>
    </div>
    <div class="preview-stage preview-${esc(preview.mode)}">
      <div class="preview-frame">
        <iframe title="Anteprima del sito" src="${esc(src)}"></iframe>
      </div>
    </div>`;
  const sel = el.querySelector("#preview-page");
  if (sel) sel.addEventListener("change", () => {
    preview.url = sel.value;
    drawPreview(true);
  });
  void reload;
}

function byId(list, id) {
  return (list || []).find((x) => x.id === id);
}

function removeId(list, id) {
  const i = list.findIndex((x) => x.id === id);
  if (i >= 0) list.splice(i, 1);
}

function move(list, id, dir) {
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  const [item] = list.splice(i, 1);
  list.splice(j, 0, item);
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function cloneSection(section) {
  const copy = cloneData(section);
  copy.id = uid("s");
  return copy;
}

function insertSection(page, section, at) {
  const spot = at || insertAt || { where: "end" };
  insertAt = null;
  if (spot.where === "start") {
    page.sections.unshift(section);
    return;
  }
  if (spot.sectionId && (spot.where === "before" || spot.where === "after")) {
    const i = page.sections.findIndex((s) => s.id === spot.sectionId);
    if (i >= 0) {
      page.sections.splice(spot.where === "before" ? i : i + 1, 0, section);
      return;
    }
  }
  page.sections.push(section);
}

function reorderSection(page, sourceId, targetId, where) {
  if (!sourceId || !targetId || sourceId === targetId) return false;
  const from = page.sections.findIndex((s) => s.id === sourceId);
  let to = page.sections.findIndex((s) => s.id === targetId);
  if (from < 0 || to < 0) return false;
  if (where === "after") to += 1;
  const [row] = page.sections.splice(from, 1);
  if (from < to) to -= 1;
  page.sections.splice(to, 0, row);
  return true;
}

function polishPublishedBook(book) {
  if (!book || book.status !== "published") return;
  if (/in preparazione/i.test(book.eyebrow || "")) {
    book.eyebrow = [book.genre || "Romanzo", book.year].filter(Boolean).join(" · ");
  }
  if (!book.statusLabel || /preparazione/i.test(book.statusLabel)) book.statusLabel = "Disponibile";
}

function bookIsLive(book) {
  return !!(book && book.status === "published");
}

function applyBookVisibility(book, live) {
  if (!book) return;
  book.status = live ? "published" : "upcoming";
  if (live) {
    if (!book.statusLabel || /preparazione/i.test(book.statusLabel)) book.statusLabel = "Disponibile";
  } else if (!book.statusLabel || /disponibile/i.test(book.statusLabel)) {
    book.statusLabel = "In preparazione";
  }
  syncBookOnSite(book);
}

function publishBarHtml(book) {
  const live = bookIsLive(book);
  const id = book?.id || "nuovo";
  return `<div class="publish-bar ${live ? "is-live" : "is-draft"}">
    <input type="hidden" name="status" value="${live ? "published" : "upcoming"}">
    <div>
      <strong>${live ? "È sul sito" : "Bozza nascosta"}</strong>
      <p>${live
        ? "I lettori lo vedono. Se vuoi ritirarlo, tienilo nascosto: resta nel pannello e puoi ripubblicarlo in un clic."
        : "Lo prepari solo tu. Quando è pronto, «Pubblica sul sito»: compare subito tra i romanzi."}</p>
    </div>
    ${live
      ? `<button type="button" class="btn btn-secondary" data-book-live="${esc(id)}" data-live="0">Tieni nascosto</button>`
      : `<button type="button" class="btn btn-publish" data-book-live="${esc(id)}" data-live="1">Pubblica sul sito</button>`}
  </div>`;
}

function ensureBookShowcase(page, book, prefix, data) {
  if (!page) return;
  const existing = page.sections.find((s) => s.type === "featuredBook" && s.data?.bookId === book.id);
  const show = !!(book.featured && book.status === "published");
  if (show && !existing) {
    const section = { id: prefix + book.id, type: "featuredBook", visible: true, data: { bookId: book.id, ...data } };
    const first = page.sections.findIndex((s) => s.type === "featuredBook");
    page.sections.splice(first >= 0 ? first : 1, 0, section);
  }
  if (!show && existing && existing.id === prefix + book.id) removeId(page.sections, existing.id);
}

function ensureBookPurchase(book) {
  if (!book || book.status !== "published" || !book.amazon) return;
  content.purchases = content.purchases || [];
  if (!content.purchases.some((p) => p.bookId === book.id)) {
    content.purchases.push({ id: uid("buy"), bookId: book.id, name: "Amazon", type: "Scheda del libro", href: book.amazon });
  }
  const page = byId(content.pages, "acquista");
  if (!page || page.sections.some((s) => s.type === "purchases" && s.data?.bookId === book.id)) return;
  const section = { id: "s-q-buy-" + book.id, type: "purchases", visible: true, data: { bookId: book.id } };
  const firstBuy = page.sections.findIndex((s) => s.type === "purchases");
  const next = page.sections.findIndex((s) => s.id === "s-q-next");
  page.sections.splice(firstBuy >= 0 ? firstBuy : (next >= 0 ? next : page.sections.length), 0, section);
}

function syncBookOnSite(book) {
  if (!book) return;
  polishPublishedBook(book);
  ensureBookShowcase(byId(content.pages, "home"), book, "s-feat-", {
    eyebrow: book.statusLabel || "Disponibile",
  });
  ensureBookShowcase(byId(content.pages, "romanzi"), book, "s-r-feat-", {
    eyebrow: book.statusLabel || "Disponibile",
    catalog: true,
  });
  ensureBookPurchase(book);
}

async function afterPageEdit(page, focusId, message, open) {
  await save();
  if (message) toast(message);
  const r = route();
  if (r.view === "costruttore") {
    if (open && focusId) location.hash = `#/costruttore/${page.id}/sezione/${focusId}`;
    reloadBuilderFrame();
  } else if (open && r.view === "pagine" && focusId) {
    location.hash = `#/pagine/${page.id}/sezione/${focusId}`;
  }
  return render();
}

function layout(active, inner) {
  return `<div class="layout">
    <aside class="sidebar">
      <div class="brand">Erasmo Stasolla<small>Pannello di controllo</small></div>
      <nav>
        <span class="nav-group">Lavoro</span>
        <a href="#/costruttore/home" class="nav-builder ${active === "costruttore" ? "is-active" : ""}">Costruttore visivo</a>
        <a href="#/bacheca" class="${active === "bacheca" ? "is-active" : ""}">Bacheca</a>
        <a href="#/pagine" class="${active === "pagine" ? "is-active" : ""}">Pagine</a>
        <span class="nav-group">Contenuti</span>
        <a href="#/romanzi" class="${active === "romanzi" ? "is-active" : ""}">Romanzi</a>
        <a href="#/incontri" class="${active === "incontri" ? "is-active" : ""}">Incontri</a>
        <a href="#/stampa" class="${active === "stampa" ? "is-active" : ""}">Rassegna stampa</a>
        <a href="#/acquista" class="${active === "acquista" ? "is-active" : ""}">Acquista</a>
        <a href="#/materiali" class="${active === "materiali" ? "is-active" : ""}">Schede da scaricare</a>
        <span class="nav-group">Sito</span>
        <a href="#/menu" class="${active === "menu" ? "is-active" : ""}">Menu</a>
        <a href="#/footer" class="${active === "footer" ? "is-active" : ""}">Piè di pagina</a>
        <a href="#/media" class="${active === "media" ? "is-active" : ""}">File</a>
        <a href="#/impostazioni/aspetto" class="${active === "aspetto" ? "is-active" : ""}">Aspetto</a>
        <a href="#/impostazioni" class="${active === "impostazioni" ? "is-active" : ""}">Impostazioni</a>
        <button type="button" class="nav-link" data-preview="desk">Anteprima</button>
      </nav>
    </aside>
    <div class="main">
      <div class="topbar">
        <span>Studio del sito</span>
        <div class="right">
          <a class="topbar-builder" href="#/costruttore/home">Costruttore visivo</a>
          <button type="button" class="topbar-btn" data-preview="desk">Anteprima</button>
          <a href="/" target="_blank" rel="noopener">Apri il sito ↗</a>
          <span>${esc(session.user || "")}</span>
          <a href="#/esci">Esci</a>
        </div>
      </div>
      <div class="content">${inner}</div>
    </div>
  </div>${modal || ""}`;
}

function loginView(error) {
  return `<div class="login-wrap"><form class="login-card" id="login-form">
    <h1>Accedi</h1>
    <p class="sub">Pannello di controllo del sito</p>
    ${error ? `<div class="err">${esc(error)}</div>` : ""}
    <label><span>Nome utente</span><input name="user" value="admin" autocomplete="username" required></label>
    <label><span>Password</span><input name="password" type="password" autocomplete="current-password" required></label>
    <button class="btn" type="submit">Accedi</button>
    <div class="hint">Al primo accesso: utente <strong>admin</strong>, password <strong>Stasolla2026</strong>. Cambiala subito dalle Impostazioni.</div>
  </form></div>`;
}

function fieldHtml(spec, data) {
  const [name, label, kind, options, help] = spec;
  const val = data?.[name];
  const helpHtml = help ? `<span class="help">${esc(help)}</span>` : "";
  if (kind === "kicker") {
    return `<h3 class="form-kicker">${esc(label)}</h3>`;
  }
  if (kind === "textarea") {
    return `<label class="f"><span>${esc(label)}</span><textarea name="${name}">${esc(val || "")}</textarea></label>`;
  }
  if (kind === "check") {
    return `<label class="check"><input type="checkbox" name="${name}" ${val ? "checked" : ""}> ${esc(label)}</label>`;
  }
  if (kind === "select") {
    const opts = (options || []).map(([k, l]) => `<option value="${esc(k)}" ${String(val) === k ? "selected" : ""}>${esc(l)}</option>`).join("");
    return `<label class="f"><span>${esc(label)}</span><select name="${name}">${opts}</select></label>`;
  }
  if (kind === "book") {
    const opts = [`<option value="">— scegli —</option>`].concat(
      content.books.map((b) => `<option value="${esc(b.id)}" ${val === b.id ? "selected" : ""}>${esc(b.title)}</option>`)
    ).join("");
    return `<label class="f"><span>${esc(label)}</span><select name="${name}">${opts}</select></label>`;
  }
  if (kind === "image") {
    const src = val ? "/" + String(val).replace(/^\//, "") : "";
    const orient = data?.[name + "Orient"] || "";
    const labelOrient = orient === "landscape" ? "Orizzontale" : orient === "portrait" ? "Verticale" : orient === "square" ? "Quadrata" : "";
    return `<div class="f image-field"><span>${esc(label)}</span>
      <div class="image-picker">
        <div class="image-preview${orient ? " orient-" + orient : ""}">${src ? `<img src="${esc(src)}" alt="" class="smart-img"${orient ? ` data-orient="${esc(orient)}"` : ""}>` : "<span>Nessuna immagine</span>"}</div>
        ${labelOrient ? `<span class="orient-badge">${esc(labelOrient)} · il sito la inquadra da solo</span>` : ""}
        <input type="text" name="${name}" value="${esc(val || "")}" placeholder="assets/uploads/foto.jpg">
        <input type="hidden" name="${name}Width" value="${esc(data?.[name + "Width"] || "")}">
        <input type="hidden" name="${name}Height" value="${esc(data?.[name + "Height"] || "")}">
        <input type="hidden" name="${name}Orient" value="${esc(orient)}">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" data-image-for="${name}">
        ${helpHtml || `<span class="help">Carica così com’è, anche dal telefono. Verticale o orizzontale: il riquadro si adatta, senza un altro programma.</span>`}
      </div></div>`;
  }
  if (kind === "event") {
    const opts = [`<option value="">— scegli —</option>`].concat(
      content.events.map((b) => `<option value="${esc(b.id)}" ${val === b.id ? "selected" : ""}>${esc(b.title)}</option>`)
    ).join("");
    return `<label class="f"><span>${esc(label)}</span><select name="${name}">${opts}</select></label>`;
  }
  if (kind === "gallery") {
    const items = Array.isArray(data?.items) ? data.items : [];
    return `<div class="f gallery-editor" data-gallery>
      <span>${esc(label)}</span>
      <div class="gallery-items">${items.map((it, i) => galleryItemHtml(it, i)).join("") || `<p class="muted small">Nessuna foto. Aggiungine una.</p>`}</div>
      <button type="button" class="btn btn-secondary" data-add-photo>Aggiungi foto</button>
      <input type="hidden" name="itemsJson" value="${esc(JSON.stringify(items))}">
      <span class="help">Carica le foto così come sono, anche dal telefono. Verticali e orizzontali stanno insieme, come in un album.</span>
    </div>`;
  }
  if (kind === "color") {
    return colorField(name, label, data || {}, options || "#141b21");
  }
  const type = kind === "date" ? "date" : kind === "url" ? "url" : "text";
  return `<label class="f"><span>${esc(label)}</span><input type="${type}" name="${name}" value="${esc(val || "")}">${helpHtml}</label>`;
}

function galleryItemHtml(it, i) {
  const src = it?.src ? "/" + String(it.src).replace(/^\//, "") : "";
  const orient = it?.orient || "";
  return `<div class="gallery-item">
    <div class="image-preview${orient ? " orient-" + orient : ""}">${src ? `<img src="${esc(src)}" alt="">` : "<span>Vuoto</span>"}</div>
    ${orient ? `<span class="orient-badge">${orient === "landscape" ? "Orizzontale" : orient === "portrait" ? "Verticale" : "Quadrata"}</span>` : ""}
    <input type="text" data-g="src" value="${esc(it?.src || "")}" placeholder="assets/uploads/foto.jpg">
    <input type="hidden" data-g="width" value="${esc(it?.width || "")}">
    <input type="hidden" data-g="height" value="${esc(it?.height || "")}">
    <input type="hidden" data-g="orient" value="${esc(orient)}">
    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-g-file>
    <input type="text" data-g="alt" value="${esc(it?.alt || "")}" placeholder="Testo alternativo">
    <input type="text" data-g="caption" value="${esc(it?.caption || "")}" placeholder="Didascalia">
    <button type="button" class="btn-ghost" data-g-del>Rimuovi</button>
  </div>`;
}

function syncGallery(editor) {
  if (!editor) return;
  const items = [...editor.querySelectorAll(".gallery-item")].map((el) => ({
    src: el.querySelector("[data-g=src]")?.value || "",
    alt: el.querySelector("[data-g=alt]")?.value || "",
    caption: el.querySelector("[data-g=caption]")?.value || "",
    width: el.querySelector("[data-g=width]")?.value || "",
    height: el.querySelector("[data-g=height]")?.value || "",
    orient: el.querySelector("[data-g=orient]")?.value || "",
  }));
  const hidden = editor.querySelector("[name=itemsJson]");
  if (hidden) hidden.value = JSON.stringify(items);
}

function readSectionData(form) {
  const d = readForm(form);
  if (d.itemsJson !== undefined) {
    try { d.items = JSON.parse(d.itemsJson || "[]"); } catch { d.items = []; }
    delete d.itemsJson;
  }
  return d;
}

function pageUrl(page) {
  return "/" + (page?.slug ? page.slug.replace(/\/?$/, "/") : "");
}

function hexOk(v) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v || "");
}

function colorField(name, label, data, fallback) {
  const val = data?.[name] || "";
  const picker = hexOk(val) ? val : fallback;
  return `<label class="f"><span>${esc(label)}</span>
    <div class="color-field">
      <input type="color" data-sync-color="${esc(name)}" value="${esc(picker)}" aria-label="${esc(label)}">
      <input type="text" name="${esc(name)}" value="${esc(val)}" placeholder="${esc(fallback)}" spellcheck="false">
      <button type="button" class="btn-ghost" data-clear-color="${esc(name)}">Azzera</button>
    </div>
    <span class="help">Clicca il riquadro per scegliere, oppure lascia vuoto per il valore originale.</span>
  </label>`;
}

function chipGroup(name, label, chips, value) {
  return `<div class="style-group">
    <span class="style-label">${esc(label)}</span>
    <div class="chip-row">
      ${chips.map(([k, l]) => `<button type="button" class="chip ${String(value || "") === k ? "is-on" : ""}" data-set="${esc(name)}" data-value="${esc(k)}">${esc(l)}</button>`).join("")}
    </div>
    <input type="hidden" name="${esc(name)}" value="${esc(value || "")}">
  </div>`;
}

function styleStudio(data) {
  const d = data || {};
  const theme = d.styleTheme || "";
  const previewBg = hexOk(d.styleBg) ? d.styleBg : (THEME_SWATCHES.find((t) => t[0] === theme)?.[2] || "#f5f5f1");
  const previewInk = hexOk(d.styleColor) ? d.styleColor : (THEME_SWATCHES.find((t) => t[0] === theme)?.[3] || "#141b21");
  return `<div class="style-studio">
    <div class="style-preview" style="background:${esc(previewBg)};color:${esc(previewInk)};text-align:${d.styleAlign === "center" ? "center" : "left"}">
      <span>Anteprima live</span>
      <strong>Titolo della sezione</strong>
      <p>Così apparirà il testo su questo sfondo. Salva e il sito si aggiorna subito.</p>
    </div>
    <div class="style-group">
      <span class="style-label">Sfondo</span>
      <div class="swatch-row">
        ${THEME_SWATCHES.map(([k, l, bg, ink]) => `<button type="button" class="swatch ${theme === k ? "is-on" : ""}" data-set="styleTheme" data-value="${esc(k)}">
          <i style="background:${esc(bg)};color:${esc(ink)}"></i>${esc(l)}
        </button>`).join("")}
      </div>
      <input type="hidden" name="styleTheme" value="${esc(theme)}">
    </div>
    ${chipGroup("stylePad", "Spaziatura", PAD_CHIPS, d.stylePad)}
    ${chipGroup("styleAlign", "Allineamento", ALIGN_CHIPS, d.styleAlign)}
    ${chipGroup("styleWidth", "Larghezza", WIDTH_CHIPS, d.styleWidth)}
    <div class="style-colors">
      ${colorField("styleBg", "Colore sfondo personalizzato", d, "#f5f5f1")}
      ${colorField("styleColor", "Colore testo personalizzato", d, "#141b21")}
    </div>
    <p class="help">Queste scelte valgono solo per questa sezione. I colori di tutto il sito si cambiano in Aspetto.</p>
  </div>`;
}

function refreshStylePreview(form) {
  const box = form && form.querySelector(".style-preview");
  if (!box) return;
  const theme = form.querySelector("[name=styleTheme]")?.value || "";
  const pad = form.querySelector("[name=stylePad]")?.value || "";
  const align = form.querySelector("[name=styleAlign]")?.value || "";
  const bg = form.querySelector("[name=styleBg]")?.value || "";
  const ink = form.querySelector("[name=styleColor]")?.value || "";
  const sw = THEME_SWATCHES.find((t) => t[0] === theme) || THEME_SWATCHES[0];
  box.style.background = hexOk(bg) ? bg : sw[2];
  box.style.color = hexOk(ink) ? ink : sw[3];
  box.style.textAlign = align === "center" ? "center" : "left";
  box.style.padding = pad === "compact" ? "18px 20px" : pad === "large" ? "42px 24px" : pad === "none" ? "10px 20px" : "26px 22px";
}

function styleDot(s) {
  const d = s.data || {};
  const theme = d.styleTheme || "";
  const bg = hexOk(d.styleBg) ? d.styleBg : (THEME_SWATCHES.find((t) => t[0] === theme)?.[2] || "");
  if (!bg && !theme && !d.stylePad && !d.styleAlign) return "";
  return `<span class="style-dot" title="Stile personalizzato" style="background:${esc(bg || "#2271b1")}"></span>`;
}

function readForm(form) {
  const data = {};
  form.querySelectorAll("[name]").forEach((el) => {
    if (el.type === "checkbox") data[el.name] = el.checked;
    else data[el.name] = el.value;
  });
  return data;
}

function dashboard() {
  return layout("bacheca", `
    <h1>Bacheca</h1>
    <p class="lead">Il costruttore visivo è l’ingresso principale: vedi il sito, clicchi una sezione, la cambi.</p>
    ${session.mustChange ? `<div class="notice warn">Stai usando la password iniziale. Vai su <a href="#/impostazioni">Impostazioni</a> e cambiala.</div>` : ""}
    <a class="builder-hero" href="#/costruttore/home">
      <div>
        <span class="badge on">Modifica visiva</span>
        <h2>Apri il costruttore</h2>
        <p>Come un visual builder: clicchi sulla pagina vera, cambi testo, foto, gallerie e stile. Tutto resta nel tuo sito, con il tuo aspetto.</p>
      </div>
      <span class="builder-hero-go">Entra →</span>
    </a>
    <div class="cards">
      <a class="card" href="#/pagine"><div class="n">${content.pages.length}</div><div class="l">Pagine</div></a>
      <a class="card" href="#/romanzi"><div class="n">${content.books.length}</div><div class="l">Romanzi</div></a>
      <a class="card" href="#/incontri"><div class="n">${content.events.length}</div><div class="l">Incontri</div></a>
      <a class="card" href="#/stampa"><div class="n">${content.press.length}</div><div class="l">Articoli</div></a>
      <button type="button" class="card card-btn" data-preview="desk"><div class="n">Desk</div><div class="l">Anteprima computer</div></button>
      <button type="button" class="card card-btn" data-preview="tablet"><div class="n">Tablet</div><div class="l">Anteprima tablet</div></button>
      <button type="button" class="card card-btn" data-preview="mobile"><div class="n">Mobile</div><div class="l">Anteprima telefono</div></button>
    </div>
    <div class="panel"><table>
      <thead><tr><th>Pagina</th><th>Sezioni</th><th></th></tr></thead>
      <tbody>${content.pages.map((p) => `<tr>
        <td><strong>${esc(p.title)}</strong><div class="small muted">${esc(p.slug || "/")}</div></td>
        <td>${p.sections.filter((s) => s.visible !== false).length} visibili / ${p.sections.length}</td>
        <td class="actions">
          <a class="btn" href="#/costruttore/${esc(p.id)}">Costruttore</a>
          <a class="btn btn-secondary" href="#/pagine/${esc(p.id)}">Elenco</a>
        </td>
      </tr>`).join("")}</tbody>
    </table></div>`);
}

function pagesList() {
  return layout("pagine", `
    <div class="row-head"><div><h1>Pagine</h1><p class="lead">Ogni pagina è fatta di sezioni. Puoi aggiungerle, riordinarle, nasconderle o toglierle.</p></div>
    <a class="btn" href="#/pagine/nuova">Aggiungi pagina</a></div>
    <div class="panel"><table>
      <thead><tr><th>Titolo</th><th>Indirizzo</th><th>Sezioni</th><th></th></tr></thead>
      <tbody>${content.pages.map((p) => `<tr>
        <td><strong>${esc(p.title)}</strong></td>
        <td class="muted">${esc(p.slug || "/")}</td>
        <td>${p.sections.length}</td>
        <td class="actions">
          <a class="btn" href="#/costruttore/${esc(p.id)}">Costruttore</a>
          <a class="btn btn-secondary" href="#/pagine/${esc(p.id)}">Elenco</a>
          ${p.locked ? "" : `<button class="btn-ghost" data-del-page="${esc(p.id)}">Elimina</button>`}
        </td>
      </tr>`).join("")}</tbody>
    </table></div>`);
}

function sectionEditorHtml(page, section, closeHref) {
  const images = imageFieldsFor(section.type);
  const texts = contentFieldsFor(section.type);
  const tab = ["content", "image", "style"].includes(editorTab) ? editorTab : "content";
  const index = page.sections.findIndex((s) => s.id === section.id);
  const last = index === page.sections.length - 1;
  return `
    <div class="section-editor">
      <div class="section-editor-head">
        <div>
          <span class="badge">${esc(TYPES[section.type]?.label || section.type)}</span>
          <h2>${esc(previewSection(section) || "Nuova sezione")}</h2>
          <p class="muted small">Contenuto, foto e stile. Poi Salva: la pagina si aggiorna.</p>
        </div>
        ${closeHref ? `<a class="btn btn-secondary" href="${esc(closeHref)}">Chiudi</a>` : ""}
      </div>
      <div class="sec-tools">
        <button type="button" class="btn-ghost" data-add-at="before" data-sec="${esc(section.id)}">Inserisci sopra</button>
        <button type="button" class="btn-ghost" data-add-at="after" data-sec="${esc(section.id)}">Inserisci sotto</button>
        <button type="button" class="btn-ghost" data-clone-sec="${esc(section.id)}">Clona</button>
        <button type="button" class="btn-ghost" data-move="${esc(section.id)}" data-dir="-1" ${index <= 0 ? "disabled" : ""}>Su</button>
        <button type="button" class="btn-ghost" data-move="${esc(section.id)}" data-dir="1" ${last ? "disabled" : ""}>Giù</button>
        <button type="button" class="btn-ghost" data-vis="${esc(section.id)}">${section.visible === false ? "Mostra" : "Nascondi"}</button>
      </div>
      <div class="editor-tabs" role="tablist">
        <button type="button" class="${tab === "content" ? "is-on" : ""}" data-editor-tab="content">Contenuto</button>
        <button type="button" class="${tab === "image" ? "is-on" : ""}" data-editor-tab="image">${section.type === "gallery" ? "Foto" : "Immagine"}</button>
        <button type="button" class="${tab === "style" ? "is-on" : ""}" data-editor-tab="style">Stile</button>
      </div>
      <form id="section-form" data-page="${esc(page.id)}" data-section="${esc(section.id)}">
        <div class="tab-pane ${tab === "content" ? "is-on" : ""}" data-pane="content">
          <div class="form-grid">${texts.map((f) => fieldHtml(f, section.data || {})).join("") || `<p class="muted">Nessun testo da compilare. Passa a Immagine o Stile.</p>`}</div>
        </div>
        <div class="tab-pane ${tab === "image" ? "is-on" : ""}" data-pane="image">
          <div class="form-grid">${images.length ? images.map((f) => fieldHtml(f, section.data || {})).join("") : `<p class="muted">${section.type === "gallery" ? "Le foto della galleria stanno in Contenuto." : "Questa sezione non ha una foto propria. Lo stile si cambia nella scheda Stile."}</p>`}</div>
        </div>
        <div class="tab-pane ${tab === "style" ? "is-on" : ""}" data-pane="style">${styleStudio(section.data || {})}</div>
        <div class="editor-bar">
          <button class="btn" type="submit">Salva e pubblica</button>
          <button type="button" class="btn-danger" data-del-sec="${esc(section.id)}">Elimina sezione</button>
        </div>
      </form>
      ${nestedEntriesHtml(page, section)}
    </div>`;
}

function nestedEntriesHtml(page, section) {
  if (!page) return "";
  const d = section.data || {};
  let rows = "";
  if (section.type === "bookList" || section.type === "featuredBook" || section.type === "purchases") {
    let books = content.books || [];
    if (section.type === "featuredBook" || section.type === "purchases") {
      books = books.filter((b) => !d.bookId || b.id === d.bookId);
    } else if (d.filter === "upcoming") books = books.filter((b) => !bookIsLive(b));
    else if (d.filter === "published") books = books.filter((b) => bookIsLive(b) && !b.featured);
    rows = books.map((b) => `<a href="#/costruttore/${esc(page.id)}/romanzo/${esc(b.id)}">${esc(b.title)}</a>`).join("")
      + `<a href="#/costruttore/${esc(page.id)}/romanzo/nuovo">+ Nuovo romanzo</a>`;
  } else if (section.type === "eventsList" || section.type === "encounters") {
    rows = (content.events || []).map((e) => `<a href="#/costruttore/${esc(page.id)}/incontro/${esc(e.id)}">${esc(e.title)}</a>`).join("");
  } else if (section.type === "pressList" || section.type === "pressQuote") {
    rows = (content.press || []).map((e) => `<a href="#/costruttore/${esc(page.id)}/stampa/${esc(e.id)}">${esc(e.title)}</a>`).join("");
  } else if (section.type === "resources") {
    rows = (content.resources || []).map((e) => `<a href="#/costruttore/${esc(page.id)}/materiale/${esc(e.id)}">${esc(e.title)}</a>`).join("");
  }
  if (!rows) return "";
  return `<div class="vb-nested"><h3>Clicca un elemento per entrarci</h3><div class="vb-nested-list">${rows}</div></div>`;
}

function pageEditor(page, sectionId) {
  if (!page) return layout("pagine", `<h1>Pagina non trovata</h1><p><a href="#/pagine">Torna alle pagine</a></p>`);
  const section = sectionId ? byId(page.sections, sectionId) : null;
  const sectionForm = section ? sectionEditorHtml(page, section, `#/pagine/${page.id}`) : "";
  return layout("pagine", `
    <p class="small"><a href="#/pagine">← Pagine</a></p>
    <div class="row-head"><h1>${esc(page.title)}</h1>
      <div class="actions">
        <a class="btn" href="#/costruttore/${esc(page.id)}">Costruttore visivo</a>
        <button type="button" class="btn btn-secondary" data-preview="desk">Anteprima</button>
        <a class="btn btn-secondary" href="/${esc(page.slug ? page.slug + "/" : "")}" target="_blank" rel="noopener">Apri pagina</a>
        <button class="btn" id="save-page">Salva pagina</button>
      </div>
    </div>
    <div class="editor">
      <div>
        <form id="page-meta" class="panel page-meta">
          <div class="form-grid two">
            ${fieldHtml(["title", "Titolo in elenco"], page)}
            ${fieldHtml(["slug", "Indirizzo (vuoto = home)"], page)}
            ${fieldHtml(["seoTitle", "Titolo per Google e il browser"], page)}
            ${fieldHtml(["seoDescription", "Descrizione per Google e i social"], { seoDescription: page.seoDescription })}
            ${fieldHtml(["shareImage", "Immagine per i social", "image", null, "Opzionale. JPG o PNG, 1200 × 630 pixel, orizzontale. Se è vuoto, in condivisione si usa la foto in evidenza della pagina."], page)}
          </div>
        </form>
        ${sectionForm}
        <div class="row-head"><h2 style="margin:0;font-size:1.05rem">Sezioni della pagina</h2>
          <button class="btn" id="add-section">Aggiungi sezione</button></div>
        <div class="section-list">
          ${page.sections.map((s, i) => `<article class="section-card ${s.visible === false ? "hidden-sec" : ""} ${section && section.id === s.id ? "is-editing" : ""}">
            <span class="sec-num">${String(i + 1).padStart(2, "0")}</span>
            ${sectionThumb(s)}
            <div class="sec-copy">
              <span class="badge">${esc(TYPES[s.type]?.label || s.type)}</span>${styleDot(s)}
              <h3>${esc(previewSection(s))}</h3>
            </div>
            <div class="actions">
              <button class="btn-ghost" data-move="${esc(s.id)}" data-dir="-1" ${i === 0 ? "disabled" : ""}>Su</button>
              <button class="btn-ghost" data-move="${esc(s.id)}" data-dir="1" ${i === page.sections.length - 1 ? "disabled" : ""}>Giù</button>
              <button class="btn-ghost" data-clone-sec="${esc(s.id)}">Clona</button>
              <button class="btn-ghost" data-vis="${esc(s.id)}">${s.visible === false ? "Mostra" : "Nascondi"}</button>
              <a class="btn btn-secondary" href="#/pagine/${esc(page.id)}/sezione/${esc(s.id)}">Modifica</a>
              <button class="btn-ghost" data-del-sec="${esc(s.id)}">Elimina</button>
            </div>
          </article>`).join("")}
        </div>
      </div>
      <aside class="sticky-side">
        <div class="side-box">
          <h2>Come si lavora</h2>
          <ol class="work-steps">
            <li>Apri una sezione</li>
            <li>Scrivi in Contenuto</li>
            <li>Sistema lo Stile</li>
            <li>Salva e guarda l’anteprima</li>
          </ol>
          <p><button class="btn" id="save-page-side">Salva pagina</button></p>
          <p><button type="button" class="btn btn-secondary" data-preview="desk">Anteprima</button></p>
        </div>
      </aside>
    </div>`);
}

function previewSection(s) {
  const d = s.data || {};
  return d.title || d.quote || d.heading || d.eyebrow || d.copy || TYPES[s.type]?.hint || s.type;
}

function sectionThumb(s) {
  const d = s.data || {};
  let src = d.image;
  if (!src && s.type === "featuredBook") src = byId(content.books, d.bookId)?.cover;
  if (!src && s.type === "hero") src = content.site?.portrait;
  if (!src) return "";
  const path = "/" + String(src).replace(/^\//, "");
  return `<img class="sec-thumb" src="${esc(path)}" alt="">`;
}

function typeModal() {
  const place = insertAt?.where === "before" ? "sopra la sezione scelta"
    : insertAt?.where === "after" ? "sotto la sezione scelta"
    : insertAt?.where === "start" ? "in cima alla pagina"
    : "in fondo alla pagina";
  return `<div class="modal-back" id="type-modal"><div class="modal">
    <h2>Aggiungi una sezione</h2>
    <p class="muted">Scegli il blocco. Verrà inserito ${place}. Poi lo sistemi dal costruttore.</p>
    ${TYPE_GROUPS.map(([title, keys]) => `<div class="type-group"><h3>${esc(title)}</h3><div class="type-grid">${keys.map((k) => {
      const v = TYPES[k];
      return `<button type="button" data-type="${k}"><strong>${esc(v.label)}</strong><span>${esc(v.hint)}</span></button>`;
    }).join("")}</div></div>`).join("")}
    <p style="margin-top:16px"><button class="btn btn-secondary" id="close-modal" type="button">Annulla</button></p>
  </div></div>`;
}

function builderItemEditor(page, kind, id) {
  const spec = ITEM_KINDS[kind];
  const isNew = id === "nuovo";
  const item = isNew
    ? (kind === "romanzo" ? { status: "upcoming", language: "Italiano", featured: false } : { status: "upcoming" })
    : spec && byId(content[spec.list], id);
  if (!spec || !item) {
    return `<div class="vb-empty"><p>Elemento non trovato.</p><a class="btn btn-secondary" href="#/costruttore/${esc(page.id)}">Torna alla pagina</a></div>`;
  }
  return `<div class="section-editor">
    <div class="section-editor-head">
      <div>
        <span class="badge">${esc(spec.label)}</span>
        <h2>${esc(item.title || item.name || (isNew ? "Nuovo " + spec.label.toLowerCase() : spec.label))}</h2>
        <p class="muted small">${kind === "romanzo"
          ? (isNew ? "Prepara la scheda da nascosto. Quando è pronta, «Pubblica sul sito»: compare subito." : (item.status === "published" ? "È visibile ai lettori. Puoi nasconderlo e ripubblicarlo quando vuoi." : "È nascosto. Compila e poi pubblica: un clic basta."))
          : (isNew ? "Compila e salva." : "Sei dentro questo elemento. Puoi cambiarlo o eliminarlo.")}</p>
      </div>
      <a class="btn btn-secondary" href="#/costruttore/${esc(page.id)}">Chiudi</a>
    </div>
    <form id="${spec.form}" class="form-grid" style="padding:18px">
      ${kind === "romanzo" ? publishBarHtml(item) : ""}
      ${spec.fields().map((f) => fieldHtml(f, item)).join("")}
      <div class="editor-bar">
        <button class="btn" type="submit">${kind === "romanzo" ? "Salva la scheda" : "Salva e pubblica"}</button>
        ${isNew ? "" : `<button type="button" class="btn-danger" data-del="${esc(spec.list)}" data-id="${esc(item.id)}">Elimina</button>`}
      </div>
    </form>
  </div>`;
}

function builderPanel(page, section) {
  const r = route();
  if (r.itemKind) return builderItemEditor(page, r.itemKind, r.itemId);
  if (!section) {
    return `<div class="vb-empty">
      <span class="badge on">Costruttore</span>
      <h2>Clicca una sezione sulla pagina</h2>
      <p>Poi la cloni, la sposti, ne inserisci un’altra sopra o sotto, la nascondi o la elimini. Puoi anche trascinare la maniglia ⋮⋮.</p>
      <div class="sec-tools">
        <button type="button" class="btn" id="add-section">Aggiungi in fondo</button>
        <button type="button" class="btn btn-secondary" data-add-at="start">Aggiungi in cima</button>
      </div>
    </div>`;
  }
  return sectionEditorHtml(page, section, `#/costruttore/${page.id}`);
}

function reloadBuilderFrame() {
  const frame = $("#vb-frame");
  if (!frame) return;
  const u = new URL(frame.getAttribute("src") || pageUrl(byId(content.pages, route().id)) + "?builder=1", location.origin);
  u.searchParams.set("builder", "1");
  u.searchParams.set("t", String(Date.now()));
  frame.src = u.pathname + "?" + u.searchParams.toString();
}

function builderView() {
  const r = route();
  const page = byId(content.pages, r.id) || content.pages[0];
  if (!r.id && page) {
    location.hash = `#/costruttore/${page.id}`;
    return;
  }
  if (!page) return layout("costruttore", `<h1>Pagina non trovata</h1>`);
  const section = r.sectionId ? byId(page.sections, r.sectionId) : null;
  const url = pageUrl(page) + "?builder=1";
  const root = $(".vb-app");
  if (root) {
    const frame = $("#vb-frame");
    const have = frame ? new URL(frame.src, location.origin).pathname : "";
    const want = new URL(url, location.origin).pathname;
    if (have && have !== want) frame.src = url;
    const sel = $("#vb-page");
    if (sel) sel.value = page.id;
    const panel = $("#vb-panel");
    if (panel) panel.innerHTML = builderPanel(page, section);
    highlightBuilder();
    if (modal && !$("#type-modal")) app().insertAdjacentHTML("beforeend", modal);
    return;
  }
  const opts = content.pages.map((p) => `<option value="${esc(p.id)}" ${p.id === page.id ? "selected" : ""}>${esc(p.title)}</option>`).join("");
  app().innerHTML = `<div class="vb-app" id="vb-app">
    <header class="vb-bar">
      <strong>Costruttore visivo</strong>
      <label class="vb-page-label">Pagina <select id="vb-page">${opts}</select></label>
      <button type="button" class="btn" id="add-section">Aggiungi sezione</button>
      <a class="btn btn-secondary" href="#/pagine/${esc(page.id)}">Elenco sezioni</a>
      <a class="vb-exit" href="#/bacheca">Esci</a>
    </header>
    <div class="vb-work">
      <iframe id="vb-frame" title="Pagina in modifica" src="${esc(url)}"></iframe>
      <aside id="vb-panel">${builderPanel(page, section)}</aside>
    </div>
  </div>${modal || ""}`;
}

function newPageView() {
  return layout("pagine", `
    <p class="small"><a href="#/pagine">← Pagine</a></p>
    <h1>Nuova pagina</h1>
    <form id="new-page" class="panel" style="padding:18px;max-width:640px">
      <div class="form-grid">
        ${fieldHtml(["title", "Titolo"], {})}
        ${fieldHtml(["slug", "Indirizzo (es. news)"], {})}
        ${fieldHtml(["seoDescription", "Descrizione breve"], {})}
        <label class="check"><input type="checkbox" name="inNav" checked> Mostra nel menu</label>
        <button class="btn" type="submit">Crea pagina</button>
      </div>
    </form>`);
}

function navListView(key, title, lead, addHash, items, listId, editBase) {
  return layout(key, `
    <div class="row-head"><div>
      <h1>${esc(title)}</h1>
      <p class="lead">${esc(lead)}</p>
    </div>
    <a class="btn" href="${addHash}">Aggiungi voce</a></div>
    <div class="drag-list" id="${esc(listId)}">
      ${(items || []).map((e) => `<article class="drag-item" draggable="true" data-id="${esc(e.id)}">
        <button type="button" class="drag-handle" aria-label="Trascina per riordinare">⋮⋮</button>
        <div class="drag-copy">
          <strong>${esc(e.label)}</strong>
          <span class="muted">${esc(e.href || "/")}</span>
          ${e.style === "buy" ? `<span class="badge">Pulsante Acquista</span>` : ""}
        </div>
        <div class="actions">
          <a class="btn btn-secondary" href="${editBase}/${esc(e.id)}">Modifica</a>
          <button class="btn-ghost" data-del="${esc(key)}" data-id="${esc(e.id)}">Elimina</button>
        </div>
      </article>`).join("") || `<p class="muted">Nessuna voce. Aggiungine una.</p>`}
    </div>`);
}

function menuView() {
  return navListView("menu", "Menu", "Aggiungi una voce, poi trascinala. L’ordine va subito in alto sul sito.", "#/menu/nuovo", content.menu, "menu-drag", "#/menu");
}

function footerView() {
  return navListView("footer", "Piè di pagina", "Queste voci appaiono in basso. Aggiungile e trascinale nell’ordine che vuoi.", "#/footer/nuovo", content.footer, "footer-drag", "#/footer");
}

function bindSortableList(list, items, onSave) {
  if (!list || !items) return;
  let fromId = "";
  const clearMarks = () => list.querySelectorAll(".drag-over,.drag-over-after").forEach((el) => el.classList.remove("drag-over", "drag-over-after"));

  function placeOf(over, clientY) {
    const rect = over.getBoundingClientRect();
    return clientY < rect.top + rect.height / 2 ? "before" : "after";
  }

  async function applyOrder(sourceId, targetId, where) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const from = items.findIndex((x) => x.id === sourceId);
    let to = items.findIndex((x) => x.id === targetId);
    if (from < 0 || to < 0) return;
    if (where === "after") to += 1;
    const [row] = items.splice(from, 1);
    if (from < to) to -= 1;
    items.splice(to, 0, row);
    await onSave();
    render();
  }

  list.addEventListener("dragstart", (e) => {
    const item = e.target.closest(".drag-item");
    if (!item || e.target.closest("a,input,.btn,.btn-ghost,.btn-secondary")) {
      e.preventDefault();
      return;
    }
    fromId = item.dataset.id;
    item.classList.add("is-dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", fromId);
  });
  list.addEventListener("dragend", (e) => {
    e.target.closest(".drag-item")?.classList.remove("is-dragging");
    clearMarks();
    fromId = "";
  });
  list.addEventListener("dragover", (e) => {
    const over = e.target.closest(".drag-item");
    if (!over) return;
    e.preventDefault();
    clearMarks();
    over.classList.add(placeOf(over, e.clientY) === "before" ? "drag-over" : "drag-over-after");
  });
  list.addEventListener("drop", (e) => {
    const over = e.target.closest(".drag-item");
    if (!over) return;
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || fromId;
    applyOrder(id, over.dataset.id, placeOf(over, e.clientY));
  });

  let touchId = "";
  list.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(".drag-handle")) return;
    const item = e.target.closest(".drag-item");
    if (!item) return;
    touchId = item.dataset.id;
    item.classList.add("is-dragging");
    item.setPointerCapture?.(e.pointerId);
  });
  list.addEventListener("pointermove", (e) => {
    if (!touchId) return;
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest(".drag-item");
    if (!over) return;
    clearMarks();
    over.classList.add(placeOf(over, e.clientY) === "before" ? "drag-over" : "drag-over-after");
  });
  list.addEventListener("pointerup", (e) => {
    if (!touchId) return;
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest(".drag-item");
    const id = touchId;
    list.querySelector(".is-dragging")?.classList.remove("is-dragging");
    const where = over ? placeOf(over, e.clientY) : "";
    const target = over?.dataset.id;
    touchId = "";
    clearMarks();
    if (target) applyOrder(id, target, where);
  });
}

function collectionView(key, title, addHash, cols, rows) {
  const lead = key === "romanzi"
    ? `<p class="lead">Prepara i libri da nascosto. Quando è il momento, un clic su «Pubblica» e compare sul sito. «Nascondi» lo ritira, senza cancellarlo.</p>`
    : "";
  return layout(key, `
    <div class="row-head"><div><h1>${esc(title)}</h1>${lead}</div>
    <a class="btn" href="${addHash}">Aggiungi</a></div>
    <div class="panel"><table>
      <thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}<th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`);
}

function itemEditor(nav, back, title, formId, fields, data, extra = "") {
  const bar = formId === "book-form" ? publishBarHtml(data || { status: "upcoming" }) : "";
  return layout(nav, `
    <p class="small"><a href="${back}">← Indietro</a></p>
    <h1>${esc(title)}</h1>
    <form id="${formId}" class="panel form-grid" style="padding:18px;max-width:760px">
      ${bar}
      ${fields.map((f) => fieldHtml(f, data || {})).join("")}
      ${extra}
      <div class="actions"><button class="btn" type="submit">${formId === "book-form" ? "Salva la scheda" : "Salva"}</button></div>
    </form>`);
}

function siteSettings() {
  const s = content.site;
  const look = route().id === "aspetto";
  return layout(look ? "aspetto" : "impostazioni", `
    <h1>${look ? "Aspetto" : "Impostazioni"}</h1>
    <form id="site-form" class="panel form-grid settings-form">
      ${look ? "" : `
      ${fieldHtml(["name", "Nome del sito"], s)}
      ${fieldHtml(["tagline", "Sottotitolo"], s)}
      ${fieldHtml(["footerText", "Testo nel piè di pagina", "textarea"], s)}
      ${fieldHtml(["copyright", "Copyright"], s)}
      ${fieldHtml(["portrait", "Ritratto", "image"], s)}
      ${fieldHtml(["portraitCaption", "Nome sotto il ritratto"], s)}
      ${fieldHtml(["portraitNote", "Nota sotto il ritratto"], s)}
      <h3 class="form-kicker">Social (compaiono in basso e in Google)</h3>
      ${fieldHtml(["facebook", "Facebook", "url"], s)}
      ${fieldHtml(["instagram", "Instagram", "url"], s)}
      ${fieldHtml(["youtube", "YouTube", "url"], s)}
      ${fieldHtml(["tiktok", "TikTok", "url"], s)}
      ${fieldHtml(["x", "X (Twitter)", "url"], s)}
      ${fieldHtml(["threads", "Threads", "url"], s)}
      ${fieldHtml(["linkedin", "LinkedIn", "url"], s)}
      ${fieldHtml(["email", "Email pubblica"], s)}
      ${fieldHtml(["whatsapp", "WhatsApp (numero, es. 3669240009)"], s)}
      ${fieldHtml(["whatsappMessage", "Primo messaggio su WhatsApp"], s)}
      <p class="help">Incolla solo i collegamenti che usi. Quelli vuoti non si vedono. Facebook e WhatsApp sono già impostati. Il numero compare in basso e nel pulsante verde.</p>
      <h3 class="form-kicker">SEO e condivisione</h3>
      ${fieldHtml(["baseUrl", "Indirizzo pubblico del sito (https://…)"], s)}
      ${fieldHtml(["shareImage", "Immagine predefinita per i social", "image", null, "JPG o PNG, 1200 × 630 pixel, orizzontale. Si usa solo se la pagina o il romanzo non hanno una foto in evidenza."], s)}
      `}
      <h3 class="form-kicker">Colori e pulsanti</h3>
      ${colorField("colorInk", "Colore testo", s, "#141b21")}
      ${colorField("colorPaper", "Colore sfondo", s, "#f5f5f1")}
      ${colorField("colorRed", "Colore pulsanti", s, "#a4372e")}
      ${colorField("colorCoral", "Colore di accento", s, "#ee9b85")}
      ${chipGroup("buttonStyle", "Forma dei pulsanti", BTN_CHIPS, s.buttonStyle)}
      <button class="btn" type="submit">Salva sito</button>
    </form>
    ${look ? "" : `<h2>Password del pannello</h2>
    <form id="pw-form" class="panel form-grid" style="padding:18px;max-width:520px">
      <label class="f"><span>Nome utente</span><input name="user" value="${esc(session.user || "admin")}"></label>
      <label class="f"><span>Password attuale</span><input name="current" type="password" required></label>
      <label class="f"><span>Nuova password</span><input name="new" type="password" minlength="8" required><span class="help">Almeno 8 caratteri.</span></label>
      <button class="btn" type="submit">Cambia password</button>
    </form>`}`);
}

async function mediaView() {
  let files = [];
  try { files = (await api("/api/media")).files || []; } catch { files = []; }
  return layout("media", `
    <h1>File</h1>
    <p class="lead">Carica immagini o documenti. Poi copia il percorso nei campi delle sezioni.</p>
    <form id="upload-form" class="drop">
      <p>Scegli un file (JPG, PNG, WebP, PDF, TXT — max 16 MB). Le foto dal telefono vanno bene così come sono.</p>
      <input type="file" name="file" accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.pdf,.txt" required>
      <p><button class="btn" type="submit">Carica</button></p>
    </form>
    <div class="media-grid" style="margin-top:22px">${files.map((f) => `<div class="media-item">
      ${/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name) ? `<img src="/${esc(f.path)}" alt="">` : ""}
      <strong>${esc(f.name)}</strong>
      <div class="muted">${esc(f.path)}</div>
    </div>`).join("")}</div>`);
}

async function render() {
  const r = route();
  if (r.view === "esci") {
    await api("/api/logout", { method: "POST", body: "{}" }).catch(() => {});
    session.ok = false;
    location.hash = "#/accedi";
    app().innerHTML = loginView();
    return;
  }
  if (!session.ok && r.view !== "accedi") {
    location.hash = "#/accedi";
    app().innerHTML = loginView();
    return;
  }
  if (r.view === "accedi") {
    if (session.ok) { location.hash = "#/bacheca"; return render(); }
    app().innerHTML = loginView();
    return;
  }
  if (!content) content = await api("/api/content");
  if (!Array.isArray(content.footer)) content.footer = [];

  if (r.view === "costruttore") return builderView();
  if (r.view === "bacheca") app().innerHTML = dashboard();
  else if (r.view === "pagine" && r.id === "nuova") app().innerHTML = newPageView();
  else if (r.view === "pagine" && r.id) app().innerHTML = pageEditor(byId(content.pages, r.id), r.sectionId);
  else if (r.view === "pagine") app().innerHTML = pagesList();
  else if (r.view === "romanzi" && r.id === "nuovo") app().innerHTML = itemEditor("romanzi", "#/romanzi", "Nuovo romanzo", "book-form", BOOK_FIELDS, { status: "upcoming", language: "Italiano" });
  else if (r.view === "romanzi" && r.id) app().innerHTML = itemEditor("romanzi", "#/romanzi", "Modifica romanzo", "book-form", BOOK_FIELDS, byId(content.books, r.id));
  else if (r.view === "romanzi") app().innerHTML = collectionView("romanzi", "Romanzi", "#/romanzi/nuovo", ["", "Titolo", "Sul sito"],
    content.books.map((b) => `<tr><td>${b.cover ? `<img class="sec-thumb" src="/${esc(String(b.cover).replace(/^\//, ""))}" alt="">` : ""}</td><td><strong>${esc(b.title)}</strong></td><td>${bookIsLive(b) ? `<span class="pill pill-on">Pubblicato</span>` : `<span class="pill pill-off">Bozza nascosta</span>`}</td>
      <td class="actions"><a class="btn btn-secondary" href="#/romanzi/${esc(b.id)}">Prepara</a>
      ${bookIsLive(b)
        ? `<button type="button" class="btn-ghost" data-book-live="${esc(b.id)}" data-live="0">Nascondi</button>`
        : `<button type="button" class="btn btn-publish" data-book-live="${esc(b.id)}" data-live="1">Pubblica</button>`}
      <button class="btn-ghost" data-del="books" data-id="${esc(b.id)}">Elimina</button></td></tr>`).join(""));
  else if (r.view === "incontri" && r.id === "nuovo") app().innerHTML = itemEditor("incontri", "#/incontri", "Nuovo incontro", "event-form", EVENT_FIELDS, { status: "upcoming" });
  else if (r.view === "incontri" && r.id) app().innerHTML = itemEditor("incontri", "#/incontri", "Modifica incontro", "event-form", EVENT_FIELDS, byId(content.events, r.id));
  else if (r.view === "incontri") app().innerHTML = collectionView("incontri", "Incontri", "#/incontri/nuovo", ["Data", "Titolo"],
    content.events.map((e) => `<tr><td>${esc(e.date || "")}</td><td>${esc(e.title)}</td>
      <td class="actions"><a class="btn btn-secondary" href="#/incontri/${esc(e.id)}">Modifica</a>
      <button class="btn-ghost" data-del="events" data-id="${esc(e.id)}">Elimina</button></td></tr>`).join(""));
  else if (r.view === "stampa" && r.id === "nuovo") app().innerHTML = itemEditor("stampa", "#/stampa", "Nuovo articolo", "press-form", PRESS_FIELDS, { topic: "libro" });
  else if (r.view === "stampa" && r.id) app().innerHTML = itemEditor("stampa", "#/stampa", "Modifica articolo", "press-form", PRESS_FIELDS, byId(content.press, r.id));
  else if (r.view === "stampa") app().innerHTML = collectionView("stampa", "Rassegna stampa", "#/stampa/nuovo", ["Testata", "Titolo", "Libro"],
    content.press.map((e) => `<tr><td>${esc(e.source)}</td><td>${esc(e.title)}</td><td>${esc(byId(content.books, e.bookId)?.title || "—")}${e.topic === "presentazione" ? ` <span class="pill pill-off">Presentazione</span>` : ""}</td>
      <td class="actions"><a class="btn btn-secondary" href="#/stampa/${esc(e.id)}">Modifica</a>
      <button class="btn-ghost" data-del="press" data-id="${esc(e.id)}">Elimina</button></td></tr>`).join(""));
  else if (r.view === "acquista" && r.id === "nuovo") app().innerHTML = itemEditor("acquista", "#/acquista", "Nuovo collegamento", "buy-form", BUY_FIELDS, {});
  else if (r.view === "acquista" && r.id) app().innerHTML = itemEditor("acquista", "#/acquista", "Modifica collegamento", "buy-form", BUY_FIELDS, byId(content.purchases, r.id));
  else if (r.view === "acquista") app().innerHTML = collectionView("acquista", "Dove acquistare", "#/acquista/nuovo", ["Libreria", "Romanzo"],
    content.purchases.map((e) => `<tr><td>${esc(e.name)}</td><td>${esc(byId(content.books, e.bookId)?.title || e.bookId)}</td>
      <td class="actions"><a class="btn btn-secondary" href="#/acquista/${esc(e.id)}">Modifica</a>
      <button class="btn-ghost" data-del="purchases" data-id="${esc(e.id)}">Elimina</button></td></tr>`).join(""));
  else if (r.view === "materiali" && r.id === "nuovo") app().innerHTML = itemEditor("materiali", "#/materiali", "Nuova scheda da scaricare", "res-form", RES_FIELDS, {});
  else if (r.view === "materiali" && r.id) app().innerHTML = itemEditor("materiali", "#/materiali", "Modifica scheda da scaricare", "res-form", RES_FIELDS, byId(content.resources, r.id));
  else if (r.view === "materiali") app().innerHTML = collectionView("materiali", "Schede da scaricare", "#/materiali/nuovo", ["Titolo", "Gruppo"],
    content.resources.map((e) => `<tr><td>${esc(e.title)}</td><td>${esc(e.groupTitle || e.group)}</td>
      <td class="actions"><a class="btn btn-secondary" href="#/materiali/${esc(e.id)}">Modifica</a>
      <button class="btn-ghost" data-del="resources" data-id="${esc(e.id)}">Elimina</button></td></tr>`).join(""));
  else if (r.view === "menu" && r.id === "nuovo") app().innerHTML = itemEditor("menu", "#/menu", "Nuova voce di menu", "menu-form", MENU_FIELDS, { style: "link" });
  else if (r.view === "menu" && r.id) app().innerHTML = itemEditor("menu", "#/menu", "Modifica voce", "menu-form", MENU_FIELDS, byId(content.menu, r.id));
  else if (r.view === "menu") {
    app().innerHTML = menuView();
    bindSortableList($("#menu-drag"), content.menu, save);
  }
  else if (r.view === "footer" && r.id === "nuovo") app().innerHTML = itemEditor("footer", "#/footer", "Nuova voce nel piè di pagina", "footer-form", FOOTER_FIELDS, {});
  else if (r.view === "footer" && r.id) app().innerHTML = itemEditor("footer", "#/footer", "Modifica voce", "footer-form", FOOTER_FIELDS, byId(content.footer, r.id));
  else if (r.view === "footer") {
    app().innerHTML = footerView();
    bindSortableList($("#footer-drag"), content.footer, save);
  }
  else if (r.view === "impostazioni") app().innerHTML = siteSettings();
  else if (r.view === "media") app().innerHTML = await mediaView();
  else app().innerHTML = dashboard();
}

function slugify(v) {
  return String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "pagina";
}

document.addEventListener("submit", async (e) => {
  const form = e.target;
  if (!(form instanceof HTMLFormElement)) return;
  e.preventDefault();
  try {
    if (form.id === "login-form") {
      const data = readForm(form);
      try {
        const res = await api("/api/login", { method: "POST", body: JSON.stringify(data) });
        session = { ok: true, user: data.user, mustChange: res.mustChange };
        content = await api("/api/content");
        location.hash = "#/costruttore/home";
        render();
      } catch (err) {
        app().innerHTML = loginView(err.message);
      }
      return;
    }
    if (form.id === "page-meta") return;
    if (form.id === "section-form") {
      const page = byId(content.pages, form.dataset.page);
      const section = byId(page.sections, form.dataset.section);
      section.data = { ...(section.data || {}), ...readSectionData(form) };
      await save();
      if (route().view === "costruttore") {
        reloadBuilderFrame();
        return;
      }
      return render();
    }
    if (form.id === "new-page") {
      const d = readForm(form);
      const id = uid("page");
      const slug = slugify(d.slug || d.title);
      content.pages.push({
        id, slug, title: d.title || "Nuova pagina",
        seoTitle: `${d.title} | Erasmo Stasolla`,
        seoDescription: d.seoDescription || "",
        inNav: !!d.inNav, locked: false,
        sections: [{ id: uid("s"), type: "heading", visible: true, data: { eyebrow: "", title: d.title, subtitle: d.seoDescription || "" } }],
      });
      if (d.inNav) content.menu.push({ id: uid("m"), label: d.title, href: slug + "/", style: "link" });
      await save();
      location.hash = `#/pagine/${id}`;
      return render();
    }
    if (form.id === "book-form") {
      const d = readForm(form);
      const r = route();
      const id = r.itemKind === "romanzo" ? r.itemId : r.id;
      let book;
      if (id === "nuovo") {
        d.id = uid("book");
        d.slug = slugify(d.slug || d.title);
        content.books.push(d);
        book = d;
        location.hash = r.view === "costruttore" ? `#/costruttore/${r.id}/romanzo/${d.id}` : `#/romanzi/${d.id}`;
      } else {
        book = byId(content.books, id);
        if (!book) {
          toast("Questo romanzo non si è trovato. Aprilo di nuovo dall’elenco.");
          return;
        }
        Object.assign(book, d);
        book.id = id;
      }
      syncBookOnSite(book);
      await save();
      toast(book.status === "published" && book.featured
        ? "Pubblicato. È in evidenza in home e in Romanzi."
        : book.status === "published"
          ? "Pubblicato sul sito. Lo trovi in Romanzi. Spunta «in evidenza» se vuoi anche la home."
          : "Scheda salvata e tenuta nascosta. Quando è pronta, premi «Pubblica sul sito».");
      if (r.view === "costruttore") { reloadBuilderFrame(); return render(); }
      return render();
    }
    if (form.id === "event-form") {
      const d = readForm(form);
      const r = route();
      const id = r.itemKind === "incontro" ? r.itemId : r.id;
      if (id === "nuovo") { d.id = uid("event"); content.events.push(d); location.hash = r.view === "costruttore" ? `#/costruttore/${r.id}/incontro/${d.id}` : `#/incontri/${d.id}`; }
      else Object.assign(byId(content.events, id), d);
      await save();
      if (r.view === "costruttore") { reloadBuilderFrame(); return; }
      return render();
    }
    if (form.id === "press-form") {
      const d = readForm(form);
      const r = route();
      const id = r.itemKind === "stampa" ? r.itemId : r.id;
      if (id === "nuovo") { d.id = uid("press"); content.press.push(d); location.hash = r.view === "costruttore" ? `#/costruttore/${r.id}/stampa/${d.id}` : `#/stampa/${d.id}`; }
      else Object.assign(byId(content.press, id), d);
      await save();
      if (r.view === "costruttore") { reloadBuilderFrame(); return; }
      return render();
    }
    if (form.id === "buy-form") {
      const d = readForm(form);
      const r = route();
      const id = r.itemKind === "acquisto" ? r.itemId : r.id;
      if (id === "nuovo") { d.id = uid("buy"); content.purchases.push(d); location.hash = r.view === "costruttore" ? `#/costruttore/${r.id}/acquisto/${d.id}` : `#/acquista/${d.id}`; }
      else Object.assign(byId(content.purchases, id), d);
      await save();
      if (r.view === "costruttore") { reloadBuilderFrame(); return; }
      return render();
    }
    if (form.id === "res-form") {
      const d = readForm(form);
      const r = route();
      const id = r.itemKind === "materiale" ? r.itemId : r.id;
      if (id === "nuovo") { d.id = uid("res"); content.resources.push(d); location.hash = r.view === "costruttore" ? `#/costruttore/${r.id}/materiale/${d.id}` : `#/materiali/${d.id}`; }
      else Object.assign(byId(content.resources, id), d);
      await save();
      if (r.view === "costruttore") { reloadBuilderFrame(); return; }
      return render();
    }
    if (form.id === "menu-form") {
      const d = readForm(form);
      const r = route();
      if (r.id === "nuovo") { d.id = uid("m"); content.menu.push(d); location.hash = `#/menu/${d.id}`; }
      else Object.assign(byId(content.menu, r.id), d);
      await save();
      return render();
    }
    if (form.id === "footer-form") {
      const d = readForm(form);
      const r = route();
      if (!content.footer) content.footer = [];
      if (r.id === "nuovo") { d.id = uid("f"); content.footer.push(d); location.hash = `#/footer/${d.id}`; }
      else Object.assign(byId(content.footer, r.id), d);
      await save();
      return render();
    }
    if (form.id === "site-form") {
      Object.assign(content.site, readForm(form));
      await save();
      return render();
    }
    if (form.id === "pw-form") {
      const d = readForm(form);
      await api("/api/password", { method: "POST", body: JSON.stringify(d) });
      session.user = d.user;
      session.mustChange = false;
      toast("Password aggiornata.");
      return render();
    }
    if (form.id === "upload-form") {
      const file = form.file.files[0];
      if (!file) return;
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await api("/api/upload", { method: "POST", body: JSON.stringify({ filename: file.name, data }) });
      toast("Caricato: " + res.path);
      return render();
    }
  } catch (err) {
    toast(err.message || "Errore");
  }
});

document.addEventListener("click", async (e) => {
  const liveBtn = e.target.closest("[data-book-live]");
  if (liveBtn) {
    const live = liveBtn.dataset.live === "1";
    const form = liveBtn.closest("form");
    if (form && form.id === "book-form") {
      const status = form.querySelector("[name=status]");
      if (status) status.value = live ? "published" : "upcoming";
      const label = form.querySelector("[name=statusLabel]");
      if (label) {
        if (live && (!label.value || /preparazione/i.test(label.value))) label.value = "Disponibile";
        if (!live && (!label.value || /disponibile/i.test(label.value))) label.value = "In preparazione";
      }
      form.requestSubmit();
      return;
    }
    const book = byId(content.books, liveBtn.dataset.bookLive);
    if (!book) {
      toast("Apri il romanzo e pubblicalo dalla scheda.");
      return;
    }
    try {
      applyBookVisibility(book, live);
      await save();
      toast(live
        ? (book.featured ? "Pubblicato. È in evidenza in home e in Romanzi." : "Pubblicato sul sito. Lo trovi in Romanzi.")
        : "Nascosto. Resta nel pannello: puoi ripubblicarlo quando vuoi.");
      if (route().view === "costruttore") reloadBuilderFrame();
      return render();
    } catch (err) {
      toast(err.message || "Errore");
    }
    return;
  }
  const tab = e.target.closest("[data-editor-tab]");
  if (tab) {
    editorTab = tab.dataset.editorTab;
    const root = tab.closest(".section-editor") || document;
    root.querySelectorAll("[data-editor-tab]").forEach((b) => b.classList.toggle("is-on", b === tab));
    root.querySelectorAll("[data-pane]").forEach((p) => p.classList.toggle("is-on", p.dataset.pane === editorTab));
    return;
  }
  const set = e.target.closest("[data-set]");
  if (set) {
    const form = set.closest("form");
    const input = form && form.querySelector(`[name="${set.dataset.set}"]`);
    if (input) input.value = set.dataset.value;
    set.parentElement.querySelectorAll("[data-set]").forEach((b) => b.classList.toggle("is-on", b === set));
    refreshStylePreview(form);
    return;
  }
  const clear = e.target.closest("[data-clear-color]");
  if (clear) {
    const form = clear.closest("form");
    const field = form && form.querySelector(`[name="${clear.dataset.clearColor}"]`);
    if (field) field.value = "";
    refreshStylePreview(form);
    return;
  }
  const addPhoto = e.target.closest("[data-add-photo]");
  if (addPhoto) {
    const editor = addPhoto.closest("[data-gallery]");
    const box = editor && editor.querySelector(".gallery-items");
    if (box) {
      box.querySelector("p")?.remove();
      box.insertAdjacentHTML("beforeend", galleryItemHtml({}, box.children.length));
      syncGallery(editor);
    }
    return;
  }
  const gdel = e.target.closest("[data-g-del]");
  if (gdel) {
    const editor = gdel.closest("[data-gallery]");
    gdel.closest(".gallery-item")?.remove();
    syncGallery(editor);
    return;
  }
  const previewBtn = e.target.closest("[data-preview],#preview-close");
  if (previewBtn) {
    if (previewBtn.id === "preview-close") return closePreview();
    openPreview(previewBtn.dataset.preview);
    return;
  }
  const t = e.target.closest("[data-del],[data-del-page],[data-del-sec],[data-move],[data-vis],[data-move-menu],[data-type],[data-clone-sec],[data-add-at],#add-section,#close-modal,#save-page,#save-page-side");
  if (!t) return;
  const r = route();
  const page = (r.view === "pagine" || r.view === "costruttore") ? byId(content.pages, r.id) : null;
  try {
    if (t.id === "add-section") {
      const meta = $("#page-meta");
      if (meta && page) Object.assign(page, readForm(meta));
      insertAt = { where: "end" };
      modal = typeModal();
      return render();
    }
    if (t.dataset.addAt && page) {
      insertAt = t.dataset.addAt === "start"
        ? { where: "start" }
        : { where: t.dataset.addAt, sectionId: t.dataset.sec };
      modal = typeModal();
      return render();
    }
    if (t.id === "close-modal") {
      insertAt = null;
      modal = null;
      $("#type-modal")?.remove();
      if (!$(".vb-app")) return render();
      return;
    }
    if (t.dataset.type && page) {
      const created = { id: uid("s"), type: t.dataset.type, visible: true, data: {} };
      insertSection(page, created);
      modal = null;
      $("#type-modal")?.remove();
      await save();
      toast("Sezione aggiunta. Compilala da qui.");
      const base = r.view === "costruttore" ? "costruttore" : "pagine";
      location.hash = `#/${base}/${page.id}/sezione/${created.id}`;
      if (r.view === "costruttore") reloadBuilderFrame();
      return render();
    }
    if (t.dataset.cloneSec && page) {
      const src = byId(page.sections, t.dataset.cloneSec);
      if (!src) return;
      const copy = cloneSection(src);
      insertSection(page, copy, { where: "after", sectionId: src.id });
      return afterPageEdit(page, copy.id, "Sezione clonata. Ora puoi modificarla.", true);
    }
    if ((t.id === "save-page" || t.id === "save-page-side") && page) {
      const meta = $("#page-meta");
      if (meta) Object.assign(page, readForm(meta));
      await save();
      return;
    }
    if (t.dataset.delPage) {
      const p = byId(content.pages, t.dataset.delPage);
      if (!p || p.locked) return toast("Questa pagina principale non si elimina. Puoi nasconderne le sezioni.");
      if (!confirm(`Eliminare la pagina «${p.title}»?`)) return;
      removeId(content.pages, p.id);
      await save();
      return render();
    }
    if (t.dataset.delSec && page) {
      if (!confirm("Eliminare questa sezione?")) return;
      removeId(page.sections, t.dataset.delSec);
      await save();
      toast("Sezione eliminata.");
      if (r.view === "costruttore") {
        location.hash = `#/costruttore/${page.id}`;
        reloadBuilderFrame();
        return render();
      }
      location.hash = `#/pagine/${page.id}`;
      return render();
    }
    if (t.dataset.move && page) {
      move(page.sections, t.dataset.move, Number(t.dataset.dir));
      return afterPageEdit(page, t.dataset.move, "Sezione spostata.");
    }
    if (t.dataset.vis && page) {
      const s = byId(page.sections, t.dataset.vis);
      s.visible = s.visible === false;
      return afterPageEdit(page, s.id, s.visible === false ? "Sezione nascosta sulla pagina pubblica." : "Sezione di nuovo visibile.");
    }
    if (t.dataset.moveMenu) {
      move(content.menu, t.dataset.moveMenu, Number(t.dataset.dir));
      await save();
      return render();
    }
    if (t.dataset.del) {
      if (!confirm("Eliminare questo elemento?")) return;
      removeId(content[t.dataset.del], t.dataset.id);
      await save();
      if (r.view === "costruttore") {
        location.hash = `#/costruttore/${r.id}`;
        reloadBuilderFrame();
        return render();
      }
      location.hash = `#/${r.view}`;
      return render();
    }
  } catch (err) {
    toast(err.message || "Errore");
  }
});

window.addEventListener("message", (e) => {
  if (e.origin !== location.origin) return;
  const data = e.data || {};
  if (data.type === "cms-item" && data.pageId && data.kind && data.id) {
    const kind = ITEM_FROM_CMS[data.kind];
    if (kind) location.hash = `#/costruttore/${data.pageId}/${kind}/${data.id}`;
    return;
  }
  if (data.type === "cms-select" && data.pageId && data.sectionId) {
    location.hash = `#/costruttore/${data.pageId}/sezione/${data.sectionId}`;
  }
  if (data.type === "cms-add" && data.pageId) {
    location.hash = `#/costruttore/${data.pageId}`;
    insertAt = { where: "end" };
    modal = typeModal();
    render();
  }
  if (data.type === "cms-section" && data.pageId && data.action) {
    runBuilderAction(data);
  }
  if (data.type === "cms-ready") {
    if (data.pageId && route().view === "costruttore" && route().id !== data.pageId) {
      location.hash = `#/costruttore/${data.pageId}`;
    }
    highlightBuilder();
  }
});

function highlightBuilder() {
  const frame = $("#vb-frame");
  const r = route();
  if (!frame || !frame.contentWindow || r.view !== "costruttore") return;
  try {
    frame.contentWindow.postMessage({
      type: "cms-highlight",
      sectionId: r.sectionId || "",
      itemKind: r.itemKind ? Object.keys(ITEM_FROM_CMS).find((k) => ITEM_FROM_CMS[k] === r.itemKind) : "",
      itemId: r.itemId || "",
    }, location.origin);
  } catch {}
}

async function runBuilderAction(data) {
  const page = byId(content.pages, data.pageId);
  if (!page) return;
  const id = data.sectionId || "";
  try {
    if (data.action === "add" || data.action === "add-start" || data.action === "add-before" || data.action === "add-after") {
      insertAt = data.action === "add" ? { where: "end" }
        : data.action === "add-start" ? { where: "start" }
        : { where: data.action === "add-before" ? "before" : "after", sectionId: id };
      modal = typeModal();
      return render();
    }
    if (data.action === "clone") {
      const src = byId(page.sections, id);
      if (!src) return;
      const copy = cloneSection(src);
      insertSection(page, copy, { where: "after", sectionId: src.id });
      return afterPageEdit(page, copy.id, "Sezione clonata. Ora puoi modificarla.", true);
    }
    if (data.action === "delete") {
      if (!confirm("Eliminare questa sezione?")) return;
      removeId(page.sections, id);
      await save();
      toast("Sezione eliminata.");
      location.hash = `#/costruttore/${page.id}`;
      reloadBuilderFrame();
      return render();
    }
    if (data.action === "up" || data.action === "down") {
      move(page.sections, id, data.action === "up" ? -1 : 1);
      return afterPageEdit(page, id, "Sezione spostata.");
    }
    if (data.action === "hide") {
      const s = byId(page.sections, id);
      if (!s) return;
      s.visible = s.visible === false;
      return afterPageEdit(page, s.id, s.visible === false ? "Sezione nascosta sulla pagina pubblica." : "Sezione di nuovo visibile.");
    }
    if (data.action === "reorder" && data.fromId && data.toId) {
      if (!reorderSection(page, data.fromId, data.toId, data.where || "before")) return;
      return afterPageEdit(page, data.fromId, "Ordine aggiornato. Puoi continuare a trascinare.");
    }
  } catch (err) {
    toast(err.message || "Errore");
  }
}

document.addEventListener("input", (e) => {
  if (e.target.closest("[data-gallery]")) syncGallery(e.target.closest("[data-gallery]"));
  if (e.target.matches(".image-picker input[type=text][name]")) probeImageField(e.target.closest(".image-field"), e.target.name, e.target.value);
  if (e.target.matches("[data-g=src]")) probeGalleryItem(e.target.closest(".gallery-item"), e.target.value);
  if (e.target.matches("[data-sync-color]")) {
    const name = e.target.dataset.syncColor;
    const text = e.target.closest(".color-field")?.querySelector(`[name="${name}"]`);
    if (text) text.value = e.target.value;
    refreshStylePreview(e.target.closest("form"));
  }
  if (e.target.matches("[name=styleBg],[name=styleColor]")) {
    const picker = e.target.closest(".color-field")?.querySelector("[data-sync-color]");
    if (picker && hexOk(e.target.value)) picker.value = e.target.value;
    refreshStylePreview(e.target.closest("form"));
  }
});

function orientLabel(orient) {
  return orient === "landscape" ? "Orizzontale" : orient === "portrait" ? "Verticale" : orient === "square" ? "Quadrata" : "";
}

function applyUploadPreview(box, res, extra) {
  if (!box) return;
  box.classList.remove("orient-landscape", "orient-portrait", "orient-square");
  if (res.orientation) box.classList.add("orient-" + res.orientation);
  box.innerHTML = `<img src="/${esc(res.path)}" alt="" class="smart-img"${res.orientation ? ` data-orient="${esc(res.orientation)}"` : ""}>`;
  const parent = box.parentElement;
  const label = orientLabel(res.orientation);
  if (!parent || !label) return;
  let badge = parent.querySelector(".orient-badge");
  const text = extra || (label + " · il sito la inquadra da solo");
  if (badge) badge.textContent = text;
  else box.insertAdjacentHTML("afterend", `<span class="orient-badge">${esc(text)}</span>`);
}

function setHidden(root, name, value) {
  const el = root && root.querySelector(`[name="${name}"]`);
  if (el) el.value = value == null ? "" : value;
}

function probeNatural(src, done) {
  const path = String(src || "").trim();
  if (!path || !/\.(jpe?g|png|webp|gif|svg)$/i.test(path)) return;
  const img = new Image();
  img.onload = () => {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return;
    const r = w / h;
    const orientation = r > 0.92 && r < 1.08 ? "square" : w > h ? "landscape" : "portrait";
    done({ path: path.replace(/^\//, ""), width: w, height: h, orientation });
  };
  img.src = /^https?:/i.test(path) ? path : "/" + path.replace(/^\//, "");
}

function probeImageField(field, name, src) {
  if (!field || !name) return;
  probeNatural(src, (res) => {
    setHidden(field, name + "Width", res.width);
    setHidden(field, name + "Height", res.height);
    setHidden(field, name + "Orient", res.orientation);
    applyUploadPreview(field.querySelector(".image-preview"), res);
  });
}

function probeGalleryItem(item, src) {
  if (!item) return;
  probeNatural(src, (res) => {
    const w = item.querySelector("[data-g=width]");
    const h = item.querySelector("[data-g=height]");
    const o = item.querySelector("[data-g=orient]");
    if (w) w.value = res.width;
    if (h) h.value = res.height;
    if (o) o.value = res.orientation;
    applyUploadPreview(item.querySelector(".image-preview"), res, orientLabel(res.orientation));
    syncGallery(item.closest("[data-gallery]"));
  });
}

document.addEventListener("change", async (e) => {
  if (e.target.id === "vb-page") {
    insertAt = null;
    location.hash = `#/costruttore/${e.target.value}`;
    return;
  }
  const gfile = e.target.closest("[data-g-file]");
  if (gfile && gfile.files && gfile.files[0]) {
    const file = gfile.files[0];
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await api("/api/upload", { method: "POST", body: JSON.stringify({ filename: file.name, data }) });
      const item = gfile.closest(".gallery-item");
      const src = item && item.querySelector("[data-g=src]");
      if (src) src.value = res.path;
      const w = item && item.querySelector("[data-g=width]");
      const h = item && item.querySelector("[data-g=height]");
      const o = item && item.querySelector("[data-g=orient]");
      if (w) w.value = res.width || "";
      if (h) h.value = res.height || "";
      if (o) o.value = res.orientation || "";
      applyUploadPreview(item && item.querySelector(".image-preview"), res, orientLabel(res.orientation));
      syncGallery(gfile.closest("[data-gallery]"));
      toast(orientLabel(res.orientation) ? `Foto ${orientLabel(res.orientation).toLowerCase()} in galleria.` : "Foto aggiunta alla galleria.");
    } catch (err) {
      toast(err.message || "Caricamento non riuscito");
    }
    return;
  }
  const input = e.target.closest("[data-image-for]");
  if (!input || !input.files || !input.files[0]) return;
  const file = input.files[0];
  try {
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const res = await api("/api/upload", { method: "POST", body: JSON.stringify({ filename: file.name, data }) });
    const field = input.closest(".image-field");
    const name = input.dataset.imageFor;
    const text = field && field.querySelector(`input[name="${name}"]`);
    if (text) text.value = res.path;
    setHidden(field, name + "Width", res.width || "");
    setHidden(field, name + "Height", res.height || "");
    setHidden(field, name + "Orient", res.orientation || "");
    applyUploadPreview(field && field.querySelector(".image-preview"), res);
    const kind = orientLabel(res.orientation);
    toast(kind ? `Immagine ${kind.toLowerCase()} caricata. Il sito la inquadra da solo.` : "Immagine caricata.");
  } catch (err) {
    toast(err.message || "Caricamento non riuscito");
  }
});

window.addEventListener("hashchange", () => { modal = null; render(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && preview.open) closePreview();
});

(async function init() {
  try {
    session = await api("/api/session");
  } catch {
    session = { ok: false };
  }
  if (!location.hash) location.hash = session.ok ? "#/costruttore/home" : "#/accedi";
  else render();
})();
