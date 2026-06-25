"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { Answers, QuestionnaireSchema } from "@/schemas/types";
import { StepRenderer } from "./StepRenderer";

type WizardProps = {
  schema: QuestionnaireSchema;
  context?: Answers;
  onComplete: (answers: Answers) => void;
};

export function Wizard({ schema, context = {}, onComplete }: WizardProps) {
  const form = useForm({ defaultValues: context });
  const [stepIndex, setStepIndex] = useState(0);

  const liveAnswers = { ...context, ...form.watch() };
  const visibleSteps = schema.steps.filter((step) =>
    step.fields.some((field) => !field.visibleIf || field.visibleIf(liveAnswers))
  );

  const currentStep = visibleSteps[stepIndex];
  const isLastStep = stepIndex === visibleSteps.length - 1;

  function handleNext() {
    if (isLastStep) {
      onComplete({ ...context, ...form.getValues() });
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function handleBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  if (!currentStep) return null;

  const progressPercent = ((stepIndex + 1) / visibleSteps.length) * 100;

  return (
    <FormProvider {...form}>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="mb-2 text-sm text-slate-500">
            Solis {stepIndex + 1} no {visibleSteps.length}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <StepRenderer step={currentStep} />

        <div className="mt-6 flex justify-between border-t border-slate-100 pt-4">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Atpakaļ
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {isLastStep ? "Pabeigt" : "Tālāk"}
          </button>
        </div>
      </div>
    </FormProvider>
  );
}
