# MILO app workspace

This directory contains the Tauri 2 + React + TypeScript Windows desktop application.

See the [repository README](../README.md) for setup and commands. See [architecture](../docs/ARCHITECTURE.md) and [implementation log](../docs/IMPLEMENTATION_LOG.md) for current status and known native validation gaps.

Run the deterministic shell state tests with `corepack pnpm test` from this directory. Native focus, hit-testing, monitor and packaged-runtime checks are tracked in [the shell validation matrix](../docs/SHELL_VALIDATION.md); builds do not substitute for those Windows observations.
