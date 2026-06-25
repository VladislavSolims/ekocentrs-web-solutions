export function getPartyRoleLabel(role: unknown, dealType: unknown): string {
  const isClient = role === "client";

  if (dealType === "sale" || dealType === "purchase") {
    const clientIsSeller = dealType === "sale";
    const isSeller = isClient ? clientIsSeller : !clientIsSeller;
    return isSeller ? "Pārdevējs" : "Pircējs";
  }

  if (dealType === "rent" || dealType === "lease") {
    // By convention the broker's client is the property owner offering it for rent/lease.
    const isLandlord = isClient;
    return isLandlord ? "Izīrētājs" : "Nomnieks";
  }

  return isClient ? "Klients" : "Darījuma partneris";
}

function getPartyName(answers: Record<string, unknown>): string {
  const fullName = [answers.firstName, answers.lastName].filter(Boolean).join(" ");
  if (fullName) return fullName;
  return typeof answers.companyName === "string" ? answers.companyName : "";
}

const LATVIAN_DIACRITICS: Record<string, string> = {
  ā: "a", Ā: "A",
  č: "c", Č: "C",
  ē: "e", Ē: "E",
  ģ: "g", Ģ: "G",
  ī: "i", Ī: "I",
  ķ: "k", Ķ: "K",
  ļ: "l", Ļ: "L",
  ņ: "n", Ņ: "N",
  š: "s", Š: "S",
  ū: "u", Ū: "U",
  ž: "z", Ž: "Z",
};

function transliterate(value: string): string {
  return value
    .split("")
    .map((char) => LATVIAN_DIACRITICS[char] ?? char)
    .join("");
}

function slugifyForFilename(value: string): string {
  return transliterate(value)
    .trim()
    // Strip characters illegal in filenames, plus the double quote: it would otherwise
    // break out of the quoted filename="..." value in the Content-Disposition header.
    .replace(/["\\/:*?<>|]/g, "")
    .replace(/\s+/g, "_");
}

export function buildPdfFileName(answers: Record<string, unknown>): string {
  const roleLabel = getPartyRoleLabel(answers.role, answers.dealType);
  const name = getPartyName(answers);
  const address = typeof answers.address === "string" ? answers.address : "";

  const parts = [roleLabel, name, address].filter(Boolean).map(slugifyForFilename);

  return parts.length > 0 ? `${parts.join("_")}.pdf` : "anketa.pdf";
}
