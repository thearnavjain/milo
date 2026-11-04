use crate::windowing::{ShellGeometry, place_shell};
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn set_shell_expanded(
    app: AppHandle,
    shell_state: State<'_, AtomicBool>,
    expanded: bool,
) -> Result<ShellGeometry, String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "WINDOW_UNAVAILABLE".to_owned())?;
    let geometry = place_shell(&window, expanded)?;
    shell_state.store(expanded, Ordering::Release);
    Ok(geometry)
}
