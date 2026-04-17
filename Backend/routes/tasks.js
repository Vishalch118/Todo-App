import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";
import { encrypt, decrypt } from "../utils/encryption.js";

const router = express.Router();

// GET todos 
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId });

    const decryptedTasks = tasks.map(task => ({
      ...task.toObject(),
      title:
        typeof task.title === "string"
          ? task.title // old data
          : decrypt(task.title) // encrypted data
    }));

    res.json(decryptedTasks);
  } catch (err) {
    res.status(500).json("Failed to fetch tasks");
  }
});

// ADD task
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.credits <= 0) {
      return res.status(403).json("No credits left");
    }

    const task = await Task.create({
      userId: req.userId,
      title: encrypt(req.body.title),
      completed: false
    });

    user.credits -= 1;
    await user.save();

    res.json({
      ...task.toObject(),
      title: decrypt(task.title)
    });
  } catch (err) {
    res.status(500).json("Failed to create task");
  }
});

// UPDATE task
router.put("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.credits <= 0) {
      return res.status(403).json("No credits left");
    }

    if (req.body.title) {
      req.body.title = encrypt(req.body.title);
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!task) return res.status(404).json("Task not found");

    user.credits -= 1;
    await user.save();

    res.json({
      ...task.toObject(),
      title:
        typeof task.title === "string"
          ? task.title
          : decrypt(task.title)
    });
  } catch (err) {
    res.status(500).json("Failed to update task");
  }
});

// DELETE task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId 
    });

    if (!task) return res.status(404).json("Task not found");

    res.json("Deleted");
  } catch (err) {
    res.status(500).json("Failed to delete task");
  }
});

export default router;