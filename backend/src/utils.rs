use libsql::{params, Connection};
use rand::{thread_rng, Rng};

use warp::Rejection;

pub async fn generate_unique_short_code(
    db: &Connection,
    length: usize,
) -> Result<String, Rejection> {
    const MAX_ATTEMPTS: u32 = 10;
    for _ in 0..MAX_ATTEMPTS {
        let short_code = generate_random_string(length);

        let exists: bool = db
            .query(
                "SELECT 1 FROM urls WHERE short_code = ?",
                params![short_code.clone()],
            )
            .await
            .map_err(|e| {
                eprintln!("Database error: {}", e);
                warp::reject::custom(DatabaseError)
            })?
            .next()
            .await
            .map_err(|e| {
                eprintln!("Database error: {}", e);
                warp::reject::custom(DatabaseError)
            })?
            .is_some();

        println!("{}", exists);

        if !exists {
            return Ok(short_code);
        }
    }
    Err(warp::reject::custom(ShortCodeGenerationError))
}

pub fn generate_random_string(length: usize) -> String {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
                            abcdefghijklmnopqrstuvwxyz\
                            0123456789";

    let mut rng = thread_rng();

    (0..length)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

#[derive(Debug)]
struct DatabaseError;
impl warp::reject::Reject for DatabaseError {}

#[derive(Debug)]
struct ShortCodeGenerationError;
impl warp::reject::Reject for ShortCodeGenerationError {}
