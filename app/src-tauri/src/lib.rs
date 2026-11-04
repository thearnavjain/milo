mod commands;
mod windowing;

use std::sync::atomic::{AtomicBool, Ordering};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() -> tauri::Result<()> {
    tauri::Builder::default()
        .manage(AtomicBool::new(false))
        .on_window_event(|window, event| {
            use tauri::{Emitter, Manager};

            if !matches!(event, tauri::WindowEvent::ScaleFactorChanged { .. }) {
                return;
            }

            let app = window.app_handle();
            let expanded = app.state::<AtomicBool>().load(Ordering::Acquire);
            if let Some(shell) = app.get_webview_window("main") {
                if let Err(error) = windowing::place_shell(&shell, expanded) {
                    if app.emit("milo://native-error", error).is_err() {
                        eprintln!("MILO could not report a display-change error to the interface");
                    }
                }
            }
        })
        .setup(|app| {
            use tauri::Manager;
            let window = app
                .get_webview_window("main")
                .ok_or_else(|| std::io::Error::other("main window is unavailable"))?;
            windowing::place_shell(&window, false).map_err(std::io::Error::other)?;
            window.show().map_err(std::io::Error::other)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::window::set_shell_expanded,
            commands::window::focus_shell
        ])
        .run(tauri::generate_context!())
}
