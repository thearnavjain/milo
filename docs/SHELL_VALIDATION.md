# MILO native shell validation handover

This matrix is the completion gate for GitHub Issue #4. Run it on a Windows development machine where the project's executable is allowed by the machine's existing policy. Do not weaken, disable, bypass, or evade Windows Application Control, Defender, SmartScreen, or other protections. If a policy blocks MILO, record the exact message and ask the machine administrator to provide an appropriately trusted development environment or make an authorized policy decision.

## Host and execution record

### Earlier build attempt

- `corepack pnpm tauri dev` from `app/` built the development executable, then Windows blocked its launch: “An Application Control policy has blocked this file” (OS error 4551). The final Rust test executable was also blocked on a later rerun. No security setting or policy was changed or bypassed.
- Host probes reported Windows 11 Home Single Language, version `10.0.26300`, build `26300`; registry `ProductName` instead says Windows 10 Home Single Language, `DisplayVersion` `26H2`, UBR `9818`.
- One primary display was reported. WinForms and `GetMonitorInfo` returned a DPI-virtualized 1536 × 864 rectangle; WMI reported 120 horizontal DPI. `SHAppBarMessage(ABM_GETTASKBARPOS)` reported a bottom taskbar at `(0,1020)`, size `1920 × 60`. These probes do not establish the monitor scale or work area seen by Tauri.

### Release executable observation — 2026-11-04

- Launched the already-built `app/src-tauri/target/release/milo.exe` through the Windows UI. It opened and showed the collapsed MILO island. This verifies launch and a basic rendered window for the loose release executable only; it does not verify the installed NSIS package.
- Clicked the collapsed handle: the panel expanded downward and its Overview content rendered. Visible system status was “Unavailable”; the screen did not present fabricated system readings.
- Clicked explicit collapse: the AX tree returned to the collapsed `Expand MILO` control, while the MILO window remained present. **Pass for this explicit-collapse path.**
- Sent Escape while the panel was expanded: the next AX observation still showed the expanded panel. **Fail for this observed Escape path.** Focus was reported on the root MILO pane, not a specific interactive control. Reproduce with keyboard focus established on the island in the trusted environment and investigate if it remains reproducible.
- Clicked the pin control: its accessible name changed to `Unpin MILO`; clicked the visible pin control again and it changed back to `Keep MILO open`. **Pass for pin/unpin control state change only.** Pin persistence while the pointer leaves was not established.
- Attempts to activate another window for blur/pointer-dismissal checks became inconclusive because the native UI automation lost coordinate geometry while MILO overlaid the target window. Do not count these attempts as passes or failures.
- No transparent-corner click-through, unrelated-app focus preservation, display topology/DPI change, taskbar-placement variation, package installation, or startup-failure injection was verified. The NSIS installer was not launched or installed.

## How to run

1. Record the host, monitor and taskbar configuration using the fields below.
2. Prefer a trusted Windows development environment and run `corepack pnpm tauri dev` from `app/`. If the executable is blocked, stop runtime testing; record the exact OS message and leave every affected case **Blocked** or **Not run**.
3. Use a harmless, unsaved blank document in a second application for focus and hit-test cases. Do not type into or modify an existing user document. Restore the second application before each case.
4. Run each test independently and record the outcome, observations and evidence. A successful compile or installer build is not runtime evidence.
5. For monitor cases, repeat on every available display/scale combination. Do not infer multi-monitor behavior from a one-monitor host.
6. Attach only screenshots or recordings of the real application, plus relevant OS/build and monitor details. Avoid capturing unrelated private content.

## Host record to complete

| Field | Value |
|---|---|
| Date / tester | |
| Windows edition, version and build | |
| MILO commit / build type | |
| Monitor count and arrangement | |
| Per-monitor resolution and scale | |
| Per-monitor work area / origin | |
| Taskbar edge and auto-hide state | |
| Runtime launch result / exact error | |

## Runtime validation matrix

For every row, record **Pass**, **Fail**, **Not run**, or **Blocked**. A failure is any reproducible deviation from the expected behavior. Record the exact steps, monitor/scale, outcome and screenshot/video or other observation. Do not attach evidence that contains unrelated personal content.

