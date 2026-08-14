# Implementation Plan: Inställningar, Backup & GitHub-synk

> **Guidelines**:
> - All kodutveckling och arkitektur skall följa standarderna för moderna Angular Standalone Components, Signals och strikt TypeScript.
> - Gränssnitt och UX skall följa designskissen i [`doc/ui-sketch/Golf Yardage Book.dc.html`](file:///Users/joel.binnquist/projects/kod/joelabs/golf-yardage-book/doc/ui-sketch/Golf%20Yardage%20Book.dc.html).

---

## Phase 1: SettingsService & Global Enhetshantering (Meter / Yards)
- [x] Task: Skapa `SettingsService` med enhetsval och persistent lagring
  - [x] Skapa `src/app/services/settings.service.ts` med signaler för måttenhet (`unit: 'm' | 'y'`), GitHub-inställningar och formatering av avstånd.
  - [x] Skapa datamodeller för inställningar och GitHub-konfiguration i `src/app/models/settings.model.ts`.
  - [x] Uppdatera `PlayRoundComponent` och `CourseEditorComponent` för att använda `SettingsService.formatDistance()` / `unit()`.
  - [x] Skapa enhetstester i `src/app/services/settings.service.spec.ts`.
  - [x] Task: Phase Verification & Checkpoint

---

## Phase 2: JSON Backup (Export & Import) i StorageService
- [x] Task: Implementera export- och importmetoder i `StorageService`
  - [x] Lägg till `exportBackupData(): Promise<string>` som serialiserar banor, rundor och exporteringsdatum som formaterad JSON.
  - [x] Lägg till `importBackupData(jsonString: string): Promise<{ coursesCount: number; roundsCount: number }>` som validerar och importerar kurser/rundor till IndexedDB/LocalStorage.
  - [x] Skapa enhetstester i `src/app/services/storage.service.spec.ts` för export och import.
  - [x] Task: Phase Verification & Checkpoint

---

## Phase 3: GitHub REST API Synkronisering & Kompaktering
- [x] Task: Skapa `GithubSyncService`
  - [x] Skapa `src/app/services/github-sync.service.ts`.
  - [x] Implementera metoder för att läsa och skriva filer via GitHub Contents API (`PUT /repos/{owner}/{repo}/contents/{path}`).
  - [x] Skapa logik för att synka `/courses/{course-id}.json`, `/rounds/{round-id}.json` och `/manifest.json`.
  - [x] Implementera räknare för kompaktering och hantera automatisk sammanslagning efter var 5:e commit.
  - [x] Hantera felkoder, nätverksfel och offline-läge med informativa felmeddelanden.
  - [x] Skapa enhetstester i `src/app/services/github-sync.service.spec.ts`.
  - [x] Task: Phase Verification & Checkpoint

---

## Phase 4: SettingsComponent UI & Navigering
- [x] Task: Implementera `SettingsComponent` och konfigurera routing
  - [x] Skapa `src/app/components/settings/settings.component.ts`, `.html`, `.css`.
  - [x] Bygg enhetsväljare (Meter / Yards toggle).
  - [x] Bygg GPS-precisionskort med signal från `GeolocationService` och färgindikator (grön/gul/röd).
  - [x] Bygg GitHub-synkningskort med formulär för användarnamn, repo och Personal Access Token, synkstatus, kompakteringsindikator och "Synka nu"-knapp.
  - [x] Bygg backup-knappar ("Exportera .json" med filnedladdning och "Importera .json" med filväljare).
  - [x] Registrera rutt `/settings` i `src/app/app.routes.ts`.
  - [x] Säkerställ att bottenmenyn i `nav-bar.component.html` navigerar aktivt till `/settings`.
  - [x] Task: Phase Verification & Checkpoint

---

## Phase 5: Slutgiltig Verifiering & Polering
- [x] Task: Kör bygge och testerna
  - [x] Verifiera ren kompilering med `npm run build`.
  - [x] Verifiera enhetstester med `npx vitest run`.
  - [x] Task: Phase Verification & Checkpoint
- [x] Task: Användargranskning & acceptans
  - [x] Presentera resultat för användaren.
  - [x] Du **MÅSTE** efterfråga och erhålla användarens godkännande för att spåret skall anses komplett 
