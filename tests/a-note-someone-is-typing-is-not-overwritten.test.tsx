/**
 * The notes card refetches while somebody is typing into it.
 *
 * Both screens that carry a note poll: the booking page invalidates on every
 * edit, the patient card refetches on focus. A card that copies the server's
 * value into the textarea on every render deletes half a sentence the front
 * desk was in the middle of writing — the kind of thing nobody reports as a
 * bug, they just stop using the field.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { NotesCard } from "@/components/features/notes-card";

function card(value: string | null, onSave = vi.fn()) {
  return (
    <NotesCard
      title="Call notes"
      hint="hint"
      placeholder="placeholder"
      value={value}
      onSave={onSave}
    />
  );
}

describe("NotesCard", () => {
  it("keeps what is being typed when the same note arrives again", () => {
    const { rerender } = render(card("Upper left hurts."));
    const box = screen.getByPlaceholderText("placeholder") as HTMLTextAreaElement;

    fireEvent.change(box, { target: { value: "Upper left hurts. Cold only." } });
    rerender(card("Upper left hurts.")); // a refetch lands mid-edit

    expect(box.value).toBe("Upper left hurts. Cold only.");
  });

  it("shows a note that arrives after the first render", () => {
    const { rerender } = render(card(null)); // still loading
    rerender(card("Her daughter drives her."));

    expect(
      (screen.getByPlaceholderText("placeholder") as HTMLTextAreaElement).value
    ).toBe("Her daughter drives her.");
  });

  it("offers Save only once something changed, and saves trimmed text", () => {
    const onSave = vi.fn();
    render(card("Upper left hurts.", onSave));
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();

    fireEvent.change(screen.getByPlaceholderText("placeholder"), {
      target: { value: "  Lower left, not upper.  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith("Lower left, not upper.");
  });
});
