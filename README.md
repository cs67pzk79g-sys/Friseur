# HAARSCHARF.

Demo-Website für einen **fiktiven** Friseursalon. Referenzprojekt, um zu zeigen,
was individuell gebaute Websites gegenüber Baukastensystemen leisten.

> **Demo-Hinweis:** Salon, Adresse, Telefonnummer, Team, Preise und Bewertungen
> sind frei erfunden. `impressum.html` und `datenschutz.html` sind markierte
> Platzhalter und **dürfen so nicht live gehen**.

---

## Starten

Kein Build-Prozess, keine Abhängigkeiten, kein `npm install`.

```bash
# Reicht meistens: index.html im Browser öffnen.
# Sauberer (relative Pfade, korrekte MIME-Typen):
python3 -m http.server 8000
```

---

## Aufbau

```
index.html            Die gesamte Seite (10 Abschnitte)
impressum.html        Platzhalter-Impressum
datenschutz.html      Platzhalter-Datenschutz + Barrierefreiheitserklärung

css/
  fonts.css           @font-face für die drei selbst gehosteten Schriften
  tokens.css          Farbe, Typo, Raster, Timing — die einzige Stellschraube
  base.css            Reset, Grundtypografie, Barrierefreiheits-Hilfsklassen
  components.css      Buttons, Navigation, Cursor, Formular, Lightbox, Tabs
  sections.css        Layout je Abschnitt, von oben nach unten
  legal.css           Rechtsseiten

js/
  core.js             Hilfsfunktionen, Navigation, Scroll-Reveals, Parallax
  interactions.js     Cursor, magnetische Buttons, 3D-Tilt, Lightbox, Tabs
  booking.js          Buchungs-Flow (State Machine) + Formularvalidierung

assets/
  fonts/              14 woff2-Dateien (latin + latin-ext)
  img/                27 Fotos, lokal
  favicon.svg
```

Die drei JS-Dateien sind bewusst **keine** ES-Module: klassische `<script>`-Tags
laufen auch, wenn man `index.html` direkt per Doppelklick öffnet. ES-Module
würden dabei an der CORS-Prüfung scheitern.

---

## Gestaltungsentscheidungen

**Farbe.** Fast-Schwarz `#0b0b0c` statt reinem Schwarz (auf OLED reißen Bilder
sonst ab), warmes Off-White `#f4f1e9`, und genau **ein** Akzent: ein kaltes
Chartreuse `#d6f252`. Gewählt gegen das übliche Salon-Gold, weil es
„Klinge / Präzision“ transportiert — und weil es auf dem Grundton ~15:1
Kontrast liefert, also auch in kleinen Größen unbedenklich ist.

**Typografie.** Drei Rollen, drei Schriften:
Big Shoulders Display (schmale Plakatgrotesk, Wortmarke und Überschriften),
Instrument Serif (Zitate und Zwischenrufe),
Instrument Sans (alles, was gelesen statt gesehen wird).
Größen durchgehend fluid über `clamp()` — keine Media-Query-Treppe.

**Signature-Element.** Die Wortmarke im Hero ist entlang einer flachen
Diagonale *aufgeschnitten*: zwei deckungsgleiche Textebenen, gegenläufig
beschnitten, um Haaresbreite versetzt, mit einer Akzent-Haarlinie auf der
Schnittkante. Beim Laden fährt die Klinge einmal durch. Auf dem Desktop
öffnet sich der Schnitt minimal mit der Mausposition. Das Motiv kehrt als
Trennlinie in jedem Abschnittskopf wieder.

**Layout.** Asymmetrisches 12-Spalten-Raster, versetzte Team-Karten, Galerie
als echtes Masonry über Zeilen-Spans. Negative Flächen sind gesetzt, nicht
übrig geblieben.

---

## Technik

| Effekt | Umsetzung |
|---|---|
| Scroll-Reveals | `IntersectionObserver`, gestaffelt nach Position |
| Parallax | ein einziger gedrosselter Scroll-Listener, nur für sichtbare Elemente |
| Eigener Cursor | eine `requestAnimationFrame`-Schleife für Zeiger *und* magnetische Buttons |
| 3D-Tilt | `perspective()` in der Transform, max. 6° Ausschlag |
| Buchungs-Flow | kleine State Machine: ein Zustandsobjekt, eine `render()`-Funktion |
| Karte | handgezeichnetes Inline-SVG statt Google-Maps-Embed |

