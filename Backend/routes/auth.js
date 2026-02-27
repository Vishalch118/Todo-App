import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json("User exists");

  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, password: hash });

  res.json("User created");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json("Invalid credentials");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, username });
});

export default router;
