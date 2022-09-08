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
      if (reviews.length > 0) {
        for (singleReview of reviews) {
          singleReview.comment_count = reviews.length;
        }
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

exports.getCommentsArrayForReview = (reviewID) => {
  return db
    .query(`SELECT * FROM comments WHERE review_id=$1`, [reviewID])
    .then((data) => {
      return data.rows;
    });
};

// exports.postCommentToSpecificReview = (reviewID, objToPost) => {
  
//     return db
//       .query(
//         `INSERT INTO comments (review_id, author, body) VALUES ($1, $2, $3)`,
//         [reviewID, objToPost.username, objToPost.body]
//       )
//       .then((data) => {
//         return db.query(
//           `SELECT * FROM comments WHERE review_id=$1 AND author=$2 AND body=$3`,
//           [reviewID, objToPost.username, objToPost.body]
//         );
//       })
//       .then((uploadedComment) => {
//         return uploadedComment.rows;
//       })
//       .catch((err)=>{
//         return Promise.reject(err)
//       });
// };
exports.postCommentToSpecificReview = (reviewID, objToPost) => {
  console.log(typeof objToPost.username)
  
  return db
    .query(
      `INSERT INTO comments (review_id, author, body) VALUES ($1, $2, $3) RETURNING *`,
      [reviewID, objToPost.username, objToPost.body]
    )
    .then((uploadedComment) => {
      return uploadedComment.rows[0];
    })
};