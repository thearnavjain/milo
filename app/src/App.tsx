import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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
import "./App.css";

type Section = "Overview" | "System" | "Productivity" | "Files" | "Music" | "Settings";
type ShellState = "collapsed" | "expanding" | "expanded" | "collapsing";

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
  const [shell, setShell] = useState<ShellState>("collapsed");
  const [section, setSection] = useState<Section>("Overview");
  const [pinned, setPinned] = useState(false);
  const [nativeError, setNativeError] = useState<string | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const dismissTimer = useRef<number | undefined>(undefined);
  const interactionRef = useRef(false);
  const expanded = shell === "expanded" || shell === "expanding";

  const clearHoverTimers = useCallback(() => {
    window.clearTimeout(hoverTimer.current);
    window.clearTimeout(dismissTimer.current);
  }, []);

  const changeShell = useCallback(async (open: boolean) => {
    clearHoverTimers();
    if (open === expanded || shell === "expanding" || shell === "collapsing") return;
    setShell(open ? "expanding" : "collapsing");
    setNativeError(null);
    try {
      if (isTauri()) await invoke("set_shell_expanded", { expanded: open });
      window.setTimeout(() => setShell(open ? "expanded" : "collapsed"), 280);
    } catch {
      setShell(open ? "collapsed" : "expanded");
      setNativeError("MILO couldn’t reposition its desktop window. Try opening it again.");
    }
  }, [clearHoverTimers, expanded, shell]);

  const onIslandEnter = () => {
    if (expanded || pinned) return;
    window.clearTimeout(dismissTimer.current);
    hoverTimer.current = window.setTimeout(() => void changeShell(true), 150);
  };

  const onSurfaceLeave = () => {
    window.clearTimeout(hoverTimer.current);
    if (!expanded || pinned) return;
    dismissTimer.current = window.setTimeout(() => {
      if (!interactionRef.current) void changeShell(false);
    }, 480);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && expanded) {
        event.stopPropagation();
        setPinned(false);
        void changeShell(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearHoverTimers();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [changeShell, expanded, pinned, clearHoverTimers]);

  return (
    <main
      className={`milo-window ${expanded ? "is-expanded" : "is-collapsed"}`}
      onMouseEnter={expanded ? undefined : onIslandEnter}
      onMouseLeave={onSurfaceLeave}
      onPointerDownCapture={() => { interactionRef.current = true; }}
      onPointerUpCapture={() => { interactionRef.current = false; }}
      onFocusCapture={() => { interactionRef.current = true; }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) interactionRef.current = false;
      }}
    >
      <button
        className="island-handle"
        type="button"
        aria-label={expanded ? "Collapse MILO" : "Expand MILO"}
        aria-expanded={expanded}
        onClick={() => void changeShell(!expanded)}
        onMouseEnter={onIslandEnter}
      >
        <span className="brand-mark" aria-hidden="true"><span /></span>
        <span className="island-wordmark">MILO</span>
        <span className="island-divider" />
        <span className="island-time">{formatTime(now)}</span>
        <span className="live-dot" aria-label="Available" />
        <ChevronDown className={`island-chevron ${expanded ? "turned" : ""}`} size={13} aria-hidden="true" />
      </button>

      {expanded && (
        <section className="deck" aria-label="MILO desktop companion">
          <header className="deck-header">
            <div className="welcome-lockup">
              <span className="brand-mark brand-mark-small" aria-hidden="true"><span /></span>
              <div>
                <div className="deck-kicker">YOUR DESKTOP, IN REACH</div>
                <div className="deck-date">{formatDate(now)}</div>
              </div>
            </div>
            <div className="header-actions">
              <button className={`quiet-icon ${pinned ? "active" : ""}`} type="button" aria-label={pinned ? "Unpin MILO" : "Keep MILO open"} title={pinned ? "Unpin MILO" : "Keep open"} onClick={() => setPinned((value) => !value)}>
                <Pin size={15} />
              </button>
              <button className="quiet-icon" type="button" aria-label="Notifications" title="Notifications" disabled>
                <Bell size={16} />
              </button>
              <button className="quiet-icon collapse-action" type="button" aria-label="Collapse MILO" title="Collapse MILO" onClick={() => { setPinned(false); void changeShell(false); }}>
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
