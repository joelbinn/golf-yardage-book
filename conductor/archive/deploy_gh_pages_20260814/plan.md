# Implementation Plan: Deploy till GitHub Pages

---

## Phase 1: Uppdatera package.json
- [x] Task: Lägg till deployment-skript i `package.json`
  - [x] Lägg till `"deploy-to-github-pages": "npx ng build --configuration production --base-href /golf-yardage-book/ && npx angular-cli-ghpages --dir=dist/golf-yardage-book/browser"` i `scripts`.
  - [x] Lägg till `"deploy": "npm run deploy-to-github-pages"` i `scripts`.

---

## Phase 2: Verifiering & Bygge
- [x] Task: Kör bygge och verifiera skript
  - [x] Verifiera ren kompilering med `npm run build`.
  - [x] Verifiera att testerna passerar med `npx vitest run`.
