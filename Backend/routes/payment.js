import dotenv from "dotenv";
dotenv.config();
import express from "express";
import Razorpay from "razorpay";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

//creates an order
router.post("/create-order", auth, async (req, res) => {
  try {
    const { plan } = req.body;

    let amount = 0;

    if (plan === "pro") amount = 1500;
    if (plan === "premium") amount = 3000;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR"
    });

    res.json(order);
  } catch (err) {
    res.status(500).json("Failed to create order");
  }
});

//VERIFY PAYMENT + ADD CREDITS
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const { plan } = req.body;

    let creditsToAdd = 0;

    if (plan === "pro") creditsToAdd = 150;
    if (plan === "premium") creditsToAdd = 350;

    const user = await User.findById(req.userId);

    user.credits += creditsToAdd;
    await user.save();

    res.json({
      message: "Credits added",
      credits: user.credits
    });
  } catch (err) {
    res.status(500).json("Payment verification failed");
  }
});

export default router;