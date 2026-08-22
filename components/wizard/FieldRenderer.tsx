"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { Answers, FieldDef } from "@/schemas/types";
import { validateField } from "@/schemas/validation";
import { DatePicker } from "./DatePicker";

const labelClass = "block text-sm font-medium text-slate-700 mb-1";
const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";
const optionRowClass = "flex items-center gap-2 text-sm text-slate-700";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="mt-1 text-sm text-red-600">
      {message}
    </p>
  );
}

export function FieldRenderer({ field }: { field: FieldDef }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  // The whole set of answers is passed in by react-hook-form, so a field whose
  // requirement depends on another answer (or which is hidden entirely) is judged
  // against what the client has actually filled in so far.
  const rules = {
    validate: (value: unknown, answers: Answers) => validateField(field, value, answers),
  };

  const error = errors[field.id]?.message;
  const message = typeof error === "string" ? error : undefined;

  switch (field.type) {
    case "text":
    case "email":
    case "tel":
    case "number":
      return (
        <div className="mb-4">
          <label htmlFor={field.id} className={labelClass}>
            {field.label}
          </label>
          <input
            id={field.id}
            type={field.type}
            className={inputClass}
            aria-invalid={message ? true : undefined}
            {...register(field.id, rules)}
          />
          <FieldError message={message} />
        </div>
      );

    case "date":
      // A native <input type="date"> renders its calendar/format in the browser's own
      // UI language (especially in Chrome, regardless of the page's lang="lv"), which
      // would show e.g. Russian month names to a Latvian-language form. Our own calendar
      // (react-day-picker, forced to the "lv" locale) keeps the picker and the typed
      // format consistent for every client, regardless of their browser/OS language.
      return (
        <div className="mb-4">
          <label htmlFor={field.id} className={labelClass}>
            {field.label}
          </label>
          <Controller
            name={field.id}
            control={control}
            rules={rules}
            render={({ field: { value, onChange } }) => (
              <DatePicker id={field.id} value={typeof value === "string" ? value : ""} onChange={onChange} />
            )}
          />
          <FieldError message={message} />
        </div>
      );

    case "textarea":
      return (
        <div className="mb-4">
          <label htmlFor={field.id} className={labelClass}>
            {field.label}
          </label>
          <textarea
            id={field.id}
            className={`${inputClass} min-h-24`}
            aria-invalid={message ? true : undefined}
            {...register(field.id, rules)}
          />
          <FieldError message={message} />
        </div>
      );

    case "select":
      return (
        <div className="mb-4">
          <label htmlFor={field.id} className={labelClass}>
            {field.label}
          </label>
          <select
            id={field.id}
            defaultValue=""
            className={inputClass}
            aria-invalid={message ? true : undefined}
            {...register(field.id, rules)}
          >
            <option value="" disabled />
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FieldError message={message} />
        </div>
      );

    case "radio":
      return (
        <fieldset data-testid={field.id} className="mb-4 rounded-md border border-slate-200 bg-white p-4">
          <legend className="mb-2 text-sm font-medium text-slate-700">{field.label}</legend>
          <div className="flex flex-col gap-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className={optionRowClass}>
                <input
                  type="radio"
                  value={opt.value}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-600"
                  {...register(field.id, rules)}
                />
                {opt.label}
              </label>
            ))}
          </div>
          <FieldError message={message} />
        </fieldset>
      );

    case "checkbox":
      return (
        <div className="mb-4">
          <label data-testid={field.id} className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              aria-invalid={message ? true : undefined}
              {...register(field.id, rules)}
            />
            {field.label}
          </label>
          <FieldError message={message} />
        </div>
      );

    case "checkboxGroup":
      return (
        <fieldset data-testid={field.id} className="mb-4 rounded-md border border-slate-200 bg-white p-4">
          <legend className="mb-2 text-sm font-medium text-slate-700">{field.label}</legend>
          <div className="flex flex-col gap-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className={optionRowClass}>
                <input
                  type="checkbox"
                  value={opt.value}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  {...register(field.id, rules)}
                />
                {opt.label}
              </label>
            ))}
          </div>
          <FieldError message={message} />
        </fieldset>
      );
  }
}
