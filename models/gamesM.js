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
    .query(`SELECT * FROM reviews WHERE review_id=$1;`, [reviewID])
    .then((data) => {
      data = data.rows;
      if (data.length > 0) {
        return data;
      } else {
        return Promise.reject({ status: 404, msg: "not present in database" });
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
