//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose= require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://todolist:Abhi-12345@mycluster.w15ks.mongodb.net/todolist?retryWrites=true&w=majority");


const itemSchema={
   name: String
};
const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"Welcome to your todolist"
})
const item2=new Item({
  name:"Hit + to add an item"
})
const item3=new Item({
  name:"-- hit this to delete an item"
})

const defaultItems=[item1, item2, item3];

const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);
app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if (foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("Successfully saved default items to DB ");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  })
});


app.post("/", function(req, res){

  const itemName= req.body.newItem;
  const listName= req.body.list;
  const item= new Item({
    name:itemName
  }) ;
  if(listName==="Today"){

    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err, foundList){
         foundList.items.push(item);
         foundList.save();
         res.redirect("/"+ listName)
    });
  }
  });


app.post("/delete",function(req,res){
   const checkedItemid=req.body.checkbox;
   const listName=req.body.listName;
   if (listName==="Today"){
   Item.findByIdAndRemove(checkedItemid,function(err){
     if (!err){
       console.log("Successfully deleted cheked item");
       res.redirect("/");
       }
     });
   }else{
    List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemid}}},function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
   }
})
app.get("/:customListName", function(req,res){
   const customListName=_.capitalize(req.params.customListName);

   List.findOne({name:customListName},function(err,foundList){

     if (!err){
       if (!foundList){
         //create a mew list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
       }else{
        // show an existing list
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
       }
     }
   })

   const list= new List({
     name:customListName,
     items:defaultItems
   });


   // res.redirect('/');
});

app.get("/about", function(req, res){
  res.render("about");
});
let port= process.env.PORT;
if (port== null || port=""){
  port=3000;
}
app.listen(port,function() {
  console.log("Server has started Successfully");
});
