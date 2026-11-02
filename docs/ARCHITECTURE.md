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

The Rust window controller sizes the transparent, borderless, topmost WebView to a compact island or a bounded deck. It uses the selected monitor's work area and scale factor, centers the window horizontally, and anchors it to the top of that area. The UI owns a single shell state and requests geometry changes through `set_shell_expanded`.

The native overlay's transparent-region hit testing, non-activating hover, DPI transitions, monitor hot-plug, tray/single-instance lifecycle and actual packaged behavior remain high-risk validation gates. This initial controller does not yet satisfy those native acceptance checks by itself.

## Security baseline

- Restrictive Tauri capability configuration and CSP.
- No generic shell, SQL, or arbitrary file-access command.
- Validate all data in Rust before domain mutations.
- Keep private user content and absolute file paths out of diagnostics/network calls.
- SQLite migrations are numbered, forward-only, backed up before destructive changes, and never edited after release.
