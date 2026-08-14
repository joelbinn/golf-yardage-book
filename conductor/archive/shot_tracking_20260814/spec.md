# Specification: GPS Slagspårning & Slagkedja på Kartan

## Overview
Detta spår implementerar GPS-slagspårning och visuella slagkedjor på satellitkartan under pågående runda i `PlayRoundComponent`. Det kompletterar hybridspårningen enligt punkt 3.2.3 i huvudspecifikationen (`doc/APPLICATION-IDEA.md`).

---

## Functional Requirements

### 1. Registrera Slag (`PlayRoundComponent`)
- Tydlig knapp *"Registrera Slag"* i hålvyn på `PlayRoundComponent`.
- Vid knapptryck loggas spelarens aktuella GPS-position via `GeolocationService`.
- Slaget tilldelas automatiskt hålnummer, startposition, slutposition, beräknat avstånd och tidsstämpel.
- Slagräknaren (`strokes`) på scorekortet ökar automatiskt med +1.
- Valbar popup/modal för att ange vilken klubba (ex. *Driver, 3W, 7i, PW, Putter*) som användes.

### 2. Visuell Slagkedja på Satellitkartan (`MapComponent` & Leaflet)
- Rita ut slagkedjan för nuvarande hål som solida färgade linjer mellan slagens positioner på kartan.
- Visa markörer för varje slag (Slag 1, Slag 2, osv.) med avståndspill (ex. `235 m` / `257 yd`).
- Möjlighet att rensa/ta bort senaste registrerade slag vid felinmatning.

### 3. Lagring i `Round` Datastruktur
- Slag sparas i `round.shots: Shot[]` och uppdateras persistent i `StorageService`.

---

## Acceptance Criteria
- [ ] Knappen "Registrera Slag" finns tillgänglig i `PlayRoundComponent`.
- [ ] Klick på knappen sparar slaget med GPS-position och beräknar avstånd i valda enheter (Meter/Yards).
- [ ] Slagräknaren ökar automatiskt vid nytt registreras slag.
- [ ] Slagkedjan ritas ut snyggt på satellitkartan med linjer och etiketter.
- [ ] Möjlighet att ta bort senaste slaget finns.
- [ ] Alla enhetstester passerar och `npm run build` bygger utan fel.
