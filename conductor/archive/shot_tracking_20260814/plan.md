# Implementation Plan: GPS Slagspårning & Slagkedja på Kartan

---

## Phase 1: Datamodell & Logik i PlayRoundComponent
- [x] Task: Implementera logik för att spåra och spara `Shot` i `PlayRoundComponent`
  - [x] Lägg till metoder `registerShot()` och `undoLastShot()` i `PlayRoundComponent.ts`.
  - [x] Beräkna slaglängd i meter/yards från föregående registrering eller hålets tee-start.
  - [x] Uppdatera automatisk slagräknare (`strokes`) och spara i `StorageService`.

---

## Phase 2: Kartvisualisering i MapComponent
- [x] Task: Uppdatera `MapComponent` för att visa slagkedja och slagmarkörer
  - [x] Skapa `@Input() shots: Shot[]` i `MapComponent`.
  - [x] Rita polylinjer och Leaflet-divIcons för registrerade slag på kartan.

---

## Phase 3: UI-integrering & Klubbväljare Modal
- [x] Task: Bygg UI-knapp och Klubbväljare i `PlayRoundComponent`
  - [x] Lägg till knappen "Registrera Slag" och "Ångra slag" i `play-round.component.html`.
  - [x] Bygg snabbmodal för att välja klubba vid slagregistrering.

---

## Phase 4: Verifiering & Bygge
- [x] Task: Kör tester och bygge
  - [x] Kör `npx vitest run`.
  - [x] Kör `npm run build`.
  - [x] Användargranskning & godkännande.
