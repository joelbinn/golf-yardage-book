# Specification: Synkroniserad Kompakteringsräknare i GitHub-repot

## Overview
Detta spår ser till att räknaren för synkningar till kompaktering (`syncCommitCount`) sparas och synkroniseras via GitHub-repot (`manifest.json`) istället för att bara lagras isolerat per enhet i lokal `localStorage`. Det garanterar att olika klienter (mobiler, surfplattor, datorer) alltid visar samma aktuella värde (t.ex. 3/5 till kompaktering).

---

## Functional Requirements

### 1. Inläsning av Fjärrräknare (`GithubSyncService.fetchAndMergeRemote`)
- När `manifest.json` hämtas från GitHub i `fetchAndMergeRemote()`, läs av `manifest.syncCount`.
- Om `syncCount` finns angivet som nummer på GitHub, anropa `this.settings.setSyncCommitCount(manifest.syncCount)` för att uppdatera det lokala värdet.

### 2. Uppdatering vid Synkronisering (`GithubSyncService.syncAll`)
- Vid `syncAll()`, räkna upp `syncCount` i `manifest.json` och spara fjärrfilen på GitHub.
- Om kompaktering utförs (efter 5 synkningar), nollställs `syncCount` till 0 både lokalt och i fjärrmanifestet.

---

## Acceptance Criteria
- [ ] `fetchAndMergeRemote()` uppdaterar den lokala synkräknaren med värdet från GitHubs `manifest.json`.
- [ ] Olika enheter ser exakt samma räknarvärde efter att ha synkat mot samma repo.
- [ ] Kompaktering vid 5 synkningar nollställer räknaren korrekt på alla enheter.
- [ ] Enhetstester verifierar funktionen och `npm run build` bygger utan fel.
