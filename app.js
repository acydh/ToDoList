//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

var items = ["Buy food", "Cook food", "Eat food"];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

// ROUTES

app.get("/", function(req, res) {
  var todayDate = new Date();
  var day = todayDate.toLocaleDateString("en-US", {weekday: "long", day: "numeric", month: "long"});
  res.render("list", {
    day: day,
    newListItems: items
  });
});

app.post("/", function (req, res) {
  items.push(req.body.newItem);
  res.redirect("/");
});


// SERVER STUFF

app.listen(3000, function() {
  console.log("server started");
});
