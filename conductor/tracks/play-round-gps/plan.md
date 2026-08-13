# Track Plan: Spela Runda – Live GPS & Avståndsmätning

> **Guidelines**:
> - All kodutveckling och arkitektur skall följa skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) (Signals, Standalone Components, `@if`/`@for`).
> - Gränssnitt och UX skall strikt följa designskissen i [`doc/ui-sketch/Golf Yardage Book.dc.html`](file:///Users/joel/kod/joelabs/golf-yardage-book/doc/ui-sketch/Golf%20Yardage%20Book.dc.html).

## Phase 1: Rundamodell, Rundastart & Routing
- [ ] Task: Utöka/skapa datamodeller för `Round`, `RoundHole` och `Shot` i `src/app/models/round.model.ts`.
- [ ] Task: Utöka `StorageService` med metoder för att hantera aktiva och sparade rundor (`startRound`, `getActiveRound`, `saveRound`, `finishRound`).
- [ ] Task: Skapa `PlayRoundComponent` och ny route `/play/:roundId` samt uppdatera navigering för att starta runda från banlistan (`CourseListComponent`).
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Live GPS, Precisionsindikator & Avståndsvisning
- [ ] Task: Integrera `GeolocationService` i `PlayRoundComponent` för kontinuerlig spårning och beräkning av avstånd (Haversine-formel).
- [ ] Task: Bygga visuell avståndspanel för Green (Front, Center, Back) och hinder för det aktiva hålet.
- [ ] Task: Implementera inställning för enhetsväxel (Meter / Yards) med Signal-stöd och automatisk omräkning.
- [ ] Task: Bygga visuell GPS-precisionsindikator (Grön/Gul/Röd + felmarginal i meter).
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: Interaktiv Karta, Touch to Measure & Centrering
- [ ] Task: Integrera Leaflet satellitkarta i `PlayRoundComponent` med spelarmarkör, greenmarkörer och hindermarkörer.
- [ ] Task: Implementera **Touch to Measure**: klickhändelse på kartan som ritar en linje från spelarens GPS-position till klickad punkt och visar avståndet.
- [ ] Task: Lägga till knappar för att centrera kartan på spelarens GPS-position samt på green.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 4: Snabbregistrering av Hinder under spel & Polering
- [ ] Task: Bygga dialog/funktion för snabbregistrering av nytt hinder under rundan direkt på spelarens nuvarande GPS-position och uppdatera banan i `StorageService`.
- [ ] Task: Mobilanpassning och verifiering mot designskissen `Golf Yardage Book.dc.html`.
- [ ] Task: Köra `npm run build` och testerna för att säkerställa noll regressionsfel.
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)
