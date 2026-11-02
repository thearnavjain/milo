mod commands;
mod windowing;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
            commands::window::set_shell_expanded
        ])
        .run(tauri::generate_context!())
        .expect("MILO failed to start");
}
