import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  googleId: {type: String},
  credits: { type: Number, default: 5 }
});

export default mongoose.model("User", userSchema);
