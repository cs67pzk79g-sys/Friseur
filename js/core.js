/* ==================================================================
   HAARSCHARF. — core.js
   Grundlagen: Hilfsfunktionen, Navigation, Scroll-Reveals, Parallax,
   Öffnungszeiten. Läuft ohne Abhängigkeiten und ohne Build-Schritt.

   Alle Module hängen an einem einzigen globalen Objekt (HS), damit die
   drei Skriptdateien miteinander reden können, ohne den globalen
   Namensraum vollzumüllen.
   ================================================================== */

window.HS = (function () {
  'use strict';

  /* ---------------------------------------------------------------
     Hilfsfunktionen
     --------------------------------------------------------------- */
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* Zwei Umgebungsfragen, die fast jedes Modul stellt. Als Funktionen
     und nicht als Konstanten, weil sich beides zur Laufzeit ändern
     kann (Nutzer:in schaltet "Bewegung reduzieren" um, oder ein
     Touchscreen-Gerät wird an eine Maus angeschlossen). */
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hasFinePointer = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Wert in einen Bereich zwängen. */
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  /* Lineare Interpolation – die Grundlage jeder weichen Nachführung. */
  const lerp = (a, b, t) => a + (b - a) * t;

  /* Scroll- und Resize-Handler dürfen nie direkt feuern: sie werden an
     den Frame-Takt des Browsers gekoppelt. Sonst rechnet man bis zu
     100-mal pro Sekunde Layout, statt 60-mal zu zeichnen. */
  function rafThrottle(fn) {
    let ticking = false;
    return function throttled() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; fn(); });
    };
  }

  /* Ein einziger Scroll-Listener für die ganze Seite. Module melden
     sich hier an, statt jeweils eigene Listener zu registrieren. */
  const scrollSubscribers = [];
  const onScroll = (fn) => { scrollSubscribers.push(fn); };

  window.addEventListener('scroll', rafThrottle(function () {
    const y = window.scrollY || window.pageYOffset;
    for (let i = 0; i < scrollSubscribers.length; i++) scrollSubscribers[i](y);
  }), { passive: true });


  /* ---------------------------------------------------------------
     Navigation: Zustandswechsel beim Scrollen + aktiver Abschnitt
     --------------------------------------------------------------- */
  function initNav() {
    const nav = $('#nav');
    if (!nav) return;

    // Hysterese: erst ab 40 px "kleben", erst unter 20 px wieder lösen.
    // Ohne diesen Puffer flackert die Leiste, wenn man genau auf der
    // Schwelle scrollt.
    let stuck = false;
    onScroll(function (y) {
      if (!stuck && y > 40)      { stuck = true;  nav.classList.add('is-stuck'); }
      else if (stuck && y < 20)  { stuck = false; nav.classList.remove('is-stuck'); }
    });

    // Aktiven Menüpunkt markieren (Scrollspy).
    const links = $$('[data-nav]');
    const targets = links
      .map(a => ({ link: a, section: $(a.getAttribute('href')) }))
      .filter(t => t.section);

    if (!targets.length || !('IntersectionObserver' in window)) return;

    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const match = targets.find(t => t.section === entry.target);
        if (!match) return;
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('is-current'));
          match.link.classList.add('is-current');
        }
      });
    }, {
      // Ein schmales Band in der oberen Bildschirmhälfte: der Abschnitt
      // gilt als "aktiv", sobald er dieses Band schneidet.
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    targets.forEach(t => spy.observe(t.section));
  }


  /* ---------------------------------------------------------------
     Mobiles Menü
     --------------------------------------------------------------- */
  function initMobileMenu() {
    const burger = $('#burger');
    const menu   = $('#mobile-menu');
    if (!burger || !menu) return;

    const links = $$('a', menu);
    // Gestaffelte Verzögerung, damit die Einträge nacheinander kommen.
    links.forEach((a, i) => a.style.setProperty('--d', (i * 45) + 'ms'));

    let open = false;

    function setOpen(next) {
      open = next;
      burger.setAttribute('aria-expanded', String(open));
      $('.visually-hidden', burger).textContent = open ? 'Menü schließen' : 'Menü öffnen';
      document.body.style.overflow = open ? 'hidden' : '';

      if (open) {
        menu.hidden = false;
        // Ein Frame Pause, damit der Browser den Startzustand rendert
        // und die Transition tatsächlich läuft.
        requestAnimationFrame(() => menu.classList.add('is-open'));
      } else {
        menu.classList.remove('is-open');
        const done = () => { menu.hidden = true; menu.removeEventListener('transitionend', done); };
        if (prefersReducedMotion()) done();
        else menu.addEventListener('transitionend', done);
      }
    }

    burger.addEventListener('click', () => setOpen(!open));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });
  }


  /* ---------------------------------------------------------------
     Scroll-Reveals
     Elemente mit [data-reveal] blenden ein, sobald sie ins Bild
     kommen. Die Startklasse setzt JavaScript – ohne JavaScript bleibt
     also nichts unsichtbar.
     --------------------------------------------------------------- */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      items.forEach(el => el.classList.add('is-in'));
      return;
    }

    document.documentElement.classList.add('js-reveal');

    const io = new IntersectionObserver(function (entries, observer) {
      // Nach Position sortieren, damit Geschwister von links nach
      // rechts nacheinander erscheinen statt in Beobachtungsreihenfolge.
      entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top ||
                        a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach(function (entry, i) {
          entry.target.style.setProperty('--reveal-delay', (i * 70) + 'ms');
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target); // einmal reicht
        });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    items.forEach(el => io.observe(el));
  }


  /* ---------------------------------------------------------------
     Parallax
     Elemente mit [data-parallax="0.18"] verschieben sich beim Scrollen
     um den angegebenen Faktor gegen die Scrollrichtung.
     --------------------------------------------------------------- */
  function initParallax() {
    const layers = $$('[data-parallax]');
    if (!layers.length || prefersReducedMotion()) return;

    // Nur rechnen, was gerade sichtbar ist.
    const visible = new Set();
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
    }, { rootMargin: '20% 0px 20% 0px' });
    layers.forEach(el => io.observe(el));

    function update() {
      const vh = window.innerHeight;
      visible.forEach(function (el) {
        const speed = parseFloat(el.dataset.parallax) || 0;
        const rect  = el.getBoundingClientRect();
        // Fortschritt von -1 (Element unter dem Viewport) bis +1 (darüber).
        const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        el.style.transform = 'translate3d(0,' + (progress * speed * 100).toFixed(2) + 'px,0)';
      });
    }

    onScroll(update);
    window.addEventListener('resize', rafThrottle(update), { passive: true });
    update();
  }


  /* ---------------------------------------------------------------
     Öffnungszeiten: heutigen Tag hervorheben
     Damit steht in der Demo nie ein toter Wochentag – die Liste
     richtet sich nach dem echten Datum im Browser.
     --------------------------------------------------------------- */
  function initHours() {
    const list = $('#hours');
    if (!list) return;
    const today = new Date().getDay(); // 0 = Sonntag
    const row = $('[data-day="' + today + '"]', list);
    if (!row) return;
    row.classList.add('is-today');
    // Für Screenreader die Information im Klartext ergänzen.
    const tag = document.createElement('span');
    tag.className = 'visually-hidden';
    tag.textContent = ' (heute)';
    row.querySelector('span').appendChild(tag);
  }


  /* ---------------------------------------------------------------
     Intro
     Die Schnitt-Animation der Wortmarke startet erst, wenn die
     Schriften geladen sind – sonst schneidet sie durch die
     Ersatzschrift und springt danach.
     --------------------------------------------------------------- */
  function initIntro() {
    function go() {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-cut');
    }
    if (document.fonts && document.fonts.ready) {
      // Notbremse: falls die Schriften hängen, nach 1,2 s trotzdem starten.
      const timeout = setTimeout(go, 1200);
      document.fonts.ready.then(() => { clearTimeout(timeout); go(); });
    } else {
      go();
    }
  }


  /* ---------------------------------------------------------------
     Start
     --------------------------------------------------------------- */
  function boot() {
    document.documentElement.classList.remove('no-js');
    initIntro();
    initNav();
    initMobileMenu();
    initReveal();
    initParallax();
    initHours();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Öffentliche Oberfläche für die anderen Skriptdateien.
  return { $, $$, clamp, lerp, rafThrottle, onScroll, prefersReducedMotion, hasFinePointer };
})();
