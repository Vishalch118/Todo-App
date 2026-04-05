import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";

import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

import passport from "./config/passport.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
)