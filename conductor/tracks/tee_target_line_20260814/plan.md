# Implementation Plan: Tee-positioner & Tänkt Spellinje

---

## Phase 1: Datamodell & Editor-kontroller
- [ ] Task: Uppdatera `course.model.ts`
  - [ ] Lägg till `Tee` gränssnittet och utöka `Hole` med `tees?: Tee[]` och `targetLine?: LatLng[]`.
- [ ] Task: Lägg till Tee- och Spellinje-verktyg i `CourseEditorComponent`
  - [ ] Skapa knappar för "Lägg till Tee" och "Rita Spellinje" i editorn.
  - [ ] Implementera hantering av klickhändelser på kartan.

---

## Phase 2: Kartvisualisering & Spelläge
- [ ] Task: Uppdatera `MapComponent` för Tees & Spellinje
  - [ ] Lägg till `@Input() tees` och `@Input() targetLine`.
  - [ ] Rendera streckade linjer med Leaflet och distans-badges för delavstånd.
- [ ] Task: Integrera i `PlayRoundComponent`
  - [ ] Skicka tees och spellinje till kartan i spelläget.

---

## Phase 3: Enhetstester & Verifiering
- [ ] Task: Bygge och tester
  - [ ] Uppdatera enhetstester för modeller och kartredigering.
  - [ ] Verifiera ren kompilering med `npm run build`.
  - [ ] Verifiera med `npx vitest run`.
