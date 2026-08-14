# Specification: Deploy till GitHub Pages

## Overview
Detta spår lägger till ett dedikerat npm-skript i `package.json` för att bygga och publicera Golf Yardage Book PWA-applikationen till GitHub Pages med ett enda kommando, i enlighet med mönstret från `jb-guitar-frontend`.

---

## Functional Requirements
1. **npm script `"deploy-to-github-pages"`**:
   - Bygger applikationen i produktionsläge med `--base-href /golf-yardage-book/`.
   - Publicerar den byggda mappen `dist/golf-yardage-book/browser` till `gh-pages` branschen via `npx angular-cli-ghpages`.
2. **npm script `"deploy"`**:
   - Fungerar som ett alias för `"npm run deploy-to-github-pages"`.

---

## Acceptance Criteria
- [ ] `package.json` innehåller `"deploy-to-github-pages"` och `"deploy"`.
- [ ] Rätt repository-namn (`/golf-yardage-book/`) och utdatamapp (`dist/golf-yardage-book/browser`) är angivna.
- [ ] Applikationen kompilerar utan fel (`npm run build`).
