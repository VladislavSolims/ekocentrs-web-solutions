import type { Answers, QuestionnaireSchema } from "@/schemas/types";
import { formatFieldValue } from "@/schemas/formatFieldValue";
import { COMPANIES, type CompanyKey } from "@/config/companies";
import { LEGAL_DEFINITIONS_LV } from "@/content/legalDefinitions";
import { DEAL_TYPE_LABELS } from "@/lib/dealTypeLabels";
import { getDocumentTitle } from "@/lib/documentTitle";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getDealTypeLabel(dealType: unknown): string | undefined {
  return typeof dealType === "string" && dealType in DEAL_TYPE_LABELS
    ? DEAL_TYPE_LABELS[dealType as keyof typeof DEAL_TYPE_LABELS]
    : undefined;
}

function renderQuestionAnswer(question: string, answer: string): string {
  return `<div class="qa"><dt>${escapeHtml(question)}</dt><dd>${escapeHtml(answer)}</dd></div>`;
}

export function renderDocumentHtml(schema: QuestionnaireSchema, answers: Answers, company: CompanyKey): string {
  const companyInfo = COMPANIES[company];
  const dealTypeLabel = getDealTypeLabel(answers.dealType);

  const transactionObjectHtml =
    answers.address || dealTypeLabel
      ? `<section><h2>Darījuma objekts</h2><dl>${
          answers.address ? renderQuestionAnswer("Adrese", String(answers.address)) : ""
        }${dealTypeLabel ? renderQuestionAnswer("Darījuma veids", dealTypeLabel) : ""}</dl></section>`
      : "";

  const sectionsHtml = schema.steps
    .map((step) => {
      const visibleFields = step.fields.filter((f) => !f.visibleIf || f.visibleIf(answers));
      if (visibleFields.length === 0) return "";

      const fieldsHtml = visibleFields
        .map((field) => renderQuestionAnswer(field.label, formatFieldValue(field, answers[field.id])))
        .join("\n");

      return `<section><h2>${escapeHtml(step.title)}</h2><dl>${fieldsHtml}</dl></section>`;
    })
    .join("\n");

  const handwrittenSignatureHtml =
    answers.signingMethod === "handwritten"
      ? `<section class="signature-area">
          <div class="signature-line"><div class="signature-blank"></div><p>Vārds, uzvārds</p></div>
          <div class="signature-line"><div class="signature-blank"></div><p>Paraksts</p></div>
        </section>`
      : "";

  return `<article>
  <h1>${escapeHtml(getDocumentTitle(answers.role))}</h1>
  <p>${escapeHtml(companyInfo.legalName)}, reģistrācijas numurs ${escapeHtml(companyInfo.regNr)}</p>
  ${transactionObjectHtml}
  ${sectionsHtml}
  ${handwrittenSignatureHtml}
  <footer style="white-space: pre-wrap;">${escapeHtml(LEGAL_DEFINITIONS_LV)}</footer>
</article>`;
}
