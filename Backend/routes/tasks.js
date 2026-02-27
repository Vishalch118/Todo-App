import express from "express";
import Task from "../models/Task.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json(tasks);
});

router.post("/", auth, async (req, res) => {
  const task = await Task.create({
    userId: req.userId,
    title: req.body.title,
    completed: false
  });
  res.json(task);
});

router.put("/:id", auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(task);
});

router.delete("/:id", auth, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json("Deleted");
});

export default router;
