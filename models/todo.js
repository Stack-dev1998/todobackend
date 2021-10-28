const mongoose = require("mongoose");
const { Schema } = mongoose;

const todoSchema = new Schema({
  title: String,
  createdAt: { type: Date, default: Date.now },
});

var Todo = mongoose.model("todo",todoSchema);
module.exports = {
  Todo,
};