| ID / check | What to do | Expected behavior | Failure signal | Evidence to record |
|---|---|---|---|---|
| S1 Startup and initial placement | Launch MILO from the documented development command. Observe the collapsed island on each test monitor. | One collapsed island appears at the top-center of the selected usable work area, within bounds and clear of the taskbar. | No window, duplicate window, incorrect monitor, clipping, taskbar overlap, or out-of-bounds position. | Host record; screenshot with display/taskbar context; launch result. |
| S2 Hover without activation | Focus a harmless unsent text field in another app. Move the pointer over the collapsed island without clicking. | Hover may expand the island, but the other app retains keyboard focus/caret until MILO is intentionally activated. | MILO steals foreground focus or keystrokes before intentional activation. | Screen recording showing caret/focus before and after hover; foreground app observation. |
| S3 Click activation and expanded geometry | Click the collapsed handle once. Observe the window and panel bounds. | MILO activates intentionally and expands downward; panel remains centered and inside the usable area. | No expansion, expansion in the wrong direction, clipping, unexpected movement, or unrelated app activation. | Before/after screenshots; display/work-area/scale record. |
| S4 Visible content interaction and pointer travel | Click visible controls, then move from the handle into the panel and between navigation/content regions. | Visible content receives input; moving through the panel does not trigger accidental collapse or lose control interaction. | Clicks are ignored, delivered to the app behind MILO, or pointer travel collapses the panel. | Short recording and exact control/route exercised. |
| S5 Transparent collapsed corners | Place a harmless blank window behind MILO. Click just outside each visible rounded corner of the collapsed island; separately click visible island content. | Transparent corner pixels pass input to the underlying app; visible MILO pixels receive input. | Transparent pixels intercept input, visible content passes through, or a gutter behaves inconsistently. | Recording/screenshot showing pointer target and resulting underlying-app response for each corner. |
| S6 Transparent expanded corners and gutters | Repeat around all rounded lower corners and empty margins of the expanded panel; test visible controls. | Outside-region pixels pass through; visible panel and native client region receive input, with no invisible side/bottom gutters. | Any transparent area intercepts, or visible client content is non-interactive. | Labeled diagram/screenshot plus per-location result and underlying-app response. |
| S7 Explicit collapse and process continuity | Expand, then use the panel's explicit Collapse control. Confirm the compact island remains available. | Panel collapses to the handle and MILO remains running. | App exits, disappears, remains expanded, or becomes unusable. | Before/after screenshot and process/window observation. |
| S8 Escape collapse and focus return | Expand and intentionally focus MILO; press Escape once. Reopen and repeat from a focused input/control if applicable. | The expanded panel collapses, pin state follows the documented behavior, and focus returns to the collapsed handle without quitting MILO. | Escape is ignored, unrelated app loses focus unexpectedly, focus is lost, or MILO exits. | Exact focused control, key action, before/after AX or focus observation, pin state. |
| S9 Pointer-away dismissal | Expand unpinned; move the pointer to a harmless area of another app and wait for the documented dismissal interval. Repeat by moving into the panel during the collapse animation. | Unpinned MILO collapses when pointer leaves; re-entry/interactions interrupt collapse cleanly. | Stuck expanded/collapsed state, accidental collapse during in-panel travel, or animation race. | Screen recording with pointer path and elapsed time; resulting window state. |
| S10 Pinning and unpinning | Expand; pin; move pointer to another app and wait. Unpin and move away again. | Pinned MILO stays expanded on pointer leave; unpinned MILO dismisses. | Pin control state and actual persistence disagree, or unpin does not restore dismissal. | Control state plus recording of each pointer-leave result. |
| S11 Focus and activation cycle | With another app focused, hover, intentionally click MILO, interact with controls, collapse, and return to the other app. | Hover does not steal focus; intentional activation allows keyboard interaction; collapse returns focus appropriately and does not disrupt other desktop work. | Unexpected foreground changes, keyboard input routed incorrectly, or focus not returned/restored. | Recording and names of focused apps/controls at each step. |
| S12 Rapid transitions and animation interruption | Repeat hover/click/open/close quickly; move back into MILO while a collapse animation is running; switch sections while expanded. | One window remains; final geometry and state match the latest action; controls remain usable without flicker or stale size. | Duplicate windows, flicker, stale dimensions, stuck state, lost controls, or crash. | Screen recording, repetition count and any error logs. |
| S13 DPI scale changes | Test each available per-monitor scale. While MILO is open, change scale using normal Windows Display Settings, then allow display notifications to settle. | Island is re-centered and remains bounded at the new scale; content and hit region stay aligned. | Drift, clipping, mismatched visible/native hit regions, or failure to reposition. | Before/after scale, resolution, work area, screenshots and resulting bounds. |
| S14 Multi-monitor and negative origins | Test each display; move MILO between displays if supported; include a topology with a monitor left of or above the primary display. Connect/disconnect displays only where safe and available. | Correct target monitor/work area is used; negative coordinates remain valid; changes do not strand or duplicate MILO. | Wrong display, off-screen position, incorrect centering, crash, or stale monitor geometry. | Display arrangement screenshot, origins/scales/work areas and MILO bounds before/after each transition. |
| S15 Small work area | Use the smallest available resolution/work area and repeat initial placement and expansion. | Window dimensions clamp to the usable work area and remain operable without overflow or invalid geometry. | Negative/invalid size, off-screen content, taskbar overlap, or crash. | Resolution, work area, window bounds and screenshots of collapsed/expanded states. |
| S16 Taskbar placement | Repeat with bottom and top taskbar placement where available; include auto-hide state if supported. | Geometry respects the usable work area and does not overlap the visible taskbar unexpectedly. | Island is positioned against full-screen bounds instead of work area, or overlaps taskbar. | Taskbar edge/auto-hide setting, work area and before/after screenshots. |
| S17 Display-scale repositioning while open | With MILO expanded, change display scale or use the supported display-change event path; observe window bounds and UI alignment after reconfiguration. | Native geometry and frontend dimensions update together without mismatch. | Stale dimensions, offset, clipped panel, wrong hit region, or error hidden from the user. | Scale/work-area values, screenshot, and any surfaced error. |
| S18 Packaged NSIS runtime | Install the generated x64 NSIS package in a normal user context on a trusted test host. Launch, repeat S1/S3/S7/S8/S10, exit using the supported UI/lifecycle, then relaunch. | Installer and installed app launch normally; core shell behavior matches development runtime; relaunch works. | Policy block, install/runtime failure, missing resources, different geometry/input, or stale process after exit. | Installer version/hash; install context/result; runtime screenshots; exact errors; process/window lifecycle observations. |
| S19 Startup failure handling | In a disposable test environment, use a documented, reversible way to make the native initialization dependency unavailable (for example, a test harness/fault injection if present). Do not alter security policy or damage the host. | MILO reports a clear recoverable error, does not panic silently, and does not claim successful positioning. | Crash without explanation, false success, silent wrong placement, or persistent unusable process. | Exact injected condition, user-visible message, logs and process state. If no safe fault-injection mechanism exists, mark Not run and create a focused follow-up. |

