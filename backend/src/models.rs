use libsql::Row;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct UrlExistsRequest {
    pub url: String,
}

#[derive(Deserialize, Serialize)]
pub struct UrlDbSchema {
    id: String,
    short_code: String,
    original_url: String,
    created_at: String,
}

impl UrlDbSchema {
    pub fn from_row(row: &Row) -> Self {
        Self {
            id: row.get(0).unwrap_or(String::from("")),
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
