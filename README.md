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

## Veröffentlichen (GitHub Pages)

Die Seite ist veröffentlicht und erreichbar unter
**https://cs67pzk79g-sys.github.io/Friseur/** — der Workflow läuft bei jedem Push
auf den Standard-Branch.

Für ein neues Repository ist einmalig nötig:

> **Settings → Pages → Build and deployment → Source → „GitHub Actions“**

Wer lieber ohne Actions arbeitet, wählt stattdessen unter *Source* den Eintrag
„Deploy from a branch“, den Standard-Branch und den Ordner `/ (root)`. Dann ist
`.github/workflows/pages.yml` überflüssig und kann gelöscht werden. **Nur eine
der beiden Varianten aktivieren**, sonst schlägt der Workflow fehl.

**Beim Umbenennen des Standard-Branches** den Namen in `pages.yml` unter
`on.push.branches` mit anpassen. Steht dort ein Branch, den es nicht mehr gibt,
läuft der Workflow einfach nicht mehr an — ohne Fehlermeldung.

### Was dafür im Repo liegt

| Datei | Wofür |
|---|---|
| `.github/workflows/pages.yml` | Kopiert die Seitendateien nach `site/` und veröffentlicht sie. `.claude/` und `.github/` bleiben außen vor. |
| `.nojekyll` | Schaltet Jekyll ab. Ohne die Datei schickt Pages jeden Push durch Jekyll, das unter anderem Dateien mit führendem Unterstrich verschluckt. |
| `404.html` | Fehlerseite im selben Design. Pages zieht sie automatisch. |
| `robots.txt` | Sperrt die Indexierung (siehe unten). |

### Suchmaschinen: bewusst gesperrt

Die Seite ist per `robots.txt` **und** `<meta name="robots" content="noindex">`
von der Indexierung ausgenommen. Der Grund ist nicht Bescheidenheit: Die Demo
enthält einen erfundenen Salon samt Adresse, Telefonnummer, Öffnungszeiten und
`HairSalon`-Structured-Data. Ohne die Sperre könnte Google diesen Fantasiebetrieb
als echtes Unternehmen in den Index und ins Unternehmensprofil übernehmen.

Soll die Seite als Portfolio-Referenz gefunden werden, sind zwei Handgriffe nötig:

1. In `index.html` die Zeile `<meta name="robots" content="noindex, follow">` löschen
2. In `robots.txt` die beiden `Disallow`-Zeilen entfernen

Vorher aber die erfundenen Kontaktdaten im JSON-LD-Block durch echte ersetzen —
oder den Block ganz entfernen.

### Eigene Domain

Bei eigener Domain an drei Stellen die Adresse austauschen: `og:url`, `og:image`
und `canonical` in `index.html`. Dazu eine Datei `CNAME` mit der Domain im
Wurzelverzeichnis anlegen und den DNS-Eintrag auf GitHub zeigen lassen.

---

## Aufbau

```
index.html            Die gesamte Seite (10 Abschnitte)
impressum.html        Platzhalter-Impressum
datenschutz.html      Platzhalter-Datenschutz + Barrierefreiheitserklärung
404.html              Fehlerseite im Seitendesign
robots.txt            Indexierungssperre

css/
  fonts.css           @font-face für die drei selbst gehosteten Schriften
  tokens.css          Farbe, Typo, Raster, Timing — die einzige Stellschraube
  base.css            Reset, Grundtypografie, Barrierefreiheits-Hilfsklassen
  components.css      Buttons, Navigation, Formular, Lightbox, Tabs
  sections.css        Layout je Abschnitt, von oben nach unten
  legal.css           Rechtsseiten

js/
  core.js             Hilfsfunktionen, Navigation, Scroll-Reveals, Parallax
  interactions.js     Magnetische Buttons, 3D-Tilt, Lightbox, Tabs
  booking.js          Buchungs-Flow (State Machine) + Formularvalidierung

assets/
  fonts/              14 woff2-Dateien (latin + latin-ext)
  img/                23 Fotos, lokal
  favicon.svg
```

Die drei JS-Dateien sind bewusst **keine** ES-Module: klassische `<script>`-Tags
laufen auch, wenn man `index.html` direkt per Doppelklick öffnet. ES-Module
würden dabei an der CORS-Prüfung scheitern.

---

## Gestaltungsentscheidungen

**Farbe.** Fast-Schwarz `#0b0b0c` statt reinem Schwarz (auf OLED reißen Bilder
sonst ab), warmes Off-White `#f4f1e9`, und genau **ein** Akzent: ein warmes
Messing `#d9a441`. Es greift das Metall der Schere auf und teilt mit dem
Off-White dieselbe Temperatur — dadurch wirkt die Seite geschlossen statt
kontrastgeladen. Kontrast auf dem Grundton: 8,75:1, also auch in kleinen
Größen unbedenklich.

**Farbe wechseln.** Der Akzent hängt an *einer* Zeile in `css/tokens.css`:

```css
--acid-rgb: 217 164 65;   /* Messing */
```

Alles andere — Volltonflächen, Hover-Zustände, die Haarlinie im Hero, der Pin
in der SVG-Karte und sämtliche durchscheinenden Auswahlflächen — leitet sich
über `rgb(var(--acid-rgb) / …)` daraus ab. Erprobte Alternativen, alle
WCAG-AA-fest auf dem Grundton:

