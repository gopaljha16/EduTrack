const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect routes — verifies JWT Bearer token.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Not authorized. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "User belonging to this token no longer exists.",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Token is invalid or has expired.",
    });
  }
};

module.exports = { protect };
