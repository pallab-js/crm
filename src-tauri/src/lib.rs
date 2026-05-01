use serde::{Deserialize, Serialize};
use std::fs;
use tauri::Manager;

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
        let raw = fs::read_to_string(&file).map_err(|e| e.to_string())?;
        serde_json::from_str(&raw).map_err(|e| e.to_string())
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

#[tauri::command]
async fn save_app_data(app: tauri::AppHandle, data: AppData) -> Result<(), String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    
    let file_path = data_dir.join("data.json");
    let temp_path = data_dir.join("data.json.tmp");
    
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    
    // Write to temporary file first
    fs::write(&temp_path, json).map_err(|e| e.to_string())?;
    
    // Atomic rename (replaces file_path if it exists)
    fs::rename(&temp_path, &file_path).map_err(|e| e.to_string())
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
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            load_app_data,
            save_app_data,
            get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
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