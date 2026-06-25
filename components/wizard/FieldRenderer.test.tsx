import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { FieldRenderer } from "./FieldRenderer";
import type { FieldDef } from "@/schemas/types";

function renderField(field: FieldDef) {
  function Harness() {
    const methods = useForm();
    return (
      <FormProvider {...methods}>
        <FieldRenderer field={field} />
      </FormProvider>
    );
  }
  return render(<Harness />);
}

describe("FieldRenderer", () => {
  it("renders a text field accessible by its label and accepts typed input", () => {
    renderField({ id: "firstName", label: "Vārds", type: "text" });
    const input = screen.getByLabelText("Vārds") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Jānis" } });
    expect(input.value).toBe("Jānis");
  });

  it("renders a select field with the given options", () => {
    renderField({
      id: "idDocumentType",
      label: "Personas apliecinoša dokumenta veids",
      type: "select",
      options: [
        { value: "passport", label: "Pase" },
        { value: "id_card", label: "ID karte" },
      ],
    });
    const select = screen.getByLabelText("Personas apliecinoša dokumenta veids") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "id_card" } });
    expect(select.value).toBe("id_card");
  });

  it("renders radio options as individually selectable radio inputs", () => {
    renderField({
      id: "isPep",
      label: "Esmu PNP",
      type: "radio",
      options: [
        { value: "yes", label: "Jā" },
        { value: "no", label: "Nē" },
      ],
    });
    const yesOption = screen.getByRole("radio", { name: "Jā" });
    fireEvent.click(yesOption);
    expect(yesOption).toBeChecked();
  });

  it("renders a single checkbox toggled by its label", () => {
    renderField({
      id: "truthfulInfoCommitment",
      label: "Apliecinu, ka ziņas ir patiesas",
      type: "checkbox",
    });
    const checkbox = screen.getByLabelText("Apliecinu, ka ziņas ir patiesas") as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("renders a checkbox group as individually selectable checkboxes", () => {
    renderField({
      id: "sourceOfFunds",
      label: "Līdzekļu izcelsmes avots",
      type: "checkboxGroup",
      options: [
        { value: "salary", label: "darba alga" },
        { value: "other", label: "cits" },
      ],
    });
    const salary = screen.getByRole("checkbox", { name: "darba alga" });
    const other = screen.getByRole("checkbox", { name: "cits" });
    fireEvent.click(salary);
    expect(salary).toBeChecked();
    expect(other).not.toBeChecked();
  });
});
