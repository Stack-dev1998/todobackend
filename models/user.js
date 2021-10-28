const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: String,
  password:String,
  createdAt: { type: Date, default: Date.now },
});

var User = mongoose.model("user", userSchema);
module.exports = {
  User,
};
