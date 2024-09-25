use libsql::{params, Connection};
use warp::{http::StatusCode, Rejection, Reply};

use crate::models::{Message, UrlDbSchema};

pub async fn get_user(discord_id: String, db: Connection) -> Result<impl Reply, Rejection> {
    // Reset the db??
    db.reset().await;

    match db
        .query(
            "SELECT * FROM urls WHERE discord_id = ?",
            params![discord_id],
        )
        .await
    {
        Ok(mut rows) => {
            let mut urls = Vec::new();
            loop {
                match rows.next().await {
                    Ok(Some(row)) => {
                        let url = UrlDbSchema::from_row(&row);
                        urls.push(url);
                    }
                    Ok(None) => break,
                    Err(e) => {
                        eprintln!("Error processing row: {}", e);
                        return Ok(warp::reply::with_status(
                            warp::reply::json(&Message {
                                message: None,
                                error: Some(format!("Error processing row: {}", e)),
                            }),
                            StatusCode::INTERNAL_SERVER_ERROR,
                        ));
                    }
                }
            }

            if urls.is_empty() {
                Ok(warp::reply::with_status(
                    warp::reply::json(&Message {
                        message: None,
                        error: Some("User with that ID not found".to_string()),
                    }),
                    StatusCode::NOT_FOUND,
                ))
            } else {
                Ok(warp::reply::with_status(
                    warp::reply::json(&urls),
                    StatusCode::OK,
                ))
            }
        }
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
