# Implementation Plan: Automatisk Bakgrundssynkronisering

---

## Phase 1: Reaktiv händelsekanal i StorageService
- [x] Task: Lägg till `dataChanged$` i `StorageService`
  - [x] Skapa `readonly dataChanged$ = new Subject<void>();`.
  - [x] Sänd händelser från `saveCourse`, `deleteCourse`, `saveRound`, `deleteRound` och `importBackupData`.

---

## Phase 2: Bakgrundslyssnare i GithubSyncService
- [x] Task: Koppla lyssnare med debouncing i `GithubSyncService`
  - [x] Prenumerera på `storage.dataChanged$` med `debounceTime(3000)`.
  - [x] Implementera `backgroundSync()` för tyst icke-blockerande körning.

---

## Phase 3: Enhetstester & Verifiering
- [x] Task: Kör tester och bygge
  - [x] Skriv enhetstest för `backgroundSync()`.
  - [x] Verifiera ren kompilering med `npm run build`.
  - [x] Verifiera 18/18 tester med `npx vitest run`.
