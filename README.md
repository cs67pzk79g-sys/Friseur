# HAARSCHARF.

Demo-Website für einen **fiktiven** Friseursalon. Referenzprojekt, um zu zeigen,
was individuell gebaute Websites gegenüber Baukastensystemen leisten.

> **Demo-Hinweis:** Salon, Adresse, Telefonnummer, Team, Preise und Bewertungen
> sind frei erfunden. `impressum.html` und `datenschutz.html` sind markierte
> Platzhalter und **dürfen so nicht live gehen**.

---

## Vorführen (lokal, ohne Server)

`index.html` doppelklicken. Fertig.

Die Seite hat **null externe Abhängigkeiten** — Schriften, Bilder, Skripte und
Stile liegen alle im Ordner. Sie läuft deshalb vollständig **ohne Internet**:
Buchungsstrecke, Galerie, Animationen, Rechtsseiten. Genau dafür ist sie so
gebaut; ein Kundentermin in einem Salon mit schlechtem WLAN ist kein Problem.

Wer lieber einen lokalen Server will (sauberere MIME-Typen, aber nicht nötig):

```bash
python3 -m http.server 8000
```

---

## Veröffentlichen — derzeit abgeschaltet

Die Seite ist **nicht öffentlich erreichbar**. Sie wird lokal vorgeführt, nicht
im Netz gehostet. Das hat einen konkreten Vorteil über die Technik hinaus: Ein
nur lokal gezeigtes Projekt ist kein geschäftsmäßig angebotenes Telemedium und
löst damit keine Impressumspflicht nach § 5 DDG aus (siehe *Rechtliche
Checkliste*).

`.github/workflows/pages.yml` liegt weiterhin im Repository, läuft aber **nur
noch auf Knopfdruck** (*Actions → Deploy to GitHub Pages → Run workflow*). Der
automatische Auslöser bei jedem Push ist auskommentiert.

### Wieder veröffentlichen

Drei Schritte, alle rückgängig zu machen:

1. In `pages.yml` die drei Zeilen unter `on:` wieder einkommentieren:
   ```yaml
   push:
     branches: [main]
   ```
2. *Settings → Pages → Build and deployment → Source* auf **„GitHub Actions"**
3. *Settings → Environments → `github-pages` → Deployment branches* muss `main`
   erlauben. **Diese Stelle wird gern übersehen:** Sie zieht bei einer
   Branch-Umbenennung nicht automatisch mit, und der Deploy scheitert dann
   ohne verwertbare Fehlermeldung — der Job bricht nach zwei Sekunden ab, ohne
   dass je ein Runner zugewiesen wurde.

Vor einem erneuten Livegang die Punkte aus der *Rechtlichen Checkliste* prüfen,
insbesondere die Anbieterkennzeichnung des Betreibers.

### Was sonst noch für das Veröffentlichen im Repo liegt

| Datei | Wofür |
|---|---|
| `.github/workflows/pages.yml` | Kopiert die Seitendateien nach `site/` und veröffentlicht sie. `.claude/` und `.github/` bleiben außen vor. |
| `.nojekyll` | Schaltet Jekyll ab. Ohne die Datei schickt Pages jeden Push durch Jekyll, das unter anderem Dateien mit führendem Unterstrich verschluckt. |
| `404.html` | Fehlerseite im selben Design. Pages zieht sie automatisch. |
| `robots.txt` | Sperrt die Indexierung. |

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
  automatisiert über alle drei Seiten geprüft — inklusive der Beschriftungen
  im Karten-SVG. Die lagen zunächst außerhalb der Prüfung, weil der erste
  Prüflauf nur das normale DOM abging und `<text>`-Elemente im SVG dabei
  übersprang; sie erreichten dadurch unbemerkt nur 2,9:1 bis 3,4:1.
- **Touch-Ziele nach WCAG 2.2 (2.5.8)** geprüft: kein Ziel unter 24 px verletzt
  die Abstandsausnahme
- **Kein horizontaler Überlauf bis hinunter zu 320 px** Viewport-Breite
- Auswahlzustände zusätzlich über Haken-Symbole, nicht allein über Farbe
- Statusmeldungen über `aria-live`, Datumsschaltflächen mit vollständigem
  `aria-label` („Mittwoch, 3. September“ statt „Mi 03“)
- Alternativtexte für alle inhaltstragenden Bilder, dekorative sind
  `aria-hidden`

---

## Rechtliche Checkliste (Deutschland/EU)

Die Seite wird **nur lokal vorgeführt**, nicht im Netz veröffentlicht. Das ist
die rechtlich entscheidende Tatsache: Was ausschließlich auf dem eigenen Rechner
gezeigt wird, ist kein geschäftsmäßig angebotenes Telemedium — wie eine
ausgedruckte Mappe.

| Punkt | Status |
|---|---|
| Impressum des Betreibers | ➖ nicht erforderlich, solange nur lokal gezeigt wird |
| Impressum (fiktiver Salon) | ⚠️ Gerüst mit markierten Platzhaltern, bewusst so |
| Datenschutzerklärung | ⚠️ Gerüst; für den lokalen Betrieb gegenstandslos |
| Cookie-/Consent-Banner | ➖ nicht nötig: keine Cookies, kein Tracking, keine Drittanbieter-Requests (geprüft) |
| Barrierefreiheit (BFSG) | ➖ keine Pflicht; WCAG 2.1 AA trotzdem eingehalten |
| Urheberrecht Bilder | ✅ Unsplash-Lizenz; für echte Kund:innenfotos zusätzlich Einwilligung nötig |
| Shop-Pflichten, Newsletter | ➖ nicht relevant, kein Verkauf, kein Versand |
| Hosting-Drittlandtransfer | ➖ entfällt, solange nichts gehostet wird |

### Der Punkt, an dem es kippt

Sobald die Seite **wieder öffentlich erreichbar** ist — auch als Link, den man
nach einem Termin verschickt, und auch ohne Auffindbarkeit über Suchmaschinen —
ist sie ein geschäftsmäßiges Angebot. Dann gilt:

1. **Anbieterkennzeichnung des Betreibers** wird Pflicht (§ 5 DDG): Name,
   ladungsfähige Anschrift, E-Mail. Nicht die des erfundenen Salons, sondern
   der Person, die die Seite betreibt. Der Demo-Hinweis im Footer verhindert,
   dass jemand HAARSCHARF. für echt hält — er ersetzt aber keine
   Anbieterkennzeichnung.
2. **Hosting-Angaben** in der Datenschutzerklärung müssen zum tatsächlichen
   Hoster passen. Bei GitHub Pages (GitHub, Inc., USA) kommen
   Drittlandübermittlung nach Art. 44 ff. DSGVO und ein
   Auftragsverarbeitungsvertrag nach Art. 28 DSGVO dazu.

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
