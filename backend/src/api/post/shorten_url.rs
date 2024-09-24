use libsql::{params, Connection};
use warp::{http::StatusCode, Rejection, Reply};

use crate::{
    models::{Message, ShortCode, UrlExistsRequest},
    utils::generate_unique_short_code,
};

pub async fn shorten_url(
    request: UrlExistsRequest,
    db: Connection,
) -> Result<impl Reply, Rejection> {
    // Reset the db??
    db.reset().await;

    let long_url = request.url;
    let short_code = generate_unique_short_code(&db, 12).await?;

    match db
        .execute(
            "INSERT INTO urls (short_code, original_url) VALUES (?, ?)",
            params![short_code.clone(), long_url],
        )
        .await
    {
        Ok(_) => Ok(warp::reply::with_status(
            warp::reply::json(&ShortCode { code: short_code }),
            StatusCode::OK,
        )),
        Err(e) => {
            eprintln!("Failed to insert URL: {}", e);
            Ok(warp::reply::with_status(
                warp::reply::json(&Message {
                    message: None,
                    error: Some(format!("Failed to insert URL: {}", e)),
                }),
                StatusCode::INTERNAL_SERVER_ERROR,
            ))
        }
    }
}
