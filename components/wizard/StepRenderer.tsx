"use client";

import { useFormContext } from "react-hook-form";
import type { StepDef } from "@/schemas/types";
import { FieldRenderer } from "./FieldRenderer";

export function StepRenderer({ step }: { step: StepDef }) {
  const { watch } = useFormContext();
  const answers = watch();

  const visibleFields = step.fields.filter((f) => !f.visibleIf || f.visibleIf(answers));

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{step.title}</h2>
      {visibleFields.map((field) => (
        <FieldRenderer key={field.id} field={field} />
      ))}
    </div>
  );
}
