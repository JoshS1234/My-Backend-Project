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

exports.getReviewListComments = (categoryObj) => {
  validKeys = [
    "review_id",
    "owner",
    "title",
    "category",
    "review_img_url",
    "created_at",
    "votes",
    "designer",
    "comment_count",
  ];

  return db
    .query(
      "SELECT review_id, COUNT(review_id) FROM comments GROUP BY review_id"
    )
    .then((data) => {
      let countData = data.rows;
      return Promise.all(countData);
    })
    .then((countData) => {
      let queryStr = `SELECT * FROM reviews `;
      if (Object.keys(categoryObj).length > 0) {
        let count = 0;
        for (key in categoryObj) {
          if (validKeys.includes(key)) {
            if (count === 0) {
              queryStr += `WHERE ${key} = '${categoryObj[key]}' `;
            } else {
              queryStr += `AND ${key} = '${categoryObj[key]}' `;
            }
            count++;
          }
        }
      }
      queryStr += `ORDER BY created_at DESC;`;
      return Promise.all([db.query(queryStr), countData]);
    })
    .then((promiseArr) => {
      let reviewArr = promiseArr[0].rows;
      let countObj = promiseArr[1];

      countObj2 = {};
      for (element of countObj) {
        countObj2[element.review_id] = element.count;
      }

      let outputReviews = reviewArr.map((review) => {
        if (countObj2[review.review_id]) {
          review.comment_count = Number(countObj2[review.review_id]);
        } else {
          review.comment_count = 0;
        }
        return review;
      });
      return outputReviews;
    });
};
