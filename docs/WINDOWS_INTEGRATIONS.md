# Windows integrations and validation status

No integration is reported as complete until its real Windows behavior is verified.

| Capability | Planned API / approach | Current status | Honest fallback |
|---|---|---|---|
| Shell positioning | Tauri current-monitor/work-area APIs; physical coordinates derived from per-monitor scale | Geometry rejects invalid dimensions, handles negative origins, and fits small work areas. Scale-factor changes trigger a geometry refresh. WMI reports Windows 11 Home Single Language build 26300, while registry `ProductName` reports Windows 10 Home Single Language (DisplayVersion `26H2`, UBR `9818`). System APIs report one primary display, DPI-virtualized 1536×864 bounds, 120 horizontal DPI, and a bottom taskbar at `(0,1020)` size `1920×60`. These probes do not establish Tauri's runtime coordinate space. The MILO executable is blocked by Windows Application Control (OS error 4551), so no runtime positioning observation is available. | Run the documented shell matrix on an allowed Windows development machine; verify topology and Tauri's actual coordinate space |
| Transparent empty-region hit testing | Native Windows HRGN and CSS surface with matching bounds | GDI region now keeps square top edges and clips lower corners; CSS handle/deck fill the native client width and expanded height. Compile-verified, not runtime-verified. | Must not claim safe click-through until testing the actual window against another app |
| Focus and topmost | Tauri `focus: false`, natural click activation, blur handling, keyboard collapse | Hover resize calls do not explicitly request activation; UI collapses on focus loss when unpinned and restores focus to the handle after explicit/Escape collapse. These behaviors are not runtime-verified because Windows Application Control blocked launch. | Test foreground-window stability, click activation, keyboard operation, and focus return on Windows |
| Battery and power saver | Win32 `GetSystemPowerStatus` and power notifications | Not implemented | No OS values displayed as live |
| Master volume | Core Audio endpoint APIs | Not implemented | No fake slider |
| Brightness | Supported WMI/DDC-CI adapter only | Not implemented | Windows Display Settings route |
| Wi-Fi/Bluetooth | Windows Radio APIs and permission-aware confirmation | Not implemented | Windows Settings route |
| Media sessions | GSMTC session manager | Not implemented | No fabricated player/track |
| File intake/drag-out | Tauri/native intake plus OLE `IDataObject`/`DoDragDrop` on STA | Not implemented | Do not use browser-only drag-out |
| Notifications | Windows App SDK `AppNotificationManager`, validated unpackaged bridge if required | Not implemented | Keep schedule data local; explain delivery limitations |

## Host observations

The host has Windows x64, Visual Studio Community 18, WebView2 Evergreen, Rust stable MSVC 1.99.1, rustfmt, and Windows SDK 10.0.26100. WMI identifies Windows 11 Home Single Language, version `10.0.26300`, build `26300`; one primary display reports 1536×864, while WMI reports 120 horizontal DPI. These identify the build host but do not establish MILO's runtime scale factor. Windows Application Control denied execution of the just-built development executable with OS error 4551; security controls were not changed or bypassed. Tauri, Rust, and frontend compilation pass independently of runtime.
