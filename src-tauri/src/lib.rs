use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

const MAX_DATA_FILE_SIZE: u64 = 50_000_000; // 50MB limit
const BACKUP_SUFFIX: &str = ".bak";
const CURRENT_SCHEMA_VERSION: u32 = 1;

#[derive(Serialize, Deserialize)]
struct VersionedData {
    schema_version: u32,
    #[serde(flatten)]
    data: serde_json::Value,
}

fn get_backup_path(path: &std::path::Path) -> std::path::PathBuf {
    let mut name = path.file_name().unwrap().to_os_string();
    name.push(BACKUP_SUFFIX);
    path.with_file_name(name)
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Activity {
    pub id: String,
    pub message: String,
    pub timestamp: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct DashboardState {
    #[serde(default)]
    pub stats: Vec<serde_json::Value>,
    pub recent: Vec<Activity>,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Company {
    pub id: String,
    pub name: String,
    pub domain: String,
    pub industry: String,
    pub phone: String,
    pub address: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Contact {
    pub id: String,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub company_id: Option<String>,
    pub status: String,
    pub tags: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub contact_id: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Email {
    pub id: String,
    pub contact_id: String,
    pub subject: String,
    pub body: String,
    pub direction: String,
    pub created_at: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Deal {
    pub id: String,
    pub title: String,
    pub value: f64,
    pub stage: String,
    pub probability: i32,
    pub contact_id: String,
    pub company_id: Option<String>,
    pub expected_close_date: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub due_date: String,
    pub recurring: Option<String>,
    pub contact_id: Option<String>,
    pub deal_id: Option<String>,
    pub company_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct AppSettings {
    #[serde(default = "default_theme")]
    pub theme: String,
    #[serde(default = "default_tags")]
    pub tags: Vec<String>,
    #[serde(default = "default_monthly_target")]
    pub monthly_target: f64,
}

fn default_theme() -> String { "dark".to_string() }
fn default_tags() -> Vec<String> { vec!["VIP".to_string(), "Follow up".to_string(), "Hot lead".to_string(), "Cold".to_string()] }
fn default_monthly_target() -> f64 { 100000.0 }

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct AppData {
    pub dashboard: DashboardState,
    pub companies: Vec<Company>,
    pub contacts: Vec<Contact>,
    pub notes: Vec<Note>,
    pub emails: Vec<Email>,
    pub deals: Vec<Deal>,
    pub tasks: Vec<Task>,
    pub settings: AppSettings,
}

fn get_data_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(data_dir.join("data.json"))
}

#[tauri::command]
async fn load_app_data(app: tauri::AppHandle) -> Result<AppData, String> {
    let file = get_data_path(&app)?;

    if file.exists() {
        // Check file size before reading
        let metadata = fs::metadata(&file).map_err(|e| format!("Failed to read file metadata: {}", e))?;
        if metadata.len() > MAX_DATA_FILE_SIZE {
            return Err(format!("Data file too large: {} bytes (max {} bytes)", metadata.len(), MAX_DATA_FILE_SIZE));
        }

        let raw = fs::read_to_string(&file).map_err(|e| e.to_string())?;

        // Try to deserialize, fallback to backup if available
        match try_load_app_data(&raw) {
            Ok(data) => Ok(data),
            Err(e) => {
                log::warn!("Failed to parse data.json: {}. Attempting backup...", e);
                // Try to load backup
                let backup_path = get_backup_path(&file);
                if backup_path.exists() {
                    let backup_raw = fs::read_to_string(&backup_path)
                        .map_err(|be| format!("Failed to read backup: {}. Original error: {}", be, e))?;
                    try_load_app_data(&backup_raw)
                        .map_err(|be| format!("Backup also invalid: {}. Original error: {}", be, e))
                } else {
                    Err(format!("Failed to parse data.json and no backup found: {}", e))
                }
            }
        }
    } else {
        Ok(AppData {
            settings: AppSettings {
                theme: "dark".to_string(),
                tags: vec!["VIP".to_string(), "Follow up".to_string(), "Hot lead".to_string(), "Cold".to_string()],
                monthly_target: 100000.0,
            },
            ..Default::default()
        })
    }
}

fn try_load_app_data(raw: &str) -> Result<AppData, String> {
    // Try versioned format first
    if let Ok(versioned) = serde_json::from_str::<VersionedData>(raw) {
        log::info!("Loaded data with schema version: {}", versioned.schema_version);
        // Migrate if needed (add migration logic here as schema evolves)
        return serde_json::from_value::<AppData>(versioned.data)
            .map_err(|e| format!("Failed to parse data from versioned format: {}", e));
    }

    // Fallback: try legacy format (no schema_version)
    serde_json::from_str::<AppData>(raw)
        .map_err(|e| format!("Failed to parse data.json: {}", e))
}

#[tauri::command]
async fn save_app_data(app: tauri::AppHandle, data: AppData) -> Result<(), String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;

    let file_path = data_dir.join("data.json");
    let temp_path = data_dir.join("data.json.tmp");

    // Backup existing file before overwriting
    if file_path.exists() {
        let backup_path = get_backup_path(&file_path);
        fs::copy(&file_path, &backup_path)
            .map_err(|e| format!("Failed to create backup: {}", e))?;
    }

    // Wrap data with schema version
    let versioned = VersionedData {
        schema_version: CURRENT_SCHEMA_VERSION,
        data: serde_json::to_value(&data).map_err(|e| e.to_string())?,
    };

    let json = serde_json::to_string_pretty(&versioned).map_err(|e| e.to_string())?;

    // Write to temporary file first
    fs::write(&temp_path, &json).map_err(|e| e.to_string())?;

    // Atomic rename (replaces file_path if it exists)
    fs::rename(&temp_path, &file_path).map_err(|e| {
        // Clean up temp file on failure
        let _ = fs::remove_file(&temp_path);
        e.to_string()
    })
}

#[tauri::command]
fn get_system_info() -> serde_json::Value {
    serde_json::json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logger
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            load_app_data,
            save_app_data,
            get_system_info,
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| {
            // Graceful shutdown: log exit event
            if let tauri::RunEvent::Exit = event {
                log::info!("Application exiting");
            }
        });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn app_data_default_has_dark_theme() {
        let data = AppData {
            settings: AppSettings {
                theme: default_theme(),
                tags: default_tags(),
                monthly_target: default_monthly_target(),
            },
            ..Default::default()
        };
        assert_eq!(data.settings.theme, "dark");
    }

    #[test]
    fn app_data_default_tags_not_empty() {
        let tags = default_tags();
        assert!(!tags.is_empty());
    }

    #[test]
    fn app_data_serializes_and_deserializes() {
        let data = AppData::default();
        let json = serde_json::to_string(&data).expect("serialize");
        let restored: AppData = serde_json::from_str(&json).expect("deserialize");
        assert_eq!(restored.settings.theme, data.settings.theme);
    }
}