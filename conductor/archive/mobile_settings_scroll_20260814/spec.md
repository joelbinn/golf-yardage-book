# Specification: Fixa Rullning på Mer-sidan i Mobilvy

## Overview
Detta spår åtgärdar ett visningsfel på mobilskärmar där det nedersta innehållet på "Mer"-sidan skyms bakom den fasta bottenmenyn, vilket gör att användaren inte kan rulla ända ned till slutet.

---

## Functional Requirements

### 1. Bottenmarginal & Rullningsavstånd (`SettingsComponent`)
- Uppdatera `.settings-content` i `settings.component.css` med tillräcklig `padding-bottom` (112px / `calc(72px + 40px)`).
- Säkerställ att hela sidfoten (Git SHA, byggdatum, kopiera-knapp) och alla backup-knappar rullar fritt upp ovanför bottenmenyn på alla mobila enheter.

---

## Acceptance Criteria
- [ ] Det går att rulla ända ned till slutet på "Mer"-sidan på mobiltelefoner (< 768px).
- [ ] Inget innehåll skyms eller täcks av den fasta bottenmenyn.
- [ ] `npm run build` och alla enhetstester passerar utan fel.
