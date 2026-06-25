import type { QuestionnaireSchema } from "./types";

const noPersonalCode = (a: Record<string, unknown>) => !a.personalCode;
const isNonResidentDocSection = noPersonalCode;

export const individualSchema: QuestionnaireSchema = {
  id: "individual",
  steps: [
    {
      id: "personal-info",
      title: "Informācija par klientu",
      fields: [
        { id: "firstName", label: "Vārds", type: "text", required: true },
        { id: "lastName", label: "Uzvārds", type: "text", required: true },
        { id: "personalCode", label: "Personas kods", type: "text" },
        {
          id: "birthDate",
          label: "Dzimšanas datums (jāaizpilda, ja klients ir nerezidents)",
          type: "date",
          visibleIf: noPersonalCode,
          required: noPersonalCode,
        },
        { id: "contactPhone", label: "Tālrunis", type: "tel", required: true },
        { id: "contactEmail", label: "E-pasts", type: "email", required: true },
        { id: "birthPlace", label: "Dzimšanas vieta", type: "text", required: true },
        { id: "nationality", label: "Valsts piederība", type: "text", required: true },
        {
          id: "residenceCountry",
          label: "Pastāvīgās dzīvesvietas (rezidences) valsts",
          type: "text",
          required: true,
        },
        {
          id: "idDocumentType",
          label: "Personas apliecinoša dokumenta veids",
          type: "select",
          options: [
            { value: "passport", label: "Pase" },
            { value: "id_card", label: "ID karte" },
          ],
          visibleIf: isNonResidentDocSection,
          required: isNonResidentDocSection,
        },
        {
          id: "idDocumentNumber",
          label: "Dokumenta numurs",
          type: "text",
          visibleIf: isNonResidentDocSection,
          required: isNonResidentDocSection,
        },
        {
          id: "idDocumentIssueDate",
          label: "Izdošanas datums",
          type: "date",
          visibleIf: isNonResidentDocSection,
          required: isNonResidentDocSection,
        },
        {
          id: "idDocumentExpiryDate",
          label: "Derīga līdz",
          type: "date",
          visibleIf: isNonResidentDocSection,
          required: isNonResidentDocSection,
        },
        {
          id: "idDocumentIssuingCountry",
          label: "Izdevējvalsts",
          type: "text",
          visibleIf: isNonResidentDocSection,
          required: isNonResidentDocSection,
        },
        {
          id: "idDocumentIssuingAuthority",
          label: "Izdevējiestāde",
          type: "text",
          visibleIf: isNonResidentDocSection,
          required: isNonResidentDocSection,
        },
        {
          id: "residencePermitType",
          label: "Uzturēšanās atļauja",
          type: "radio",
          options: [
            { value: "fixed_term", label: "Termiņa" },
            { value: "permanent", label: "Beztermiņa" },
          ],
          visibleIf: isNonResidentDocSection,
        },
        {
          id: "residencePermitDocumentInfo",
          label:
            "Personu apliecinoša dokumenta numurs, izdošanas datums, valsts un institūcija, kas dokumentu izdevusi",
          type: "textarea",
          visibleIf: isNonResidentDocSection,
        },
      ],
    },
    {
      id: "economic-activity",
      title: "Informācija par klienta nodarbošanos un līdzekļu izcelsmes avotu",
      fields: [
        {
          id: "socialStatus",
          label: "Sociālais statuss/darba vieta",
          type: "radio",
          required: true,
          options: [
            { value: "employee", label: "algots darbinieks(-cе)" },
            { value: "business_owner", label: "komersants" },
            { value: "student", label: "students (-е)" },
            { value: "homemaker", label: "mājsaimnieks (-се)" },
            { value: "pensioner", label: "pensionārs (-е)" },
            { value: "unemployed", label: "bezdarbnieks (-се)" },
            { value: "other", label: "cits" },
          ],
        },
        {
          id: "socialStatusOther",
          label: "Cits (jānorāda)",
          type: "text",
          visibleIf: (a) => a.socialStatus === "other",
        },
        { id: "employerName", label: "Esošā darba vieta: Nosaukums", type: "text" },
        { id: "employerPosition", label: "Ieņemamais amats", type: "text" },
        {
          id: "businessActivityType",
          label: "Saimnieciskās darbības veids",
          type: "checkboxGroup",
          options: [
            { value: "currency_exchange", label: "skaidras un bezskaidras valūtas maiņa" },
            { value: "real_estate_brokerage", label: "starpniecība darījumos ar nekustamajiem īpašumiem" },
            { value: "precious_metals_trade", label: "tirdzniecības ar dārgmetāliem un dārgakmeņiem" },
            { value: "gambling", label: "azartspēļu organizēšana" },
            { value: "cash_collection", label: "inkasācijas pakalpojumu sniegšana" },
            { value: "other", label: "cits" },
          ],
        },
        {
          id: "businessActivityTypeOther",
          label: "Cits (Ievadīt tekstu)",
          type: "text",
          visibleIf: (a) => Array.isArray(a.businessActivityType) && a.businessActivityType.includes("other"),
        },
        {
          id: "militaryGoodsConnection",
          label:
            "Vai klienta saimnieciskā vai personiskā darbība ir saistīta ar militāra vai divejādā lietojuma precēm vai tehnoloģijām?",
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
            "Vai uz klienta saimniecisko vai personisko darbību var tikt attiecinātas Eiropas Savienības sankciju regulējumā noteiktie ierobežojumi?",
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
          label: "Lūdzu aprakstiet, norādot preces muitas/TARIC kodu vai pakalpojuma veidu",
          type: "text",
          visibleIf: (a) => a.sanctionsRegulationExposure === "yes",
        },
        {
          id: "sourceOfFunds",
          label: "Līdzekļu izcelsmes avots",
          type: "checkboxGroup",
          required: true,
          options: [
            { value: "salary", label: "darba alga" },
            { value: "fees", label: "honorāri" },
            { value: "business_income", label: "ienākumi no saimnieciskās darbības" },
            { value: "dividends_interest", label: "dividendes, procentu ienākumi" },
            { value: "financial_instruments_sale", label: "finanšu instrumentu pārdošana" },
            { value: "inheritance_gift", label: "mantojums, dāvinājums" },
            { value: "private_property_sale", label: "privātīpašuma pārdošana" },
            { value: "borrowed_funds", label: "aizņemtie līdzekļi" },
            { value: "other", label: "cits" },
          ],
        },
        {
          id: "sourceOfFundsOther",
          label: "Norādiet kāds",
          type: "text",
          visibleIf: (a) => Array.isArray(a.sourceOfFunds) && a.sourceOfFunds.includes("other"),
        },
        {
          id: "activityJurisdictions",
          label: "Jurisdikcija/jurisdikcijas, kuros klients veic saimniecisko vai personisko darbību",
          type: "textarea",
        },
        {
          id: "averageAnnualIncome",
          label: "Vidējais gada ienākums pēdējo trīs gadu laikā, EUR",
          type: "number",
        },
        {
          id: "cashIncomeShare",
          label: "Skaidras naudas īpatsvars ienākumā, %",
          type: "number",
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
            "Vai klientam ir ciešas ģimenes vai biznesa saites ar personām, attiecībā uz kurām ANO, ASV OFAC vai ES ir noteikuši sankcijas?",
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
          id: "soleBeneficialOwnerConfirmation",
          label:
            "Apliecinu, ka esmu vienīgais darījuma attiecību vai gadījuma rakstura darījuma ar Sabiedrību patiesais labuma guvējs",
          type: "checkbox",
          required: true,
        },
        {
          id: "isPep",
          label:
            "Esmu politiski nozīmīga persona vai politiski nozīmīgas personas ģimenes loceklis, vai ar politiski nozīmīgu personu cieši saistīta persona",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Jā" },
            { value: "no", label: "Nē" },
          ],
        },
        {
          id: "pepDescription",
          label:
            "Lūdzam norādīt ieņemamo amatu, vai saistītās politiski nozīmīgās personas vārdu/uzvārdu un saistību ar personu",
          type: "textarea",
          visibleIf: (a) => a.isPep === "yes",
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
        {
          id: "actingOnBehalfOfAnother",
          label: "Vai darījums/i tiks veikti citas personas labā vai interesēs?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Jā (lūdzu aizpildiet sadaļu)" },
            { value: "no", label: "Nē, darījumu/us veicu savā vārdā" },
          ],
        },
      ],
    },
    {
      id: "authorized-person",
      title: "Informācija par pilnvaroto personu vai personu, kuras interesēs tiek veikts darījums",
      fields: [
        {
          id: "authorizedPersonType",
          label: "Atzīmēt vajadzīgo",
          type: "radio",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
          options: [
            { value: "attorney", label: "pilnvarotā persona" },
            { value: "beneficiary", label: "persona, kuras labā vai interesēs tiek veikts darījums" },
            { value: "other", label: "cits" },
          ],
        },
        {
          id: "authorizedPersonTypeOther",
          label: "Cits (jānorāda)",
          type: "text",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes" && a.authorizedPersonType === "other",
        },
        {
          id: "authorizedPersonFullName",
          label: "Vārds, uzvārds",
          type: "text",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedPersonalCode",
          label: "Personas kods",
          type: "text",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedBirthInfo",
          label:
            "Dzimšanas datums, mēnesis, gads, dzimšanas vieta (ja personai nav Latvijas Republikas personas koda)",
          type: "text",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedAddress",
          label: "Dzīvesvietas adrese",
          type: "text",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedPhone",
          label: "Tālrunis",
          type: "tel",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedEmail",
          label: "E-pasts",
          type: "email",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedIdDocumentType",
          label: "Personas apliecinoša dokumenta veids (jāaizpilda, ja personai nav Latvijas Republikas personas koda)",
          type: "select",
          options: [
            { value: "passport", label: "Pase" },
            { value: "id_card", label: "ID karte" },
          ],
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedIdDocumentNumber",
          label: "Dokumenta numurs",
          type: "text",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedIdDocumentIssueDate",
          label: "Izdošanas datums",
          type: "date",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedIdDocumentExpiryDate",
          label: "Derīga līdz",
          type: "date",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedIdDocumentIssuingCountry",
          label: "Izdevējvalsts",
          type: "text",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedIdDocumentIssuingAuthority",
          label: "Izdevējiestāde",
          type: "text",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedResidencePermitType",
          label: "Uzturēšanās atļauja",
          type: "radio",
          options: [
            { value: "fixed_term", label: "Termiņa" },
            { value: "permanent", label: "Beztermiņa" },
          ],
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizedResidencePermitDocumentInfo",
          label:
            "Personu apliecinoša dokumenta numurs, izdošanas datums, valsts un institūcija, kas dokumentu izdevusi",
          type: "textarea",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizationType",
          label: "Pilnvaras veids",
          type: "textarea",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
        {
          id: "authorizationBasis",
          label: "Pamatojums pilnvaras izmantošanai",
          type: "textarea",
          visibleIf: (a) => a.actingOnBehalfOfAnother === "yes",
        },
      ],
    },
    {
      id: "gdpr-consent",
      title: "Klienta piekrišana savu personas datu apstrādei",
      fields: [
        {
          id: "dataProcessingConsent1",
          label:
            "Piekrītu, ka Klienta identifikācijas un izpētes anketā norādītie mani personas dati tiek apstrādāti un saglabāti, lai Sabiedrība izpildītu normatīvo aktu prasības",
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
          label: "Piekrītu dokumenta, uz kura pamata tiek veikta mana identifikācija, kopijas izgatavošanai un glabāšanai Sabiedrībā",
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
          label: "Klienta vārds, uzvārds",
          type: "text",
          visibleIf: (a) => a.signingMethod === "electronic",
          required: (a) => a.signingMethod === "electronic",
        },
        { id: "signatureDate", label: "Datums", type: "date", required: true },
      ],
    },
  ],
};
