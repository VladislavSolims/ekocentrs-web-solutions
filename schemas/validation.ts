/**
 * Whether an answer satisfies the field that asked for it.
 *
 * The schemas mark fields `required`, and this is what gives that flag teeth.
 * The rules live here as plain functions rather than inside the form components,
 * so the wizard and the field renderer agree on what "answered" means.
 */
import type { Answers, FieldDef } from "./types";

export const REQUIRED_TEXT_MESSAGE = "Šis lauks ir obligāts";
export const REQUIRED_CHOICE_MESSAGE = "Lūdzu, izvēlieties vienu variantu";
export const REQUIRED_GROUP_MESSAGE = "Lūdzu, izvēlieties vismaz vienu variantu";
export const REQUIRED_CHECK_MESSAGE = "Lai turpinātu, šī atzīme ir jāapstiprina";

export function isFieldVisible(field: FieldDef, answers: Answers): boolean {
  return !field.visibleIf || field.visibleIf(answers);
}

/**
 * A field the client never sees cannot be required of them — otherwise the
 * wizard would refuse to move on for a reason nobody can act on.
 */
export function isFieldRequired(field: FieldDef, answers: Answers): boolean {
  if (!isFieldVisible(field, answers)) return false;
  if (typeof field.required === "function") return field.required(answers);

  return field.required === true;
}

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;

  // A number stays an answer even when it is 0.
  return false;
}

/** @returns true when the answer passes, otherwise the message to show the client. */
export function validateField(field: FieldDef, value: unknown, answers: Answers): true | string {
  if (!isFieldRequired(field, answers)) return true;

  switch (field.type) {
    case "checkbox":
      // These are confirmations and consents — an unticked box is a "no", not a blank.
      return value === true ? true : REQUIRED_CHECK_MESSAGE;

    case "checkboxGroup":
      return isBlank(value) ? REQUIRED_GROUP_MESSAGE : true;

    case "radio":
    case "select":
      return isBlank(value) ? REQUIRED_CHOICE_MESSAGE : true;

    default:
      return isBlank(value) ? REQUIRED_TEXT_MESSAGE : true;
  }
}
