# Specification: GitHub-Synkindikator i den Undre Menyn

## Overview
Detta spår lägger till en reaktiv statusindikator (status-prick med förklarande tooltip) i den ständigt synliga undre navigeringsmenyn. Indikatorn visar om lokal data har synkroniserats till GitHub eller om osynkade ändringar väntar.

---

## Functional Requirements

### 1. Reaktiv Statusuppdatering (`GithubSyncService`)
- Lägg till reaktiv signal `syncState = signal<'synced' | 'pending' | 'error' | 'disabled'>('synced')`.
- Lägg till beräknad signal `syncStateText = computed(...)` som returnerar svenska förklarande texter för tooltip:
  - 🟢 `synced`: "Alla ändringar synkroniserade till GitHub"
  - 🟡 `pending`: "Ändringar väntar på synkronisering..."
  - 🔴 `error`: "Synkroniseringsfel eller offline"
  - ⚪ `disabled`: "GitHub-synkronisering ej konfigurerad"
- Uppdatera status vid dataändringar (`pending`), vid slutförd synk (`synced`), vid fel (`error`) och vid avsaknad av konfiguration (`disabled`).

### 2. Visuell Prick & Tooltip i Menyn (`NavBarComponent`)
- Placera statuspricken direkt i bottenmenyn på "Mer"-ikonen.
- Använd `[title]="syncService.syncStateText()"` för HTML-tooltip vid hover/tryck.
- Animera den gula pricken med en mjuk pulsering när ändringar väntar.

---

## Acceptance Criteria
- [ ] Statuspricken syns alltid i bottenmenyn på alla sidor.
- [ ] Pricken skiftar färg: Grön (synkad), Gul (ändringar väntar/pågår), Röd (fel), Grå (ej konfigurerad).
- [ ] Hover/tryck på pricken visar en förklarande tooltip.
- [ ] Enhetstester täcker statusskiften i `GithubSyncService`.
- [ ] `npm run build` och alla tester passerar.
