const db = require("../db/connection");

exports.getCategoryList = () => {
  return db
    .query("SELECT * FROM categories")
    .then((data) => {
      return data.rows;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};
