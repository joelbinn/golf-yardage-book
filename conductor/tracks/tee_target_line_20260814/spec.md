# Specification: Tee-positioner & Tänkt Spellinje

## Overview
Detta spår utökar Golf Yardage Book med stöd för flera namngivna Tee-positioner per hål (t.ex. Vit, Gul, Blå, Röd eller 58, 54, 48) samt möjligheten att rita ut och visualisera en **tänkt spellinje (line of play)** bestående av brytpunkter (waypoints/doglegs) från Tee till Green med delavståndsberäkningar.

---

## Functional Requirements

### 1. Datamodell (`src/app/models/course.model.ts`)
- Lägg till gränssnittet `Tee` (`id`, `name`, `color?`, `position: LatLng`).
- Utöka `Hole` med `tees?: Tee[]` och `targetLine?: LatLng[]`.

### 2. Baneditor (`CourseEditorComponent`)
- Lägg till lägesknapp **"Lägg till Tee"** för att klicka ut tees på kartan och namnge dem.
- Lägg till lägesknapp **"Rita Spellinje"** för att klicka ut fairway-brytpunkter från tee till green.

### 3. Kartkomponent (`MapComponent`)
- Rendera tee-markörer på kartan med deras namn/färg.
- Rendera den tänkta spellinjen som en halvtransparent linje med Leaflet-divIcon badges för delavstånd (t.ex. "Tee → Dogleg: 215m", "Dogleg → Green: 135m").

### 4. Spelläge (`PlayRoundComponent`)
- Visa den tänkta spellinjen alltid synlig på kartan under spelets gång.
- Tillåt val av aktivt Tee för hålet/rundan.

---

## Acceptance Criteria
- [ ] Baneditorn tillåter att lägga till och redigera flera tees samt tänkt spellinje per hål.
- [ ] Kartan visar tees och den tänkta spellinjen med tydliga delavstånd.
- [ ] Spelläget visar den tänkta spellinjen under rundans gång.
- [ ] Enhetstester uppdateras och `npm run build` bygger utan fel.
