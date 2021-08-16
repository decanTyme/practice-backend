const express = require("express");
const router = express.Router();

router.get("/aneue-sama", (req, res) => {
  res.send("Daisukiiiiiiii");
});

router.get("/do?", (req, res) => {
  let q = req.query;
  if (!q || q === "") {
    res.status(303).json({
      error: "Uhh, I think you're in the wrong API here...",
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

module.exports = router;
