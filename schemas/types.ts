export type Answers = Record<string, unknown>;

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "email"
  | "tel"
  | "select"
  | "radio"
  | "checkbox"
  | "checkboxGroup";

export type FieldOption = {
  value: string;
  label: string;
};

export type FieldDef = {
  id: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  required?: boolean | ((answers: Answers) => boolean);
  visibleIf?: (answers: Answers) => boolean;
};

export type StepDef = {
  id: string;
  title: string;
  fields: FieldDef[];
};

export type QuestionnaireSchema = {
  id: "individual" | "legal";
  steps: StepDef[];
};

export function getField(schema: QuestionnaireSchema, id: string): FieldDef | undefined {
  for (const step of schema.steps) {
    const field = step.fields.find((f) => f.id === id);
    if (field) return field;
  }
  return undefined;
}

export function getAllFieldIds(schema: QuestionnaireSchema): string[] {
  return schema.steps.flatMap((step) => step.fields.map((f) => f.id));
}
