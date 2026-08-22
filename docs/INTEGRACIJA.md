# Integrācija ekocentrs.lv vietnē

Anketa ir patstāvīga Next.js lietotne. Vietne **ekocentrs.lv darbojas uz Joomla 3.10.10**
(pārbaudīts 2026-08-22; Joomla 3.x ir sasniegusi dzīves cikla beigas — sk. "Piezīme par Joomla 3"
zemāk). Anketas izvietošanai Joomla kodu **nav** nepieciešams modificēt.
Ieteicamā pieeja: atsevišķs subdomain + saite vai iframe no vietnes.

Šī faila PDF versija (`INTEGRACIJA.pdf`) ir domāta nosūtīšanai vietnes uzturētājam.

## 1. Anketas izvietošana (deploy)

Izvieto anketu kā atsevišķu lietotni. Vienkāršākās iespējas:

**Vercel (bezmaksas, vienkāršākais)**

```bash
npm install -g vercel
vercel --prod
```

Vercel piešķir URL, piemēram: `https://ekocentrs-anketa.vercel.app`

**VPS / savs serveris**

```bash
npm run build
npm start   # ports 3000, liec aiz nginx/caddy
```

## 2. Subdomain (pēc izvēles, bet ieteicams)

DNS iestatījumos pievieno A/CNAME ierakstu:

```
anketa.ekocentrs.lv  →  Vercel IP vai savs serveris
```

## 3. Ievietošana Joomla

**Variants A — atsevišķa izvēlnes saite (ieteicams `/izveidot` lapai)**

Joomla admin → Izvēlne → Jauns elements → Tips: "Ārēja URL" → URL: `https://anketa.ekocentrs.lv`

Lietotājs tiek aizvests uz anketas lapu. Vienkārši, bez iframe.

**Variants B — iframe rakstā (der klienta anketai, kurai nav vajadzīga autorizācija)**

Joomla admin → Saturs → Raksti → atver vajadzīgo rakstu → HTML skats:

```html
<iframe
  src="https://anketa.ekocentrs.lv"
  width="100%"
  height="900"
  style="border:none;"
  loading="lazy">
</iframe>
```

> **Uzmanību:** ja lapa prasa autorizāciju, iframe ir problemātisks — sesijas sīkdatnei citā
> domēnā jābūt `SameSite=None; Secure`, un daļa pārlūku to bloķē kā trešās puses sīkdatni.
> Tāpēc `/izveidot` (aģentu lapa) jāatver kā **atsevišķa saite** (Variants A), nevis iframe.

## 4. Piekļuves ierobežošana `/izveidot`

Lapa `/izveidot` (aģenta saišu izveide) nav paredzēta klientiem — klients aizpilda anketu pa
saiti `/aizpildit?d=...`, kurai autorizācija nav vajadzīga.

**Izvēlētais risinājums (vēl nav ieviests):** autorizācija ar esošajiem **Joomla lietotāju
kontiem** — aģenti izmanto to pašu paroli, ar ko iet ekocentrs.lv, atsevišķs paroļu saraksts
netiek veidots. Plānotā shēma:

1. Aģents atver `anketa.ekocentrs.lv/izveidot` → nav sesijas → pāradresācija uz Joomla.
2. Joomla pusē neliels tilts (plugin vai atsevišķs PHP ieejas punkts) pārbauda, vai lietotājs ir
   pieteicies un vai viņš ir vajadzīgajā lietotāju grupā; ja nav — parāda parasto Joomla login formu.
3. Pēc pieteikšanās Joomla pāradresē atpakaļ uz anketu ar īsdzīvojošu, ar koplietotu noslēpumu
   parakstītu marķieri (HMAC/JWT, derīgs ~60 s, satur lietotāja ID un grupu).
4. Next.js pārbauda parakstu un uzliek savu `httpOnly` sesijas sīkdatni; `middleware.ts` sargā
   `/izveidot`.

**Pagaidu risinājums, kamēr tilts nav gatavs:** ierobežo piekļuvi infrastruktūras līmenī —
Cloudflare Access (bezmaksas līdz 50 lietotājiem) vai nginx IP whitelist uz biroja tīklu.

## Piezīme par Joomla 3

Joomla 3.10 atbalsts beidzās 2023. gada augustā — vietne vairs nesaņem drošības atjauninājumus.
Tas neietekmē anketu (tā ir atsevišķa lietotne uz sava subdomain), bet ietekmē tiltu no 4. punkta:
kods jāraksta Joomla 3 API (`JFactory::getUser()`), nevis Joomla 4/5 API. Ja vietni plāno
migrēt uz Joomla 5, tiltu ir vērts rakstīt pēc migrācijas, lai to nevajadzētu pārrakstīt divreiz.

## Minimālais plāns

1. `vercel --prod` → iegūst URL
2. Ieslēdz Cloudflare Access uz `/izveidot` (vai IP whitelist)
3. Joomla izvēlnē pievieno saiti uz to URL
4. Vēlāk: nomaina pagaidu ierobežojumu pret Joomla kontu autorizāciju
