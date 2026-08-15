# Implementation Plan: Redesign av Hålvy i "Spela Runda"

## Phase 1: Layout & Fullscreen Map Restructuring
- [x] Task: Omstrukturera layout i `PlayRoundComponent` så att kartan täcker hela bakgrunden
  - [x] Uppdatera `play-round.component.html` layoutstruktur för full-screen kartcanvas.
  - [x] Anpassa `play-round.component.css` för `position: fixed/absolute` full-screen kartvy med z-index lager.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Floating Header Bar (Top Pill Header)
- [x] Task: Implementera den flytande, avrundade toppbaren
  - [x] Skapa HTML-struktur för toppbaren med navigeringspilar, hålnr/par/hcp, GPS-noggrannhet, enhetsväxlare och score-badge.
  - [x] Stila toppbaren med rundade ändar, frostat glas (`backdrop-filter: blur(12px)`), skuggor och responskompakthet.
  - [x] Koppla knappar för hålnavigering (`prevHole()`, `nextHole()`), enhetsväxel (`toggleUnit()`) och GPS-indikator.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Bottom Sheet Card & Drag/Toggle Logic
- [x] Task: Implementera expanderbart/komprimerbart Bottom Sheet-kort
  - [x] Lägg till Signal `isBottomSheetExpanded` i `play-round.component.ts`.
  - [x] Implementera gest-/klickhantering för draghandtaget och överkanten (touch-swipe & click).
  - [x] Skapa CSS-klasser och transitions för komprimerat läge (endast green-avstånd) och expanderat läge (hinder, slagregistrering, score-steppers, knappar).
  - [x] Säkerställ att bottom sheet dockar direkt ovanför `app-nav-bar` utan att täcka över den.
  - [x] Lägg till internt scrollstöd för expanderat innehåll på mindre skärmar.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 4: Integration, Styling Polish & Verification
- [x] Task: Finjustera UX, kartkontroller och verifiera applikationsbygget
  - [x] Justera Leaflet zoom-kontroller och kartmarkörer för fri sikt.
  - [x] Kör `npm run build` för att verifiera att alla TypeScript- och Angular-komponenter kompilerar utan fel.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)
