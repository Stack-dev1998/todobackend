const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { User } = require("./models/user");
const { Todo } = require("./models/todo");
const authenticate = require("./auth");

//Mongodb connection
mongoose
  .connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("=> Connected to mongodb");
  })
  .catch((err) => {
    console.log("Error :" + err);
  });

//midlewares
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,authorization "
  );
  next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.post("/signup", (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   console.log(req.body);
//   var newUser = new User({
//     email,
//     password: bcrypt.hashSync(password, 8),
//   });
//   newUser.save((err, result) => {
//     if (err) return res.status(500).json("Error on the server.");
//     res.json("signup successfully");
//   });
// });

//login start
app.post("/login", function (req, res) {
  const email = req.body.email.toLowerCase();
  User.findOne({ email }, function (err, result) {
    if (err) return res.status(500).json("Error on the server.");
    if (!result) {
      return res.status(200).json({
        auth: false,
        token: null,
        status: "fail",
        msg: "User not Found",
      });
    }

    var passwordIsValid = bcrypt.compareSync(
      req.body.password,
      result.password
    );
    if (!passwordIsValid)
      return res.json({
        auth: false,
        token: null,
        status: "fail",
        msg: "Enter valid Password",
      });

    var token = jwt.sign(
      { _id: result._id, email: result.email },
      process.env.JWTSECRET,
      {
        expiresIn: 86400, // expires in 24 hours
      }
    );

    res.status(200).json({
      auth: true,
      token: token,
      status: "success",
      msg: "Successfull Login",
    });
  });
});

//dashboard start
app.get("/dashboard", authenticate, async function (req, res) {
  const result = await Todo.find({});
  res.status(200).json({
    status: "success",
    todos: result,
  });
});

//todos start
app.get("/list-todos", async (req, res) => {
  const result = await Todo.find({});
  res.status(200).json({
    status: "success",
    todos: result,
  });
});

app.post("/add-todo", authenticate, (req, res) => {
  const title = req.body.title;
  var newTodo = new Todo({
    title,
  });
  newTodo.save((err, result) => {
    if (err) return res.status(500).json("Error on the server.");
    return res.status(200).json({
      status: "success",
      msg: "Added successfully",
      result,
    });
  });
});

//update todo
app.post("/update-todo",authenticate, async (req, res) => {
  const _id = req.body._id;
  const title = req.body.title;
  var result = await Todo.updateOne({ _id }, { $set: { title } });
  if (result.nModified != 0) {
    return res.status(200).json({
      status: "success",
      msg: "Updated successfully",
    });
  } else {
    return res.status(200).json({
      status: "fail",
      msg: "Updation failed",
    });
  }
});

//delete todo
app.delete("/delete-todo/:id",authenticate, async (req, res) => {
  const _id = req.params.id;
  var result = await Todo.deleteOne({ _id });
  if (result.deletedCount != 0) {
    return res.status(200).json({
      status: "success",
      msg: "Deleted successfully",
    });
  } else {
    return res.status(200).json({
      status: "fail",
      msg: "Deletion failed",
    });
  }
});

app.listen(port, () =>
  console.log("> Server is up and running on port : " + port)
);
