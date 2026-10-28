/* Costa Combat pages — language toggle + WhatsApp prefill + Ads conversion.
   Spanish is in the HTML; English lives in DICT below. If this script fails,
   the page still reads correctly in Spanish. */
(function () {
  "use strict";

  /* Swap this for a short.io link (e.g. https://costacombat.com/w-a1) if you want
     automatic click counts on the CTA. Doing so drops the dynamic prefill below —
     short.io can only carry one fixed message. */
  var WA_BASE = "https://wa.me/523221026023";

  var variant = document.body.dataset.variant || "a";

  /* How the visitor arrived, worded naturally in each language. */
  var SOURCE = {
    flyer:     { es: "el folleto",   en: "flyer" },
    instagram: { es: "el Instagram", en: "Instagram post" },
    facebook:  { es: "el Facebook",  en: "Facebook post" },
    google:    { es: "la página",    en: "listing" },
    ads:       { es: "el anuncio",   en: "ad" },
    whatsapp:  { es: "el perfil de WhatsApp", en: "WhatsApp profile" },
    _default:  { es: "la página",    en: "page" }
  };

  var MESSAGE = {
    a: {
      es: "Hola, vi {src} de Costa Combat. Me interesa inscribirme en un plan.",
      en: "Hi, I saw the Costa Combat {src}. I'd like to sign up for a plan."
    },
    b: {
      es: "Hola, vi {src} de Costa Combat. Quiero información de horarios y planes.",
      en: "Hi, I saw the Costa Combat {src}. I'd like information on class times and plans."
    },
    home: {
      es: "Hola, vi {src} de Costa Combat. Quiero tomar mi primera clase gratis.",
      en: "Hi, I saw the Costa Combat {src}. I'd like to book my free first class."
    }
  };

  function sourceWord(lang) {
    var p = new URLSearchParams(location.search);
    // Campaign pages are reached from print; the home page usually isn't.
    var s = (p.get("utm_source") || (variant === "home" ? "" : "flyer")).toLowerCase();
    return (SOURCE[s] || SOURCE._default)[lang];
  }

  function refreshWhatsApp(lang) {
    var href = WA_BASE;
    if (WA_BASE.indexOf("wa.me") !== -1) {
      var text = MESSAGE[variant][lang].replace("{src}", sourceWord(lang));
      href = WA_BASE + "?text=" + encodeURIComponent(text);
    }
    document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = href; });

    /* Schedule entries book their own slot. Runs after the language swap, so
       the day, class and time are read in the language on screen. */
    if (WA_BASE.indexOf("wa.me") === -1) return;
    document.querySelectorAll("[data-wa-slot]").forEach(function (a) {
      var day = a.closest(".day").querySelector("h3").textContent.trim();
      var cls = a.querySelector("[data-i18n]").textContent.trim();
      var time = a.querySelector(".time").textContent.trim();
      var text = lang === "en"
        ? "Hi, I'd like to book a free trial lesson: " + cls + ", " + day + " " + time
        : "Hola, quiero reservar una clase de prueba gratis: " + cls + ", " + day.toLowerCase() + " " + time;
      a.href = WA_BASE + "?text=" + encodeURIComponent(text);
    });
  }

  /* ---- language ---- */

  var DICT = window.EN_STRINGS || {};

  function setLang(lang, remember) {
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.dataset.i18n;
      if (lang === "en") {
        if (!el.dataset.es) el.dataset.es = el.innerHTML;
        if (DICT[key]) el.innerHTML = DICT[key];
      } else if (el.dataset.es) {
        el.innerHTML = el.dataset.es;
      }
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      var spec = el.dataset.i18nAttr.split(":");   // "attr:key"
      var attr = spec[0], key = spec[1];
      if (lang === "en") {
        if (!el.dataset.esAttr) el.dataset.esAttr = el.getAttribute(attr) || "";
        if (DICT[key]) el.setAttribute(attr, DICT[key]);
      } else if (el.dataset.esAttr !== undefined) {
        el.setAttribute(attr, el.dataset.esAttr);
      }
    });

    if (DICT.__title) {
      if (!document.body.dataset.esTitle) document.body.dataset.esTitle = document.title;
      document.title = lang === "en" ? DICT.__title : document.body.dataset.esTitle;
    }

    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });

    if (remember) { try { localStorage.setItem("bmc-lang", lang); } catch (e) {} }
    refreshWhatsApp(lang);
  }

  var stored = null;
  try { stored = localStorage.getItem("bmc-lang"); } catch (e) {}
  var initial = stored || ((navigator.language || "es").toLowerCase().indexOf("es") === 0 ? "es" : "en");

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang, true); });
  });

  setLang(initial, false);

  /* ---- Google Ads conversion ---- */

  /* Every WhatsApp link counts, wherever it sits on the page. The Google tag in
     each page's <head> defines gtag; gtag sends by beacon, so the hit survives
     the navigation to wa.me. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me"]');
    if (a && typeof window.gtag === "function") {
      window.gtag("event", "conversion", { send_to: "AW-18515765135/pztFCPWzoq0dEI_PgP1E" });
    }
  });
})();
