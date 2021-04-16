'use strict';


// const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://JlearnUse:wVmV4RL0am4MuinO@learningcluster0.p98nk.mongodb.net/btph?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let express = require('express');
let app = express();
var path = require('path');
let mongoose = require('mongoose');
let cors = require('cors');
// let db = mongoose.connect("mongodb://localhost/btph", {
//   useNewUrlParser: true, useUnifiedTopology: true
// });

app.use(express.static(__dirname + '/'));
app.use(express.json());
app.use(cors());

mongoose.connect(uri, {
  useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true
}).then(console.log("Connect successful."));

let Product = require('./js/models/product');
let Customer = require('./js/models/customer');
let Event = require('./js/models/events');

app.get('/aneue-sama', (req, res) => {
  res.send("Daisukiiiiiiii");
});

app.get('/do?', (req, res) => {
  let q = req.query;
  if (!q || q === "") {
    res.status(303).send({
      error: "Uhh, I think you're in the wrong API here..."
    });
  } else {
    if (req.query.love === "aneue-sama") {
      res.send("HAAAAAAIII");
    } else if (req.query.love === "lyn") {
      res.send("<h1>Sorry...</h1>");
    } else if (req.query.love === "ken") {
      res.send("Paglaki ko gusto kong maging kriminal");
    } else if (req.query.love === "yana") {
      res.send("HAHAHAHAHAHAAHAHA sorry");
    } else if (req.query.love === "") {
      res.send("yes i love myself thank you");
    } else {
      res.send("lol who dat");
    }
  }
});

// function sendPro(err, products) {
//   return res.send(products);
// }

// function someF(req, res) {
//   return Product.find({}, sendPro(res));
// }

// app.get('/products', someF(app.req, app.res));

app.get('/', (req, res) => {
  res.send();
});

app.get('/load?', (req, res) => {
  if (req.query.p == "") {
    Product.find({}, (err, products) => {
      res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }).send(products);
    });
  } else if (req.query.p == "events") {
    Event.find({}, (err, event) => {
      res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }).send(event);
    });
  } else {
    Product.find({_id:req.query.p}, (err, product) => {
      if (err) {
        res.status(500).send({error: `There is no product called ${req.query.p} found.`});
      } else {
        res.set({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }).send(product);
      }
    });
  }
});

app.post('/add?', (req, res) => {
  if (req.query.i === "product") {
    console.log("Data body:", req.body);
    let product = new Product({
      name: req.body.name,
      code: req.body.code,
      class: req.body.class,
      category: req.body.category,
      quantity: req.body.quantity,
      price: req.body.price,
      salePrice: req.body.salePrice
    });

    product.save((err, savedProduct) => {
      if (err) {
        res.status(500).send({
          error: "There was an error in saving the product."
        });
      } else {
        res.send(savedProduct);
      }
    });
  } else if (req.query.i === "event") {
    let event = new Event({
      name: req.body.name,
      date: req.body.date,
      venue: req.body.venue
    });

    event.save((err, savedEvent) => {
      if (err) {
        res.status(500).send({
          error: "There was an error in saving the event."
        });
      } else {
        res.send(savedEvent);
      }
    });
  } else {
    res.status(404).send({error:"Not found."})
  }
});

app.delete('/del?', (req, res) => {
  console.log(req.query.id);
  if (req.query.i === "product") {
    console.log("Data body:", req.body);

    let product = Product.find({_id: req.body._id});
    product.deleteOne((err, product) => {
      if (err) {
        res.status(500).send({
          error: "There was an error in deleting the product."
        });
      } else {
        res.send(product);
      }
    });

  } else if (req.query.i === "event") {
    event.save((err, savedEvent) => {
      if (err) {
        res.status(500).send({
          error: "There was an error in saving the event."
        });
      } else {
        res.send(savedEvent);
      }
    });
  } else {
    res.status(404).send({error:"Not found."})
  }
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname + '/html/inv-main.html'));
});

let port = 8080;

app.listen(process.env.PORT || 5000, () => {
  console.log(`BTPH API listening on port ${port}`);
});

// pokeName.innerHTML = "Hello";