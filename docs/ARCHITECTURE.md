# MILO architecture

## Target boundaries

```text
React + TypeScript presentation
        │ typed, allow-listed Tauri commands/events
Rust domain services and lifecycle
        ├── SQLite repositories and migrations
        └── isolated Windows adapters (windowing, power, audio, radios, media, OLE, notifications)
```

The UI owns presentation and short-lived form/view state. Rust owns validation, business rules, persistence, scheduling and operating-system access. SQLite in the user's local application-data directory owns durable user data. Windows is authoritative for system state. External lyrics and signed update checks are optional network boundaries; neither is part of this shell slice.

## Repository layout

- `app/src`: React presentation, shared design tokens and feature modules.
- `app/src-tauri/src/commands`: narrow IPC request/response handlers.
- `app/src-tauri/src/windowing.rs`: native monitor-aware shell geometry.
- `app/src-tauri/src/persistence`, `services`, `integrations/windows`: planned modules added with their implementation phases.
- `docs`: audit, decisions, traceability and implementation records.

## Shell slice

The Rust window controller sizes the transparent, borderless, topmost WebView to a compact island or a bounded deck. It uses the window's current monitor (with a primary-monitor fallback), its work area and scale factor, centers horizontally, and anchors to the work area's top edge. Invalid/empty monitor geometry is rejected, and even very small work areas constrain the window instead of forcing a minimum that can extend off-screen. Tauri scale-factor changes trigger a geometry refresh.

On Windows, a GDI region clips only the lower corners so the shape matches the top-attached interface. The React deck and handle fill the complete native client width; the expanded deck flexes into the remaining client height so there are no transparent gutters inside the native region. The UI state machine keeps the panel mounted through its collapse animation, serializes native resize requests, ignores stale animation completions, collapses on focus loss when unpinned, and returns keyboard focus to the collapsed handle only for explicit/Escape collapse.

The Win32 region's actual click-through, non-activating hover, focus behavior, mixed-DPI runtime, monitor hot-plug/topology changes, tray/single-instance lifecycle and packaged behavior remain unverified. A display scale-factor event is handled, but Tauri does not expose a general monitor-topology notification in this implementation. Do not treat the code change or a successful build as proof of native hit-testing.

## Security baseline

- Restrictive Tauri capability configuration and CSP.
- No generic shell, SQL, or arbitrary file-access command.
- Validate all data in Rust before domain mutations.
- Keep private user content and absolute file paths out of diagnostics/network calls.
- SQLite migrations are numbered, forward-only, backed up before destructive changes, and never edited after release.
