const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../services/authenticate-token");
const db = require("../db");

// Mongoose model imports
let Product = require("../models/product");
let Event = require("../models/events");
let User = require("../models/users");

const router = express.Router();

router.use(express.static(__dirname + "/"));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const KW_EVENT = "event";
const KW_PRODUCT = "product";

let isDbConnected;

// Mongoose connect flag
db.on("connected", () => {
  console.log("Database connected!");
  isDbConnected = true;
});

// Pings the database to check if it is connected
router.get("/ping", authenticateToken, (req, res) => {
  if (!isDbConnected)
    return res.status(500).json({ error: "Database connect error" });

  console.log(
    req.authDecoded,
    new Date(req.authDecoded.iat * 1000),
    new Date(req.authDecoded.exp * 1000)
  );

  return res.json({ auth: true });
});

// Authentication routes
router.post("/login", (req, res) => {
  User.findOne({ username: req.body.username }).then((user) => {
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    bcrypt.compare(req.body.password, user.password).then((valid) => {
      if (!valid)
        return res.status(401).json({ error: "Invalid credentials." });

      const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: "10m",
      });

      // console.log("token in server: ", token);
      var decoded = jwt.decode(token, process.env.TOKEN_SECRET);
      res.status(200).json({
        userId: user._id,
        token: token,
        iat: decoded.iat,
        exp: decoded.exp,
      });
    });
  });
});

router.post("/signup", (req, res) => {
  console.log(req.body);

  let newUser = new User({
    username: req.body.username,
    password: req.body.password,
  });

  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save().then((value) => {
        res.json(value);
      });
    })
  );
});

router.get("/authenticate", authenticateToken, (req, res) => {
  res.status(200).send({ auth: true });
});

router.post("/add?", authenticateToken, (req, res) => {
  if (req.query.i === KW_PRODUCT) {
    let product = new Product({
      name: req.body.name,
      code: req.body.code,
      class: req.body.class,
      category: req.body.category,
      quantity: req.body.quantity,
      price: req.body.price,
      salePrice: req.body.salePrice,
    });

    product
      .save()
      .then((savedProduct) => {
        res.status(201).json(savedProduct);
      })
      .catch((error) => {
        res
          .salePrice(500)
          .json({ error: "There was an error in saving the product." });
      });
  } else if (req.query.i === KW_EVENT) {
    let event = new Event({
      name: req.body.name,
      date: req.body.date,
      venue: req.body.venue,
    });

    event
      .save()
      .then((savedProduct) => {
        res.status(201).json(savedProduct);
      })
      .catch((error) => {
        res
          .salePrice(500)
          .json({ error: "There was an error in saving the product." });
      });
  } else {
    res.status(400).json({ error: "Not found." });
  }
});

router.delete("/del?", authenticateToken, (req, res) => {
  if (req.query.i === KW_PRODUCT) {
    let product = Product.find({ _id: req.body._id });

    product.deleteOne((err, deletedProduct) => {
      if (err) {
        res
          .status(500)
          .json({ error: "There was an error in deleting the product." });
      } else {
        res.json(deletedProduct);
      }
    });
  } else if (req.query.i === KW_EVENT) {
    let event = Product.find({ _id: req.body._id });

    event.deleteOne((err, deletedEvent) => {
      if (err) {
        res
          .status(500)
          .json({ error: "There was an error in deleting the event." });
      } else {
        res.json(deletedEvent);
      }
    });
  } else {
    res.status(404).json({ error: "Not found." });
  }
});

router.get("/load?", authenticateToken, (req, res) => {
  console.log(req.query);
  let uriQueries = req.query;
  if (uriQueries.item_ == KW_PRODUCT + "s") {
    Product.find()
      .then((products) => {
        res.json(products);
      })
      .catch((error) => {
        res.status(500).json({ error: error });
      });
  } else if (uriQueries.item_ == KW_EVENT + "s") {
    Event.find({})
      .then((events) => {
        res.json(events);
      })
      .catch((error) => {
        res.status(500).json({ error: error });
      });
  } else {
    if (uriQueries.item_ == KW_PRODUCT) {
      Product.find({ _id: uriQueries._id })
        .then((product) => {
          console.log(product);
          res.json(product);
        })
        .catch((error) => {
          res
            .status(404)
            .json({ error: `No product with id '${uriQueries._id}' found.` });
        });
    }
  }
});

module.exports = router;
