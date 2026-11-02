use raw_window_handle::{HasWindowHandle, RawWindowHandle};
use serde::Serialize;
use tauri::{PhysicalPosition, PhysicalSize, WebviewWindow};

const COLLAPSED_WIDTH: f64 = 220.0;
const COLLAPSED_HEIGHT: f64 = 36.0;
const EXPANDED_WIDTH: f64 = 680.0;
const EXPANDED_HEIGHT: f64 = 560.0;
const DISPLAY_GUTTER: f64 = 16.0;

#[derive(Debug, PartialEq)]
struct WindowBounds {
    left: i32,
    top: i32,
    width: u32,
    height: u32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShellGeometry {
    pub expanded: bool,
    pub width: u32,
    pub height: u32,
    pub scale_factor: f64,
}

fn calculate_bounds(
    x: i32,
    y: i32,
    work_width: u32,
    work_height: u32,
    scale: f64,
    expanded: bool,
) -> WindowBounds {
    let max_width = (f64::from(work_width) / scale - DISPLAY_GUTTER).max(160.0);
    let max_height = (f64::from(work_height) / scale - DISPLAY_GUTTER).max(160.0);
    let logical_width = if expanded {
        EXPANDED_WIDTH.min(max_width)
    } else {
        COLLAPSED_WIDTH.min(max_width)
    };
    let logical_height = if expanded {
        EXPANDED_HEIGHT.min(max_height)
    } else {
        COLLAPSED_HEIGHT.min(max_height)
    };
    let width = (logical_width * scale).round().max(1.0) as u32;
    let height = (logical_height * scale).round().max(1.0) as u32;
    let left = x + ((i64::from(work_width) - i64::from(width)) / 2) as i32;
    WindowBounds {
        left,
        top: y,
        width,
        height,
    }
}

pub fn place_shell(window: &WebviewWindow, expanded: bool) -> Result<ShellGeometry, String> {
    let monitor = window
        .current_monitor()
        .map_err(|_| "MONITOR_UNAVAILABLE".to_owned())?
        .or(window
            .primary_monitor()
            .map_err(|_| "MONITOR_UNAVAILABLE".to_owned())?)
        .ok_or_else(|| "MONITOR_UNAVAILABLE".to_owned())?;
    let scale = monitor.scale_factor();
    let work_area = monitor.work_area();
    let bounds = calculate_bounds(
        work_area.position.x,
        work_area.position.y,
        work_area.size.width,
        work_area.size.height,
        scale,
        expanded,
    );

    window
        .set_size(PhysicalSize::new(bounds.width, bounds.height))
        .map_err(|_| "WINDOW_RESIZE_FAILED".to_owned())?;
    window
        .set_position(PhysicalPosition::new(bounds.left, bounds.top))
        .map_err(|_| "WINDOW_POSITION_FAILED".to_owned())?;
    apply_native_region(window, bounds.width, bounds.height, scale, expanded)?;
    Ok(ShellGeometry {
        expanded,
        width: bounds.width,
        height: bounds.height,
        scale_factor: scale,
    })
}

#[cfg(target_os = "windows")]
fn apply_native_region(
    window: &WebviewWindow,
    width: u32,
    height: u32,
    scale: f64,
    expanded: bool,
) -> Result<(), String> {
    use windows_sys::Win32::Graphics::Gdi::{CreateRoundRectRgn, DeleteObject, SetWindowRgn};

    let handle = window
        .window_handle()
        .map_err(|_| "WINDOW_HANDLE_UNAVAILABLE".to_owned())?;
    let RawWindowHandle::Win32(handle) = handle.as_raw() else {
        return Err("WINDOW_HANDLE_UNAVAILABLE".to_owned());
    };
    let radius = ((if expanded { 26.0 } else { 18.0 }) * scale).round() as i32;
    let region =
        unsafe { CreateRoundRectRgn(0, 0, width as i32, height as i32, radius * 2, radius * 2) };
    if region.is_null() {
        return Err("WINDOW_REGION_FAILED".to_owned());
    }
    let applied = unsafe { SetWindowRgn(handle.hwnd.get() as _, region, 1) };
    if applied == 0 {
        unsafe { DeleteObject(region as _) };
        return Err("WINDOW_REGION_FAILED".to_owned());
    }
    Ok(())
}

#[cfg(not(target_os = "windows"))]
fn apply_native_region(
    _window: &WebviewWindow,
    _width: u32,
    _height: u32,
    _scale: f64,
    _expanded: bool,
) -> Result<(), String> {
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::calculate_bounds;

    #[test]
    fn centers_expanded_window_on_negative_origin_monitor_at_mixed_dpi() {
        let bounds = calculate_bounds(-1920, 0, 1920, 1080, 1.5, true);
        assert_eq!(bounds.left, -1470);
        assert_eq!(bounds.top, 0);
        assert_eq!(bounds.width, 1020);
        assert_eq!(bounds.height, 840);
    }

    #[test]
    fn keeps_collapsed_island_inside_small_work_area() {
        let bounds = calculate_bounds(0, 0, 160, 120, 1.0, false);
        assert!(bounds.width <= 160);
        assert!(bounds.height <= 120);
        assert!(bounds.left >= 0);
    }

    #[test]
    fn constrains_expanded_deck_to_work_area_at_common_scaling_factors() {
        for scale in [1.0, 1.25, 1.5, 1.75, 2.0] {
            let bounds = calculate_bounds(0, 40, 1920, 1000, scale, true);
            assert!(bounds.left >= 0, "left out of bounds at scale {scale}");
            assert!(
                bounds.left as u32 + bounds.width <= 1920,
                "right out of bounds at scale {scale}"
            );
            assert!(
                bounds.top as u32 + bounds.height <= 1040,
                "bottom out of bounds at scale {scale}"
            );
        }
    }
}
