'use strict';

// Imports
const express = require('express');
const app = express();
var path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config();

app.use(express.static(__dirname + '/'));
app.use(express.json());
app.use(cors());

// Mongoose connect
const uri = "mongodb+srv://JlearnUse:wVmV4RL0am4MuinO@learningcluster0.p98nk.mongodb.net/btph?retryWrites=true&w=majority";
const mOpts = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
};
mongoose.connect(uri, mOpts);

// Mongoose connect events
let isDbConnected = false;
let db = mongoose.connection;
db.on('connecting', () => {
  console.log("Connecting to the database...");
});

db.on('error', err => {
  console.log("Database connect error: ", err);
  isDbConnected = false;
  mongoose.disconnect();
});

db.on('reconnected', () => {
  console.log("Database successfully reconnected!");
  isDbConnected = true;
})

db.on('disconnected', function () {
  console.log('MongoDB disconnected!');
  isDbConnected = false;
  mongoose.connect(uri, mOpts);
});

db.on('connected', () => {
  console.log('Database connected!');
  isDbConnected = true;
});

db.once('open', () => {
  console.log('Database connection successfully opened!');
});

// Mongoose model imports
let Product = require('./js/models/product');
let Customer = require('./js/models/customer');
let Event = require('./js/models/events');
let User = require('./js/models/users');

// Routes
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

function authenticateToken(req, res, next) {
  const token = req.headers['x-access-token'];

  console.log("token from client: ", token)
  if (token == null) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send({ hasToken: true, auth: false, message: 'Failed to authenticate token.' });
    req.user = user;
    next();
  });
}

app.get('/', authenticateToken, (req, res) => {
  res.status(301).redirect('/dashboard');
});

app.use('/authenticate', authenticateToken, (req, res) => {
  res.status(301).redirect('/dashboard');
});

app.get('/ping', authenticateToken, (req, res) => {
  if (isDbConnected) {
    res.send({connected: true});
  } else res.status(500).send({error: "Database connect error"});
});

app.use('/login', (req, res) => {
  console.log(req.headers);

  User.findOne({
    username: req.body.username
  }).then(user => {
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials.'
      });
    }
    console.log("Comparing bcrypt...");
    bcrypt.compare(req.body.password, user.password).then(
      valid => {
        if (!valid) {
          console.log("Invalid bcrypt", req.body.password, user.password);
          return res.status(401).json({
            error: 'Invalid credentials.'
          });
        }
        const token = jwt.sign({userId: user._id},
          process.env.TOKEN_SECRET, {
            expiresIn: '1hr'
          });
        console.log("token in server: ", token);
        res.status(200).json({
          userId: user._id,
          token: token
        });
      }
    ).catch(
      (error) => {
        res.status(500).json({
          error: `in bcrypt: ${error}`
        });
      }
    );
  }).catch(
    (error) => {
      res.status(500).json({
        error: "in find()"
      });
    }
  );
});

app.post('/signup', (req, res) => {
  console.log(req.body);

  let newUser = new User({
    username: req.body.username,
    password: req.body.password
  });

  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(newUser.password, salt,
      (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then(value => {
          console.log(value);
          res.send(value);
        })
      }
    )
  )
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
    Product.find({
      _id: req.query.p
    }, (err, product) => {
      if (err) {
        res.status(500).send({
          error: `There is no product called ${req.query.p} found.`
        });
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
    res.status(404).send({
      error: "Not found."
    })
  }
});

app.delete('/del?', (req, res) => {
  console.log(req.query.id);
  if (req.query.i === "product") {
    console.log("Data body:", req.body);

    let product = Product.find({
      _id: req.body._id
    });
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
    res.status(404).send({
      error: "Not found."
    })
  }
});

app.get("/dashboard", (req, res) => {
  res.send({
    msg: "Hello! responding Dashboad from Node server."
  });
});

let port = 8080;

app.listen(process.env.PORT || port, () => {
  console.log(`BTPH API listening on port ${process.env.PORT || port}`);
});