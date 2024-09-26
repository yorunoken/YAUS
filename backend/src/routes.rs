use crate::{
    api::{delete, get, post},
    database::with_db,
};
use libsql::Connection;
use warp::{body::json, Filter};

pub fn routes(
    db: Connection,
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    // GET routes

    let get_url = warp::path!("api" / "url" / String)
        .and(warp::get())
        .and(with_db(db.clone()))
        .and_then(get::url);

    let get_user = warp::path!("api" / "user" / String / "details")
        .and(warp::get())
        .and(with_db(db.clone()))
        .and_then(get::user);

    // POST routes

    let insert_url = warp::path!("api" / "url")
        .and(warp::post())
        .and(json())
        .and(with_db(db.clone()))
        .and_then(post::url);

    // DELETE routes

    let delete_url = warp::path!("api" / "url" / String)
        .and(warp::delete())
        .and(with_db(db.clone()))
        .and_then(delete::url);

    insert_url.or(get_url).or(get_user).or(delete_url)
}
