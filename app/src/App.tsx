import { useCallback, useEffect, useRef, useState, type AnimationEvent, type ReactNode } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Command,
  FileStack,
  Gauge,
  Music2,
  Pin,
  Plus,
  Settings2,
  Sparkles,
  Sun,
  Wifi,
} from "lucide-react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import {
  canCollapseOnLeave,
  canOpenOnHover,
  initialShellState,
  shouldCollapseOnEscape,
  shouldSuppressHoverUntilLeave,
  transitionShell,
  type CollapseReason,
  type ShellEvent,
  type ShellState,
} from "./shellState";
import "./App.css";

type Section = "Overview" | "System" | "Productivity" | "Files" | "Music" | "Settings";
const sections: { label: Section; icon: typeof Clock3 }[] = [
  { label: "Overview", icon: Clock3 },
  { label: "System", icon: Gauge },
  { label: "Productivity", icon: Check },
  { label: "Files", icon: FileStack },
  { label: "Music", icon: Music2 },
  { label: "Settings", icon: Settings2 },
];

const sectionDetails: Record<Exclude<Section, "Overview">, { eyebrow: string; title: string; description: string }> = {
  System: { eyebrow: "DEVICE", title: "System controls", description: "Live Windows status and controls will appear here as each native adapter is connected and verified." },
  Productivity: { eyebrow: "YOUR SPACE", title: "Productivity", description: "Tasks, reminders, timers and alarms will be backed by MILO’s local database and scheduler." },
  Files: { eyebrow: "TEMPORARY HOLDING BAY", title: "Keep files close", description: "Files will stay in their original locations. MILO will hold references so you can drag them into another app." },
  Music: { eyebrow: "NOW PLAYING", title: "A little more in tune", description: "Supported Windows media sessions and their real control capabilities will show up here." },
  Settings: { eyebrow: "PERSONALISE MILO", title: "Make it yours", description: "Appearance, island behaviour, privacy and accessibility preferences will be saved locally." },
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(date);
}

function useLocalClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timeout: number;
    const tick = () => {
      const current = new Date();
      setNow(current);
      timeout = window.setTimeout(tick, 60_000 - (current.getTime() % 60_000) + 30);
    };
    timeout = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 30);
    return () => window.clearTimeout(timeout);
  }, []);
  return now;
}

