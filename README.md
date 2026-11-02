# MILO

MILO is a local-first Windows desktop companion built around a small floating island attached to the top edge of the screen. It is an installed desktop application, not a website.

## Current stage

The repository began with the six product specification PDFs and no application code. The first implementation increment establishes the Tauri desktop shell, its initial visual language, top-centre monitor positioning, and the expand/collapse interaction. Product modules are being implemented in the documented phase order; screens explicitly identify integrations that are not connected yet.

## Requirements and decisions

- [Project assessment](docs/PROJECT_ASSESSMENT.md)
- [Requirements traceability checklist](docs/REQUIREMENTS_TRACEABILITY.md)
- [Decision log](docs/DECISIONS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Windows integration status](docs/WINDOWS_INTEGRATIONS.md)
- [Implementation log](docs/IMPLEMENTATION_LOG.md)

The six supplied PDFs in the repository root are the source of truth and must remain unchanged.

## Development prerequisites

- Windows x64
- Node.js LTS, Corepack/pnpm
- Rust stable MSVC toolchain
- Visual Studio C++ Build Tools
- Microsoft Edge WebView2 Evergreen Runtime

The app workspace is [`app`](app). From that directory:

```powershell
corepack pnpm install
corepack pnpm tauri dev
```

Useful checks:

```powershell
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
corepack pnpm tauri build
```

Tauri Windows prerequisites are described in the [official Tauri guide](https://v2.tauri.app/start/prerequisites/).

## Trust and data rules

MILO must not fabricate OS status. The frontend has no direct database or arbitrary filesystem access. File staging is metadata-only by default and must never silently move, overwrite, upload, or delete original files. Core functionality must remain local-first and account-free.
