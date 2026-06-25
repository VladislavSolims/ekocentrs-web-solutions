import { describe, it, expect } from "vitest";
import { renderDocumentHtml } from "./renderDocumentHtml";
import type { QuestionnaireSchema } from "@/schemas/types";

const schema: QuestionnaireSchema = {
  id: "individual",
  steps: [
    {
      id: "step-1",
      title: "Informācija par klientu",
      fields: [{ id: "firstName", label: "Vārds", type: "text" }],
    },
  ],
};

describe("renderDocumentHtml", () => {
  it("includes the company legal name, registration number and field values", () => {
    const html = renderDocumentHtml(schema, { firstName: "Jānis" }, "SUN_RAIN");
    expect(html).toContain("SUN RAIN");
    expect(html).toContain("40103157437");
    expect(html).toContain("Jānis");
  });

  it("escapes HTML-significant characters in user-supplied values", () => {
    const html = renderDocumentHtml(schema, { firstName: "<script>alert(1)</script>" }, "EKOCENTRS");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes the transaction object (address and deal type) from the link payload", () => {
    const html = renderDocumentHtml(
      schema,
      { address: "Rīga, Brīvības iela 1", dealType: "sale" },
      "EKOCENTRS"
    );
    expect(html).toContain("Darījuma objekts");
    expect(html).toContain("Rīga, Brīvības iela 1");
    expect(html).toContain("NĪ pārdošana");
  });

  it("titles the document for the Client by default", () => {
    const html = renderDocumentHtml(schema, {}, "EKOCENTRS");
    expect(html).toContain("<h1>Klienta identifikācijas un izpētes anketa</h1>");
  });

  it("titles the document for the transaction Partner when role is 'partner'", () => {
    const html = renderDocumentHtml(schema, { role: "partner" }, "EKOCENTRS");
    expect(html).toContain("<h1>Klienta darījuma partnera identifikācijas un izpētes anketa</h1>");
  });

  it("includes a blank handwritten signature area when signing method is 'handwritten'", () => {
    const html = renderDocumentHtml(schema, { signingMethod: "handwritten" }, "EKOCENTRS");
    expect(html).toContain("signature-area");
  });

  it("does not include the handwritten signature area when signing electronically", () => {
    const html = renderDocumentHtml(schema, { signingMethod: "electronic" }, "EKOCENTRS");
    expect(html).not.toContain("signature-area");
  });
});
