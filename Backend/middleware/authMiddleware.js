import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;  //Bearer abcd123

  if (!authHeader) {
    return res.status(401).json("No token provided");
  }

  const token = authHeader.split(" ")[1]; //abcd123

  if (!token) {
    return res.status(401).json("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json("Invalid token");
  }
};

export const checkCredits = async (req, res, next) => {
  const user = await User.findById(req.userId);

  if (!user || user.credits <= 0) {
    return res.status(403).json("No credits left");
  }

  req.user = user;
  next();
};

export default auth;