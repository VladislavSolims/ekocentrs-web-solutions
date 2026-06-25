import type { Answers, QuestionnaireSchema } from "@/schemas/types";
import { formatFieldValue } from "@/schemas/formatFieldValue";
import { COMPANIES, type CompanyKey } from "@/config/companies";
import { LEGAL_DEFINITIONS_LV } from "@/content/legalDefinitions";
import { DEAL_TYPE_LABELS } from "@/lib/dealTypeLabels";
import { getDocumentTitle } from "@/lib/documentTitle";

function getDealTypeLabel(dealType: unknown): string | undefined {
  return typeof dealType === "string" && dealType in DEAL_TYPE_LABELS
    ? DEAL_TYPE_LABELS[dealType as keyof typeof DEAL_TYPE_LABELS]
    : undefined;
}

function QuestionAnswer({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="mb-3">
      <dt className="text-xs font-medium text-slate-500">{question}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{answer}</dd>
    </div>
  );
}

export function DocumentTemplate({
  schema,
  answers,
  company,
}: {
  schema: QuestionnaireSchema;
  answers: Answers;
  company: CompanyKey;
}) {
  const companyInfo = COMPANIES[company];
  const dealTypeLabel = getDealTypeLabel(answers.dealType);

  return (
    <article className="text-slate-800">
      <h1 className="text-xl font-semibold text-slate-900">{getDocumentTitle(answers.role)}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {companyInfo.legalName}, reģistrācijas numurs {companyInfo.regNr}
      </p>
      {(answers.address || dealTypeLabel) && (
        <section className="mt-6 border-t border-slate-200 pt-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Darījuma objekts
          </h2>
          <dl>
            {answers.address ? <QuestionAnswer question="Adrese" answer={String(answers.address)} /> : null}
            {dealTypeLabel ? <QuestionAnswer question="Darījuma veids" answer={dealTypeLabel} /> : null}
          </dl>
        </section>
      )}
      {schema.steps.map((step) => {
        const visibleFields = step.fields.filter((f) => !f.visibleIf || f.visibleIf(answers));
        if (visibleFields.length === 0) return null;
        return (
          <section key={step.id} className="mt-6 border-t border-slate-200 pt-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{step.title}</h2>
            <dl>
              {visibleFields.map((field) => (
                <QuestionAnswer
                  key={field.id}
                  question={field.label}
                  answer={formatFieldValue(field, answers[field.id])}
                />
              ))}
            </dl>
          </section>
        );
      })}
      {answers.signingMethod === "handwritten" && (
        <section data-testid="handwritten-signature" className="mt-6 border-t border-slate-200 pt-4">
          <div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <div className="h-10 border-b border-slate-400" />
              <p className="mt-1 text-xs text-slate-500">Vārds, uzvārds</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400" />
              <p className="mt-1 text-xs text-slate-500">Paraksts</p>
            </div>
          </div>
        </section>
      )}
      <footer
        className="mt-8 border-t border-slate-200 pt-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-400"
      >
        {LEGAL_DEFINITIONS_LV}
      </footer>
    </article>
  );
}
