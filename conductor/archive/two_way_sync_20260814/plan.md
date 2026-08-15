# Implementation Plan: Tvåvägssynkronisering & Remote Fetch/Merge

---

## Phase 1: Implementera fetchAndMergeRemote i GithubSyncService
- [x] Task: Lägg till Base64 UTF-8 avkodning och getFileContent i `GithubSyncService.ts`
  - [x] Implementera `fromBase64Utf8()` och `getFileContent()`.
  - [x] Implementera `fetchAndMergeRemote()` med tidsstämpelsjämförelse (`updatedAt`).

---

## Phase 2: Integrering & Enhetstester
- [x] Task: Integrera fetchAndMergeRemote i `syncAll()` och skriv enhetstester
  - [x] Uppdatera `syncAll()` att köra `fetchAndMergeRemote()` innan push.
  - [x] Skapa enhetstest för `fetchAndMergeRemote()` i `github-sync.service.spec.ts`.

---

## Phase 3: Verifiering & Bygge
- [x] Task: Kör tester och bygge
  - [x] Verifiera att alla tester passerar med `npx vitest run`.
  - [x] Verifiera att appen bygger med `npm run build`.
  - [x] Användargranskning & godkännande.
