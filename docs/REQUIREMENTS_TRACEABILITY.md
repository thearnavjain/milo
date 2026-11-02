# MILO requirements traceability

This is the implementation checklist for the six source specifications. The source PDFs remain unchanged. Status values: **NS** not started, **IP** in progress, **I** implemented, **T** tested, **B** blocked, **D** deferred with rationale. An item is not complete merely because a UI control renders; acceptance requires the documented backend/native behavior, failure state, and verification.

| Requirement group / source IDs | Scope | Implementation mapping | Verification mapping | Status |
|---|---|---|---|---|
| PRD UI-SHELL-001–006 | Top-centre default, usable bounds, downward expansion, responsive size, positioning preference, topology changes | `app/src-tauri/src/windowing.rs`, `app/src/App.tsx` | AC-001, FLOW-026; DPI/monitor matrix | IP |
| PRD UI-SHELL-010–016 | Hover intent, immediate explicit open, safe collapse, pointer travel, Escape, pin, no hover focus theft | `app/src-tauri/src/windowing.rs`, `app/src/App.tsx` | AC-002/003, FLOW-003/004/005 | IP |
| PRD UI-SHELL-020–025; TRD windowing 5.x | Z-order, click-through/hit test, focus, outside click, keyboard open/close, fullscreen suppression | `app/src-tauri/src/windowing.rs` (region shape coded); remaining lifecycle/hit-test handling planned | FLOW-003/004/026/028; native focus/hit-test checks | IP |
| PRD SYS-001–005 | Local time/date, Windows locale/time zone, low-frequency updates | `app/src/decks/system/`, `app/src-tauri/src/integrations/windows/` | AC-004; locale/time-zone tests | NS |
| PRD SYS-010–015 | Battery/AC/charging/saver and no-battery state; no silent power-plan mutation | `app/src/decks/system/`, `app/src-tauri/src/integrations/windows/power.rs` | AC-005; laptop + desktop checks | NS |
| PRD SYS-020–024 | Confirmed volume/mute state, debounced writes, no unexpected unmute | `app/src/decks/system/`, `app/src-tauri/src/integrations/windows/audio.rs` | Native Core Audio checks | NS |
| PRD SYS-030–034 | Capability-based display brightness and honest settings fallback | `app/src/decks/system/`, `app/src-tauri/src/integrations/windows/brightness.rs` | Supported internal-panel and unsupported/external-display checks | NS |
| PRD SYS-040–044 | Accurate radio/connectivity state, safe permissioned controls/settings route, privacy | `app/src/decks/system/`, `app/src-tauri/src/integrations/windows/radios.rs` | Permission, policy, airplane-mode, adapter tests | NS |
| PROD-001–007 | Named lists, task CRUD/reorder, local persistence, quick capture | `app/src/decks/productivity/tasks/`, `app/src-tauri/src/persistence/` | AC-006; DB CRUD/migration/restart tests | NS |
| PROD-010–014 | One-time/recurring reminders, edit/snooze/dismiss/delete, honest delivery | `app/src/features/reminders/`, `app/src-tauri/src/services/scheduler/` | AC-008; recurrence/restart/notification checks | NS |
| PROD-020–025 | Preset/custom timers, lifecycle, compact state, accurate suspend/resume | `app/src/features/timers/`, scheduler | AC-007; timer clock/restart/suspend tests | NS |
| PROD-030–034, TRD alarms | One-time/repeating alarms, weekdays, controls, snooze, bounded guarantee | `app/src/features/alarms/`, scheduler/notification adapter | Alarm recurrence, missed-event and delivery-limit checks | NS |
| PROD-040–044 | Data continuity, destructive safety, empty states, keyboard, account-free use | Domain services and all productivity views | FLOW-007–013/028/029 | NS |
| FILE-001–010; TRD 9.x | Multi-file native intake, metadata-only references, persist/missing state, real OLE copy drag-out, safe remove/clear | `app/src/decks/dropzone/`, `app/src-tauri/src/integrations/windows/ole_drag.rs` | AC-009; FLOW-014–017; Explorer/browser target matrix | NS |
| MEDIA-001–006; TRD 10.1–10.2 | GSMTC sessions, confirmed metadata/artwork/state, supported controls/seek, session recovery | `app/src/decks/music/`, `app/src-tauri/src/integrations/windows/media.rs` | AC-010; FLOW-018/019; multiple player tests | NS |
| MEDIA-010–015; PRD lyrics | Permitted provider only, timed/plain distinction, attribution, opt-out, no fabricated lyrics | `app/src/features/lyrics/` | Provider/rights review; matching, rate-limit, privacy tests | D (rights unresolved) |
| AV-001–007; TRD 11.x | Expanded-only optional companion, semantic moods, reduced/static behavior, no interruption | `app/src/components/mascot/` | AC-011; reduced-motion/accessibility checks | NS |
| SET-001–006; TRD 12.x | Skippable onboarding, contextual permissions, no account, settings/persistence | `app/src/decks/settings/`, onboarding/lifecycle | FLOW-001/020/023/024; first-run and settings checks | NS |
| SEC-001–008; TRD 15.x | Validate IPC, untrusted inputs, secrets, TLS, signed updates, least privilege, clear data/quit | `app/src-tauri/capabilities/`, IPC/adapters | Capability/CSP review, path/input tests, release integrity tests | NS |
| A11Y-001–010 | Names/roles/states, keyboard, focus, contrast, scaling, reduced motion, non-color cues | Shared UI primitives and all views | Narrator + keyboard-only + contrast + 200% text checks | NS |
| PRD AC-001–014 | Release acceptance: shell, system, data, timers, reminders, files, media, avatar, keyboard, data controls, install | Cross-cutting | AC-001 through AC-014 | NS |
| App Flow FLOW-001–030 | Lifecycle, shell, navigation, data, schedules, files, media, errors, settings, offline | `app/src/` and `app/src-tauri/` module map | Named journey tests/manual evidence | NS |

