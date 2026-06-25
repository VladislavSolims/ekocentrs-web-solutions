import type { FieldDef } from "./types";

export function formatFieldValue(field: FieldDef, value: unknown): string {
  if (value == null || value === "") return "—";

  if (field.type === "checkbox") {
    return value ? "Jā" : "Nē";
  }

  if (field.type === "checkboxGroup" && Array.isArray(value)) {
    return value
      .map((v) => field.options?.find((o) => o.value === v)?.label ?? String(v))
      .join(", ");
  }

  if ((field.type === "radio" || field.type === "select") && field.options) {
    return field.options.find((o) => o.value === value)?.label ?? String(value);
  }

  return String(value);
}
