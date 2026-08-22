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
saiti `/aizpildit?d=...`, kurai autorizācija nav vajadzīga un nekad nebūs.

**Izvēlētā pieeja (2026-08-22): `AGENT_LOGIN=external`.** Ierobežojumu uzliek vietnes uzturētājs
tā, kā viņai ērtāk — Cloudflare Access, IP whitelist vai HTTP Basic Auth uz `location /izveidot`.
Lietotnes pusē neko konfigurēt nevajag: `proxy.ts` šajā režīmā laiž cauri visus, jo pieņem, ka
neviens cits līdz tai nemaz netiek. Nosacījums viens: ierobežojums attiecas **tikai** uz ceļu
`/izveidot`, nevis uz visu subdomain, citādi klienti nevar aizpildīt anketu.

Iemesls: nevajag apmainīties ar koplietotu noslēpumu un nevajag likt kodu vietnē. Cena: aģents
piesakās nevis ar savu ekocentrs.lv paroli, bet ar to, ko izvēlas uzturētāja.

### Rezerves variants: `AGENT_LOGIN=joomla`

Kods pieteikšanai ar esošajiem Joomla kontiem ir uzrakstīts, notestēts un paliek repozitorijā —
to ieslēdz, uzstādot `AGENT_LOGIN=joomla` un trīs mainīgos no `.env.example`. Tas noder, ja
kādreiz gribas, lai aģenti ietu ar to pašu paroli, ar ko iet vietnē, vai citā aģentūrā, kur nav
sava uzturētāja.

Tam Joomla saknē jāievieto tilts `kyc-sso.php`: tas pārbauda, vai lietotājs ir pieteicies un vai
ir vajadzīgajā grupā, un pāradresē uz `/api/auth/joomla` ar 30 sekundes derīgu, ar HMAC-SHA256
parakstītu marķieri (`base64url(JSON).paraksts`; lauki sub/name/email/iat/exp). Mūsu puse
pārbauda parakstu nemainīgā laikā, piemēro 30 sekunžu ierobežojumu pati (neuzticoties `exp`) un
apmaina marķieri pret savu `httpOnly` sesijas sīkdatni uz 8 stundām. Izlietotie marķieri netiek
glabāti — lietotne apzināti ir bez datubāzes.

Tilta PHP kods bija aprakstīts šī dokumenta 2026-08-22 versijā; to var atjaunot no git vēstures
(`git log -- docs/integracija-handoff.html`).

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
