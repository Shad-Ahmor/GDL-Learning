use std::process::Command;

#[tauri::command]
fn get_hardware_fingerprint() -> String {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("wmic")
            .args(["csproduct", "get", "uuid"])
            .output()
            .expect("Failed to execute wmic");
        let result = String::from_utf8_lossy(&output.stdout).to_string();
        let lines: Vec<&str> = result.lines().collect();
        if lines.len() > 1 {
            return lines[1].trim().to_string();
        }
        return "UNKNOWN_WINDOWS_HWID".to_string();
    }

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("ioreg")
            .args(["-rd1", "-c", "IOPlatformExpertDevice"])
            .output()
            .expect("Failed to execute ioreg");
        let result = String::from_utf8_lossy(&output.stdout).to_string();
        for line in result.lines() {
            if line.contains("IOPlatformUUID") {
                let parts: Vec<&str> = line.split('"').collect();
                if parts.len() > 3 {
                    return parts[3].to_string();
                }
            }
        }
        return "UNKNOWN_MACOS_HWID".to_string();
    }

    #[cfg(target_os = "linux")]
    {
        let output = Command::new("cat")
            .arg("/etc/machine-id")
            .output()
            .expect("Failed to read machine-id");
        return String::from_utf8_lossy(&output.stdout).trim().to_string();
    }

    #[allow(unreachable_code)]
    "UNKNOWN_HWID".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            use tauri::Manager;
            use tauri_plugin_shell::ShellExt;
            
            let mut resource_path = app.path().resource_dir().unwrap();
            if !cfg!(debug_assertions) {
                resource_path = resource_path.join("_up_");
            }
            let resource_path = resource_path.join("src-sidecar").join("server.js");
            let resource_path_str = resource_path.to_string_lossy().to_string();
            
            let (_, _child) = app.shell().sidecar("node")
                .expect("failed to create `node` sidecar command")
                .args([&resource_path_str])
                .spawn()
                .expect("Failed to spawn sidecar");
                
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_hardware_fingerprint])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
