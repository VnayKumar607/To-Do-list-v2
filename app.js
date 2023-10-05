//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose  = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connection
mongoose.connect('mongodb+srv://admin-vinaykumar:Vinay2001@cluster0.8uapeii.mongodb.net/todolistDB');

//schema
const itemSchema = new mongoose.Schema({
  name: String
});

//model
const Item = mongoose.model("Item" , itemSchema);

const item1 = new Item({
  name: "Welcome to ToDo List!"
});
const item2 = new Item({
  name: "Press + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List" , listSchema);


app.get("/", function(req, res) {
  
  Item.find({}).then(function(foundItems){
    
    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
        console.log("succesffullly added default items!")
      }).catch(function(e){
        console.log(e);
      })
    
    res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
     }).catch(function(e){
    console.log(e);
  })
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName == "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save();

      res.redirect("/" + listName);
    }).catch((err)=>{
      console.log(err);
    })
  }

});

app.post("/delete" ,function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName == "Today"){
    Item.deleteOne({_id: checkedItemId}).then(function(){
      console.log("Scucessfully deleted checked item");
    }).catch(function(e){
      console.log(e);
    })
  
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then((foundList) =>{
      res.redirect("/" + listName);
    }).catch((err) =>{
      console.log(err);
    })
  }

})
  

app.get("/:customlistName" , function(req,res){
  const customlistName = _.capitalize(req.params.customlistName);
  
  List.findOne({name: customlistName}).then((foundList)=>{

    if(!foundList){
      const list = new List({
      name: customlistName,
      items: defaultItems
      });

      list.save();
      res.redirect("/" + customlistName);
    }

    if(foundList){
      res.render("list" , {listTitle: foundList.name, newListItems: foundList.items})
    }

  }).catch((err) =>{
    console.log(err);
  }) 
  

})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port , function() {
  console.log("Server started successfully...");
});
