const express = require("express");
const { getCategories } = require(`${__dirname}/controllers/gamesC`);

const app = express();
app.use(express.json());

app.get("/api/categories", getCategories);

//error handling
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "general error catch" });
});

module.exports = app;
