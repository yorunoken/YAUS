use libsql::{params, Connection};
use warp::{http::StatusCode, Rejection, Reply};

use crate::models::{Message, UrlDbSchema};

pub async fn url(code: String, db: Connection) -> Result<impl Reply, Rejection> {
    // Reset the db??
    db.reset().await;

    match db
        .query("SELECT * FROM urls WHERE short_code = ?", params![code])
        .await
    {
        Ok(mut rows) => match rows.next().await {
            Ok(Some(row)) => {
                let url = UrlDbSchema::from_row(&row);
                Ok(warp::reply::with_status(
                    warp::reply::json(&url),
                    StatusCode::OK,
                ))
            }
            Ok(None) => Ok(warp::reply::with_status(
                warp::reply::json(&Message {
                    message: None,
                    error: Some("URL not found".to_string()),
                }),
                StatusCode::NOT_FOUND,
            )),
            Err(e) => {
                eprintln!("Failed to retrieve URL: {}", e);
                Ok(warp::reply::with_status(
                    warp::reply::json(&Message {
                        message: None,
                        error: Some(format!("Failed to retrieve URL: {}", e)),
                    }),
                    StatusCode::INTERNAL_SERVER_ERROR,
                ))
            }
        },
        Err(e) => {
            eprintln!("Failed to query database: {}", e);
            Ok(warp::reply::with_status(
                warp::reply::json(&Message {
                    message: None,
                    error: Some(format!("Failed to query database: {}", e)),
                }),
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    }
}
