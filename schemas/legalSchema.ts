import type { QuestionnaireSchema } from "./types";

export const legalSchema: QuestionnaireSchema = {
  id: "legal",
  steps: [
    {
      id: "company-info",
      title: "Informācija par klientu",
      fields: [
        { id: "companyName", label: "Nosaukums, juridiskā forma", type: "text", required: true },
        {
          id: "registrationNumberAndDate",
          label: "Reģistrācijas numurs un datums",
          type: "text",
          required: true,
        },
        { id: "legalAddress", label: "Juridiskā adrese", type: "text", required: true },
        {
          id: "actualBusinessAddress",
          label: "Saimnieciskās darbības faktiskā veikšanas vieta (ja tā atšķiras no juridiskās adreses)",
          type: "text",
        },
        { id: "website", label: "Tīmekļa vietne", type: "text" },
        {
          id: "issuesBearerShares",
          label: "Vai klients emitē vai ir tiesīgs emitēt uzrādītāja akcijas (kapitāla vērtspapīrus)",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "jā" },
            { value: "no", label: "nē" },
          ],
        },
        {
          id: "representativeFullNameAndCode",
          label: "Persona, kura ir tiesīga pārstāvēt klientu: vārds, uzvārds, personas kods",
          type: "text",
          required: true,
        },
        {
          id: "representativeBirthDate",
          label: "Dzimšanas datums (jāaizpilda, ja persona, kura ir tiesīga pārstāvēt klientu, ir nerezidents)",
          type: "date",
        },
        {
          id: "representativeIdDocumentInfo",
          label:
            "Personu apliecinoša dokumenta Nr., izdošanas datums, institūcija, kas dokumentu izdevusi (ja persona, kura ir tiesīga pārstāvēt klientu, ir nerezidents)",
          type: "textarea",
        },
        { id: "representativePosition", label: "Amats", type: "text", required: true },
        {
          id: "representativeContact",
          label: "Kontaktinformācija: tālrunis, e-pasts",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: "economic-activity",
      title: "Informācija par klienta saimniecisko darbību, līdzekļu izcelsmes avotiem un saistību ar jurisdikcijām",
      fields: [
        { id: "businessActivity", label: "Saimnieciskā darbība", type: "textarea", required: true },
        { id: "naceCode", label: "Darbības veidi saskaņā ar NACE klasifikatoru", type: "text", required: true },
        {
          id: "activityJurisdictions",
          label: "Jurisdikcija/jurisdikcijas, kuros klients veic saimniecisko darbību",
          type: "textarea",
        },
        {
          id: "licenseRequired",
          label: "Vai klienta darbībai ir nepieciešama licence (ja jā, jāpievieno licences kopija)",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "jā" },
            { value: "no", label: "nē" },
          ],
        },
        {
          id: "averageAnnualTurnover",
          label: "Vidējais gada apgrozījums pēdējo trīs gadu laikā, EUR",
          type: "number",
        },
        {
          id: "cashTurnoverShare",
          label: "Skaidras naudas darījumu īpatsvars apgrozījumā, %",
          type: "number",
        },
        {
          id: "sourceOfFunds",
          label: "Līdzekļu izcelsmes avots",
          type: "radio",
          required: true,
          options: [
            { value: "business_activity", label: "saimnieciskā darbība" },
            { value: "borrowed_funds", label: "aizņemtie līdzekļi" },
            { value: "other", label: "cits" },
          ],
        },
        {
          id: "sourceOfFundsOther",
          label: "Norādiet kāds",
          type: "text",
          visibleIf: (a) => a.sourceOfFunds === "other",
        },
        {
          id: "militaryGoodsConnection",
          label:
            "Vai klienta saimnieciskā darbība ir saistīta ar militāra pielietojuma precēm, divejādā lietojuma precēm vai tehnoloģijām?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "jā" },
            { value: "no", label: "nē" },
          ],
        },
        {
          id: "militaryGoodsCode",
          label: "Lūdzu aprakstiet, norādot preces muitas/TARIC kodu",
          type: "text",
          visibleIf: (a) => a.militaryGoodsConnection === "yes",
        },
        {
          id: "sanctionsRegulationExposure",
          label:
            "Vai uz klienta saimniecisko darbību var tikt attiecinātas Eiropas Savienības sankciju regulējumā noteiktie ierobežojumi?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "jā" },
            { value: "no", label: "nē" },
            { value: "hard_to_say", label: "grūti atbildēt" },
          ],
        },
        {
          id: "sanctionsRegulationDescription",
          label: "Lūdzu aprakstiet, norādot preces muitas/TARIC kodu",
          type: "text",
          visibleIf: (a) => a.sanctionsRegulationExposure === "yes",
        },
      ],
    },
    {
      id: "sanctions-screening",
      title: "Informācija par klienta saistību ar sankcijām pakļautām personām",
      fields: [
        {
          id: "sanctionedPersonsConnection",
          label:
            "Vai klientam ir biznesa saites ar personām, attiecībā uz kurām ANO, ASV OFAC vai ES ir noteikuši sankcijas?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "jā" },
            { value: "no", label: "nē" },
          ],
        },
        {
          id: "sanctionedPersonsDescription",
          label: "Lūdzu aprakstiet",
          type: "textarea",
          visibleIf: (a) => a.sanctionedPersonsConnection === "yes",
        },
      ],
    },
    {
      id: "beneficial-owner",
      title: "Informācija par klienta patieso labuma guvēju (PLG)",
      fields: [
        { id: "beneficialOwnerFullName", label: "Vārds, uzvārds", type: "text", required: true },
        { id: "beneficialOwnerPersonalCode", label: "Personas kods", type: "text" },
        {
          id: "beneficialOwnerBirthDate",
          label: "Dzimšanas datums, mēnesis un gads",
          type: "date",
        },
        {
          id: "beneficialOwnerIdDocumentInfo",
          label:
            "Personu apliecinoša dokumenta Nr., izdošanas datums, institūcija, kas dokumentu izdevusi (ja PLG ir nerezidents)",
          type: "textarea",
        },
        { id: "beneficialOwnerNationality", label: "Valsts piederība", type: "text", required: true },
        {
          id: "beneficialOwnerResidenceCountry",
          label: "Pastāvīgās dzīvesvietas valsts",
          type: "text",
          required: true,
        },
        {
          id: "beneficialOwnerControlShare",
          label: "Piederošo kontrolēto kapitāla daļu vai akciju īpatsvars kopējā skaitā, vai īstenojamās kontroles veids",
          type: "text",
          required: true,
        },
        {
          id: "beneficialOwnerSanctionsConnection",
          label:
            "Vai klienta PLG ir ciešas ģimenes vai biznesa saites ar personām, attiecībā uz kurām ANO, ASV OFAC vai ES ir noteikuši sankcijas?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "jā" },
            { value: "no", label: "nē" },
          ],
        },
        {
          id: "beneficialOwnerSanctionsDescription",
          label: "Lūdzu aprakstiet",
          type: "textarea",
          visibleIf: (a) => a.beneficialOwnerSanctionsConnection === "yes",
        },
        {
          id: "indirectControlType",
          label: "Persona, ar kuras starpniecību tiek īstenota kontrole (ja kontrole tiek īstenota netieši)",
          type: "radio",
          options: [
            { value: "natural_person", label: "fiziskā persona" },
            { value: "legal_entity", label: "juridiskā persona vai juridiskais veidojums" },
          ],
        },
        {
          id: "indirectControlNaturalPersonName",
          label: "Vārds, uzvārds",
          type: "text",
          visibleIf: (a) => a.indirectControlType === "natural_person",
        },
        {
          id: "indirectControlNaturalPersonCode",
          label: "Personas kods (ja personai nav personas koda - dzimšanas datums, mēnesis un gads)",
          type: "text",
          visibleIf: (a) => a.indirectControlType === "natural_person",
        },
        {
          id: "indirectControlLegalEntityName",
          label: "Nosaukums",
          type: "text",
          visibleIf: (a) => a.indirectControlType === "legal_entity",
        },
        {
          id: "indirectControlLegalEntityRegNr",
          label: "Reģistrācijas numurs",
          type: "text",
          visibleIf: (a) => a.indirectControlType === "legal_entity",
        },
        {
          id: "indirectControlLegalEntityAddress",
          label: "Juridiskā adrese",
          type: "text",
          visibleIf: (a) => a.indirectControlType === "legal_entity",
        },
        {
          id: "indirectControlAuthorizedPersonName",
          label: "Pilnvarota persona (ja starpniecību īsteno ar juridiskā veidojuma starpniecību): vārds, uzvārds",
          type: "text",
          visibleIf: (a) => a.indirectControlType === "legal_entity",
        },
        {
          id: "indirectControlAuthorizedPersonCode",
          label: "Personas kods (ja personai nav personas koda - dzimšanas datums, mēnesis un gads)",
          type: "text",
          visibleIf: (a) => a.indirectControlType === "legal_entity",
        },
      ],
    },
    {
      id: "deal-terms",
      title: "Darījuma attiecību mērķis, summa un norēķini",
      fields: [
        {
          id: "relationshipPurpose",
          label: "Darījuma attiecību vai gadījuma rakstura darījuma mērķis un paredzama būtība",
          type: "textarea",
          required: true,
        },
        {
          id: "purchaseSaleAmountBracket",
          label: "Darījuma kopēja summa NĪ iegādei/pārdošanai",
          type: "radio",
          visibleIf: (a) => a.dealType === "sale" || a.dealType === "purchase",
          options: [
            { value: "up_to_50000", label: "līdz 50'000 EUR" },
            { value: "up_to_100000", label: "līdz 100'000 EUR" },
            { value: "up_to_250000", label: "līdz 250'000 EUR" },
            { value: "up_to_500000", label: "līdz 500'000 EUR" },
            { value: "more", label: "vairāk nekā 500'000 EUR" },
          ],
        },
        {
          id: "purchaseSaleAmountDescription",
          label: "Lūdzu aprakstiet",
          type: "text",
          visibleIf: (a) => a.purchaseSaleAmountBracket === "more",
        },
        {
          id: "rentLeaseAmountBracket",
          label: "Darījuma kopēja summa (mēneša maksa) NĪ izīrēšanai/nomāšanai",
          type: "radio",
          visibleIf: (a) => a.dealType === "rent" || a.dealType === "lease",
          options: [
            { value: "up_to_500", label: "līdz 500 EUR" },
            { value: "up_to_1000", label: "līdz 1000 EUR" },
            { value: "up_to_2000", label: "līdz 2000 EUR" },
            { value: "more", label: "vairāk nekā 2000 EUR" },
          ],
        },
        {
          id: "rentLeaseAmountDescription",
          label: "Lūdzu aprakstiet",
          type: "text",
          visibleIf: (a) => a.rentLeaseAmountBracket === "more",
        },
        {
          id: "paymentInstitutions",
          label: "Norēķiniem par NĪ darījumu tiek plānots izmantot šādas finanšu iestādes",
          type: "checkboxGroup",
          required: true,
          options: [
            { value: "latvia", label: "kredītiestādēs vai maksājuma iestādēs, kas reģistrētas Latvijā" },
            { value: "eu", label: "kredītiestādēs vai maksājuma iestādēs, kas reģistrētas ES" },
            { value: "third_country", label: "trešo valstu kredītiestādēs vai maksājuma iestādēs" },
          ],
        },
        {
          id: "paymentInstitutionsEuCountry",
          label: "Lūdzu norādiet valsti",
          type: "text",
          visibleIf: (a) => Array.isArray(a.paymentInstitutions) && a.paymentInstitutions.includes("eu"),
        },
        {
          id: "paymentInstitutionsThirdCountry",
          label: "Lūdzu norādiet valsti",
          type: "text",
          visibleIf: (a) =>
            Array.isArray(a.paymentInstitutions) && a.paymentInstitutions.includes("third_country"),
        },
      ],
    },
    {
      id: "declarations",
      title: "Klienta apliecinājumi",
      fields: [
        {
          id: "beneficialOwnerPepStatus",
          label:
            "Apliecinu, ka norādītais klienta patiesais labuma guvējs - PLG (vajadzīgo atzīmēt)",
          type: "radio",
          required: true,
          options: [
            { value: "not_pep", label: "nav politiski nozīmīga persona (PNP) vai ar PNP saistīta persona" },
            {
              value: "is_pep",
              label: "ir PNP, PNP ģimenes loceklis vai ar PNP cieši saistīta persona, vai bija šādā statusā iepriekšējo 12 mēnešu laikā",
            },
          ],
        },
        {
          id: "beneficialOwnerPepDescription",
          label: "Norādiet PNP amatu, radniecības ar PNP pakāpi, vai ciešo attiecību ar PNP aprakstu",
          type: "textarea",
          visibleIf: (a) => a.beneficialOwnerPepStatus === "is_pep",
        },
        {
          id: "criminalRecordRepresentativeAndOwner",
          label:
            "Apliecinu, ka persona, kura ir tiesīga pārstāvēt klientu, un klienta PLG (vajadzīgo atzīmēt)",
          type: "radio",
          required: true,
          options: [
            { value: "none", label: "nav bijuši krimināli sodīti" },
            { value: "cleared", label: "ir bijuši krimināli sodīti, bet sodāmība ir noņemta vai dzēsta" },
          ],
        },
        {
          id: "criminalRecordRepresentativeAndOwnerJustification",
          label: "Norādiet pamatojumu un datumu",
          type: "text",
          visibleIf: (a) => a.criminalRecordRepresentativeAndOwner === "cleared",
        },
        {
          id: "sanctionsCountryConnection",
          label:
            "Apliecinu, ka klients, tā PLG, sadarbības partneri un klienta darījumi (vajadzīgo atzīmēt)",
          type: "radio",
          required: true,
          options: [
            { value: "no", label: "nav saistīti ar valsti vai teritoriju, uz kuru attiecināmas sankcijas" },
            { value: "yes", label: "ir saistīti ar valsti vai teritoriju, uz kuru attiecināmas sankcijas" },
          ],
        },
        {
          id: "sanctionsCountryDescription",
          label: "Norādiet valsti vai teritoriju",
          type: "text",
          visibleIf: (a) => a.sanctionsCountryConnection === "yes",
        },
        {
          id: "criminalRecord",
          label: "Apliecinu, ka (vajadzīgo atzīmēt)",
          type: "radio",
          required: true,
          options: [
            { value: "none", label: "neesmu bijis krimināli sodīts" },
            { value: "cleared", label: "esmu bijis krimināli sodīts, bet sodāmība ir noņemta vai dzēsta" },
          ],
        },
        {
          id: "criminalRecordJustification",
          label: "Norādiet pamatojumu un datumu",
          type: "text",
          visibleIf: (a) => a.criminalRecord === "cleared",
        },
        {
          id: "sanctionsComplianceCommitment",
          label:
            "Apņemos neizmantot Sabiedrības pakalpojumus darījumos, kuru rezultātā tiktu pārkāpti LR, ES, ANO vai ASV OFAC normatīvie akti vai starptautisko organizāciju lēmumi, kas nosaka sankcijas",
          type: "checkbox",
          required: true,
        },
        {
          id: "truthfulInfoCommitment",
          label:
            "Apliecinu, ka Klienta identifikācijas un izpētes anketā norādītās ziņas ir pilnīgas un patiesas un apņemos 10 dienu laikā informēt Sabiedrību par izmaiņām tajos",
          type: "checkbox",
          required: true,
        },
      ],
    },
    {
      id: "gdpr-consent",
      title: "Personas, kura ir tiesīga pārstāvēt klientu, piekrišana savu personas datu apstrādei",
      fields: [
        {
          id: "dataProcessingConsent1",
          label:
            "Piekrītu, ka klienta identifikācijas un izpētes anketā norādītie mani personas dati tiks apstrādāti un saglabāti, lai Sabiedrība izpildītu normatīvo aktu prasības",
          type: "checkbox",
          required: true,
        },
        {
          id: "dataProcessingConsent2",
          label:
            "Piekrītu, ka Sabiedrība ir tiesīga pārbaudīt Klienta identifikācijas un izpētes anketā norādīto informāciju un datus citos avotos, tajā skaitā LR valsts informācijas sistēmās",
          type: "checkbox",
          required: true,
        },
        {
          id: "dataProcessingConsent3",
          label: "Piekrītu dokumenta, uz kura pamata tiek veikta mana identifikācija, kopijas izgatavošanai un glabāšanai pie NĪ starpnieka",
          type: "checkbox",
          required: true,
        },
        {
          id: "signingMethod",
          label: "Kā dokuments tiks parakstīts?",
          type: "radio",
          required: true,
          options: [
            { value: "electronic", label: "Elektroniski (eParakstī)" },
            { value: "handwritten", label: "Parakstīšu ar roku" },
          ],
        },
        {
          id: "signatureName",
          label: "Personas, kura ir tiesīga pārstāvēt klientu, vārds, uzvārds",
          type: "text",
          visibleIf: (a) => a.signingMethod === "electronic",
          required: (a) => a.signingMethod === "electronic",
        },
        { id: "signatureDate", label: "Datums", type: "date", required: true },
      ],
    },
  ],
};
