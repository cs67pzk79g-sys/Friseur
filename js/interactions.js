/* ==================================================================
   HAARSCHARF. — interactions.js
   Alles, was auf den Mauszeiger reagiert: eigener Cursor, magnetische
   Buttons, 3D-Tilt, Bildvorschau in der Preisliste, Lightbox, Tabs.

   Leitregel für diese Datei: jeder Effekt hier ist Zugabe. Nichts
   davon darf nötig sein, um die Seite zu benutzen — auf Touch-Geräten
   und bei "Bewegung reduzieren" bleibt alles davon einfach aus.
   ================================================================== */

(function (HS) {
  'use strict';

  const { $, $$, clamp, lerp, rafThrottle, prefersReducedMotion, hasFinePointer } = HS;

  const canHover = hasFinePointer();
  const canMove  = canHover && !prefersReducedMotion();


  /* ---------------------------------------------------------------
     Magnetische Elemente

     Buttons mit [data-magnetic] ziehen sich leicht zum Zeiger, solange
     er in Reichweite ist. Läuft in einer einzigen
     requestAnimationFrame-Schleife für alle Elemente — pro Bild eine
     Schleife statt einer je Button.
     --------------------------------------------------------------- */
  function initMagnetic() {
    if (!canMove) return;

    // Magnetische Elemente werden einmal eingesammelt statt bei jeder
    // Mausbewegung neu gesucht.
    const magnets = $$('[data-magnetic]').map(el => ({ el, dx: 0, dy: 0 }));
    if (!magnets.length) return;

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
    }, { passive: true });

    function frame() {
      // Die Bewegung ist gedeckelt, damit der Button nicht aus seinem
      // Platz wandert.
      for (let i = 0; i < magnets.length; i++) {
        const m = magnets[i];
        const r = m.el.getBoundingClientRect();
        // Grob vorfiltern: was weit weg ist, wird gar nicht gerechnet.
        if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;

        const mx = r.left + r.width / 2;
        const my = r.top + r.height / 2;
        const dist = Math.hypot(tx - mx, ty - my);
        const range = Math.max(r.width, r.height) * 0.9 + 40;

        let goalX = 0, goalY = 0;
        if (dist < range) {
          const pull = 1 - dist / range;          // 0 am Rand, 1 im Zentrum
          goalX = clamp((tx - mx) * pull * 0.32, -18, 18);
          goalY = clamp((ty - my) * pull * 0.32, -18, 18);
        }
        m.dx = lerp(m.dx, goalX, 0.16);
        m.dy = lerp(m.dy, goalY, 0.16);

        // Unter einem halben Pixel lohnt kein Schreibzugriff.
        if (Math.abs(m.dx) < 0.08 && Math.abs(m.dy) < 0.08) m.el.style.transform = '';
        else m.el.style.transform = 'translate3d(' + m.dx.toFixed(2) + 'px,' + m.dy.toFixed(2) + 'px,0)';
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }


  /* ---------------------------------------------------------------
     3D-Tilt

     Die Karte kippt zum Zeiger hin. Der Ausschlag ist bewusst klein
     (max. 6°): darüber wirkt es nach Spielzeug statt nach Material.
     --------------------------------------------------------------- */
  function initTilt() {
    const cards = $$('[data-tilt]');
    if (!cards.length || !canMove) return;

    const MAX_DEG = 6;

    cards.forEach(function (card) {
      let raf = null;

      function apply(e) {
        const r = card.getBoundingClientRect();
        // -0.5 … +0.5 relativ zur Kartenmitte
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transform =
            'perspective(900px)' +
            ' rotateX(' + (-py * MAX_DEG).toFixed(2) + 'deg)' +
            ' rotateY(' + ( px * MAX_DEG).toFixed(2) + 'deg)' +
            ' translate3d(0,-4px,0)';
        });
      }

      card.addEventListener('mouseenter', function () { card.classList.add('is-tilting'); });
      card.addEventListener('mousemove', apply);
      card.addEventListener('mouseleave', function () {
        if (raf) cancelAnimationFrame(raf);
        // Klasse entfernen -> die CSS-Transition federt zurück.
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });
  }


  /* ---------------------------------------------------------------
     Die Wortmarke reagiert auf die Maus

     Der Schnitt öffnet sich leicht, je weiter der Zeiger von der Mitte
     weg ist. Sehr dezent — man bemerkt es eher, als dass man es sieht.
     --------------------------------------------------------------- */
  function initHeroCut() {
    const hero = $('#hero');
    const cut  = $('#heroCut');
    if (!hero || !cut || !canMove) return;

    let raf = null;
    hero.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … +0.5
        cut.style.setProperty('--cut-x', (Math.abs(px) * 14).toFixed(1) + 'px');
      });
    }, { passive: true });

    hero.addEventListener('mouseleave', function () {
      cut.style.setProperty('--cut-x', '0px');
    });
  }


  /* ---------------------------------------------------------------
     Leistungen: Tabs

     Mit vollständiger Tastaturbedienung (Pfeiltasten, Pos1/Ende), wie
     es das WAI-ARIA-Muster für Tabs vorsieht.
     --------------------------------------------------------------- */
  function initTabs() {
    const tabs = $$('[role="tab"]');
    if (!tabs.length) return;

    function select(tab, focus) {
      tabs.forEach(function (t) {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.setAttribute('tabindex', on ? '0' : '-1');
        t.classList.toggle('is-active', on);

        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (!panel) return;
        panel.hidden = !on;
        panel.classList.toggle('is-active', on);
      });
      if (focus) tab.focus();
    }

    // Ausgangszustand konsistent setzen (roving tabindex).
    select(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0], false);

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', function (e) {
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }


  /* ---------------------------------------------------------------
     Preisliste: Bildvorschau am Zeiger
     --------------------------------------------------------------- */
  function initPricePeek() {
    const peek = $('#svcPeek');
    if (!peek || !canMove) return;

    const img = $('img', peek);
    const rows = $$('.price-row[data-peek]');
    if (!rows.length) return;

    let raf = null, tx = 0, ty = 0;

    function move(e) {
      tx = e.clientX; ty = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        // Die Vorschau sitzt rechts neben dem Zeiger, außer es wird zu
        // eng am rechten Rand — dann klappt sie nach links.
        const offset = tx > window.innerWidth - 300 ? -160 : 160;
        peek.style.top  = ty + 'px';
        peek.style.left = (tx + offset) + 'px';
      });
    }

    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        const src = row.dataset.peek;
        if (img.getAttribute('src') !== src) img.src = src;
        peek.classList.add('is-on');
      });
      row.addEventListener('mousemove', move);
      row.addEventListener('mouseleave', function () { peek.classList.remove('is-on'); });
    });
  }


  /* ---------------------------------------------------------------
     Galerie-Lightbox

     Mit Tastaturbedienung (Pfeile, Esc), Fokus-Rückgabe und einer
     einfachen Fokusfalle, damit man nicht hinter das Overlay tabbt.
     --------------------------------------------------------------- */
  function initLightbox() {
    const box = $('#lightbox');
    const triggers = $$('.gal__btn');
    if (!box || !triggers.length) return;

    const img   = $('#lbImg');
    const cap   = $('#lbCap');
    const close = $('#lbClose');
    const prev  = $('#lbPrev');
    const next  = $('#lbNext');

    let index = 0;
    let lastFocused = null;

    function show(i) {
      index = (i + triggers.length) % triggers.length;
      const t = triggers[index];
      img.src = t.dataset.full;
      // Der Alternativtext des Vorschaubilds beschreibt dasselbe Motiv.
      img.alt = $('img', t) ? $('img', t).alt : '';
      cap.textContent = t.dataset.caption || '';
    }

    function open(i) {
      lastFocused = document.activeElement;
      show(i);
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => box.classList.add('is-open'));
      close.focus();
    }

    function hide() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      const done = function () {
        box.hidden = true;
        box.removeEventListener('transitionend', done);
        if (lastFocused) lastFocused.focus();
      };
      if (prefersReducedMotion()) done();
      else box.addEventListener('transitionend', done);
    }

    triggers.forEach((t, i) => t.addEventListener('click', () => open(i)));
    close.addEventListener('click', hide);
    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));

    // Klick auf den Hintergrund schließt ebenfalls.
    box.addEventListener('click', function (e) {
      if (e.target === box) hide();
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape')     { hide(); }
      else if (e.key === 'ArrowLeft')  { show(index - 1); }
      else if (e.key === 'ArrowRight') { show(index + 1); }
      else if (e.key === 'Tab') {
        // Fokusfalle: nur die vier Bedienelemente sind erreichbar.
        const focusables = [close, prev, next];
        const i = focusables.indexOf(document.activeElement);
        e.preventDefault();
        const dir = e.shiftKey ? -1 : 1;
        focusables[(Math.max(i, 0) + dir + focusables.length) % focusables.length].focus();
      }
    });
  }


  /* ---------------------------------------------------------------
     Bilder aufhellen auf Geräten ohne Zeiger

     Die Fotos liegen entsättigt und abgedunkelt in der dunklen Bühne;
     ihre volle Farbe ist am Desktop die Belohnung fürs Überfahren. Auf
     einem Telefon gibt es kein Überfahren — dort müsste man jedes Bild
     antippen, was praktisch niemand tut. Also übernimmt das Scrollen
     die Rolle: sobald ein Bild im Blickfeld ist, kommt die Farbe.

     Einmal aufgehellt bleibt aufgehellt. Wieder abzudunkeln, sobald
     das Bild den Rand berührt, würde beim Zurückscrollen flackern.
     --------------------------------------------------------------- */
  function initTouchReveal() {
    // Bewusst (hover: none) statt der Zeiger-Prüfung oben: exakt
    // dieselbe Bedingung, unter der die :hover-Regeln im CSS tot sind.
    if (!window.matchMedia('(hover: none)').matches) return;

    // Noch nicht aufgehellte Bilder. Die Menge leert sich im Lauf des
    // Scrollens; ist sie leer, kostet jeder weitere Aufruf nichts.
    const pending = new Set($$('.gal, .insta__tile, .team-card, .philo__fig'));
    if (!pending.size) return;

    /* Bewusst eine Positionsprüfung beim Scrollen statt eines
       IntersectionObservers: Der Observer meldet sich nur, wenn ein
       Element eine Schwelle *überquert*. Springt man per Menü-Link
       mitten in die Seite — und bei "Bewegung reduzieren" springt der
       Browser hart statt zu gleiten —, überfliegen Bilder den
       Ausschnitt, ohne je darin gewesen zu sein: der Observer schweigt,
       die Bilder blieben grau. Die Abfrage hier kennt diesen Fall
       nicht, sie sieht nur, wo ein Element gerade steht. */
    function sweep() {
      if (!pending.size) return;
      const trigger = window.innerHeight * 0.82;
      pending.forEach(function (el) {
        // top < trigger deckt beides ab: gerade hereingescrollt und
        // längst nach oben hinausgeschoben (dann ist top negativ).
        if (el.getBoundingClientRect().top < trigger) {
          el.classList.add('is-lit');
          pending.delete(el);
        }
      });
    }

    HS.onScroll(sweep);                       // bereits an den Bildtakt gekoppelt
    window.addEventListener('resize', sweep, { passive: true });
    sweep();                                  // was beim Laden schon zu sehen ist
  }


  /* ---------------------------------------------------------------
     Start
     --------------------------------------------------------------- */
  function boot() {
    initTabs();         // immer – reine Bedienung, kein Effekt
    initLightbox();     // immer
    initTouchReveal();  // nur ohne Zeiger
    initMagnetic();
    initTilt();
    initHeroCut();
    initPricePeek();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})(window.HS);
