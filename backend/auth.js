const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const router = express.Router();
const SECRET = "YOUR_SECRET_KEY";

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.json({ error: "User exists" });

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hash,
    friends: [],
    servers: []
  });

  res.json({ success: true });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ error: "Invalid user" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({ token });
});

module.exports = router;
