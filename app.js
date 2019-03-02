//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');
mongoose.connect('mongodb+srv://admin_acydh:mongodb1884@cluster0-hhwv2.mongodb.net/todolistDB', {useNewUrlParser: true});
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Default Item 1"
});
const item2 = new Item({
  name: "Default Item 2"
});
const item3 = new Item({
  name: "Default Item 3"
});

const defaultItems = [item1, item2, item3];

// ROUTES


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, response){
    if(response){
      res.render("list", {listTitle: response.name, newListItems: response.items});
    } else {
      const list = new List({name: customListName, items: defaultItems});
      list.save();
      console.log("List " + customListName + " created and populated");
      res.redirect("/" + customListName);
    }
  });
});


app.get("/", function(req, res) {
  Item.find({}, function(err, response){
    if (err) {
      console.log("Issues finding items");
    } else {
      const selectedItems = response;
      if (selectedItems.length === 0) {
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("Insert done");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: selectedItems});
      }
    }
  });
});

app.post("/", function(req, res){
  const listName = req.body.list;
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const listName = req.body.listName;
  const itemId = req.body.checkbox;
  if (listName === "Today") {
    Item.findByIdAndRemove(req.body.checkbox, function(err){
      if (!err) {
        console.log("Item " + req.body.checkbox + " removed");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, function(err, foundList) {
      res.redirect("/" + listName);
    });
  }
});

// SERVER STUFF

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started");
});
