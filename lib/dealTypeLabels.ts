import type { LinkPayload } from "./linkPayload";

export const DEAL_TYPE_LABELS: Record<LinkPayload["dealType"], string> = {
  sale: "NĪ pārdošana",
  purchase: "NĪ iegāde",
  rent: "NĪ īre",
  lease: "NĪ noma",
};
