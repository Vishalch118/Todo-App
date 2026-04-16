import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"; // <-- ADDED: For sending emails
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";
import passport from "../config/passport.js";

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// --- NODEMAILER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- EXISTING LOCAL AUTH (Unchanged) ---
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

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token, username });
});

// --- GOOGLE OAUTH FLOW ---
router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

// MODIFIED: Intercept the callback to send OTP instead of logging in directly
router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      // 1. Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // 2. Save OTP and expiration (5 mins) to the database
      const user = await User.findById(req.user._id);
      user.otp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();

      // 3. Send the OTP via Email
      // Note: Ensure your passport strategy saves the Google email to req.user.email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: req.user.email, 
        subject: "Your To-Do App Verification Code",
        text: `Your 4-digit verification code is: ${otp}. It expires in 5 minutes.`,
      };
      await transporter.sendMail(mailOptions);

      // 4. Generate a temporary JWT (valid only for 5 minutes)
      const tempToken = jwt.sign(
        { id: req.user._id, isTemp: true },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      // 5. Redirect to a new OTP frontend page with the temporary token
      res.redirect(`https://todo-app-psi-six-32.vercel.app/verify-otp.html?tempToken=${tempToken}`);

    } catch (error) {
      console.error("Error during Google Callback:", error);
      res.redirect(`https://todo-app-psi-six-32.vercel.app/?error=auth_failed`);
    }
  }
);

// NEW ROUTE: Verify the OTP and issue the final token
router.post("/verify-otp", async (req, res) => {
  const { tempToken, otp } = req.body;

  try {
    // 1. Validate the temporary token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.isTemp) return res.status(400).json("Invalid token type");

    // 2. Find the user
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json("User not found");

    // 3. Check if OTP matches and is not expired
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json("Invalid or expired OTP");
    }

    // 4. Success! Clear the OTP from the database
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // 5. Issue the final, fully-privileged JWT
    const finalToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send token back to frontend to complete login
    res.json({ token: finalToken, username: user.username });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(401).json("Session expired or invalid. Please try logging in again.");
  }
});

// --- EXISTING PROTECTED ROUTE (Unchanged) ---
router.get("/credits", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ credits: user.credits });
  } catch (err) {
    res.status(500).json("Failed to fetch credits");
  }
});

export default router;