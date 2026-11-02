# MILO — Modular Interactive Launchpad Overlay

MILO is a local-first Windows desktop companion built around a floating island attached to the top-centre edge of the desktop. It is an installed desktop application, not a website.

## Vision and design philosophy

MILO is designed to keep useful desktop tools close without taking over the screen. Its compact island expands into a focused workspace, while local-first operation, clear capability states, and careful handling of user data guide the product as it grows.

## Current development status

MILO is in early development. The current 0.1.0 foundation provides a working Tauri desktop shell and an initial interface. The shell has been exercised on the development machine; compatibility across Windows versions, display setups, and packaged installations is still being validated.

The visible System, Productivity, Files, Music, and Settings destinations are interface previews. Their underlying integrations and workflows are not connected yet. See the [implementation log](docs/IMPLEMENTATION_LOG.md) and [Windows integration status](docs/WINDOWS_INTEGRATIONS.md) for verified behavior and open validation work.

## Screenshots and interface preview

> **Screenshot coming soon.** No suitable application screenshot is currently included in the repository. This section will be updated with a genuine capture of the running Windows application.

## Features currently implemented

- Native Tauri window positioned at the top-centre of the current monitor's work area.
- Collapsed island that opens into a larger desktop panel and can be collapsed without quitting.
- Click and hover activation, pinning, Escape-to-collapse, and responsive panel navigation.
- Local time and date display using the Windows environment's locale and time zone.
- Initial dark visual theme and clearly marked unavailable integration states.
- Rust geometry tests for mixed-DPI calculations, negative monitor origins, and small work areas.

Battery and power, volume, brightness, Wi-Fi and Bluetooth, tasks, reminders, timers, alarms, file staging, media controls, notifications, tray behavior, and persistent settings are not implemented yet. A Windows integration is not considered complete until its behavior has been verified.

## Planned features

- Reliable shell lifecycle, tray behavior, focus handling, DPI and multi-monitor validation.
- Local persistence and migrations, followed by tasks, reminders, timers, and alarms.
- Capability-aware Windows system controls with honest fallbacks.
- Safe temporary file staging and native drag-out that preserves original files.
- Supported Windows media-session controls and metadata.
- Onboarding, settings, notifications, accessibility preferences, and an optional companion.
- Lyrics only if a suitable provider and usage rights are established.

## Technology stack

- **Desktop shell:** Tauri 2
- **Native layer:** Rust and Windows APIs
- **Interface:** React, TypeScript, Vite, and CSS
- **Icons:** Lucide React
- **Persistence:** SQLite is part of the target architecture; it is not connected in the current shell foundation.

## Architecture overview

The React and TypeScript interface communicates with the Rust desktop layer through narrow Tauri commands. The current native command handles shell positioning and size. Future Windows integrations and persistence are planned as isolated Rust modules; the UI should not access the database or arbitrary filesystem paths directly.

See [the architecture notes](docs/ARCHITECTURE.md) for the intended boundaries and current native validation gaps.

## Installation and development prerequisites

MILO targets Windows x64. Development requires:

- Node.js LTS with Corepack and pnpm.
- Rust stable with the MSVC target.
- Visual Studio C++ Build Tools and a Windows SDK.
- Microsoft Edge WebView2 Evergreen Runtime.

See the [Tauri Windows prerequisites](https://v2.tauri.app/start/prerequisites/) for platform setup details.

## Running locally

From the `app/` directory in PowerShell:

```powershell
corepack pnpm install
corepack pnpm tauri dev
```

Useful frontend checks:

```powershell
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

Rust checks can be run from `app/`:

```powershell
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

## Building the Windows application

From `app/`:

```powershell
corepack pnpm tauri build
```

The Windows NSIS installer is generated under `app/src-tauri/target/release/bundle/nsis/`. Build outputs and installers are ignored by Git; use GitHub Releases for future distributable builds.

## Project structure

```text
app/                  Tauri, React, TypeScript, and Rust application
  src/                Interface and visual styles
  src-tauri/          Native shell, commands, and Windows integration boundary
docs/                 Product specifications and engineering documentation
  specifications/     Original product and engineering specification PDFs
```

## Documentation

Start with the [documentation index](docs/README.md). It links to the six product specifications, architecture and design references, implementation plan, app flows, and engineering records.

## Privacy and security principles

- Core functionality is intended to work locally without a mandatory account.
- MILO must not invent Windows state or claim an operation succeeded when it did not.
- File staging must preserve originals and must never silently move, overwrite, or delete them.
- Native commands should be narrowly scoped, validate inputs, and follow least privilege.
- Private file paths and user data should not be sent to external services by default.

These principles describe product requirements; features that depend on future integrations remain planned.

## Roadmap

1. Complete shell lifecycle, focus, hit-testing, DPI, monitor, and packaged-runtime validation.
2. Establish local storage and migrations, then deliver the first persistent productivity workflows.
3. Add verified Windows system integrations and capability-aware fallbacks.
4. Implement safe file staging, media support, and the remaining documented product areas.
5. Validate accessibility, reliability, and release packaging before calling the product production-ready.

Progress and decisions are tracked in the [implementation log](docs/IMPLEMENTATION_LOG.md), [requirements checklist](docs/REQUIREMENTS_TRACEABILITY.md), and [decision log](docs/DECISIONS.md).

## Contributing

Contributions and focused issue reports are welcome. Before opening a pull request, review the [requirements and decisions](docs/README.md), describe the user-visible change, and run the frontend and Rust checks listed above. Do not mark Windows behavior as supported without testing it on Windows and recording the evidence. Please avoid bundling generated installers or local environment files.

## License

No license has been added. Until the project owner selects one, do not assume that the code or documentation may be reused, modified, or redistributed under an open-source license.
