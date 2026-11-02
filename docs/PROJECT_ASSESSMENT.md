# MILO repository and source assessment

**Reviewed:** 2026-11-02  
**Workspace:** repository root  
**Baseline:** empty application repository; no commits; six user-supplied PDFs only.

## Source set and authority

All six PDFs were read in full (194 pages total). The Product Requirements Document establishes user and release intent; the Full Technical Requirements Document defines the selected architecture and engineering constraints; the UI/UX Design Debrief is the visual and interaction design authority; the App Flow specification defines routes and control outcomes; the Backend Data & Database Architecture specification is the persistence and security baseline; and the Implementation Plan defines the execution order and phase gates. Where they differ, preserve the product intent and record the decision instead of silently dropping scope.

## Repository audit

- No existing application source, assets, tests, package files, or project instructions were present.
- Git is initialized on `main`, has no commits, and reports all six PDFs as untracked. The PDFs are source material and must remain unchanged.
- No existing user code or generated files were overwritten.

## Development environment

- Windows x64 host, PowerShell; .NET SDK 10.0.402 and Visual Studio Community 18 are installed.
- Node.js 24.19.0, npm 11.17.0, and Corepack 0.35.0 are installed.
- Microsoft Edge WebView2 Evergreen Runtime 156.0.4314.58 is installed.
- Rust/Cargo were absent at audit time. Rust stable MSVC 1.99.1 and Cargo 1.99.1 are now installed and verified.
- Visual Studio has the MSVC 14.51.36231 compiler/linker and Windows SDK 10.0.26100 is now installed through its Windows 11 SDK component. Use the Visual Studio developer environment and SDK `um/x64` library path when invoking Cargo from the current shell.
- `pypdf` 6.21.4 was installed for read-only PDF extraction; `pdfinfo` is available. No source PDF was modified.
- Reported Windows identity is inconsistent: `Get-ComputerInfo` reports Windows 10, while the registry reports display version 26H2/build 26300. Confirm the real OS/version before treating this host as compatibility evidence.
- A single installed WebView2 runtime and local compiler presence do not validate packaged launch, transparent-window hit testing, DPI, monitor changes, notification delivery, or OLE interoperability.

## Product and architecture assessment

The intended product is an installed, resident Windows desktop utility, not a web dashboard. The selected architecture is Tauri 2 + Rust + React + strict TypeScript + SQLite, with Windows APIs isolated in Rust adapters and a narrow typed IPC layer. Local productivity data belongs in per-user app data; the WebView must not access SQLite or arbitrary paths directly. OS state must be queried and confirmed, and file staging must retain references without changing originals.

The first build milestone is the resident shell: collapsed top-centre island, downward expansion, safe collapse, explicit activation, no hover focus theft, tray/lifecycle, and responsive monitor geometry. The native shell is a high-risk dependency; a browser-only layout cannot prove the required behavior.

## Scope and release priority

The PRD calls the shell, Overview/time, battery/power, tasks, timers, reminders, file staging, settings/onboarding, and trusted installer path P0. It calls volume, brightness, radios, alarms, media, and avatar P1; lyrics are P2 and rights/provider dependent. The TRD states the complete product is the target and a workstream table is a dependency sequence, not permission to omit a deck. Therefore the checklist tracks every product area; capability-dependent items may only ship with real support or an honest fallback. Lyrics remain optional until rights and provider terms are resolved.

## Material conflicts and open decisions

| Topic | Source tension | Working treatment |
|---|---|---|
| Collapsed/expanded geometry | TRD starts at 220–290 × 42–52 logical px and 560–740 × 430–600; UI debrief recommends 176–232 × 28–38 and 620–760 × 520–680. | Use responsive geometry with an initial collapsed target near 220 × 36 and expanded target near 680 × 560 logical px; validate against physical hit testing, small displays, DPI, and user testing before freezing. |
| Hover timing | TRD 100–220 ms, design 120–180 ms, PRD says configurable. | Start at 150 ms, configurable; deliberate click/hotkey is immediate. |
| Animation timing | PRD 180–320 ms; design 220–320 ms; TRD 250–450 ms. | Start at 280 ms (shared range) and shorten/disable for reduced motion. |
| Windows support baseline | PRD cites Windows 10 1809 as a media technical floor; TRD prefers current and preceding Windows 11 releases and calls Windows 10 22H2 best effort. | Do not claim a support matrix yet. Maintain a Windows 11 x64 target; test this host only after resolving its reported OS identity. |
| Task lists/schema | PRD requires named lists and CRUD; the database architecture has tasks but no `task_lists` table; its `deck_sections` list is navigation, not task lists. | Add a schema decision/forward migration for task lists before production task CRUD; do not overload deck sections. |
| Task completion vs linked reminder | App Flow explicitly prohibits inventing cancellation/retention behavior. | Keep linkage out of initial task slice until a documented rule exists; if added, require explicit user choice. |
| Alarm delivery | Windows sleep/off-state and scheduled notification windows constrain guarantees; docs prohibit promising wake-from-sleep or powered-off delivery. | Treat notifications as best-effort, reconcile overdue items on launch, and state delivery limits in UI. Validate notification bridge separately. |
| Timer sleep behavior | TRD says elapsed wall time by default, with a pause-on-sleep option; App Flow flags semantics as undecided. | Provisional default is continue elapsed wall-clock time; expose/document the policy before release and test sleep/resume. |
| Lyrics | PRD P2; provider is only a candidate and rights are not established. | No lyrics content/provider in initial shell. Keep an unavailable state and provider boundary until a rights review supports implementation. |
| Native shell proof | Tauri transparency, region-aware hit testing, and non-activating hover require Windows validation; C++ Build Tools status and Rust installation need verification. | Build the smallest real Tauri shell first; maintain explicit unverified status until native interaction and a packaged Windows run are exercised. |

## Risk register

1. Native transparent-window hit testing and focus behavior can intercept unrelated desktop input.
2. Mixed-DPI monitor geometry and monitor removal can strand or misplace the island.
3. OLE drag-out needs a native STA/message-pump implementation; DOM drag is insufficient.
4. AppNotificationManager registration/scheduling may require a small native helper.
5. Windows radio and brightness control is device-, permission-, policy-, and driver-dependent.
6. GSMTC exposes varying session metadata and control capabilities.
7. Database schema must reconcile named task lists with the data specification before task feature implementation.
8. Signing identity, update endpoint/public key, publisher details, and release infrastructure are absent.
9. Lyrics rights, licensing, caching permissions, attribution, and service terms are unresolved.
10. The host Windows identity must be reconciled before recording OS compatibility results.

## Initial phase status

- Phase 00: source review, repository audit, environment audit, and initial traceability capture complete.
- Phase 01: application scaffold, frontend dependency verification, design tokens, architecture, and native toolchain verification are in progress; native tests and the remaining repository gates are pending.
- Phase 02: shell UI and initial native geometry code are in progress; a working Rust/MSVC build and runtime exercise remain required.
- Later production feature phases: not started and remain gated by the implementation plan.

## Verification record

No app existed at baseline, so no baseline application build could be reproduced. PDF page counts/text extraction were checked for all six documents. Frontend type checking, linting, and production bundling pass. Windows-native application behavior has not yet been tested.
