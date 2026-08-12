# Specification: Ban- och Hålhantering (Course Management UI & Green/Hinder-positionering)

## Overview
Implementera komplett gränssnitt och logik för att skapa, redigera, visa och ta bort golfbanor i Golf Yardage Book. Banhanteringen tillåter användare att sätta par och handicap-index för varje hål (9 eller 18 hål), samt positionera tre Green-punkter (Front, Center, Back) och hinder/objekt (Bunker, Vattenhinder, Träd, Custom) direkt via satellitkartan eller live GPS.

## Functional Requirements
1. **Banalista & Banredigering**:
   - Vy för att lista alla sparade banor från `StorageService`.
   - Formulär/modal för att skapa en ny bana eller redigera en befintlig (Namn, antal hål: 9 eller 18).
   - Möjlighet att ta bort en bana.

2. **Hålredigering & Navigering**:
   - Välj aktivt hål (1–9 eller 1–18) via en hålväljare/flikar.
   - Sätt/redigera Par (3, 4, 5) och Handicap Index (1–18) för varje hål.

3. **Green-positionering på kartan**:
   - Interaktiv kartvy (Leaflet + Esri satellit).
   - Välj green-punkt att placera: Front, Center, eller Back.
   - Placera green-punkt genom att klicka/trycka på kartan eller använda knappen "Sätt på nuvarande GPS-position".
   - Visning av befintliga green-markörer med tydlig färg- och ikonindikering på kartan.

4. **Hinder- & Objekt-registrering**:
   - Lägga till obegränsat antal hinder per hål (`bunker`, `water`, `tree`, `custom`).
   - Sätta namn/beskrivning för hindret (t.ex. "Fairwaybunker höger").
   - Positionera hindret genom klick på kartan eller nuvarande GPS.
   - Möjlighet att redigera och ta bort hinder från hålet.
   - Anpassade ikoner/markörer på kartan för varje hindertyp.

5. **Datalagring**:
   - Automatisk sparning och uppdatering i `StorageService` (`localStorage`/`IndexedDB`).
   - Validering så att banan har giltiga green-punkter innan sparning bekräftas.

## Non-Functional Requirements & UX
- Responsiv och mobilanpassad design (touch-vänliga knappar och kartkontroller).
- Reaktiv tillståndshantering med Angular Signals.
- Fungera 100% offline.

## Acceptance Criteria
- [ ] Användaren kan skapa en ny bana med namn och 9/18 hål.
- [ ] Användaren kan ange par och index för samtliga hål.
- [ ] Användaren kan klicka på kartan eller använda GPS för att positionera Front, Center och Back green-punkter för varje hål.
- [ ] Användaren kan skapa och radera hinder per hål med typ, namn och koordinater.
- [ ] Alla ändringar sparas och laddas korrekt från `StorageService`.
- [ ] Bygge (`npm run build`) och tester passerar utan fel.
