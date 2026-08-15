# Specification: Tee-positioner, Tänkt Spellinje & Hålvridning (Green Högst Upp)

## Overview
Detta spår utökar Golf Yardage Book med stöd för:
1. Flera namngivna Tee-positioner per hål (t.ex. Vit, Gul, Blå, Röd eller 58, 54, 48).
2. **Tänkt spellinje (line of play)** bestående av brytpunkter (waypoints/doglegs) från Tee till Green med delavståndsberäkningar.
3. **Hålvridning i Spelläget**: Automatisk rotation av kartan så att hålets Tee placeras längst ned på skärmen och Green högst upp, samt en kompassknapp för att växla till standard nordsyn (Norr Upp).

---

## Functional Requirements

### 1. Datamodell (`src/app/models/course.model.ts`)
- Lägg till gränssnittet `Tee` (`id`, `name`, `color?`, `position: LatLng`).
- Utöka `Hole` med `tees?: Tee[]` och `targetLine?: LatLng[]`.

### 2. Baneditor (`CourseEditorComponent`)
- Lägg till lägesknapp **"Lägg till Tee"** för att klicka ut tees på kartan och namnge dem.
- Lägg till lägesknapp **"Rita Spellinje"** för att klicka ut fairway-brytpunkter från tee till green.
- Editorn behåller standard nordsyn (Norr Upp) för enkel ritning.

### 3. Kartkomponent (`MapComponent`)
- Rendera tee-markörer på kartan med deras namn/färg.
- Rendera den tänkta spellinjen som en halvtransparent linje med Leaflet-divIcon badges för delavstånd (t.ex. "Tee → Dogleg: 215m", "Dogleg → Green: 135m").
- Lägg till stöd för `@Input() rotateToHole: boolean` och bärningsberäkning (bearing angle $\theta$) från hålets Tee till Green center.
- Rotera kartbehållaren/lagret så att Green hamnar längst upp och Tee längst ned.
- Motrotera alla text- och avstånds-badges så att de förblir läsbara horisontellt.

### 4. Spelläge (`PlayRoundComponent`)
- Visa den tänkta spellinjen alltid synlig på kartan under spelets gång.
- Tillåt val av aktivt Tee för hålet/rundan.
- Lägg till en orienteringsknapp på kartan för att enkelt växla mellan "Hålinriktad (Tee ➔ Green)" och "Norr Upp".

---

## Acceptance Criteria
- [ ] Baneditorn tillåter att lägga till och redigera flera tees samt tänkt spellinje per hål.
- [ ] Kartan visar tees och den tänkta spellinjen med tydliga delavstånd.
- [ ] I Spelläget roteras kartan automatiskt med Green högst upp och Tee längst ned.
- [ ] Orienteringsknappen växlar smidigt mellan Hålinriktad och Norr Upp.
- [ ] Alla avståndsetiketter och badges förblir lättlästa och horisontella.
- [ ] Enhetstester uppdateras och `npm run build` bygger utan fel.
