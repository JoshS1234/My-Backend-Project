const {
  getCategoryList,
  getUserList,
  getSingleReviewByID,
} = require("../models/gamesM.js");

exports.getCategories = (req, res) => {
  return getCategoryList().then((data) => {
    res.status(200).send(data);
  });
};

exports.getUsers = (req, res) => {
  return getUserList().then((users) => {
    res.status(200).send({ users });
  });
};

exports.getReviewByID = (req, res, next) => {
  let reviewID = req.params.review_id;
  return getSingleReviewByID(reviewID)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      next(err);
    });
};
