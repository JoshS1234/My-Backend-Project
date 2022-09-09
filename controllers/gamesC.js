const {
  getCategoryList,
  getSingleReviewByID,
  getUserList,
  addReviewVotes,
  getCommentsArrayForReview,
  postCommentToSpecificReview,
  getReviewListComments,
  deleteCommentFromIDModel,
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
  let reviewID = req.params.review_id;
  return getCommentsArrayForReview(reviewID).then((data) => {
    res.status(200).send({ comments: data });
  });
};

exports.postCommentToReview = (req, res, next) => {
  const reviewID = req.params.review_id;
  const objToPost = req.body;
  return postCommentToSpecificReview(reviewID, objToPost)
    .then((comment) => {
      res.status(201).send({ comment: comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getReviewListWithCommentCount = (req, res, next) => {
  let categoryObj = req.query;
  return getReviewListComments(categoryObj)
    .then((reviewList) => {
      res.status(200).send({ reviewList });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteCommentByID = (req, res, next) => {
  let commentID = req.params.comment_id;
  return deleteCommentFromIDModel(commentID)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};