## Results currently recorded

| ID | Current result | Evidence / limitation |
|---|---|---|
| S1 | Partial pass | Loose release executable launched; collapsed island visibly appeared at the top center on the single available display. Exact Tauri work area and taskbar clearance were not established. |
| S3 | Partial pass | Clicking the collapsed handle expanded the panel downward and displayed the Overview interface. Exact native bounds and focus behavior were not established. |
| S7 | Pass for explicit collapse | Explicit collapse returned the accessible control to `Expand MILO`; the MILO window remained present. |
| S8 | Fail observed | Escape was sent while expanded; the subsequent accessibility tree remained expanded. A trusted-host reproduction with intentional focus is still required. |
| S10 | Partial pass | Accessible control changed from `Keep MILO open` to `Unpin MILO` and back. Pointer-leave persistence was not verified. |
| Other cases | Not run / blocked | See host observations above. Native hit-testing, focus preservation, pointer dismissal, DPI, multi-monitor, taskbar variations, small work area, packaged installation and startup-failure behavior remain unverified. Development executable and final test executable execution were previously blocked by Application Control OS error 4551. |

## Issue #4 completion gate

Issue #4 must remain open until the required native runtime checks pass and evidence is recorded. At minimum, complete S2, S4–S11, and applicable cases S12–S19 on an appropriately trusted Windows host. For unavailable hardware/configurations, mark the specific case Not run with the reason and create a focused follow-up if the case is required for the release target. Do not infer native behavior from a successful compile, pure geometry test, or installer generation.
