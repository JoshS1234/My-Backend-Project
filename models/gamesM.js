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

exports.getReviewListComments = (categoryObj) => {
  validCategories = [
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
      `SELECT users.username, COUNT(reviews.owner) FROM reviews 
  JOIN users
  ON reviews.owner = users.username
  GROUP BY users.username;`
    )
    .then((countObj) => {
      countObj = countObj.rows;
      let countObj2 = {};
      countObj.forEach((user) => {
        countObj2[user.username] = user.count;
      });
      return Promise.all([
        db.query(`ALTER TABLE reviews
      ADD comment_count INT;
      `),
        countObj2,
      ]);
    })
    .then((promise) => {
      let countObj = promise[1];
      let promiseArr = [];
      for (owner in countObj) {
        promiseArr.push(
          db.query(
            `UPDATE reviews
            SET comment_count=$1 
            WHERE owner=$2;`,
            [countObj[owner], owner]
          )
        );
      }
      return Promise.all(promiseArr);
    })
    .then(() => {
      dbRequest = `SELECT * FROM reviews`;

      let count = 0;
      console.log(categoryObj);
      for (key in categoryObj) {
        if (typeof categoryObj[key] === "string") {
          categoryObj[key] = `'${categoryObj[key]}'`;
          console.log(categoryObj[key]);
        }

        if (count === 0) {
          if (validCategories.includes(key)) {
            dbRequest += ` WHERE ${key}=${categoryObj[key]}`;
          } else {
            return Promise.reject({ status: 400, msg: "not a valid category" });
          }
          count++;
        } else {
          if (validCategories.includes(key)) {
            dbRequest += ` AND ${key}=${categoryObj[key]}`;
          } else {
            return Promise.reject({ status: 400, msg: "not a valid category" });
          }
          count++;
        }
      }
      dbRequest += ` ORDER BY created_at DESC;`;
      console.log(dbRequest);
      return db.query(dbRequest);
    })
    .then((updatedReviews) => {
      console.log(updatedReviews);
      return updatedReviews.rows;
    });
};
