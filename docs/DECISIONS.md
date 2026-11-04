# MILO decision log

Decisions below are provisional engineering defaults unless explicitly marked locked. Consequential product rules called unresolved in the specifications remain open until validated.

| ID | Decision / question | Status | Default or next action |
|---|---|---|---|
| D-001 | Product architecture | Locked by source docs | Tauri 2, Rust, React, strict TypeScript, SQLite; native Windows adapters behind typed commands. |
| D-002 | Package manager | Proposed | Use pnpm and commit its lockfile, consistent with the Technical Requirements Document. Confirm Corepack can provision it. |
| D-003 | Default shell geometry | Provisional | 220 × 36 collapsed and 680 × 560 expanded logical px, dynamically constrained to usable monitor bounds. Test and tune. |
| D-004 | Hover dwell | Provisional | 150 ms; user-configurable; explicit click/shortcut opens immediately. |
| D-005 | Expansion animation | Provisional | 280 ms with reduced-motion alternative. |
| D-006 | Windows support range | Open | Windows 11 x64 current + preceding supported feature release is the TRD target; Windows 10 22H2 best effort. Publish only after matrix validation. |
| D-007 | Task list entity | Open, schema gap | Add a dedicated `task_lists` entity and `tasks.list_id` in a versioned migration before full task CRUD. |
| D-008 | Task completion and linked reminder | Open | Do not implement automatic cancel/retain semantics without explicit product rule. |
| D-009 | Alarm while asleep/off | Constraint locked; delivery design open | No powered-off guarantee. Validate Windows notification bridge and document limitations. |
| D-010 | Timer across sleep | Provisional | Continue elapsed wall-clock time; reconcile from a persisted deadline and test resume. |
| D-011 | Lyrics provider and rights | Open | No licensed provider decision yet; keep lyrics optional and never display unverified content. |
| D-012 | Native shell hit testing | Open — runtime proof required | The native region is shaped to match the top-flush, bottom-rounded UI and CSS fills the native client bounds. On 2026-11-04 the pre-fix release run failed one Escape attempt; after adding native focus on pointer interaction, a rebuilt dev run received Escape, collapsed, and remained running. Editable/transient/pinned Escape handling has deterministic tests; direct pointer-focus and focus return are not yet live-proven. Transparent click-through, non-activating hover, monitor/DPI cases, and installed-package behavior remain unverified. The prior debug/test binaries were blocked by Application Control (OS error 4551); the current dev build launched. Do not weaken or bypass policy. |
| D-013 | Signing and updates | Open | Do not publish as production-ready until publisher certificate, update endpoint, and updater key are supplied/configured. |
