import { describe, expect, it } from "vitest";
import {
  canCollapseOnLeave,
  initialShellState,
  shouldCollapseOnEscape,
  transitionShell,
  type ShellState,
} from "./shellState";

const openState: ShellState = {
  ...initialShellState,
  phase: "expanded",
  expanded: true,
  revision: 1,
};

describe("shell interaction state", () => {
  it("opens, finishes the entrance transition and closes explicitly", () => {
    const opening = transitionShell(initialShellState, { type: "OPEN" });
    expect(opening).toMatchObject({ phase: "opening", expanded: true, revision: 1 });

    const expanded = transitionShell(opening, {
      type: "ANIMATION_FINISHED",
      phase: "opening",
      revision: opening.revision,
    });
    expect(expanded.phase).toBe("expanded");

    const closing = transitionShell(expanded, { type: "CLOSE", reason: "explicit" });
    expect(closing).toMatchObject({ phase: "closing", expanded: false, restoreFocus: true });
    expect(transitionShell(closing, { type: "CLOSE_FINISHED", revision: closing.revision }).phase).toBe("collapsed");
  });

  it("does not collapse a pinned island when the pointer leaves", () => {
    const pinned = transitionShell(openState, { type: "TOGGLE_PIN" });
    expect(pinned.pinned).toBe(true);
    expect(canCollapseOnLeave(pinned, false)).toBe(false);
    expect(transitionShell(pinned, { type: "CLOSE", reason: "pointer" })).toBe(pinned);
  });

  it("keeps the panel open while an interaction is in progress", () => {
    expect(canCollapseOnLeave(openState, true)).toBe(false);
    expect(canCollapseOnLeave(openState, false)).toBe(true);
  });

  it("Escape closes an unpinned deck, while blur preserves pinning", () => {
    const pinned = transitionShell(openState, { type: "TOGGLE_PIN" });
    const escaped = transitionShell(openState, { type: "CLOSE", reason: "escape" });
    expect(escaped).toMatchObject({ phase: "closing", expanded: false, pinned: false, restoreFocus: true });

    const blurred = transitionShell(pinned, { type: "CLOSE", reason: "blur" });
    expect(blurred).toBe(pinned);
    expect(transitionShell(pinned, { type: "CLOSE", reason: "escape" })).toBe(pinned);
  });

  it("handles Escape only for an expanded, unpinned deck with no competing owner", () => {
    expect(shouldCollapseOnEscape(openState)).toBe(true);
    expect(shouldCollapseOnEscape(initialShellState)).toBe(false);
    expect(shouldCollapseOnEscape({ ...openState, pinned: true })).toBe(false);
    expect(shouldCollapseOnEscape(openState, { defaultPrevented: true })).toBe(false);
    expect(shouldCollapseOnEscape(openState, { composing: true })).toBe(false);
    expect(shouldCollapseOnEscape(openState, { editingText: true })).toBe(false);
    expect(shouldCollapseOnEscape(openState, { transientLayer: true })).toBe(false);
  });

  it("ignores repeated Escape after a close starts and does not quit the shell", () => {
    const closing = transitionShell(openState, { type: "CLOSE", reason: "escape" });
    expect(shouldCollapseOnEscape(closing)).toBe(false);
    expect(transitionShell(closing, { type: "CLOSE", reason: "escape" })).toBe(closing);
    expect(closing).toMatchObject({ phase: "closing", expanded: false });
  });

  it("closes during opening and ignores stale animation completion", () => {
    const opening = transitionShell(initialShellState, { type: "OPEN" });
    expect(shouldCollapseOnEscape(opening)).toBe(true);

    const closing = transitionShell(opening, { type: "CLOSE", reason: "escape" });
    expect(closing).toMatchObject({ phase: "closing", expanded: false, restoreFocus: true });
    expect(
      transitionShell(closing, {
        type: "ANIMATION_FINISHED",
        phase: "opening",
        revision: opening.revision,
      }),
    ).toBe(closing);
    expect(shouldCollapseOnEscape(closing)).toBe(false);
  });

  it("ignores stale animation completions during rapid state changes", () => {
    const opening = transitionShell(initialShellState, { type: "OPEN" });
    const closing = transitionShell(opening, { type: "CLOSE", reason: "pointer" });
    const reopened = transitionShell(closing, { type: "OPEN" });

    expect(reopened.phase).toBe("opening");
    expect(transitionShell(reopened, { type: "CLOSE_FINISHED", revision: closing.revision })).toBe(reopened);
    expect(
      transitionShell(reopened, {
        type: "ANIMATION_FINISHED",
        phase: "opening",
        revision: opening.revision,
      }),
    ).toBe(reopened);
  });

  it("rolls back the latest native failure but ignores stale failures", () => {
    const opening = transitionShell(initialShellState, { type: "OPEN" });
    expect(
      transitionShell(opening, {
        type: "NATIVE_FAILURE",
        revision: opening.revision,
        targetExpanded: true,
      }),
    ).toMatchObject({ phase: "collapsed", expanded: false });

    expect(
      transitionShell(opening, {
        type: "NATIVE_FAILURE",
        revision: opening.revision - 1,
        targetExpanded: true,
      }),
    ).toBe(opening);
  });

  it("coalesces repeated open requests and allows a close then immediate reopen", () => {
    const opening = transitionShell(initialShellState, { type: "OPEN" });
    expect(transitionShell(opening, { type: "OPEN" })).toBe(opening);
    const closing = transitionShell(openState, { type: "CLOSE", reason: "explicit" });
    expect(transitionShell(closing, { type: "OPEN" })).toMatchObject({ phase: "opening", expanded: true });
  });
});
