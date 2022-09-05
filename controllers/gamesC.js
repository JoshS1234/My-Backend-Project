const { getCategoryList } = require("../models/gamesM.js");

exports.getCategories = (req, res) => {
  return getCategoryList().then((data) => {
    res.status(200).send(data);
  });
};