function App() {
  const now = useLocalClock();
  const [shell, setShell] = useState<ShellState>(initialShellState);
  const [section, setSection] = useState<Section>("Overview");
  const [nativeError, setNativeError] = useState<string | null>(null);
  const shellRef = useRef(shell);
  const nativeExpandedRef = useRef<boolean | null>(false);
  const nativeQueueRef = useRef<Promise<void>>(Promise.resolve());
  const islandHandleRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const dismissTimer = useRef<number | undefined>(undefined);
  const interactionRef = useRef(false);
  const pointerInsideRef = useRef(false);
  const suppressHoverUntilLeaveRef = useRef(false);
  const expanded = shell.expanded;
  const panelMounted = shell.expanded || shell.phase === "closing";

  const transition = useCallback((event: ShellEvent) => {
    const next = transitionShell(shellRef.current, event);
    shellRef.current = next;
    setShell(next);
    return next;
  }, []);

  const clearHoverTimers = useCallback(() => {
    window.clearTimeout(hoverTimer.current);
    window.clearTimeout(dismissTimer.current);
  }, []);

  const queueNativeResize = useCallback(function queueNativeResize(
    targetExpanded: boolean,
    revision: number,
    recovery = false,
  ) {
    const operation = nativeQueueRef.current.then(async () => {
      if (nativeExpandedRef.current !== targetExpanded) {
        if (isTauri()) {
          await invoke("set_shell_expanded", { expanded: targetExpanded });
        }
        nativeExpandedRef.current = targetExpanded;
      }
      if (shellRef.current.revision === revision) {
        setNativeError(null);
      }
    }).catch(() => {
      nativeExpandedRef.current = null;
      if (shellRef.current.revision !== revision) return;

      if (recovery) {
        setNativeError("MILO couldn’t restore its previous desktop window size. Restart MILO to retry.");
        return;
      }

      const rollback = transition({ type: "NATIVE_FAILURE", revision, targetExpanded });
      setNativeError("MILO couldn’t reposition its desktop window. Its previous layout has been restored where possible.");
      void queueNativeResize(!targetExpanded, rollback.revision, true);
    });
    nativeQueueRef.current = operation;
  }, [transition]);

  const requestOpen = useCallback(() => {
    clearHoverTimers();
    const current = shellRef.current;
    const next = transition({ type: "OPEN" });
    if (next !== current && next.expanded) {
      queueNativeResize(true, next.revision);
    }
  }, [clearHoverTimers, queueNativeResize, transition]);

  const requestClose = useCallback((reason: CollapseReason) => {
    clearHoverTimers();
    suppressHoverUntilLeaveRef.current = shouldSuppressHoverUntilLeave(reason, pointerInsideRef.current);
    const current = shellRef.current;
    const next = transition({ type: "CLOSE", reason });
    if (next !== current && next.phase === "closing") {
      setNativeError(null);
    }
  }, [clearHoverTimers, transition]);

  const schedulePointerCollapse = useCallback(() => {
    window.clearTimeout(dismissTimer.current);
    dismissTimer.current = window.setTimeout(() => {
      if (!pointerInsideRef.current && canCollapseOnLeave(shellRef.current, interactionRef.current)) {
        requestClose("pointer");
      }
    }, 480);
  }, [requestClose]);

  const toggleShell = useCallback(() => {
    if (shellRef.current.expanded) requestClose("explicit");
    else {
      suppressHoverUntilLeaveRef.current = false;
      requestOpen();
    }
  }, [requestClose, requestOpen]);

  const finishDeckAnimation = useCallback((event: AnimationEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    const current = shellRef.current;
    if (current.phase === "opening" && event.animationName === "milo-deck-open") {
      transition({ type: "ANIMATION_FINISHED", phase: "opening", revision: current.revision });
      return;
    }
    if (current.phase === "closing" && event.animationName === "milo-deck-close") {
      const revision = current.revision;
      queueNativeResize(false, revision);
      const pending = nativeQueueRef.current.then(() => {
        if (shellRef.current.revision !== revision || shellRef.current.phase !== "closing") return;
        const restoreFocus = shellRef.current.restoreFocus;
        transition({ type: "CLOSE_FINISHED", revision });
        if (restoreFocus && document.hasFocus()) {
          window.requestAnimationFrame(() => islandHandleRef.current?.focus({ preventScroll: true }));
        }
      });
      nativeQueueRef.current = pending.catch(() => undefined);
    }
  }, [queueNativeResize, transition]);

  const onSurfaceEnter = () => {
    pointerInsideRef.current = true;
    if (!canOpenOnHover(shellRef.current, suppressHoverUntilLeaveRef.current)) return;
    window.clearTimeout(dismissTimer.current);
    hoverTimer.current = window.setTimeout(requestOpen, 150);
  };

  const onSurfaceLeave = () => {
    pointerInsideRef.current = false;
    suppressHoverUntilLeaveRef.current = false;
    window.clearTimeout(hoverTimer.current);
    if (!canCollapseOnLeave(shellRef.current, interactionRef.current)) return;
    schedulePointerCollapse();
  };

  const onSurfacePointerDown = () => {
    interactionRef.current = true;
    pointerInsideRef.current = true;
    if (!isTauri()) return;

    void invoke("focus_shell").catch(() => {
      setNativeError("MILO couldn’t receive keyboard focus. Try clicking the island again.");
    });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      const target = event.target instanceof Element ? event.target : null;
      const escapeContext = {
        defaultPrevented: event.defaultPrevented,
        composing: event.isComposing,
        editingText: Boolean(target && (
          (target instanceof HTMLElement && target.isContentEditable)
          || target.matches("input, textarea, select")
        )),
        transientLayer: Boolean(target?.closest(
          '[role="dialog"], [role="menu"], [role="listbox"], [role="combobox"], [data-escape-owner]',
        )),
      };
      if (!shouldCollapseOnEscape(shellRef.current, escapeContext)) return;

      event.preventDefault();
      event.stopPropagation();
      requestClose("escape");
    };
    const onWindowBlur = () => {
      if (canCollapseOnLeave(shellRef.current, false)) requestClose("blur");
    };
    const onGlobalPointerUp = () => {
      interactionRef.current = false;
      if (!pointerInsideRef.current && canCollapseOnLeave(shellRef.current, false)) {
        schedulePointerCollapse();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("pointerup", onGlobalPointerUp);
    window.addEventListener("pointercancel", onGlobalPointerUp);
    return () => {
      clearHoverTimers();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("pointerup", onGlobalPointerUp);
      window.removeEventListener("pointercancel", onGlobalPointerUp);
    };
  }, [clearHoverTimers, requestClose, schedulePointerCollapse]);

  useEffect(() => {
    if (!isTauri()) return;
    let cancelled = false;
    let unlisten: (() => void) | undefined;
    void listen<string>("milo://native-error", (event) => {
      setNativeError(`MILO couldn’t adapt its desktop window to the display: ${event.payload}`);
    }).then((stopListening) => {
      if (cancelled) stopListening();
      else unlisten = stopListening;
    });
    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  const togglePin = () => {
    const next = transition({ type: "TOGGLE_PIN" });
    if (!next.pinned && next.expanded && !pointerInsideRef.current) schedulePointerCollapse();
  };

  return (
    <main
      className={`milo-window ${panelMounted ? "is-expanded" : "is-collapsed"}`}
      onMouseEnter={onSurfaceEnter}
      onMouseLeave={onSurfaceLeave}
      onPointerDownCapture={onSurfacePointerDown}
    >
      <button
        ref={islandHandleRef}
        className="island-handle"
        type="button"
        aria-label={expanded ? "Collapse MILO" : "Expand MILO"}
        aria-expanded={expanded}
        onClick={toggleShell}
      >
        <span className="brand-mark" aria-hidden="true"><span /></span>
        <span className="island-wordmark">MILO</span>
        <span className="island-divider" />
        <span className="island-time">{formatTime(now)}</span>
        <span className="live-dot" aria-label="Available" />
        <ChevronDown className={`island-chevron ${expanded ? "turned" : ""}`} size={13} aria-hidden="true" />
      </button>

      {panelMounted && (
        <section
          className={`deck ${shell.phase === "opening" ? "is-opening" : ""} ${shell.phase === "closing" ? "is-closing" : ""}`}
          aria-label="MILO desktop companion"
          onAnimationEnd={finishDeckAnimation}
        >
          <header className="deck-header">
            <div className="welcome-lockup">
              <span className="brand-mark brand-mark-small" aria-hidden="true"><span /></span>
              <div>
                <div className="deck-kicker">YOUR DESKTOP, IN REACH</div>
                <div className="deck-date">{formatDate(now)}</div>
              </div>
            </div>
            <div className="header-actions">
              <button className={`quiet-icon ${shell.pinned ? "active" : ""}`} type="button" aria-label={shell.pinned ? "Unpin MILO" : "Keep MILO open"} title={shell.pinned ? "Unpin MILO" : "Keep open"} onClick={togglePin}>
                <Pin size={15} />
              </button>
              <button className="quiet-icon" type="button" aria-label="Notifications" title="Notifications" disabled>
                <Bell size={16} />
              </button>
              <button className="quiet-icon collapse-action" type="button" aria-label="Collapse MILO" title="Collapse MILO" onClick={() => requestClose("explicit")}>
                <ChevronDown size={16} />
              </button>
            </div>
          </header>

          <div className="deck-layout">
            <nav className="section-nav" aria-label="MILO sections">
              {sections.map(({ label, icon: Icon }) => (
                <button key={label} className={`nav-item ${section === label ? "selected" : ""}`} type="button" aria-current={section === label ? "page" : undefined} onClick={() => setSection(label)}>
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span>{label}</span>
                  {section === label && <span className="nav-indicator" />}
                </button>
              ))}
              <div className="nav-spacer" />
              <div className="nav-footnote"><span className="nav-status" /> Local by design</div>
            </nav>

            <div className="content-stage">
              {section === "Overview" ? <Overview now={now} onNavigate={setSection} /> : <ModuleLanding section={section} />}
              <div className="content-footer">
                <span><CircleHelp size={13} /> Foundation build</span>
                <span>Windows desktop</span>
              </div>
            </div>
          </div>
          {nativeError && <div className="inline-error" role="alert">{nativeError}</div>}
        </section>
      )}
    </main>
  );
}

function Overview({ now, onNavigate }: { now: Date; onNavigate: (section: Section) => void }) {
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="overview-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW <span className="eyebrow-line" /></p>
          <h1>{greeting}<span className="heading-period">.</span></h1>
          <p className="page-subtitle">A little more room for your day.</p>
        </div>
        <div className="clock-readout" aria-label={`Local time ${formatTime(now)}`}>
          <span>{formatTime(now)}</span>
          <small>{formatDate(now)}</small>
        </div>
      </div>

      <div className="overview-grid">
        <article className="feature-card time-card">
          <div className="card-orbit orbit-one" /><div className="card-orbit orbit-two" />
          <div className="card-label"><span className="card-icon cyan-icon"><Clock3 size={15} /></span> RIGHT NOW</div>
          <div className="large-time">{formatTime(now)}</div>
          <div className="time-footnote"><span className="tiny-glow" /> Your local time</div>
        </article>
        <article className="feature-card companion-card">
          <div className="companion-orb" aria-hidden="true"><Sparkles size={22} strokeWidth={1.5} /></div>
          <div className="card-label">A QUIET LITTLE CORNER</div>
          <p>Everything you need,<br /><strong>just a little closer.</strong></p>
          <span className="companion-caption">MILO stays out of your way.</span>
        </article>
        <article className="feature-card status-card">
          <div className="card-heading-row"><div className="card-label">DEVICE STATUS</div><span className="unavailable-pill">NOT CONNECTED</span></div>
          <div className="status-lines">
            <StatusLine icon={<Sun size={16} />} label="Power & battery" />
            <StatusLine icon={<Wifi size={16} />} label="Connectivity" />
            <StatusLine icon={<Gauge size={16} />} label="Audio & display" />
          </div>
          <p className="status-note">Live Windows integrations are part of the next foundation slice.</p>
        </article>
        <button className="feature-card next-card" type="button" onClick={() => onNavigate("Productivity")}>
          <span className="next-icon"><Plus size={17} /></span>
          <span><strong>Make space for a thought</strong><small>Tasks and reminders are coming next</small></span>
          <ChevronRight size={16} className="next-chevron" />
        </button>
      </div>
    </div>
  );
}

function StatusLine({ icon, label }: { icon: ReactNode; label: string }) {
  return <div className="status-line"><span className="status-line-icon">{icon}</span><span>{label}</span><span className="status-value">Unavailable</span></div>;
}

function ModuleLanding({ section }: { section: Section }) {
  if (section === "Overview") return null;
  const detail = sectionDetails[section];
  const Icon = sections.find((item) => item.label === section)?.icon ?? Command;
  return (
    <div className="module-page">
      <div className="module-art" aria-hidden="true"><div className="module-art-ring" /><div className="module-art-core"><Icon size={25} strokeWidth={1.5} /></div></div>
      <p className="eyebrow">{detail.eyebrow} <span className="eyebrow-line" /></p>
      <h1>{detail.title}</h1>
      <p className="module-description">{detail.description}</p>
      <div className="module-status"><span className="status-dot-muted" /> Not connected in this foundation build</div>
    </div>
  );
}

export default App;