## Button and interaction inventory

Each ID below must map to a component, domain handler, backend command when needed, and happy/failure/cancellation verification. All remain **NS** until individually verified.

| IDs | Controls covered | Status |
|---|---|---|
| OV-01–11 | Overview task/timer/reminder shortcuts, summaries, Files/Music routes, transport, card dismiss, refresh | NS |
| SYS-01–10 | Volume, mute, brightness, display target, Wi-Fi, Bluetooth, energy saver, battery details, Settings links, refresh | NS |
| TSK-01–16 | Task create/detail/complete/edit/delete/duplicate/checklist/tags/filter/sort/bulk/archive/restore/save/cancel | NS |
| REM-01–13 | Reminder editor, date/time/repeat, save/schedule, snooze/dismiss/complete/delete/toggle/source task/cancel | NS |
| TMR-01–13 | Timer create/preset/start/pause/resume/reset/stop/add-time/complete/restart/delete/save/cancel | NS |
| ALM-01–11 | Alarm create/time/repeat/toggle/save/edit/delete/snooze/dismiss/settings/cancel | NS |
| FIL-01–12 | Picker/drop, row, native drag-out, open/reveal/copy, remove/clear, retry, sort/filter, privacy help | NS |
| MUS-01–10 | Transport, seek/volume, lyrics entry/exit, favorite, source app, retry detection | NS |
| AVA-01–06 | Companion open, expression, motion, hide/reset/close | NS |
| SEA-01–06 | Search open/query/clear, entity/command result, close/focus return | NS |
| NOT-01–08 | Notification centre, row/deep link, read/clear, snooze/dismiss, settings | NS |
| SET-01–23 | Startup, launch state, theme/accent/motion, hover/collapse/fullscreen, notification, shortcut, timer/snooze, file clear, export/restore/reset, update, diagnostics/about/back | NS |
| Shell/tray inventory (App Flow §§5, 19) | Expand/collapse/back/home/search/notifications/settings/avatar/menu; tray open/quick-add/timer/notifications/settings/update/quit | NS |

## Traceability maintenance rule

When implementation begins, replace planned module paths with actual files and add test names or Windows manual-evidence records. Keep unsupported hardware and unvalidated platform behavior marked honestly. No requirement may be marked **T** without recorded evidence.
