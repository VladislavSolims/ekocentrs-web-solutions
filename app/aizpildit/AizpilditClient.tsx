"use client";

import { useState } from "react";
import { Wizard } from "@/components/wizard/Wizard";
import { DocumentTemplate } from "@/components/document/DocumentTemplate";
import { individualSchema } from "@/schemas/individualSchema";
import { legalSchema } from "@/schemas/legalSchema";
import type { LinkPayload } from "@/lib/linkPayload";
import { DEAL_TYPE_LABELS } from "@/lib/dealTypeLabels";
import type { Answers } from "@/schemas/types";

export function AizpilditClient({ payload }: { payload: LinkPayload }) {
  const schema = payload.clientType === "individual" ? individualSchema : legalSchema;
  const [answers, setAnswers] = useState<Answers | null>(null);

  if (!answers) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <span className="font-medium">{payload.address}</span>
          {" — "}
          {DEAL_TYPE_LABELS[payload.dealType]}
        </div>
        <Wizard schema={schema} context={payload} onComplete={setAnswers} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <DocumentTemplate schema={schema} answers={answers} company={payload.company} />
      </div>

      <form method="POST" action="/api/generate-pdf" className="mt-6">
        <input type="hidden" name="clientType" value={payload.clientType} />
        <input type="hidden" name="company" value={payload.company} />
        <input type="hidden" name="answers" value={JSON.stringify(answers)} />
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Lejupielādēt PDF
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Pēc lejupielādes, lūdzu, parakstiet dokumentu vietnē{" "}
        <a href="https://www.eparaksts.lv" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
          eParakstī
        </a>
        .
      </p>
    </main>
  );
}
