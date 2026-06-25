import { z } from "zod";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

export const LinkPayloadSchema = z.object({
  v: z.literal(1),
  clientType: z.enum(["individual", "legal"]),
  company: z.enum(["EKOCENTRS", "SUN_RAIN"]),
  address: z.string(),
  dealType: z.enum(["sale", "purchase", "rent", "lease"]),
  role: z.enum(["client", "partner"]),
});

export type LinkPayload = z.infer<typeof LinkPayloadSchema>;

export function encodeLinkPayload(payload: LinkPayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeLinkPayload(encoded: string): LinkPayload {
  const json = decompressFromEncodedURIComponent(encoded);
  if (!json) {
    throw new Error("Could not decode link payload: invalid or corrupted data");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error("Could not decode link payload: invalid JSON");
  }

  return LinkPayloadSchema.parse(raw);
}
