use libsql::Row;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct UrlExistsRequest {
    pub url: String,
    #[serde(rename = "discordId")]
    pub discord_id: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct UrlDbSchema {
    discord_id: Option<String>,
    short_code: String,
    original_url: String,
    created_at: String,
}

impl UrlDbSchema {
    pub fn from_row(row: &Row) -> Self {
        Self {
            discord_id: row.get(0).unwrap_or(None),
            short_code: row.get(1).unwrap_or(String::from("")),
            original_url: row.get(2).unwrap_or(String::from("")),
            created_at: row.get(3).unwrap_or(String::from("")),
        }
    }
}

#[derive(Deserialize, Serialize)]
pub struct ShortCode {
    pub code: String,
}

#[derive(Deserialize, Serialize)]
pub struct Message {
    pub message: Option<String>,
    pub error: Option<String>,
}
