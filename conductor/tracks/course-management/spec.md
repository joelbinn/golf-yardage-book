# Specification: Ban- och Hålhantering (Course Management UI & Green/Hinder-positionering)

## Core Guidelines & Skill Usage
1. **Developer Skill**: Skillet [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md) skall användas för all komponent- och tjänstutveckling, Angular Signals-hantering samt reaktiv arkitektur.
2. **UX & Visuell Design**: Gränssnitt och UX skall strikt följa designskissen i [`doc/ui-sketch/Golf Yardage Book.dc.html`](file:///Users/joel/kod/joelabs/golf-yardage-book/doc/ui-sketch/Golf%20Yardage%20Book.dc.html) (inklusive färgschema `#f5ead8`, `#201e1d`, `#ebddc5`, `#c67139`, typografi `Caprasimo` & `Figtree`, rundade hörn, pill-knappar och vy/flik-navigeringen för "Banor" och "Registrera bana").

## Overview
Implementera komplett gränssnitt och logik för att skapa, redigera, visa och ta bort golfbanor i Golf Yardage Book. Banhanteringen tillåter användare att sätta par och handicap-index för varje hål (9 eller 18 hål), samt positionera tre Green-punkter (Front, Center, Back) och hinder/objekt (Bunker, Vattenhinder, Träd, Custom) direkt via satellitkartan eller live GPS.

## Functional Requirements
1. **Banalista & Banredigering**:
   - Vy för att lista alla sparade banor från `StorageService` enligt vyer i `Golf Yardage Book.dc.html` (Banor-fliken).
   - Formulär/modal för att skapa en ny bana eller redigera en befintlig (Namn, antal hål: 9 eller 18).
   - Möjlighet att ta bort en bana.

2. **Hålredigering & Navigering**:
   - Välj aktivt hål (1–9 eller 1–18) via hålväljare med framåt/bakåt-knappar och indikatorer.
   - Sätt/redigera Par (3, 4, 5) och Handicap Index (1–18) för varje hål med +/- reglage.

3. **Green-positionering på kartan**:
   - Interaktiv kartvy (Leaflet + Esri satellit).
   - Välj green-punkt att placera: Front, Center, eller Back.
   - Placera green-punkt genom att klicka/trycka på kartan eller använda knappen "Sätt på nuvarande GPS-position".
   - Visning av befintliga green-markörer med tydlig färg- och ikonindikering på kartan.
   - **Centrera på green**: När greenposition finns registrerad på det öppna hålet skall en stilren monokrom knapp vara tillgänglig för att centrera kartvyn exakt över greenen. Knappen prioriterar greenens mittposition (Prio 1), därefter framkant (Prio 2) och sist bakkant (Prio 3). Knappen visas endast när giltig greenposition finns.

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
- Responsiv och mobilanpassad design (touch-vänliga knappar och kartkontroller) baserad på [`doc/ui-sketch/Golf Yardage Book.dc.html`](file:///Users/joel/kod/joelabs/golf-yardage-book/doc/ui-sketch/Golf%20Yardage%20Book.dc.html).
- Reaktiv tillståndshantering med Angular Signals och Standalone-komponenter via [`angular-developer`](file:///Users/joel/.gemini/config/skills/angular-developer/SKILL.md).
- Fungera 100% offline.

## Acceptance Criteria
- [ ] Utvecklingen följer best practices från skillet `angular-developer`.
- [ ] UI och färgschema/layout matchar designskissen i `Golf Yardage Book.dc.html`.
- [ ] Användaren kan skapa en ny bana med namn och 9/18 hål.
- [ ] Användaren kan ange par och index för samtliga hål.
- [ ] Användaren kan klicka på kartan eller använda GPS för att positionera Front, Center och Back green-punkter för varje hål.
- [ ] Knappen för att centrera kartan på green visas när greenposition finns och flyttar kartvy direkt till greenen.
- [ ] Användaren kan skapa och radera hinder per hål med typ, namn och koordinater.
- [ ] Alla ändringar sparas och laddas korrekt från `StorageService`.
- [ ] Bygge (`npm run build`) och tester passerar utan fel.
