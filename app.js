//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect("mongodb://localhost:27017/todoListDB");
//Schema of db todoListDB
const itemsSchema = {
  name: String
};
//Model for itemsSchema
const Item = mongoose.model("Item", itemsSchema);
//Creating an Item in DB todoListDB refering model Item
const item1 = new Item({
  name : "Welcome to your todolist!"
});
const item2 = new Item({
  name : "Hit the + button to add an item"
});
const item3 = new Item({
  name : "<-- Hit this to delete an item"
});

// storing the items created above into an array
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
//Model
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err, foundItems){
    if( foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if (err) {console.log(err);}
        else {console.log("Successfully added to DB.");  }
      });
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
});
// // const schema = Schema({ name: [String] });
// const nameSchema = {
//   name: [String]
// };
// const Test = mongoose.model('Test', nameSchema);
//
// const doc =  new Test({ name: [] });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const itemList = req.body.list;
  const item = new Item ({
    name: itemName
  });
  if (itemList === "Today") {
    // You can also pass an object with `$each` as the
    // first parameter to use MongoDB's `$position`
    // doc.name.push({name:[itemName]});
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name: itemList}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + itemList);
    });
  }


});
app.post("/delete", function(req, res){

  const deleteItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove (deleteItem, function(err){
      if (!err) {
        res.redirect("/");
      }
    });
  }else {
  List.findOneAndUpdate({name: listName},{$pull:{items:{_id:deleteItem}}}, function(err, foundList){
    if (!err) {
      res.redirect("/" + listName);
    }
   });
  }


});

app.get("/:todoListName/", (req, res) => {
  const todoList = _.capitalize(req.params.todoListName);

  List.findOne({name:todoList},function(err,getList){
    if(!err){
      if (!getList) {
        const list = new List ({
          name: todoList,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + todoList);
      }else {
        res.render("list", {listTitle: getList.name , newListItems: getList.items});
      }
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
