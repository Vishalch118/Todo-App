import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  googleId: { type: String },
  credits: { type: Number, default: 5 },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  email: { type: String, unique: true, sparse: true }
});

export default mongoose.model("User", userSchema); 
//User is the model of the schema , so other files can import it and use it to
//  interact with the users collection in the database.
