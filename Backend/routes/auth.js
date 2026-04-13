import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";
import passport from "../config/passport.js";

const router = express.Router();
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:3000";
  
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

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET,{ expiresIn: "1d" });
  res.json({ token, username });
});

router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`https://todo-app-psi-six-32.vercel.app/?token=${token}`);
    
  }
);

router.get("/credits", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ credits: user.credits });
  } catch (err) {
    res.status(500).json("Failed to fetch credits");
  }
});

export default router;
