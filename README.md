# Klienta identifikācijas un izpētes anketa

Web-anketa, kas aizstāj papīra/Word formāta AML/KYC anketu nekustamā īpašuma starpniecības darījumiem (saskaņā ar Noziedzīgi iegūtu līdzekļu legalizācijas un terorisma un proliferācijas finansēšanas novēršanas likuma 28. pantu).

## Kā tas darbojas

1. **Aģents** atver `/izveidot`, izvēlas firmu (SIA "EKOCENTRS" / SIA "SUN RAIN"), klienta tipu (fiziska/juridiska persona), lomu (klients/darījuma partneris), un ievada zināmos datus par darījumu (adrese, darījuma veids). Aģents iegūst saiti un/vai QR kodu, ko nosūta klientam.
2. **Klients** atver saiti (`/aizpildit?d=...`) un aizpilda visu anketu pakāpeniski (wizard), ar nosacītiem laukiem (PEP, sankcijas, pilnvarotā persona, patiesais labuma guvējs u.c. parādās tikai tad, kad tas attiecas). Obligātos laukus nevar izlaist — «Tālāk» pārbauda soli un paliek uz vietas, kamēr tie nav atbildēti; lauki, ko klients neredz, viņu neaptur.
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
  izveidot/          aģenta lapa — saites/QR koda izveide (prasa pieteikšanos)
  aizpildit/          klienta wizard + dokumenta priekšskats
  api/generate-pdf/   PDF ģenerēšanas route
  api/auth/joomla/    Joomla marķiera apmaiņa pret sesiju
components/
  wizard/             FieldRenderer, StepRenderer, Wizard
  document/           DocumentTemplate (priekšskats ekrānā)
schemas/
  individualSchema.ts fiziskas personas anketas lauki (no 1_F/2_F docx)
  legalSchema.ts      juridiskas personas anketas lauki (no 3_JUR/4_JUR docx)
lib/
  linkPayload.ts      saites kodēšana/dekodēšana
  renderDocumentHtml.ts  dokumenta HTML PDF ģenerēšanai
  hmacToken.ts        marķieru parakstīšana/pārbaude (kopīga ar Joomla pusi)
  joomlaToken.ts      Joomla izsniegtā marķiera pārbaude
  session.ts          aģenta sesijas sīkdatne
proxy.ts              sargā /izveidot (Next.js 16 nosaukums; agrāk middleware.ts)
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

### Aģenta pieteikšanās

Piekļuve lapai `/izveidot` ir ierobežota ar **esošajiem Joomla lietotāju kontiem** — aģents
piesakās ar to pašu paroli, ar ko iet ekocentrs.lv; atsevišķs paroļu saraksts netiek veidots.
Klienta lapa `/aizpildit?d=...` paliek publiska (klientam konts nav vajadzīgs).

Joomla puses tilts izsniedz 30 sekundes derīgu, ar HMAC-SHA256 parakstītu marķieri;
`app/api/auth/joomla` to pārbauda un apmaina pret savu `httpOnly` sesijas sīkdatni (8 h), un
`proxy.ts` neielaiž `/izveidot` bez tās. Paroles lietotne neredz un neglabā; izlietotie marķieri
netiek glabāti — aizsardzība ir īsais derīguma logs. Joomla pusē veicamais (kopā ar gatavu PHP
kodu) — `docs/INTEGRACIJA.md` un `docs/integracija-handoff.html`.

Vajadzīgie vides mainīgie ir aprakstīti `.env.example`. Izstrādei nokopē to uz `.env.local`;
E2E testiem vērtības nāk no `e2e/testAuth.ts`.

## Zināmie ierobežojumi (apzināti, v1 darba kārtībā)

- Projekts vēl nav izvietots (deploy) — pašlaik darbojas tikai lokāli, un Joomla puses tilts
  vēl nav uzlikts vietnē.
- Sesija darbojas 8 stundas un netiek atsaukta no ārpuses: ja aģentam atņem Joomla kontu, viņa
  jau izsniegtā sīkdatne paliek derīga līdz termiņa beigām.
- Nav servera puses datu glabāšanas — aģentam pašam jāarhivē lejupielādētie PDF atbilstoši AML likuma glabāšanas termiņiem.
