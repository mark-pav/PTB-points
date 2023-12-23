const express = require('express');
const bodyParser = require("body-parser");
var path = require('path');
const ejs = require("ejs");
const { MongoClient } = require("mongodb");
require('dotenv').config();
// Replace the uri string with your connection string.
const uri = "mongodb+srv://admin:" + process.env.dbPASSWORD + "@ptb.fhfklxc.mongodb.net/?retryWrites=true&w=majority";
//mongodb+srv://mpAdmin:<password>@ptb.fhfklxc.mongodb.net/?retryWrites=true&w=majority
const client = new MongoClient(uri);


let todayDate = null;
let todayTime = null;
let todayYear = null;
let todayDateAndTime = null;
getFreshDate();
const app = express();


app.engine('.html', ejs.__express);


app.set('view engine', 'html');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery')));


app.get("/", function(req,res){
    
    getFreshDate();
    getPointCounts(2023).then( (returnedData) => {
      let countsData = returnedData;
      res.render('index', {countsData: countsData});
    });
    
    // for (i = 1; i < 19; i++){
    //   insertPoint("Ea", "", todayDate+" "+todayTime, todayYear, "2023 initial data upload #"+i);
    // }
    
});

app.post("/addPoint", function(req,res){
  const name = req.body.whoGetsPointSelect;
  const joke = req.body.joke;
  const notes = req.body.notes;

  getFreshDate();

  insertPoint(name, joke, todayDateAndTime, todayYear, notes).then((data) => {
    res.redirect("/");
  });
});



app.listen(3000, function() {
    console.log("Server started on port 3000");
});


function getFreshDate(){
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var ampm = "am";
  var hours = today.getHours();
  if(hours>12){
    hours-=12;
    ampm = "pm";
  }else{
    ampm = "am";
  }
  var minutes = String(today.getMinutes()).padStart(2, '0');

  todayDate = mm + '/' + dd + '/' + yyyy;
  todayTime = hours + ":" + minutes + " " + ampm;
  todayDateAndTime = todayDate+" "+todayTime, todayYear
  todayYear = yyyy;
}

async function insertPoint(name, joke, date, year, notes){
  try{
    const database = client.db('PTB');
    const pointsCollection = database.collection('points');
    const pointToBeInserted = { name: name, joke: joke, date: date, year: year, notes: notes};

    const result = await pointsCollection.insertOne(pointToBeInserted);
    console.log("inserted ", result, result.insertedId);
    

  }catch(err){
    console.log(err);
  }finally{
    //await client.close();
  }
}

async function getPointCounts(year){
  try{
    const database = client.db('PTB');
    const pointsCollection = database.collection('points');
    const pipeline = [{$match:{year:2023}}, {$group:{_id:"$name",count:{$sum:1}}},{$sort: { count: -1 }}]
    //shell 
    // db.points.aggregate([{$match:{year:2023 }}, {$group:{_id:"$name",count:{$sum:1}}},{$sort: { count: -1 }}])
    const aggCursor = pointsCollection.aggregate(pipeline);

    const result = await aggCursor.toArray();
    return result;


    // const query = { name: "Ma", year: todayYear};
    // const options = {sort: { notes: 1 }}
    // const cursor = pointsCollection.find(query, options);
    // test = await cursor.toArray();
    // console.log(test);

    // const count = await pointsCollection.countDocuments(query);
    // console.log("Count = ", count);
    // test2 =  count;
    // console.log("awaited ",test2)
    
    // return count;
    

  }catch(err){
    console.log(err);
  }finally{
    //await client.close();
  }
}

