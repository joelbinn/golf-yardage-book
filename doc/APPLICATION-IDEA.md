# Golf Yardage Book – Krav & Arkitektur-specifikation

## 1. Sammanfattning
Golf Yardage Book är en Progressive Web Application (PWA) byggd för golfspelare. Applikationen använder GPS-positionering och satellitkartor för att ge exakta avstånd till green (framkant, mitten, bakkant) och diverse hinder (bunkrar, vattenhinder, träd, m.m.) under spel på golfbanan.

Appen fungerar helt offline ute på banan via Service Worker och `localStorage`/`IndexedDB`, samt har en inbyggd synkroniseringsmotor mot ett GitHub-repository via GitHubs REST API för molnbaserad lagring och säkerhetskopiering.

---

## 2. Teknikstack & Arkitektur
- **Frontend Framework**: Angular (v22) med Standalone Components och Signals för reaktiv tillståndshantering.
- **PWA & Offline-stöd**: `@angular/pwa` med Custom Service Worker för cachning av appskal, kartrutor (Esri satellite tiles) och offline-lagring.
- **Kartleverantör & Bibliotek**: [Leaflet.js](https://leafletjs.com/) med kostnadsfria satellitkartlager från **Esri World Imagery**. Inga kommersiella API-nycklar krävs.
- **Lokallagring**: `localStorage` och `IndexedDB` för offline-first upplevelse (banor, aktiva rundor, historik och inställningar).
- **Molnsynk & Backup**: GitHub REST API med Personal Access Token (PAT).
- **Hosting**: GitHub Pages (automatisk deployment).

---

## 3. Huvudmoduler & Användarlägen

Applikationen har tre huvudsakliga vyer/lägen: **Registrera Bana**, **Spela Runda** och **Inställningar & Backup**.

### 3.1. Registrera Bana (Course Management Mode)
Skapa, redigera och underhålla golfbanor.

1. **Baninställningar**:
   - Bana-namn (ex. *Bro Hof Slott - Stadium Course*).
   - Antal hål: 9 eller 18 hål.
   - Par och index per hål.

2. **Hålnavigering & Satellitkarta**:
   - Bläddra fritt mellan hål 1–9 eller 1–18.
   - Visar centrerad satellitkarta baserad på nuvarande GPS-position.
   - **Centrera kartan på green**: När greenposition finns registrerad på det öppna hålet är en knapp tillgänglig för att direkt positionera/centrera satellitkartan över greenen.

3. **Registrering av Positional Data**:
   - **Green-positioner**: Registrera tre specifika GPS-punkter per hål:
     - *Framkant (Front)*
     - *Mitten (Center)*
     - *Bakkant (Back)*
   - **Hinder & Objekt**:
     - Lägga till obegränsat antal hinder per hål när man står vid dem eller klickar på kartan.
     - Objektstyper: `Bunker`, `Vattenhinder`, `Träd`, `Custom (Egen text)`.
     - Varje objekt får namn/beskrivning (ex. *"Bunker vänster fairway"*), valfri ikon samt GPS-koordinater (`lat`, `lng`).

---

### 3.2. Spela Runda (Play Round Mode)
För att spela en runda på en registrerad bana.

1. **Rundastart**:
   - Välj bana från sparade banor.
   - Välj starthål (default hål 1).

2. **Hålvy & Avståndsvisning**:
   - **Satellitkarta**: Visar spelarens live-GPS-position, indikator för green (Front/Center/Back) samt alla registrerade hinder med anpassade ikoner.
   - **Live-avstånd**: Visar kontinuerligt uppdaterat avstånd från spelarens GPS-position till:
     - Green (Fram, Mitten, Bak).
     - Alla registrerade hinder på aktuellt hål.
   - **Touch to Measure (Interaktiv avståndsmätning)**:
     - Klicka/tryck var som helst på satellitkartan för att visa en hårkors-linje från spelarens position med direkt avståndsmätning till den klickade punkten (ex. mät landningsyta från tee).
   - **Snabbregistrering under spel**: Möjlighet att snabbt lägga till ett nytt hinder på den position man står på direkt under rundan och spara det på banan.

3. **Slag- & Score-spårning (Hybrid-spårning)**:
   - **Slagspårning (Karta)**:
     - Klicka på *"Registrera Slag"* vid bollens landningsplats.
     - Appen loggar din GPS-position, beräknar slaglängden från föregående slag och ritar ut slagkedjan på kartan.
     - Slagräknaren för hålet uppdateras automatiskt.
   - **Scorekort vid hålets slut (Score Modal)**:
     - Bekräfta/justera totalt antal slag.
     - Antal puttar.
     - Fairwayträff: `Vänster`, `Träff (Center)`, `Höger`, eller `N/A` (på par 3-hål).
     - Greenträff (GIR - Green in Regulation).
     - Antal bunkerslag.
     - Antal chippar.

4. **Rundöversikt & Statistik**:
   - Efter 9/18 hål genereras en rundöversikt:
     - Totalscore i förhållande till Par (ex. `+4` / `76 slag`).
     - Snittputtar per hål.
     - Fairwayträffar i %.
     - GIR i %.
     - Totalt antal bunkerslag & chippar.

---

### 3.3. Inställningar, Synk & Backup

1. **Enhets- & GPS-inställningar**:
   - **Mätarenhet**: Växla mellan **Meter** och **Yards**.
   - **GPS-precisionsindikator**: Visar visualiserad status på GPS-mottagning (Grön: `< 5m`, Gul: `5–15m`, Röd: `> 15m`) samt felmarginal i meter.

2. **GitHub REST API Synkronisering**:
   - Inställningsvy med instruktioner för uppsättning.
   - Fält för GitHub Personal Access Token (PAT), användarnamn och repository-namn.
   - **Synk-mekanism**:
     - Lokala ändringar i `localStorage` synkas automatiskt eller manuellt till GitHub.
     - Banor lagras under `/courses/{course-id}.json`.
     - Rundor lagras under `/rounds/{round-id}.json`.
     - `manifest.json` håller koll på alla banor och spelade rundor.
   - **Automatisk Kompaktering**:
     - Efter var 5:e commit/synk genomförs en automatisk städning där tillfällig ändringshistorik slås ihop och en samlad struktur-commit/backup skapas för att förhindra onödig commit-historik.

3. **Manuell Backup (Export/Import)**:
   - Knapp för att exportera hela databasen som en `.json`-fil.
   - Knapp för att importera/återställa banor och rundor från en tidigare `.json`-fil om man inte använder GitHub-synk.

---

## 4. Datastruktur (JSON Scheman)

### 4.1. Bana (`courses/{course-id}.json`)
```json
{
  "id": "bro-hof-stadium",
  "name": "Bro Hof Slott - Stadium Course",
  "holesCount": 18,
  "holes": [
    {
      "holeNumber": 1,
      "par": 4,
      "handicapIndex": 7,
      "green": {
        "front": { "lat": 59.55123, "lng": 17.54123 },
        "center": { "lat": 59.55140, "lng": 17.54140 },
        "back": { "lat": 59.55160, "lng": 17.54160 }
      },
      "objects": [
        {
          "id": "obj-1",
          "name": "Fairwaybunker höger",
          "type": "bunker",
          "position": { "lat": 59.55050, "lng": 17.54080 }
        },
        {
          "id": "obj-2",
          "name": "Vattenhinder framför green",
          "type": "water",
          "position": { "lat": 59.55110, "lng": 17.54110 }
        }
      ]
    }
  ]
}
```

### 4.2. Spelad Runda (`rounds/{round-id}.json`)
```json
{
  "id": "round-2026-08-12-01",
  "courseId": "bro-hof-stadium",
  "date": "2026-08-12T14:00:00Z",
  "unit": "meters",
  "scores": [
    {
      "holeNumber": 1,
      "strokes": 4,
      "putts": 2,
      "fairwayHit": "center",
      "gir": true,
      "bunkerShots": 0,
      "chips": 0,
      "shots": [
        {
          "shotNumber": 1,
          "from": { "lat": 59.54900, "lng": 17.53900 },
          "distanceMeters": 230
        },
        {
          "shotNumber": 2,
          "from": { "lat": 59.55080, "lng": 17.54090 },
          "distanceMeters": 140
        }
      ]
    }
  ]
}
```

---

## 5. Slutgiltig Kravchecklista för Utveckling
- [ ] Angular 22 PWA med Service Worker & Tile-cachning (Leaflet + Esri).
- [ ] Registrera bana: Par, hål (9/18), Green (Front/Center/Back) & hinder.
- [ ] Spela runda: Live-GPS avstånd till green & hinder.
- [ ] Touch to Measure: Klicka på kartan för mätning till valfri punkt.
- [ ] Hybrid slag- och score spårning (Slag på kartan + scorekort vid hålets slut).
- [ ] Växla enhet (Meter / Yards) + GPS-precisionsindikator.
- [ ] Inställningar: GitHub REST API-synk med automatisk kompaktering var 5:e commit.
- [ ] Manuell JSON Export & Import för säkerhetskopiering.

