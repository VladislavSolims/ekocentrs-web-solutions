import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { StepRenderer } from "./StepRenderer";
import type { StepDef } from "@/schemas/types";

function renderStep(step: StepDef, defaultValues: Record<string, unknown> = {}) {
  function Harness() {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        <StepRenderer step={step} />
      </FormProvider>
    );
  }
  return render(<Harness />);
}

const step: StepDef = {
  id: "step-1",
  title: "Informācija par klientu",
  fields: [
    { id: "wantsExtra", label: "Vēlos papildu lauku", type: "checkbox" },
    {
      id: "extraDetail",
      label: "Papildu informācija",
      type: "text",
      visibleIf: (a) => a.wantsExtra === true,
    },
  ],
};

describe("StepRenderer", () => {
  it("renders the step title", () => {
    renderStep(step);
    expect(screen.getByText("Informācija par klientu")).toBeInTheDocument();
  });

  it("hides fields whose visibleIf condition is not met", () => {
    renderStep(step);
    expect(screen.queryByLabelText("Papildu informācija")).not.toBeInTheDocument();
  });

  it("reveals a conditional field once its visibleIf condition becomes true", () => {
    renderStep(step);
    const checkbox = screen.getByLabelText("Vēlos papildu lauku");
    fireEvent.click(checkbox);
    expect(screen.getByLabelText("Papildu informācija")).toBeInTheDocument();
  });
});
