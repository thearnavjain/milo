export type ShellPhase = "collapsed" | "opening" | "expanded" | "closing";
export type CollapseReason = "explicit" | "escape" | "pointer" | "blur";

export interface ShellState {
  phase: ShellPhase;
  expanded: boolean;
  pinned: boolean;
  revision: number;
  restoreFocus: boolean;
}

export interface EscapeContext {
  defaultPrevented?: boolean;
  composing?: boolean;
  editingText?: boolean;
  transientLayer?: boolean;
}

export const initialShellState: ShellState = {
  phase: "collapsed",
  expanded: false,
  pinned: false,
  revision: 0,
  restoreFocus: false,
};

export type ShellEvent =
  | { type: "OPEN" }
  | { type: "CLOSE"; reason: CollapseReason }
  | { type: "TOGGLE" }
  | { type: "TOGGLE_PIN" }
  | { type: "ANIMATION_FINISHED"; phase: "opening"; revision: number }
  | { type: "CLOSE_FINISHED"; revision: number }
  | { type: "NATIVE_FAILURE"; revision: number; targetExpanded: boolean };

export function canCollapseOnLeave(state: ShellState, interacting: boolean): boolean {
  return state.expanded && !state.pinned && !interacting;
}

export function canOpenOnHover(state: ShellState, suppressedUntilPointerLeaves: boolean): boolean {
  return !suppressedUntilPointerLeaves && !state.expanded && !state.pinned;
}

export function shouldSuppressHoverUntilLeave(reason: CollapseReason, pointerInside: boolean): boolean {
  return pointerInside && (reason === "escape" || reason === "explicit");
}

export function shouldCollapseOnEscape(state: ShellState, context: EscapeContext = {}): boolean {
  return state.expanded
    && !state.pinned
    && !context.defaultPrevented
    && !context.composing
    && !context.editingText
    && !context.transientLayer;
}

export function transitionShell(state: ShellState, event: ShellEvent): ShellState {
  switch (event.type) {
    case "OPEN": {
      if (state.expanded) {
        return state;
      }
      return {
        ...state,
        phase: "opening",
        expanded: true,
        revision: state.revision + 1,
        restoreFocus: false,
      };
    }
    case "TOGGLE":
      return state.expanded
        ? transitionShell(state, { type: "CLOSE", reason: "explicit" })
        : transitionShell(state, { type: "OPEN" });
    case "CLOSE": {
      if (
        !state.expanded
        || (state.pinned && (event.reason === "pointer" || event.reason === "blur" || event.reason === "escape"))
      ) {
        return state;
      }
      return {
        ...state,
        phase: "closing",
        expanded: false,
        pinned: event.reason === "explicit" || event.reason === "escape" ? false : state.pinned,
        revision: state.revision + 1,
        restoreFocus: event.reason === "explicit" || event.reason === "escape",
      };
    }
    case "TOGGLE_PIN":
      return { ...state, pinned: !state.pinned };
    case "ANIMATION_FINISHED":
      if (event.phase !== "opening" || state.phase !== "opening" || state.revision !== event.revision) {
        return state;
      }
      return { ...state, phase: "expanded" };
    case "CLOSE_FINISHED":
      if (state.phase !== "closing" || state.revision !== event.revision) {
        return state;
      }
      return { ...state, phase: "collapsed" };
    case "NATIVE_FAILURE":
      if (state.revision !== event.revision || state.expanded !== event.targetExpanded) {
        return state;
      }
      return {
        ...state,
        phase: event.targetExpanded ? "collapsed" : "expanded",
        expanded: !event.targetExpanded,
        pinned: false,
        revision: state.revision + 1,
        restoreFocus: false,
      };
  }
}
