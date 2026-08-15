# Implementation Plan: Undre Navigeringsmeny på Desktop

---

## Phase 1: CSS-anpassningar i NavBarComponent & AppComponent
- [x] Task: Ta bort display:none och anpassa skrivbordslayout i `nav-bar.component.css`
  - [x] Ta bort `:host { display: none !important; }`.
  - [x] Centrera `.bottom-nav` på skärmar >= 768px (`max-width: 600px`).
- [x] Task: Ta bort padding-bottom: 0 override i `app.css`
  - [x] Säkerställ `padding-bottom: 72px` på alla skärmstorlekar.

---

## Phase 2: Verifiering & Bygge
- [x] Task: Kör tester och bygge
  - [x] Verifiera ren kompilering med `npm run build`.
  - [x] Verifiera 18/18 tester med `npx vitest run`.
