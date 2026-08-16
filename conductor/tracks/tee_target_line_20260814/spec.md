# Specification: Tee-positioner, Tänkt Spellinje & Hålvridning (Green Högst Upp)

## Overview
Detta spår utökar Golf Yardage Book med stöd för:
1. Flera namngivna Tee-positioner per hål (t.ex. Vit, Gul, Blå, Röd eller 58, 54, 48).
2. **Tänkt spellinje (line of play)** bestående av brytpunkter (waypoints/doglegs) som **alltid utgår från en specifik Tee** fram till Green med delavståndsberäkningar.
3. **Dynamisk Tee-koppling**: Om en Tee flyttas följer spellinjens startpunkt automatiskt med. Man kan alltid redigera spellinjen och byta vilken Tee den utgår ifrån.
4. **Hålvridning i Spelläget**: Automatisk rotation av kartan så att hålets valda Tee placeras längst ned på skärmen och Green högst upp, samt en kompassknapp för att växla till standard nordsyn (Norr Upp).

---

## Functional Requirements

### 1. Datamodell (`src/app/models/course.model.ts`)
- Lägg till gränssnittet `Tee` (`id`, `name`, `color?`, `position: LatLng`).
- Lägg till gränssnittet `TargetLine`:
  ```typescript
  export interface TargetLine {
    teeId?: string;       // ID för den Tee spellinjen utgår ifrån
    waypoints: LatLng[];  // Fairway-brytpunkter/doglegs mellan Tee och Green
  }
  ```
- Utöka `Hole` med `tees?: Tee[]` och `targetLine?: TargetLine`.

### 2. Baneditor (`CourseEditorComponent`)
- **Tee-hantering**: Lägesknapp **"Lägg till/Redigera Tee"** för att klicka ut, namnge och flytta tees på kartan.
- **Spellinje-hantering**: Lägesknapp **"Rita/Redigera Spellinje"**:
  - Tillåter användaren att **välja vilken Tee** spellinjen skall knytas till (`teeId`).
  - Tillåter att klicka ut, flytta eller ta bort brytpunkter (waypoints) på fairway från den valda Tee:n mot Green.
- **Automatisk uppdatering**: Om användaren flyttar den valda Tee:n på kartan uppdateras spellinjens startpunkt dynamiskt i realtid.

### 3. Kartkomponent (`MapComponent`)
- Rendera alla tee-markörer på kartan med deras namn och färg-badges.
- Rendera den tänkta spellinjen med sin startpunkt förankrad i den valda Tee:ns position, dragen via alla waypoints till Green center.
- Rendera Leaflet-divIcon badges för delavstånd längs linjen (t.ex. "Tee (Gul) → Dogleg: 215m", "Dogleg → Green: 135m", samt totalavstånd).
- Lägg till stöd för `@Input() rotateToHole: boolean` och bärningsberäkning (bearing angle $\theta$) från hålets aktiva Tee till Green center.
- Rotera kartbehållaren/lagret så att Green hamnar längst upp och Tee längst ned.
- Motrotera alla text- och avstånds-badges så att de förblir läsbara horisontellt.

### 4. Spelläge (`PlayRoundComponent`)
- Visa den tänkta spellinjen för det valda hålet/Tee:n på kartan under spelets gång.
- Tillåt spelaren att välja aktivt Tee för hålet/rundan.
- Lägg till en orienteringsknapp på kartan för att enkelt växla mellan "Hålinriktad (Tee ➔ Green)" och "Norr Upp".

---

## Acceptance Criteria
- [ ] Baneditorn tillåter att lägga till och redigera tees samt knyta den tänkta spellinjen till en specifik Tee.
- [ ] Om en Tee flyttas i baneditorn följer spellinjens startpunkt med automatiskt.
- [ ] Det går att redigera spellinjen och byta vilken Tee den utgår ifrån.
- [ ] Kartan visar tees och den tänkta spellinjen med tydliga delavstånd och totalsträcka.
- [ ] I Spelläget roteras kartan automatiskt med Green högst upp och den valda Tee:n längst ned.
- [ ] Orienteringsknappen växlar smidigt mellan Hålinriktad och Norr Upp.
- [ ] Alla avståndsetiketter och badges förblir lättlästa och horisontella.
- [ ] Enhetstester uppdateras och `npm run build` bygger utan fel.
