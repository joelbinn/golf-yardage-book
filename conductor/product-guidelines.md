# Product Guidelines - Golf Yardage Book

## Referenser
* [UI-skiss](../doc/ui-sketch/Golf%20Yardage%20Book.dc.html)

## Design & Visual Identity
- **Modern & Dynamic Mobile-First Design**: Optimerat för mobila skärmar i utomhusmiljö (solljus, hög kontrast).
- **Färgpalett**: Mörkt/ljust tema anpassat för utomhusbruk med högkontrastknappar och tydliga indikatorer för green och hinder (grönt för green, gult/orange för bunkrar, blått för vattenhinder).
- **Typografi**: Ren, läsbar sans-serif typografi (t.ex. Inter eller Roboto) med stor textstorlek för snabb avläsning på avstånd ute på golfbanan.
- **Kartvisualisering**: Tydliga ikoner och Leaflet-markörer med dynamiska avståndsetiketter som är lätta att klicka på med tummen ("Thumb-friendly tap targets", minst 44x44px).

## UX Principles
- **Minimal Interaction Friction**: Få klick krävs för att mäta avstånd eller registrera slag under runda.
- **Offline-First & Transparens**: Tydliga visuella indikatorer för offline-status, GPS-precisionsmarginal och senast genomförd GitHub-synk.
- **Snabb Responsivitet**: Omedelbar visuell feedback vid knapptryck och kartklick med hjälp av Angular Signals.

## Accessibility (A11y)
- Följer WCAG 2.1 AA-kontrastkrav för läsbarhet i starkt solljus.
- Tydliga ARIA-labels på alla interaktiva kartkontroller och scorekortselement.

## Quality Standards
- Noll tolerans för tysta fel eller dataförlust under runda: Alla ändringar sparas omedelbart i `localStorage` / `IndexedDB`.
- Robust felhantering vid nätverksavbrott eller utebliven GitHub API-anslutning.
