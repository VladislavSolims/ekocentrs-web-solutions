import type { LinkPayload } from "./linkPayload";

const DOCUMENT_TITLES: Record<LinkPayload["role"], string> = {
  client: "Klienta identifikācijas un izpētes anketa",
  partner: "Klienta darījuma partnera identifikācijas un izpētes anketa",
};

export function getDocumentTitle(role: unknown): string {
  return typeof role === "string" && role in DOCUMENT_TITLES
    ? DOCUMENT_TITLES[role as LinkPayload["role"]]
    : DOCUMENT_TITLES.client;
}
