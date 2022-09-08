const {
  getCategoryList,
  getSingleReviewByID,
  getUserList,
  addReviewVotes,
  getCommentsArrayForReview,
  postCommentToSpecificReview
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

exports.patchReviewVotesByID = (req, res, next) => {
  let reviewID = req.params.review_id;
  let voteInc = req.body.inc_votes;
  return addReviewVotes(reviewID, voteInc)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsFromReview = (req, res) => {
  let reviewID = req.params.review_id
  return getCommentsArrayForReview(reviewID).then((data) => {
    res.status(200).send({data});
  });
};

exports.postCommentToReview = (req, res) => {
  let reviewID = req.params.review_id
  let objToPost = req.body
  console.log(objToPost)
  return postCommentToSpecificReview(reviewID).then((data) => {
    res.status(200).send({data});
  });
};