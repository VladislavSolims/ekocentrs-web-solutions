export const COMPANIES = {
  EKOCENTRS: {
    legalName: 'SIA "EKOCENTRS"',
    regNr: "40003404760",
    vatPayer: true,
  },
  SUN_RAIN: {
    legalName: 'SIA "SUN RAIN"',
    regNr: "40103157437",
    vatPayer: false,
  },
} as const;

export type CompanyKey = keyof typeof COMPANIES;
