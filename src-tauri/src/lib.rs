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
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: String,
    pub tags: Vec<String>,
}

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
            },
            ..Default::default()
        })
    }
}

#[tauri::command]
async fn save_app_data(app: tauri::AppHandle, data: AppData) -> Result<(), String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(data_dir.join("data.json"), json).map_err(|e| e.to_string())
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
        .invoke_handler(tauri::generate_handler![
            load_app_data,
            save_app_data,
            get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}