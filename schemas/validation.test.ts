import { describe, it, expect } from "vitest";
import {
  isFieldRequired,
  validateField,
  REQUIRED_TEXT_MESSAGE,
  REQUIRED_CHOICE_MESSAGE,
  REQUIRED_GROUP_MESSAGE,
  REQUIRED_CHECK_MESSAGE,
} from "./validation";
import type { FieldDef } from "./types";

const text: FieldDef = { id: "firstName", label: "Vārds", type: "text", required: true };
const optional: FieldDef = { id: "note", label: "Piezīme", type: "text" };

describe("isFieldRequired", () => {
  it("reads a plain boolean", () => {
    expect(isFieldRequired(text, {})).toBe(true);
    expect(isFieldRequired(optional, {})).toBe(false);
  });

  it("asks the function when required depends on other answers", () => {
    const field: FieldDef = {
      id: "signatureName",
      label: "Vārds, uzvārds",
      type: "text",
      required: (a) => a.signingMethod === "electronic",
    };

    expect(isFieldRequired(field, { signingMethod: "electronic" })).toBe(true);
    expect(isFieldRequired(field, { signingMethod: "handwritten" })).toBe(false);
  });

  it("treats a field the client cannot see as not required", () => {
    const hidden: FieldDef = {
      id: "pepPosition",
      label: "Amats",
      type: "text",
      required: true,
      visibleIf: (a) => a.isPep === "yes",
    };

    expect(isFieldRequired(hidden, { isPep: "no" })).toBe(false);
    expect(isFieldRequired(hidden, { isPep: "yes" })).toBe(true);
  });
});

describe("validateField", () => {
  it("accepts anything in an optional field", () => {
    expect(validateField(optional, "", {})).toBe(true);
    expect(validateField(optional, undefined, {})).toBe(true);
  });

  it("rejects an empty required text field", () => {
    expect(validateField(text, "", {})).toBe(REQUIRED_TEXT_MESSAGE);
    expect(validateField(text, "   ", {})).toBe(REQUIRED_TEXT_MESSAGE);
    expect(validateField(text, undefined, {})).toBe(REQUIRED_TEXT_MESSAGE);
    expect(validateField(text, "Jānis", {})).toBe(true);
  });

  it("keeps zero as a real answer in a number field", () => {
    const amount: FieldDef = { id: "amount", label: "Summa", type: "number", required: true };

    expect(validateField(amount, 0, {})).toBe(true);
    expect(validateField(amount, "0", {})).toBe(true);
    expect(validateField(amount, "", {})).toBe(REQUIRED_TEXT_MESSAGE);
  });

  it("asks for a choice in a radio field", () => {
    const radio: FieldDef = {
      id: "isPep",
      label: "Vai esat PEP?",
      type: "radio",
      required: true,
      options: [
        { value: "yes", label: "Jā" },
        { value: "no", label: "Nē" },
      ],
    };

    expect(validateField(radio, undefined, {})).toBe(REQUIRED_CHOICE_MESSAGE);
    expect(validateField(radio, "no", {})).toBe(true);
  });

  it("asks for at least one option in a checkbox group", () => {
    const group: FieldDef = {
      id: "sourceOfFunds",
      label: "Līdzekļu izcelsmes avots",
      type: "checkboxGroup",
      required: true,
      options: [{ value: "salary", label: "darba alga" }],
    };

    expect(validateField(group, [], {})).toBe(REQUIRED_GROUP_MESSAGE);
    expect(validateField(group, undefined, {})).toBe(REQUIRED_GROUP_MESSAGE);
    expect(validateField(group, ["salary"], {})).toBe(true);
  });

  it("insists that a required consent checkbox is actually ticked", () => {
    const consent: FieldDef = {
      id: "truthfulInfoCommitment",
      label: "Apliecinu, ka sniegtā informācija ir patiesa",
      type: "checkbox",
      required: true,
    };

    expect(validateField(consent, false, {})).toBe(REQUIRED_CHECK_MESSAGE);
    expect(validateField(consent, undefined, {})).toBe(REQUIRED_CHECK_MESSAGE);
    expect(validateField(consent, true, {})).toBe(true);
  });

  it("does not block on a required field the client cannot see", () => {
    const hidden: FieldDef = {
      id: "pepPosition",
      label: "Amats",
      type: "text",
      required: true,
      visibleIf: (a) => a.isPep === "yes",
    };

    expect(validateField(hidden, "", { isPep: "no" })).toBe(true);
    expect(validateField(hidden, "", { isPep: "yes" })).toBe(REQUIRED_TEXT_MESSAGE);
  });
});
