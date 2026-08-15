# Implementation Plan: Fixa Rullning på Mer-sidan i Mobilvy

---

## Phase 1: CSS-justering i SettingsComponent & AppComponent
- [x] Task: Uppdatera `app.css` och `settings.component.css`
  - [x] Sätt `overflow-y: auto; -webkit-overflow-scrolling: touch;` på `.content-viewport` i `app.css`.
  - [x] Uppdatera `.settings-container` till `padding: 16px 16px 140px 16px;` utan kapslad rullningslåsning.
  - [x] Lägg till synlig och stilren rullningslist i `styles.css`.

---

## Phase 2: Enhetstester & Verifiering
- [x] Task: Bygge och verifiering
  - [x] Verifiera ren kompilering med `npm run build`.
  - [x] Verifiera 20/20 godkända tester med `npx vitest run`.
