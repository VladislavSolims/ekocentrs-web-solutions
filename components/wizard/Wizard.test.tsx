import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Wizard } from "./Wizard";
import type { QuestionnaireSchema } from "@/schemas/types";

const schema: QuestionnaireSchema = {
  id: "individual",
  steps: [
    {
      id: "step-1",
      title: "Pirmais solis",
      fields: [
        { id: "name", label: "Vārds", type: "text" },
        {
          id: "wantsExtra",
          label: "Vēlos papildu soli",
          type: "radio",
          options: [
            { value: "yes", label: "Jā" },
            { value: "no", label: "Nē" },
          ],
        },
      ],
    },
    {
      id: "step-2",
      title: "Otrais solis (nosacīts)",
      fields: [
        {
          id: "extraDetail",
          label: "Papildu informācija",
          type: "text",
          visibleIf: (a) => a.wantsExtra === "yes",
        },
      ],
    },
    {
      id: "step-3",
      title: "Trešais solis",
      fields: [{ id: "comment", label: "Komentārs", type: "text" }],
    },
  ],
};

describe("Wizard", () => {
  it("shows the first step's title and fields", () => {
    render(<Wizard schema={schema} onComplete={() => {}} />);
    expect(screen.getByText("Pirmais solis")).toBeInTheDocument();
    expect(screen.getByLabelText("Vārds")).toBeInTheDocument();
  });

  it("advances to the next step when 'wantsExtra' is yes", () => {
    render(<Wizard schema={schema} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: "Jā" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    expect(screen.getByText("Otrais solis (nosacīts)")).toBeInTheDocument();
  });

  it("skips the conditional step entirely when 'wantsExtra' is no", () => {
    render(<Wizard schema={schema} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    expect(screen.queryByText("Otrais solis (nosacīts)")).not.toBeInTheDocument();
    expect(screen.getByText("Trešais solis")).toBeInTheDocument();
  });

  it("goes back to the previous step", () => {
    render(<Wizard schema={schema} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    expect(screen.getByText("Trešais solis")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Atpakaļ" }));
    expect(screen.getByText("Pirmais solis")).toBeInTheDocument();
  });

  it("calls onComplete with the collected answers on the last step", () => {
    const onComplete = vi.fn();
    render(<Wizard schema={schema} onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText("Vārds"), { target: { value: "Jānis" } });
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    fireEvent.change(screen.getByLabelText("Komentārs"), { target: { value: "labi" } });
    fireEvent.click(screen.getByRole("button", { name: "Pabeigt" }));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Jānis", wantsExtra: "no", comment: "labi" })
    );
  });

  it("merges pre-filled context (e.g. from the link) with the form answers", () => {
    const onComplete = vi.fn();
    render(<Wizard schema={schema} context={{ company: "EKOCENTRS" }} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    fireEvent.click(screen.getByRole("button", { name: "Pabeigt" }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ company: "EKOCENTRS" }));
  });
});