**Keine externen Abhängigkeiten.** Kein GSAP, kein jQuery, kein Framework, keine
Google-Fonts-CDN. Das ist nicht Sparsamkeit, sondern Voraussetzung dafür, dass
die Seite ohne Cookie-Banner auskommt (siehe unten). Gesamtgewicht: ~3,2 MB,
davon rund 2,9 MB Fotos.

**Was abschaltbar ist, ist abgeschaltet:** Bei `prefers-reduced-motion: reduce`
fallen sämtliche Animationen weg. Auf Touch-Geräten laufen Cursor, Tilt,
Magnet-Effekt und Bildvorschau gar nicht erst an. Ohne JavaScript bleibt die
Seite vollständig lesbar — die Klasse `no-js` auf `<html>` hält alle
aufklappbaren Inhalte offen.

---

## Barrierefreiheit

Geprüft und eingehalten:

- Semantisches HTML, saubere Überschriftenhierarchie, Sprungmarke zum Inhalt
- Vollständige Tastaturbedienung inkl. Tab-Muster nach WAI-ARIA (Pfeiltasten,
  Pos1/Ende), Lightbox mit Fokusfalle und Fokusrückgabe
- Sichtbarer Fokusring auf allen 68 fokussierbaren Elementen
- **Kontrast: alle Text-/Hintergrundpaare ≥ 4,5:1** (bzw. 3:1 bei großem Text),
  automatisiert über alle drei Seiten geprüft
- Auswahlzustände zusätzlich über Haken-Symbole, nicht allein über Farbe
- Statusmeldungen über `aria-live`, Datumsschaltflächen mit vollständigem
  `aria-label` („Mittwoch, 3. September“ statt „Mi 03“)
- Alternativtexte für alle inhaltstragenden Bilder, dekorative sind
  `aria-hidden`

---

## Rechtliche Checkliste (Deutschland/EU)

Für **diese Demo**:

| Punkt | Status |
|---|---|
| Impressum | ⚠️ Gerüst mit markierten Platzhaltern — vor Livegang ausfüllen |
| Datenschutzerklärung | ⚠️ Gerüst mit markierten Platzhaltern |
| Cookie-/Consent-Banner | ➖ nicht nötig: keine Cookies, kein Tracking, keine Drittanbieter-Requests |
| Barrierefreiheit (BFSG) | ➖ Kleinstunternehmer-Ausnahme greift bei den meisten Salons; Standards trotzdem eingehalten |
| Urheberrecht Bilder | ✅ Unsplash-Lizenz; für echte Kund:innenfotos zusätzlich Einwilligung nötig |
| Shop-Pflichten | ➖ nicht relevant, kein Verkauf |

Drei Dinge, die beim Livegang für einen **echten** Salon dazukommen:

1. **Impressum und Datenschutz mit echten Daten füllen.** Ein fehlendes
   Impressum ist einer der häufigsten Abmahngründe überhaupt (§ 5 DDG).
2. **Sobald ein echtes Buchungssystem, eine Karte oder Analytics eingebaut
   wird**, entsteht in aller Regel eine Einwilligungspflicht nach § 25 TDDDG —
   dann braucht die Seite ein Consent-Banner, das *vor* dem Laden dieser
   Dienste greift.
3. **Gesundheitsdaten beachten.** Angaben zu Allergien, Unverträglichkeiten
   oder Kopfhauterkrankungen fallen unter Art. 9 DSGVO und dürfen im Formular
   nie Pflichtfeld sein.

*Das ist eine strukturierte Einschätzung, keine Rechtsberatung. Für die
rechtssichere Fassung gehört eine Anwältin oder ein Anwalt dazu.*

---

## Bildnachweis

Alle Fotos von [Unsplash](https://unsplash.com), genutzt unter der
Unsplash-Lizenz. Für ein echtes Kundenprojekt gehören hier eigene Salonfotos
hin — bei Personen mit schriftlicher Einwilligung (§ 22 KunstUrhG,
Art. 6 Abs. 1 lit. a DSGVO).
