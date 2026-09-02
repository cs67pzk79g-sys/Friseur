/* ==================================================================
   HAARSCHARF. — booking.js
   Der Buchungs-Mockup und das Kontaktformular.

   WICHTIG: Beides ist reine Oberfläche. Es wird nichts gesendet,
   nichts gespeichert und nichts an Dritte übertragen. Für den
   Echteinsatz käme hier ein Kalender-Backend bzw. ein Mailversand
   dahinter — die Zustandslogik und die Validierung bleiben gleich.
   ================================================================== */

(function (HS) {
  'use strict';

  const { $, $$ } = HS;


  /* ═══════════════════════════════════════════════ BUCHUNGS-FLOW ═══ */

  function initBooking() {
    const panel = $('.booking__panel');
    if (!panel) return;

    const stepEls = $$('.step', panel);
    const paneEls = $$('.bstep', panel);
    const btnBack = $('#bookBack');
    const btnNext = $('#bookNext');
    const hint    = $('#bookHint');
    const done    = $('#bookDone');

    /* Der gesamte Zustand der Buchung an einer Stelle. Jede Änderung
       läuft über set() und löst genau ein Neuzeichnen aus – das ist
       das Prinzip, nach dem auch die großen Frameworks arbeiten, nur
       eben in fünfzehn Zeilen. */
    const state = {
      step: 1,
      service: null,
      serviceMeta: null,
      duration: 60,
      stylist: null,
      stylistMeta: null,
      date: null,     // Date-Objekt
      time: null,     // "14:30"
      booked: false
    };

    function set(patch) {
      Object.assign(state, patch);
      render();
    }

    /* --- Welche Schritte sind abgeschlossen? --- */
    const stepComplete = {
      1: () => !!state.service,
      2: () => !!state.stylist,
      3: () => !!(state.date && state.time),
      4: () => true
    };

    const hints = {
      1: 'Leistung wählen, um fortzufahren.',
      2: 'Stylist:in wählen, um fortzufahren.',
      3: 'Tag und Uhrzeit wählen, um fortzufahren.',
      4: 'Alles korrekt? Dann Termin bestätigen.'
    };

    /* --- Neuzeichnen --- */
    function render() {
      stepEls.forEach(function (el) {
        const n = Number(el.dataset.step);
        el.classList.toggle('is-active', n === state.step);
        el.classList.toggle('is-done', n < state.step);
      });

      paneEls.forEach(function (el) {
        const on = Number(el.dataset.pane) === state.step;
        el.hidden = !on;
        el.classList.toggle('is-active', on);
      });

      btnBack.disabled = state.step === 1 || state.booked;
      btnNext.disabled = !stepComplete[state.step]() || state.booked;
      btnNext.textContent = state.step === 4 ? 'Termin bestätigen' : 'Weiter';
      hint.textContent = state.booked
        ? 'Das war der Mockup — vielen Dank fürs Ausprobieren.'
        : (stepComplete[state.step]() ? (state.step === 4 ? hints[4] : 'Weiter geht’s.') : hints[state.step]);

      // Zusammenfassung füllen
      const fmt = state.date
        ? state.date.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })
        : '—';
      $('[data-sum="service"]', panel).textContent = state.service || '—';
      $('[data-sum="stylist"]', panel).textContent = state.stylist || '—';
      $('[data-sum="date"]',    panel).textContent = fmt;
      $('[data-sum="time"]',    panel).textContent = state.time ? state.time + ' Uhr' : '—';
    }

    /* --- Schritt 1 + 2: Auswahlkacheln --- */
    function wireChoices(paneNum, keys) {
      const pane = paneEls.find(p => Number(p.dataset.pane) === paneNum);
      const items = $$('.choice', pane);

      items.forEach(function (btn) {
        btn.addEventListener('click', function () {
          items.forEach(b => b.setAttribute('aria-checked', 'false'));
          btn.setAttribute('aria-checked', 'true');

          const patch = {};
          patch[keys.value] = btn.dataset.value;
          patch[keys.meta]  = btn.dataset.meta;
          if (btn.dataset.dur) patch.duration = Number(btn.dataset.dur);
          set(patch);
        });
      });
    }

    wireChoices(1, { value: 'service', meta: 'serviceMeta' });
    wireChoices(2, { value: 'stylist', meta: 'stylistMeta' });


    /* --- Schritt 3: Datum ---------------------------------------
       Die Tage werden aus dem echten heutigen Datum erzeugt, damit die
       Demo auch in einem Jahr noch plausible Termine zeigt. */
    const dayStrip  = $('#dayStrip');
    const weekLabel = $('#weekLabel');
    const slotGrid  = $('#slotGrid');
    const slotHint  = $('#slotHint');
    const weekPrev  = $('#weekPrev');
    const weekNext  = $('#weekNext');

    const DOW = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    let weekOffset = 0;                       // 0 = laufende Woche
    const today = new Date(); today.setHours(0, 0, 0, 0);

    // Montag der angezeigten Woche
    function weekStart(offset) {
      const d = new Date(today);
      const shift = (d.getDay() + 6) % 7;     // Mo = 0
      d.setDate(d.getDate() - shift + offset * 7);
      return d;
    }

    const sameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

    // Montag und Sonntag ist der Salon zu, Vergangenes ist nicht buchbar.
    function isBookable(d) {
      const dow = d.getDay();
      return dow !== 0 && dow !== 1 && d >= today;
    }

    function renderWeek() {
      const start = weekStart(weekOffset);
      dayStrip.innerHTML = '';

      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'day';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', String(sameDay(d, state.date)));
        btn.disabled = !isBookable(d);
        btn.innerHTML =
          '<span class="day__dow">' + DOW[d.getDay()] + '</span>' +
          '<span class="day__num">' + String(d.getDate()).padStart(2, '0') + '</span>';

        // Vollständiges Datum für Screenreader, die "Di 14" nicht deuten können.
        btn.setAttribute('aria-label',
          d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) +
          (btn.disabled ? ' — geschlossen' : ''));

        btn.addEventListener('click', function () {
          set({ date: d, time: null });
          renderWeek();
          renderSlots();
        });

        dayStrip.appendChild(btn);
      }

      const end = new Date(start); end.setDate(start.getDate() + 6);
      weekLabel.textContent =
        start.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) + ' – ' +
        end.toLocaleDateString('de-DE',   { day: '2-digit', month: 'short', year: 'numeric' });

      weekPrev.disabled = weekOffset <= 0;
      weekNext.disabled = weekOffset >= 6;     // maximal sechs Wochen im Voraus
    }

    /* --- Schritt 3: Uhrzeiten -----------------------------------
       Erzeugt Zeitfenster im Takt der gewählten Leistung. Ein paar
       davon sind "belegt" — eine leere Liste sähe unglaubwürdig aus.
       Der Belegungs-Zufall ist an das Datum gekoppelt, damit dieselbe
       Auswahl beim Zurückspringen dieselben Zeiten zeigt.            */
    function pseudoRandom(seed) {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }

    function renderSlots() {
      slotGrid.innerHTML = '';

      if (!state.date) {
        slotHint.textContent = 'Bitte zuerst einen Tag wählen.';
        return;
      }

      const sat  = state.date.getDay() === 6;
      const open = sat ? 9 * 60 : 10 * 60;
      const shut = sat ? 18 * 60 : 20 * 60;
      const step = state.duration >= 120 ? 60 : 30;

      let free = 0;
      const seedBase = state.date.getDate() * 31 + state.date.getMonth() * 7;

      for (let m = open; m + state.duration <= shut; m += step) {
        const hh = String(Math.floor(m / 60)).padStart(2, '0');
        const mm = String(m % 60).padStart(2, '0');
        const time = hh + ':' + mm;

        // ~35 % der Fenster sind belegt.
        const taken = pseudoRandom(seedBase + m) < 0.35;
        if (!taken) free++;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', String(state.time === time));
        btn.textContent = time;
        btn.disabled = taken;
        if (taken) btn.setAttribute('aria-label', time + ' Uhr — bereits vergeben');

        btn.addEventListener('click', function () {
          set({ time: time });
          $$('.slot', slotGrid).forEach(s => s.setAttribute('aria-checked', 'false'));
          btn.setAttribute('aria-checked', 'true');
        });

        slotGrid.appendChild(btn);
      }

      slotHint.textContent = free
        ? free + ' freie Zeiten · Dauer ' + state.duration + ' Minuten'
        : 'An diesem Tag ist alles ausgebucht — bitte einen anderen Tag wählen.';
    }

    weekPrev.addEventListener('click', function () { weekOffset--; renderWeek(); });
    weekNext.addEventListener('click', function () { weekOffset++; renderWeek(); });


    /* --- Navigation zwischen den Schritten --- */
    btnBack.addEventListener('click', function () {
      if (state.step > 1) set({ step: state.step - 1 });
    });

    btnNext.addEventListener('click', function () {
      if (state.step < 4) {
        set({ step: state.step + 1 });
        if (state.step === 3) { renderWeek(); renderSlots(); }
      } else {
        // Abschluss: nichts wird gesendet, nur der Zustand wechselt.
        set({ booked: true });
        done.hidden = false;
        done.scrollIntoView({ behavior: HS.prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      }
    });

    renderWeek();
    render();
  }


  /* ═════════════════════════════════════════════ KONTAKTFORMULAR ═══ */

  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const status = $('#formStatus');

    /* Eigene Validierung statt der Browser-Blasen: dadurch stehen die
       Fehlermeldungen auf Deutsch, an einer festen Stelle im Layout und
       werden von Screenreadern über aria-describedby vorgelesen. */
    const rules = [
      { id: 'cf-name', test: v => v.trim().length >= 2,        msg: 'Bitte einen Namen eintragen.' },
      { id: 'cf-mail', test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
                                                                msg: 'Bitte eine gültige E-Mail-Adresse eintragen.' },
      { id: 'cf-msg',  test: v => v.trim().length >= 10,        msg: 'Bitte etwas mehr schreiben (mindestens 10 Zeichen).' },
      { id: 'cf-ok',   test: (v, el) => el.checked,             msg: 'Ohne diese Einwilligung dürfen wir die Anfrage nicht bearbeiten.' }
    ];

    function showError(rule, message) {
      const el  = document.getElementById(rule.id);
      const box = $('[data-err-for="' + rule.id + '"]');
      const field = el.closest('.field');

      if (message) {
        field.classList.add('is-invalid');
        box.textContent = message;
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-describedby', 'err-' + rule.id);
        box.id = 'err-' + rule.id;
      } else {
        field.classList.remove('is-invalid');
        box.textContent = '';
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
      }
    }

    function validate(only) {
      let firstBad = null;
      rules.forEach(function (rule) {
        if (only && rule.id !== only) return;
        const el = document.getElementById(rule.id);
        const ok = rule.test(el.value, el);
        showError(rule, ok ? '' : rule.msg);
        if (!ok && !firstBad) firstBad = el;
      });
      return firstBad;
    }

    // Live nachbessern, aber erst nachdem einmal abgeschickt wurde –
    // sonst meckert das Formular, bevor man zu Ende getippt hat.
    let submitted = false;
    rules.forEach(function (rule) {
      const el = document.getElementById(rule.id);
      const ev = el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(ev, function () { if (submitted) validate(rule.id); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitted = true;

      const bad = validate();
      if (bad) {
        status.textContent = 'Bitte die markierten Felder prüfen.';
        status.classList.remove('is-ok');
        bad.focus();
        return;
      }

      status.textContent =
        'Danke! In der echten Version ginge die Nachricht jetzt raus — ' +
        'dies ist eine Demo, es wurde nichts gesendet.';
      status.classList.add('is-ok');
      form.reset();
      rules.forEach(r => showError(r, ''));
    });
  }


  function boot() { initBooking(); initContactForm(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})(window.HS);
