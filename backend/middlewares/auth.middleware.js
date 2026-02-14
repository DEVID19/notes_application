import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const Auth = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - No token found",
      });
    }

    // Verify token
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token and attach to request
    const user = await User.findById(verifyToken.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user; // Attach full user object
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized - Token failed",
      error: error.message,
    });
  }
};
