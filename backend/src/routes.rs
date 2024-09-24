use crate::{
    api::{get, post},
    database::with_db,
};
use libsql::Connection;
use warp::{body::json, Filter};

pub fn routes(
    db: Connection,
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    // GET routes

    let get_url = warp::path!("api" / "get" / String)
        .and(warp::get())
        .and(with_db(db.clone()))
        .and_then(get::get_url);

    // POST routes

    let insert_url = warp::path!("api" / "url" / "shorten")
        .and(warp::post())
        .and(json())
        .and(with_db(db.clone()))
        .and_then(post::shorten_url);

    insert_url.or(get_url)
}
