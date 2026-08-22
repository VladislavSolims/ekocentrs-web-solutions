# Klienta identifikācijas un izpētes anketa

Web-anketa, kas aizstāj papīra/Word formāta AML/KYC anketu nekustamā īpašuma starpniecības darījumiem (saskaņā ar Noziedzīgi iegūtu līdzekļu legalizācijas un terorisma un proliferācijas finansēšanas novēršanas likuma 28. pantu).

## Kā tas darbojas

1. **Aģents** atver `/izveidot`, izvēlas firmu (SIA "EKOCENTRS" / SIA "SUN RAIN"), klienta tipu (fiziska/juridiska persona), lomu (klients/darījuma partneris), un ievada zināmos datus par darījumu (adrese, darījuma veids). Aģents iegūst saiti un/vai QR kodu, ko nosūta klientam.
2. **Klients** atver saiti (`/aizpildit?d=...`) un aizpilda visu anketu pakāpeniski (wizard), ar nosacītiem laukiem (PEP, sankcijas, pilnvarotā persona, patiesais labuma guvējs u.c. parādās tikai tad, kad tas attiecas).
3. Klients redz gatavā dokumenta priekšskatu un lejupielādē **PDF**. Ja paraksta elektroniski — paraksta to ārēji vietnē [eParaksti.lv](https://www.eparaksts.lv). Ja paraksta ar roku — dokumentā ir tukša vieta parakstam.

Sistēma neglabā neko serverī — visi aģenta izvēlētie dati ir iekodēti pašā saitē (`?d=` parametrā), un PDF tiek ģenerēts pieprasījuma brīdī un tūlīt aizmirsts.

## Tehnoloģijas

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS**
- **react-hook-form** + **zod** — formas un validācija
- **Playwright (playwright-core) + Chromium** — PDF ģenerēšana no HTML servera pusē
- **Vitest** + **React Testing Library** — unit/component testi
- **Playwright Test** — E2E testi (pilna lietotāja gaita no saites izveides līdz PDF lejupielādei)

## Projekta struktūra

```
app/
  izveidot/          aģenta lapa — saites/QR koda izveide
  aizpildit/          klienta wizard + dokumenta priekšskats
  api/generate-pdf/   PDF ģenerēšanas route
components/
  wizard/             FieldRenderer, StepRenderer, Wizard
  document/           DocumentTemplate (priekšskats ekrānā)
schemas/
  individualSchema.ts fiziskas personas anketas lauki (no 1_F/2_F docx)
  legalSchema.ts      juridiskas personas anketas lauki (no 3_JUR/4_JUR docx)
lib/
  linkPayload.ts      saites kodēšana/dekodēšana
  renderDocumentHtml.ts  dokumenta HTML PDF ģenerēšanai
config/companies.ts   SIA EKOCENTRS / SIA SUN RAIN rekvizīti
reference/            oriģinālās .docx anketas (avota dokumenti)
e2e/                  Playwright E2E testi
docs/                 izvietošanas un integrācijas dokumentācija
```

## Darbs ar projektu

```bash
npm install          # instalēt atkarības
npm run dev          # lokālais serveris (http://localhost:3000)
npm test             # unit/component testi (Vitest)
npm run test:e2e     # E2E testi (Playwright; palaiž dev serveri automātiski)
npx tsc --noEmit     # tipu pārbaude
npm run build        # produkcijas build
```

## Izvietošana un integrācija

Anketai paredzēts darboties kā atsevišķai lietotnei uz sava subdomain (`anketa.ekocentrs.lv`),
uz kuru ved saite no ekocentrs.lv (Joomla 3.10.10). Pilns apraksts — soli pa solim, kopā ar
Joomla pusē veicamajām darbībām — ir failā [`docs/INTEGRACIJA.md`](docs/INTEGRACIJA.md)
(nosūtāmā PDF versija: `docs/INTEGRACIJA.pdf`).

Piekļuve lapai `/izveidot` tiks ierobežota ar **esošajiem Joomla lietotāju kontiem** — aģents
piesakās ar to pašu paroli, ar ko iet ekocentrs.lv; atsevišķs paroļu saraksts netiek veidots.
Klienta lapa `/aizpildit?d=...` paliek publiska (klientam konts nav vajadzīgs). Tehniskā shēma —
`docs/INTEGRACIJA.md`, 4. punkts.

## Zināmie ierobežojumi (apzināti, v1 darba kārtībā)

- `/izveidot` lapai vēl nav autorizācijas — jebkurš ar piekļuvi lietotnei var izveidot anketas
  saiti. Risinājums izvēlēts, bet vēl nav ieviests (sk. sadaļu augstāk).
- Projekts vēl nav izvietots (deploy) — pašlaik darbojas tikai lokāli.
- Nav servera puses datu glabāšanas — aģentam pašam jāarhivē lejupielādētie PDF atbilstoši AML likuma glabāšanas termiņiem.
