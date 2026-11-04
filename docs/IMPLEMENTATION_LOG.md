# Implementation log

## 2026-11-02 — Phase 00 and initial foundation work

### Completed

- Read all six supplied PDFs completely and recorded their product, architecture, database, visual and interaction requirements.
- Audited Git and workspace; the repository contained no app code, and the PDFs remain unchanged.
- Added project assessment, traceability checklist, and decision log.
- Confirmed Node/npm/Corepack, .NET, Visual Studio C++ compiler/linker, and WebView2; detected an inconsistent reported Windows identity. Installed Windows SDK 10.0.26100 through the elevated Visual Studio installer after the initial SDK package path stalled.
- Scaffolded a Tauri 2 + React + TypeScript application under `app/` and installed frontend dependencies with pnpm.
- Implemented first shell UI: collapsed island, live local clock, explicit click/hover expansion, pin, Escape collapse, section navigation and responsive dark glass surfaces.
- Corrected the collapsed viewport sizing and allowed the expanded panel/navigation to shrink and scroll on short displays.
- Added a typed Rust command for top-centre geometry based on monitor work area and DPI scale, plus a compiled native rounded region intended to keep transparent corners outside the window hit area.
- Added a custom MILO island icon and pure Rust geometry tests for mixed DPI, negative monitor origins and small work areas.
- Added project architecture and Windows capability status documentation.

### Verification

- Dependency installation: `corepack pnpm install` — passed.
- `corepack pnpm typecheck` — passed.
- `corepack pnpm lint` — passed with no warnings.
- `corepack pnpm build` — passed.
- `cargo fmt --check` — passed after installing the rustfmt component and formatting the Rust shell foundation.
- `cargo check --manifest-path src-tauri/Cargo.toml` — passed with MSVC/SDK environment initialized and the SDK `um/x64` library path added. Fixed the `SetWindowRgn` import after the first source compile surfaced its `windows-sys` module location.
- `cargo test --manifest-path src-tauri/Cargo.toml` — passed: 3 geometry tests, 0 failures.
- `corepack pnpm tauri info` — detects Visual Studio Community 2026, WebView2, Rust stable MSVC, and Tauri 2.12.5 after SDK installation.
- `corepack pnpm tauri dev` — launched the native window; manually observed top-centre placement, 220×36 collapsed state, 680×560 downward expansion, click-to-open, pointer-away collapse, and explicit collapse.
- `corepack pnpm tauri build` — passed; produced the x64 NSIS installer. The release executable was built but its runtime inspection was stopped by the user during Computer Use.
- Mixed-DPI monitor transitions, focus theft, transparent-corner click-through, startup/tray lifecycle, and packaged runtime checks remain pending.

### Known gaps / risks

- Rounded native window-region hit testing compiles, but its corner click-through behavior remains unverified.
- No tray, single-instance enforcement, startup preference or window lifecycle recovery yet.
- The visible module destinations are labeled as not connected; they do not claim fake system data or feature success.
- Phase 02 exit gate is not passed until the app builds and the native shell is exercised on a verified Windows configuration.

### Next

Continue with the documented local-persistence and P0 feature phases; complete the remaining Windows shell, focus, DPI, packaging and lifecycle validation gates.

## 2026-11-04 — Issue #4 native shell hardening

### Changes

- Hardened pure geometry calculation: reject empty/invalid monitor data, avoid minimum-size overflow on tiny displays, preserve the usable-area gutter when possible, clamp physical dimensions to the work area, and calculate centered coordinates using a wider integer type.
- Changed the Windows HRGN from four rounded corners to square top edges with rounded lower corners, matching the top-attached design. The client UI now fills the native window width and expanded height so invisible transparent gutters do not intercept input inside the native region.
- Added scale-factor change handling to reapply monitor-aware geometry. Native initialization failures now return through Tauri's run result and display a Windows error dialog instead of panicking. The frontend surfaces native resize and display-change errors.
- Extracted shell interaction transitions into `src/shellState.ts`, serialized native resize commands, ignored stale animation completions, retained the panel for its exit animation, collapsed on unpinned window blur, and restored keyboard focus to the handle after explicit/Escape collapse.
- Pinned Corepack usage in Tauri dev/build commands to the repository-declared pnpm version. Added seven deterministic frontend state tests and three additional Rust geometry tests.

### Verification

- `corepack pnpm typecheck` — passed.
- `corepack pnpm lint` — passed with no warnings.
- `corepack pnpm test` — passed: 7 shell-state tests.
- `corepack pnpm build` — passed.
- `cargo fmt --check --manifest-path src-tauri/Cargo.toml` — passed.
- `cargo test --manifest-path src-tauri/Cargo.toml` — passed: 6 geometry tests, 0 failures.
- `cargo check --manifest-path src-tauri/Cargo.toml` — passed under Visual Studio Community 18 / Windows SDK 10.0.26100 environment.
- The final repeat of `cargo test` recompiled the unit-test executable but Windows Application Control refused to run that new executable (OS error 4551). The last successful six-test run was immediately before a GDI corner-radius-only alignment; the pure geometry/test logic did not change. Final `cargo check` and release compilation passed after that alignment.
- `corepack pnpm audit --prod` — passed; no known production frontend vulnerabilities were reported.
- `corepack pnpm tauri build` — passed on the final source; produced the x64 NSIS installer at `app/src-tauri/target/release/bundle/nsis/MILO_0.1.0_x64-setup.exe` (1.34 MiB). This artifact was not launched or installed.
- `corepack pnpm tauri dev` — Vite and the Rust development executable built; Windows Application Control blocked execution of `target/debug/milo.exe` with OS error 4551. No security setting or policy was bypassed. Consequently no live native focus, hit-testing, DPI, taskbar, monitor-transition, or interaction behavior was observed in this work session.
- Host facts captured: WMI reports Windows 11 Home Single Language build 26300, but registry `ProductName` reports Windows 10 Home Single Language (DisplayVersion `26H2`, UBR `9818`). System probes report one primary display, DPI-virtualized bounds 1536 × 864, 120 horizontal DPI, and a bottom taskbar at `(0,1020)` with size `1920 × 60`. These differing coordinate reports do not establish Tauri's runtime scale/work area. The app could not launch, so actual taskbar/work-area positioning remains unverified.

### Status and remaining gate

Issue #4 remains open. The code and deterministic tests are in place, but the issue explicitly requires real native Windows hit-testing/focus and collapse observations. Follow [SHELL_VALIDATION.md](SHELL_VALIDATION.md) on a trusted Windows development host where the executable is permitted by existing policy; do not infer completion from compilation.

### Follow-up

- Run the documented native shell matrix, including transparent corners, focus preservation, click activation, pointer/keyboard dismissal, pinning, and rapid transitions.
- Validate mixed-DPI and monitor topology transitions, top-taskbar work areas, and the installed NSIS runtime.
- Resolve the Windows minimum-version conflict in D-006 before publishing compatibility claims.
