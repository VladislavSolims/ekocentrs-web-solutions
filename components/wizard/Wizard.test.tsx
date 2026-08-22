import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Wizard } from "./Wizard";
import type { QuestionnaireSchema } from "@/schemas/types";
import {
  REQUIRED_TEXT_MESSAGE,
  REQUIRED_CHOICE_MESSAGE,
  REQUIRED_CHECK_MESSAGE,
} from "@/schemas/validation";

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

  it("advances to the next step when 'wantsExtra' is yes", async () => {
    render(<Wizard schema={schema} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: "Jā" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    expect(await screen.findByText("Otrais solis (nosacīts)")).toBeInTheDocument();
  });

  it("skips the conditional step entirely when 'wantsExtra' is no", async () => {
    render(<Wizard schema={schema} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    expect(await screen.findByText("Trešais solis")).toBeInTheDocument();
    expect(screen.queryByText("Otrais solis (nosacīts)")).not.toBeInTheDocument();
  });

  it("goes back to the previous step", async () => {
    render(<Wizard schema={schema} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    expect(await screen.findByText("Trešais solis")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Atpakaļ" }));
    expect(await screen.findByText("Pirmais solis")).toBeInTheDocument();
  });

  it("calls onComplete with the collected answers on the last step", async () => {
    const onComplete = vi.fn();
    render(<Wizard schema={schema} onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText("Vārds"), { target: { value: "Jānis" } });
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    fireEvent.change(await screen.findByLabelText("Komentārs"), { target: { value: "labi" } });
    fireEvent.click(screen.getByRole("button", { name: "Pabeigt" }));

    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Jānis", wantsExtra: "no", comment: "labi" })
      )
    );
  });

  it("merges pre-filled context (e.g. from the link) with the form answers", async () => {
    const onComplete = vi.fn();
    render(<Wizard schema={schema} context={{ company: "EKOCENTRS" }} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    fireEvent.click(await screen.findByRole("button", { name: "Pabeigt" }));
    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ company: "EKOCENTRS" }))
    );
  });
});


const requiredSchema: QuestionnaireSchema = {
  id: "individual",
  steps: [
    {
      id: "identity",
      title: "Identitāte",
      fields: [
        { id: "firstName", label: "Vārds", type: "text", required: true },
        { id: "nickname", label: "Iesauka", type: "text" },
        {
          id: "isPep",
          label: "Vai esat PEP?",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Jā" },
            { value: "no", label: "Nē" },
          ],
        },
        {
          id: "pepPosition",
          label: "Amats",
          type: "text",
          required: true,
          visibleIf: (a) => a.isPep === "yes",
        },
      ],
    },
    {
      id: "consent",
      title: "Piekrišana",
      fields: [
        {
          id: "truthfulInfoCommitment",
          label: "Apliecinu, ka sniegtā informācija ir patiesa",
          type: "checkbox",
          required: true,
        },
      ],
    },
  ],
};

describe("Wizard required fields", () => {
  it("refuses to move on while a required field is empty, and says which", async () => {
    render(<Wizard schema={requiredSchema} onComplete={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));

    expect(await screen.findByText(REQUIRED_TEXT_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText(REQUIRED_CHOICE_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText("Identitāte")).toBeInTheDocument();
    expect(screen.queryByText("Piekrišana")).not.toBeInTheDocument();
  });

  it("does not complain about an optional field left blank", async () => {
    render(<Wizard schema={requiredSchema} onComplete={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    await screen.findByText(REQUIRED_TEXT_MESSAGE);

    expect(screen.getAllByText(REQUIRED_TEXT_MESSAGE)).toHaveLength(1);
  });

  it("moves on once the required fields are answered", async () => {
    render(<Wizard schema={requiredSchema} onComplete={() => {}} />);

    fireEvent.change(screen.getByLabelText("Vārds"), { target: { value: "Jānis" } });
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));

    expect(await screen.findByText("Piekrišana")).toBeInTheDocument();
  });

  it("clears the message as soon as the client fills the field in", async () => {
    render(<Wizard schema={requiredSchema} onComplete={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));
    await screen.findByText(REQUIRED_TEXT_MESSAGE);

    fireEvent.change(screen.getByLabelText("Vārds"), { target: { value: "Jānis" } });

    await waitFor(() => expect(screen.queryByText(REQUIRED_TEXT_MESSAGE)).not.toBeInTheDocument());
  });

  it("does not block on a required field the client cannot see", async () => {
    render(<Wizard schema={requiredSchema} onComplete={() => {}} />);

    fireEvent.change(screen.getByLabelText("Vārds"), { target: { value: "Jānis" } });
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));

    // "Amats" is only asked of a PEP, so it must not hold the client back.
    expect(await screen.findByText("Piekrišana")).toBeInTheDocument();
  });

  it("asks a PEP for the position it hid from everyone else", async () => {
    render(<Wizard schema={requiredSchema} onComplete={() => {}} />);

    fireEvent.change(screen.getByLabelText("Vārds"), { target: { value: "Jānis" } });
    fireEvent.click(screen.getByRole("radio", { name: "Jā" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));

    expect(await screen.findByText(REQUIRED_TEXT_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText("Identitāte")).toBeInTheDocument();
  });

  it("will not finish the questionnaire with an unticked consent", async () => {
    const onComplete = vi.fn();
    render(<Wizard schema={requiredSchema} onComplete={onComplete} />);

    fireEvent.change(screen.getByLabelText("Vārds"), { target: { value: "Jānis" } });
    fireEvent.click(screen.getByRole("radio", { name: "Nē" }));
    fireEvent.click(screen.getByRole("button", { name: "Tālāk" }));

    fireEvent.click(await screen.findByRole("button", { name: "Pabeigt" }));

    expect(await screen.findByText(REQUIRED_CHECK_MESSAGE)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Pabeigt" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalled());
  });
});
