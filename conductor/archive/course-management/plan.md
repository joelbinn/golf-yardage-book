# Track Plan: Ban- och Hålhantering (Course Management UI & Green/Hinder-positionering)

> **Guidelines**:
> - All kodutveckling och arkitektur skall följa skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) (Signals, Standalone Components, Control Flow syntax `@if`/`@for`).
> - Layout och visuella komponenter skall strikt följa designskissen i [`doc/ui-sketch/Golf Yardage Book.dc.html`](file:///Users/joel/kod/joelabs/golf-yardage-book/doc/ui-sketch/Golf%20Yardage%20Book.dc.html).

## Phase 1: Komponentstruktur & Banalista (Angular Developer & UX Sketch)
- [x] Task: Skapa `CourseListComponent` och routing för banhantering enligt skissen i `Golf Yardage Book.dc.html`.
- [x] Task: Skapa form/modal `CourseFormDialog` för att skapa/redigera banans grunddata (namn, antal hål).
- [x] Task: Integrera med `StorageService` för att lista, skapa och ta bort banor.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Hålredigering & Green-positionering på kartan
- [x] Task: Skapa `HoleEditorComponent` med hålväljare (hål 1-9/18) samt par- och index-fält med design från skissen.
- [x] Task: Bygga interaktiv kartintegration i `HoleEditorComponent` för placering av Green-punkter (Front, Center, Back) via kartklick eller GPS-position.
- [x] Task: Visning och uppdatering av Green-markörer på Leaflet-kartan.
- [x] Task: Lägga till knapp "Centrera kartan på green" när greenposition finns för aktivt hål.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Hinder- & Objekt-hantering
- [x] Task: Bygga dialog/formulär för att lägga till och redigera hinder (typ: bunker/vatten/träd/custom, namn, position).
- [x] Task: Lägga till kartmarkörer och interaktion för hinder på hålet.
- [x] Task: Möjlighet att ta bort eller flytta hinder.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 4: Integrationsverifiering & UX-polering
- [x] Task: Verifiera att alla banändringar sparas korrekt i `StorageService` och laddas om vid omstart av appen.
- [x] Task: Verifiera mobilanpassning och visual match mot `Golf Yardage Book.dc.html`.
- [x] Task: Köra `npm run build` och testerna för att säkerställa noll regressionsfel.
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)
