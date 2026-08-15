# Specification: Undre Navigeringsmeny på Desktop

## Overview
Detta spår gör att den undre navigeringsmenyn (`<app-nav-bar>`) förblir synlig och fullt fungerande på alla skärmstorlekar, inklusive breda skrivbordsskärmar (desktop/läsplattor >= 768px).

---

## Functional Requirements
1. **Navigeringsmeny på alla skärmbredder**:
   - Ta bort dölj-regeln `:host { display: none !important; }` från `nav-bar.component.css`.
2. **Skrivbordslayout**:
   - På skärmar >= 768px centreras den undre menyn längst ned på skärmen (`max-width: 600px; left: 50%; transform: translateX(-50%);`) med rundade övre hörn och mjuk skugga.
3. **Behåll sidmarginal**:
   - Behåll `padding-bottom: 72px` på `.content-viewport` så att sidinnehåll inte täcks över av menyn.

---

## Acceptance Criteria
- [ ] Den undre navigeringsmenyn är synlig på både mobil och desktop (>= 768px).
- [ ] Menyn är klickbar och leder till Banor, Spela runda, Scorekort och Inställningar.
- [ ] Applikationen kompilerar utan fel (`npm run build`).
