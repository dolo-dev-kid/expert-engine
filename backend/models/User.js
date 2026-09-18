const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  friends: [String],
  servers: [String],
  bio: String,
  avatar: String
});

module.exports = mongoose.model("User", UserSchema);