| | Hex | `--acid-rgb` | Kontrast | Charakter |
|---|---|---|---|---|
| Messing *(gesetzt)* | `#d9a441` | `217 164 65` | 8,75:1 | warm, metallisch, premium |
| Kupfer | `#f0592b` | `240 89 43` | 5,78:1 | laut, editorial |
| Stahlblau | `#9dc9e0` | `157 201 224` | 11,12:1 | kalt, chirurgisch |
| Koralle | `#f2626f` | `242 98 111` | 6,33:1 | warm, weich |

Einzige Stelle außerhalb: `assets/favicon.svg` (dort steht der Hex-Wert
direkt, weil eine Icon-Datei keine CSS-Variablen kennt).

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
| Magnetische Buttons | eine `requestAnimationFrame`-Schleife für alle Elemente statt einer je Button |
| 3D-Tilt | `perspective()` in der Transform, max. 6° Ausschlag |
| Buchungs-Flow | kleine State Machine: ein Zustandsobjekt, eine `render()`-Funktion |
| Karte | handgezeichnetes Inline-SVG statt Google-Maps-Embed |

**Keine externen Abhängigkeiten.** Kein GSAP, kein jQuery, kein Framework, keine
Google-Fonts-CDN. Das ist nicht Sparsamkeit, sondern Voraussetzung dafür, dass
die Seite ohne Cookie-Banner auskommt (siehe unten). Gesamtgewicht: ~3,0 MB,
davon rund 2,7 MB Fotos.

**Was abschaltbar ist, ist abgeschaltet:** Bei `prefers-reduced-motion: reduce`
fallen sämtliche Animationen weg. Auf Touch-Geräten laufen 3D-Tilt und
Magnet-Effekt gar nicht erst an. Ohne JavaScript bleibt die
Seite vollständig lesbar — die Klasse `no-js` auf `<html>` hält alle
aufklappbaren Inhalte offen.

**Was ohne Zeiger ersetzt wird, statt wegzufallen:** Die Fotos liegen
entsättigt in der dunklen Bühne; ihre volle Farbe ist am Desktop die Belohnung
fürs Überfahren. Auf einem Telefon gibt es kein Überfahren — dort übernimmt
das Scrollen die Rolle: Sobald ein Bild ins Blickfeld kommt, kommt die Farbe
(`.is-lit`, gesetzt in `initTouchReveal`). Dasselbe gilt für die
Bildunterschriften in der Galerie, die unter `(hover: none)` dauerhaft stehen.

Das ist bewusst eine Positionsprüfung beim Scrollen und **kein**
`IntersectionObserver`: Der Observer meldet sich nur, wenn ein Element eine
Schwelle *überquert*. Springt man per Menü-Link mitten in die Seite — und bei
„Bewegung reduzieren“ springt der Browser hart statt zu gleiten —, überfliegen
Bilder den Ausschnitt, ohne je darin gewesen zu sein: Der Observer schweigt,
die Bilder blieben grau. Geprüft wurden gemütliches Durchscrollen, Sprung ans
Seitenende, Menü-Sprung, jeweils mit und ohne reduzierte Bewegung, auf Telefon
und Tablet.

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
| Impressum (fiktiver Salon) | ⚠️ Gerüst mit markierten Platzhaltern |
| Impressum des **Betreibers** | ❌ fehlt — siehe unten |
| Datenschutzerklärung | ⚠️ Gerüst; Hoster und Drittlandtransfer sind benannt, Details offen |
| Cookie-/Consent-Banner | ➖ nicht nötig: keine Cookies, kein Tracking, keine Drittanbieter-Requests (geprüft) |
| Barrierefreiheit (BFSG) | ➖ Informations-/Portfolioseite ohne echte Transaktion; WCAG 2.1 AA trotzdem eingehalten |
| Urheberrecht Bilder | ✅ Unsplash-Lizenz; für echte Kund:innenfotos zusätzlich Einwilligung nötig |
| Shop-Pflichten, Newsletter | ➖ nicht relevant, kein Verkauf, kein Versand |

### Was seit dem Livegang offen ist

1. **Anbieterkennzeichnung des Betreibers.** Sobald die Demo Interessenten
   gezeigt wird, ist sie ein geschäftsmäßiges Angebot — und braucht ein
   Impressum **der Person, die sie betreibt**, nicht des erfundenen Salons.
   Der Demo-Hinweis im Footer verhindert, dass jemand HAARSCHARF. für echt
   hält; er ersetzt aber keine Anbieterkennzeichnung (§ 5 DDG).
2. **Hosting in den USA.** Die Seite liegt auf GitHub Pages (GitHub, Inc.,
   USA). Server-Logs mit IP-Adressen erreichen damit ein Drittland. In der
   Datenschutzerklärung ist das benannt; Rechtsgrundlage der Übermittlung und
   Auftragsverarbeitungsvertrag sind noch zu klären. Für einen echten Salon
   ist ein EU-Hoster der einfachere Weg.

### Was bei einem echten Salon zusätzlich dazukommt

- **Impressum und Datenschutz mit echten Daten füllen.** Ein fehlendes
  Impressum ist einer der häufigsten Abmahngründe überhaupt (§ 5 DDG).
- **Sobald ein echtes Buchungssystem, eine Karte oder Analytics eingebaut
  wird**, entsteht in aller Regel eine Einwilligungspflicht nach § 25 TDDDG —
  dann braucht die Seite ein Consent-Banner, das *vor* dem Laden dieser
  Dienste greift. Ab dann spricht auch einiges für eine BFSG-Pflicht.
- **Gesundheitsdaten beachten.** Angaben zu Allergien, Unverträglichkeiten
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
