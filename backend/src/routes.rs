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

    let get_url = warp::path!("api" / "url" / String / "get")
        .and(warp::get())
        .and(with_db(db.clone()))
        .and_then(get::get_url);

    let get_user = warp::path!("api" / "user" / String / "get")
        .and(warp::get())
        .and(with_db(db.clone()))
        .and_then(get::get_user);

    // POST routes

    let insert_url = warp::path!("api" / "url" / "shorten")
        .and(warp::post())
        .and(json())
        .and(with_db(db.clone()))
        .and_then(post::shorten_url);

    insert_url.or(get_url).or(get_user)
}
