import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },

    title: {
      content: { type: String, required: true },
      iv: { type: String, required: true },
      tag: { type: String, required: true }
    },

    completed: { 
      type: Boolean, 
      default: false 
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Task", taskSchema);