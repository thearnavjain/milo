# MILO native shell validation

## Current test host

- WMI reports Windows 11 Home Single Language, version `10.0.26300`, build `26300`. The registry's `ProductName` says Windows 10 Home Single Language, while `DisplayVersion` is `26H2`, build `26300`, UBR `9818`; this host identity discrepancy remains unresolved.
- WMI reports one primary display. WinForms and `GetMonitorInfo` expose a DPI-virtualized 1536 × 864 rectangle; WMI reports `PixelsPerXLogicalInch = 120`. `SHAppBarMessage(ABM_GETTASKBARPOS)` reports a bottom taskbar at `(0,1020)` with size `1920 × 60`. These system probes do not establish the monitor scale/coordinates Tauri receives.
- Tauri's live monitor scale factor and its actual display work area were not captured because the application executable was denied by Windows Application Control.
- Launch attempt: `corepack pnpm tauri dev` built `target/debug/milo.exe`, then Windows returned: “An Application Control policy has blocked this file” (OS error 4551). No policy was changed or bypassed.

## Manual verification matrix

Run `corepack pnpm tauri dev` from `app/` on a Windows development host where the project executable is permitted by the machine's existing policy. Keep the repository/build under the host's normal development controls. Do not weaken or bypass Application Control to run this test.

1. **Startup and placement:** Confirm MILO appears collapsed at the horizontal center of the current monitor's usable top edge, with the taskbar unobstructed. Record OS edition/build, monitor arrangement, resolution, scale factors, taskbar edge, and work areas.
2. **Hover without activation:** Put keyboard focus in an unsent text field in another application. Move the pointer over the collapsed island and wait for hover expansion. Confirm the other application's focus/caret remains active until MILO is clicked.
3. **Intentional activation and content:** Click the handle. Confirm the panel opens downward, the entire panel accepts pointer interaction, and navigation controls remain clickable while the pointer travels from the handle into the panel.
4. **Transparent hit-test:** With another harmless window behind MILO, click just outside each visible lower corner of the collapsed island and expanded panel. Confirm those points pass through to the underlying window. Confirm clicks on visible MILO content reach MILO. Also inspect that there are no invisible side or bottom gutters inside the native window.
5. **Dismissal:** From the expanded panel, move the pointer outside and wait for collapse; repeat using Escape, the handle, and the explicit collapse button. Confirm the process remains running and the compact island remains visible.
6. **Pinning:** Pin the panel, move the pointer outside and confirm it remains open. Unpin it, move away, and confirm it collapses. Confirm Escape closes and clears pinning.
7. **Rapid transitions:** Repeatedly hover/click, move back into the panel during collapse, and open/close quickly. Confirm no stuck state, duplicate window, flicker, stale size, or lost controls.
8. **Display cases:** Repeat on each monitor and at each available DPI scale. Change the active display scale while MILO is open; connect/disconnect a display where available. Confirm the window remains bounded and centered. Verify both bottom and top taskbar layouts if available.
9. **Packaged runtime:** Install the generated NSIS package in a normal user context, start it, repeat the critical shell checks, close/collapse, and relaunch. Record any package-only differences.

## Acceptance evidence to attach to Issue #4

Record each step as pass/fail/not run with observations. Capture screenshots only from the real application. A successful compile or installer build does not satisfy native focus, hit-testing, DPI, monitor-transition, or packaged-runtime criteria.
