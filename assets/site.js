(function () {
  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector(".nav");
  const header = document.querySelector(".site-header");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isBuilder = /(?:\?|&)builder=1(?:&|$)/.test(location.search);

  if (menuButton && nav) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      menuButton.textContent = "Menu";
    };
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      menuButton.textContent = open ? "Chiudi" : "Menu";
      if (open && header) header.classList.remove("is-away");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-header")) closeMenu();
    });
    window.matchMedia("(min-width: 801px)").addEventListener("change", (e) => {
      if (e.matches) closeMenu();
    });
  }

  document.querySelectorAll("[data-print]").forEach((b) => {
    b.addEventListener("click", () => window.print());
  });

  if (header && !reduce && !isBuilder) {
    let last = window.scrollY;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const open = menuButton && menuButton.getAttribute("aria-expanded") === "true";
        if (open || y < 56 || header.contains(document.activeElement)) {
          header.classList.remove("is-away");
        } else if (y > last + 8) {
          header.classList.add("is-away");
        } else if (y < last - 4) {
          header.classList.remove("is-away");
        }
        last = y;
        ticking = false;
      });
    }, { passive: true });
    header.addEventListener("focusin", () => header.classList.remove("is-away"));
  }

  const REVEAL = [
    ".fade-in",
    "main .section",
    "main .page-heading",
    "main .detail-grid",
    "main .bio-layout",
    "main .book-press",
    "main .book-promo",
    "main .catalog-feature",
    "main .project-intro",
  ].join(",");

  let observer;

  function initSiteMotion() {
    if (reduce || isBuilder || document.body.classList.contains("is-builder")) return;
    const nodes = [...document.querySelectorAll(REVEAL)].filter((el) => {
      if (el.dataset.revealBound) return false;
      const parent = el.parentElement;
      return !(parent && parent.closest(REVEAL));
    });
    if (!nodes.length) {
      document.documentElement.classList.add("has-motion");
      return;
    }
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((el) => {
        el.dataset.revealBound = "1";
        el.classList.add("reveal", "is-in");
      });
      document.documentElement.classList.add("has-motion");
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.01, rootMargin: "120px 0px 120px 0px" });
    }
    nodes.forEach((el) => {
      el.dataset.revealBound = "1";
      if (visible(el)) return;
      el.classList.add("reveal");
      observer.observe(el);
    });
    document.documentElement.classList.add("has-motion");
    document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => {
      if (visible(el)) el.classList.add("is-in");
    });
  }

  window.initSiteMotion = initSiteMotion;
  initSiteMotion();
  window.addEventListener("scroll", () => {
    document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) el.classList.add("is-in");
    });
  }, { passive: true });

  const main = document.getElementById("contenuto");
  if (main) {
    new MutationObserver(() => initSiteMotion()).observe(main, { childList: true });
  }
})();
