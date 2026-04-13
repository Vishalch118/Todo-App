import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= GET TASKS ================= */
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json("Failed to fetch tasks");
  }
});

/* ================= ADD TASK (COST: 1 CREDIT) ================= */
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.credits <= 0) {
      return res.status(403).json("No credits left");
    }

    const task = await Task.create({
      userId: req.userId,
      title: req.body.title,
      completed: false
    });

    user.credits -= 1;
    await user.save();

    res.json(task);
  } catch (err) {
    res.status(500).json("Failed to create task");
  }
});

/* ================= UPDATE TASK (COST: 1 CREDIT) ================= */
router.put("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.credits <= 0) {
      return res.status(403).json("No credits left");
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // 🔒 ownership check
      req.body,
      { new: true }
    );

    if (!task) return res.status(404).json("Task not found");

    user.credits -= 1;
    await user.save();

    res.json(task);
  } catch (err) {
    res.status(500).json("Failed to update task");
  }
});

/* ================= DELETE TASK (FREE) ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId // 🔒 ownership check
    });

    if (!task) return res.status(404).json("Task not found");

    res.json("Deleted");
  } catch (err) {
    res.status(500).json("Failed to delete task");
  }
});

export default router;