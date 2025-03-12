
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

mongoose.connect("mongodb://localhost:27017/UserDataDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("users", userSchema);

app.get("/", (req, res) => {
  res.render("home", {});
});

app.get("/login", (req, res) => {
  res.render("login", { error: "" });
});

app.get("/register", (req, res) => {
  res.render("register", {});
});

app.post("/register", (req, res) => {
  User.findOne({ username: req.body.username }).then((foundItem) => {
    if (foundItem) {
      res.redirect("/login");
      console.log(foundItem);
    } else {

      bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
        const user = new User({
          username: req.body.username,
          password: hash,
        });
  
        user
          .save()
          .then(() => {
            res.render("secrets", {});
          })
          .catch((err) => {
            console.log(err);
          });
    });
    }
  }).catch((err) => {
    console.log(err);
    res.redirect("/register");
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username })
    .then((foundItem) => {
      if (foundItem) {
        bcrypt.compare(password, foundItem.password).then(function(result) {
          if (result == true) {
            res.render("secrets");
          } else {
            res.render("login", { error: "Please enter correct Details" });
          }
       });
      } else {
        res.redirect("/register");
      }
    })
    .catch((err) => {
      console.log(err);
      res.render("login", { error: "Please enter correct Details" });
    });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server is started on port 3000 !!");
});
