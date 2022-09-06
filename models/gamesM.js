const db = require("../db/connection");

exports.getCategoryList = () => {
  return db.query("SELECT * FROM categories").then((data) => {
    return data.rows;
  });
};

exports.getUserList = () => {
  return db.query("SELECT * FROM users").then((users) => {
    return users.rows;
  });
};

exports.getSingleReviewByID = (reviewID) => {
  return db
    .query(
      `SELECT reviews.review_id, review_body, title, designer, review_img_url, reviews.votes, category, owner, reviews.created_at FROM reviews 
      LEFT JOIN comments 
      ON comments.review_id=reviews.review_id 
      WHERE reviews.review_id=$1`,
      [reviewID]
    )
    .then((reviews) => {
      reviews = reviews.rows;
      console.log(reviews);
      if (reviews.length > 0) {
        for (singleReview of reviews) {
          console.log(singleReview);
          singleReview.comment_count = reviews.length;
          console.log(singleReview);
        }
        console.log(reviews);
        return { reviews };
      } else {
        return Promise.reject({
          status: 404,
          msg: "not present in database",
        });
      }
    });
};

exports.addReviewVotes = (reviewID, voteInc) => {
  if (voteInc < 0) {
    return Promise.reject({ status: 400, msg: "Votes must be positive" });
  }

  return db
    .query(`SELECT * FROM reviews WHERE review_id=$1`, [reviewID])
    .then((data) => {
      let currentVotes = data.rows[0].votes;
      let newVotes = currentVotes + voteInc;
      return db
        .query(`UPDATE reviews SET votes = $1 WHERE review_id=$2`, [
          newVotes,
          reviewID,
        ])
        .then((data) => {
          return db.query(`SELECT * FROM reviews WHERE review_id=$1`, [
            reviewID,
          ]);
        })
        .then((data) => {
          return data.rows[0];
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    });
};
