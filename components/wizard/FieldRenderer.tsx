"use client";

import { useFormContext } from "react-hook-form";
import type { FieldDef } from "@/schemas/types";

const labelClass = "block text-sm font-medium text-slate-700 mb-1";
const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";
const optionRowClass = "flex items-center gap-2 text-sm text-slate-700";

export function FieldRenderer({ field }: { field: FieldDef }) {
  const { register } = useFormContext();

  switch (field.type) {
    case "text":
    case "email":
    case "tel":
    case "date":
    case "number":
      return (
        <div className="mb-4">
          <label htmlFor={field.id} className={labelClass}>
            {field.label}
          </label>
          <input id={field.id} type={field.type} className={inputClass} {...register(field.id)} />
        </div>
      );

    case "textarea":
      return (
        <div className="mb-4">
          <label htmlFor={field.id} className={labelClass}>
            {field.label}
          </label>
          <textarea id={field.id} className={`${inputClass} min-h-24`} {...register(field.id)} />
        </div>
      );

    case "select":
      return (
        <div className="mb-4">
          <label htmlFor={field.id} className={labelClass}>
            {field.label}
          </label>
          <select id={field.id} defaultValue="" className={inputClass} {...register(field.id)}>
            <option value="" disabled />
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
                  {...register(field.id)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      );

    case "checkbox":
      return (
        <label data-testid={field.id} className="mb-4 flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            {...register(field.id)}
          />
          {field.label}
        </label>
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
                  {...register(field.id)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      );
  }
}
