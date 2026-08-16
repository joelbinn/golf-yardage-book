# Implementation Plan: Tee-positioner, Tänkt Spellinje & Hålvridning (Green Högst Upp)

## Core Guidelines & Skill Usage
1. **Developer Skill**: Skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) skall användas för all komponent- och tjänsteutveckling (Angular Signals, Standalone Components, `@if`/`@for` Control Flow syntax).

---

## Phase 1: Datamodell & Editor-kontroller
- [ ] Task: Uppdatera `course.model.ts`
  - [ ] Lägg till `Tee` gränssnittet och utöka `Hole` med `tees?: Tee[]` och `targetLine?: LatLng[]`.
- [ ] Task: Lägg till Tee- och Spellinje-verktyg i `CourseEditorComponent`
  - [ ] Skapa knappar för "Lägg till Tee" och "Rita Spellinje" i editorn.
  - [ ] Implementera hantering av klickhändelser på kartan.

---

## Phase 2: Kartvisualisering & Hålvridning i MapComponent
- [ ] Task: Uppdatera `MapComponent` för Tees, Spellinje & Hålvridning
  - [ ] Lägg till `@Input() tees` och `@Input() targetLine`.
  - [ ] Implementera bärningsberäkning (bearing) från Tee till Green center.
  - [ ] Implementera kartrotation för Hålinriktad vy (Tee längst ned, Green högst upp) med motroterade horisontella badges.
  - [ ] Rendera streckade linjer med Leaflet och distans-badges för delavstånd.

---

## Phase 3: Spelläge & Orienteringsväxlare
- [ ] Task: Integrera i `PlayRoundComponent`
  - [ ] Skicka tees, spellinje och orienteringsläge till kartan i spelläget.
  - [ ] Lägg till kompassknapp på kartan för att växla mellan "Hålinriktad (Tee ➔ Green)" och "Norr Upp".

---

## Phase 4: Enhetstester & Verifiering
- [ ] Task: Bygge och tester
  - [ ] Skriv enhetstester för bärningsberäkning och modeller.
  - [ ] Verifiera ren kompilering med `npm run build`.
  - [ ] Verifiera med `npx vitest run`.
