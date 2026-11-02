use crate::windowing::{ShellGeometry, place_shell};
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn set_shell_expanded(app: AppHandle, expanded: bool) -> Result<ShellGeometry, String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "WINDOW_UNAVAILABLE".to_owned())?;
    place_shell(&window, expanded)
}
