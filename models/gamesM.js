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
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};
