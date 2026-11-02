# Windows integrations and validation status

No integration is reported as complete until its real Windows behavior is verified.

| Capability | Planned API / approach | Current status | Honest fallback |
|---|---|---|---|
| Shell positioning | Tauri monitor/work-area APIs; physical coordinates derived from per-monitor scale | Dev runtime observed centered at the screen top; click-to-expand and collapse work. DPI changes and monitor hot-plug remain untested. | Continue with the native display matrix |
| Transparent empty-region hit testing | Native Windows hit testing or equivalent region-aware shape | Native rounded window region compiles; corner click-through behavior not yet verified | Must not claim safe click-through |
| Focus and topmost | Tauri window config plus native activation testing | Configured, not runtime-verified | Hover focus behavior not yet guaranteed |
| Battery and power saver | Win32 `GetSystemPowerStatus` and power notifications | Not implemented | No OS values displayed as live |
| Master volume | Core Audio endpoint APIs | Not implemented | No fake slider |
| Brightness | Supported WMI/DDC-CI adapter only | Not implemented | Windows Display Settings route |
| Wi-Fi/Bluetooth | Windows Radio APIs and permission-aware confirmation | Not implemented | Windows Settings route |
| Media sessions | GSMTC session manager | Not implemented | No fabricated player/track |
| File intake/drag-out | Tauri/native intake plus OLE `IDataObject`/`DoDragDrop` on STA | Not implemented | Do not use browser-only drag-out |
| Notifications | Windows App SDK `AppNotificationManager`, validated unpackaged bridge if required | Not implemented | Keep schedule data local; explain delivery limitations |

## Host observations

The host has Windows x64, Visual Studio Community 18, WebView2 Evergreen, Rust stable MSVC 1.99.1, rustfmt, and Windows SDK 10.0.26100. Tauri dependencies compile successfully when Cargo runs under the Visual Studio developer environment with the SDK `um/x64` library directory included. The host product identity remains inconsistent between Windows APIs/registry (`Windows 10` versus display version `26H2`, build `26300`); resolve this before logging compatibility evidence.
