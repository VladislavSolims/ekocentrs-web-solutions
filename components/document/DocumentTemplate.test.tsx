import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocumentTemplate } from "./DocumentTemplate";
import type { QuestionnaireSchema } from "@/schemas/types";

const schema: QuestionnaireSchema = {
  id: "individual",
  steps: [
    {
      id: "step-1",
      title: "Informācija par klientu",
      fields: [
        { id: "firstName", label: "Vārds", type: "text" },
        {
          id: "isPep",
          label: "Esmu PNP",
          type: "radio",
          options: [
            { value: "yes", label: "Jā" },
            { value: "no", label: "Nē" },
          ],
        },
        { id: "agreesToTerms", label: "Piekrītu noteikumiem", type: "checkbox" },
        {
          id: "sourceOfFunds",
          label: "Līdzekļu izcelsmes avots",
          type: "checkboxGroup",
          options: [
            { value: "salary", label: "darba alga" },
            { value: "other", label: "cits" },
          ],
        },
        {
          id: "hiddenField",
          label: "Šo nedrīkst redzēt",
          type: "text",
          visibleIf: () => false,
        },
      ],
    },
  ],
};

describe("DocumentTemplate", () => {
  it("renders the broker company's legal name and registration number", () => {
    render(<DocumentTemplate schema={schema} answers={{}} company="EKOCENTRS" />);
    expect(screen.getByText(/EKOCENTRS/)).toBeInTheDocument();
    expect(screen.getByText(/40003404760/)).toBeInTheDocument();
  });

  it("renders a plain text field's label and value as separate question/answer elements", () => {
    render(<DocumentTemplate schema={schema} answers={{ firstName: "Jānis" }} company="EKOCENTRS" />);
    expect(screen.getByText("Vārds")).toBeInTheDocument();
    expect(screen.getByText("Jānis")).toBeInTheDocument();
  });

  it("renders a radio field's value as its option label, not its raw value", () => {
    render(<DocumentTemplate schema={schema} answers={{ isPep: "yes" }} company="EKOCENTRS" />);
    expect(screen.getByText("Jā")).toBeInTheDocument();
  });

  it("renders a checkbox value as Jā/Nē", () => {
    render(<DocumentTemplate schema={schema} answers={{ agreesToTerms: true }} company="EKOCENTRS" />);
    expect(screen.getByText("Piekrītu noteikumiem")).toBeInTheDocument();
    expect(screen.getAllByText("Jā").length).toBeGreaterThan(0);
  });

  it("renders a checkboxGroup value as a joined list of option labels", () => {
    render(
      <DocumentTemplate
        schema={schema}
        answers={{ sourceOfFunds: ["salary", "other"] }}
        company="EKOCENTRS"
      />
    );
    expect(screen.getByText("darba alga, cits")).toBeInTheDocument();
  });

  it("never renders a field whose visibleIf returns false", () => {
    render(<DocumentTemplate schema={schema} answers={{}} company="EKOCENTRS" />);
    expect(screen.queryByText("Šo nedrīkst redzēt")).not.toBeInTheDocument();
  });

  it("includes the static legal definitions footer", () => {
    render(<DocumentTemplate schema={schema} answers={{}} company="EKOCENTRS" />);
    expect(screen.getByText(/Politiski nozīmīga persona/)).toBeInTheDocument();
  });

  it("renders the transaction object (address and deal type) from the link payload", () => {
    render(
      <DocumentTemplate
        schema={schema}
        answers={{ address: "Rīga, Brīvības iela 1", dealType: "sale" }}
        company="EKOCENTRS"
      />
    );
    expect(screen.getByText("Rīga, Brīvības iela 1")).toBeInTheDocument();
    expect(screen.getByText("NĪ pārdošana")).toBeInTheDocument();
  });

  it("titles the document for the Client by default", () => {
    render(<DocumentTemplate schema={schema} answers={{}} company="EKOCENTRS" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Klienta identifikācijas un izpētes anketa" })
    ).toBeInTheDocument();
  });

  it("titles the document for the transaction Partner when role is 'partner'", () => {
    render(<DocumentTemplate schema={schema} answers={{ role: "partner" }} company="EKOCENTRS" />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Klienta darījuma partnera identifikācijas un izpētes anketa",
      })
    ).toBeInTheDocument();
  });

  it("shows a blank handwritten signature area when signing method is 'handwritten'", () => {
    render(<DocumentTemplate schema={schema} answers={{ signingMethod: "handwritten" }} company="EKOCENTRS" />);
    expect(screen.getByTestId("handwritten-signature")).toBeInTheDocument();
  });

  it("does not show the handwritten signature area when signing electronically", () => {
    render(<DocumentTemplate schema={schema} answers={{ signingMethod: "electronic" }} company="EKOCENTRS" />);
    expect(screen.queryByTestId("handwritten-signature")).not.toBeInTheDocument();
  });
});
