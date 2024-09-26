use crate::models::Message;
use libsql::{params, Connection};
use warp::{http::StatusCode, Rejection, Reply};

pub async fn url(short_code: String, db: Connection) -> Result<impl Reply, Rejection> {
    // Reset the db??
    db.reset().await;

    match db
        .execute(
            "DELETE FROM urls WHERE short_code = ?",
            params![short_code.clone()],
        )
        .await
    {
        Ok(rows_affected) => {
            if rows_affected > 0 {
                Ok(warp::reply::with_status(
                    warp::reply::json(&Message {
                        message: Some(format!(
                            "URL with short code {} deleted successfully",
                            short_code
                        )),
                        error: None,
                    }),
                    StatusCode::OK,
                ))
            } else {
                Ok(warp::reply::with_status(
                    warp::reply::json(&Message {
                        message: None,
                        error: Some(format!("No URL found with short code {}", short_code)),
                    }),
                    StatusCode::NOT_FOUND,
                ))
            }
        }
        Err(e) => {
            eprintln!("Failed to delete URL: {}", e);
            Ok(warp::reply::with_status(
                warp::reply::json(&Message {
                    message: None,
                    error: Some(format!("Failed to delete URL: {}", e)),
                }),
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    }
}
