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

  let queryStr = `SELECT owner, title, reviews.review_id, category, review_img_url, reviews.created_at, reviews.votes, designer, COUNT(reviews.review_id) AS comment_count FROM comments 
FULL JOIN reviews ON reviews.review_id = comments.review_id `;
  let validKey = true;
  let repeatKey = false;
  for (key in categoryObj) {
    if (Array.isArray(categoryObj[key])) {
      repeatKey = true;
    }
  }

  if (repeatKey) {
    return Promise.reject({
      status: 400,
      msg: "Query has been entered more than once",
    });
  } else {
    let defaultQueryStr2 = `GROUP BY reviews.review_id ORDER BY created_at `;
    let defaultQueryStr3 = `DESC;`;

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
        } else if (key === "sort_by") {
          if (validKeys.includes(categoryObj[key])) {
            defaultQueryStr2 = `GROUP BY reviews.review_id ORDER BY ${categoryObj[key]} `;
          } else {
            validKey = false;
          }
        } else if (key === "order") {
          if (["asc", "desc"].includes(categoryObj[key])) {
            defaultQueryStr3 = `${categoryObj[key]}`;
          } else {
            validKey = false;
          }
        } else {
          validKey = false;
        }
      }
    }

    queryStr += defaultQueryStr2;
    queryStr += defaultQueryStr3;

    if (validKey === true) {
      return db.query(queryStr).then((data) => {
        let output = data.rows.map((element) => {
          element.comment_count = Number(element.comment_count);
          return element;
        });
        return output;
      });
    } else {
      return Promise.reject({ status: 404, msg: "not a valid key" });
    }
  }
};

exports.postCommentToSpecificReview = (reviewID, objToPost) => {
  return db
    .query(
      `INSERT INTO comments (review_id, author, body) VALUES ($1, $2, $3) RETURNING *`,
      [reviewID, objToPost.username, objToPost.body]
    )
    .then((uploadedComment) => {
      return uploadedComment.rows[0];
    });
};
