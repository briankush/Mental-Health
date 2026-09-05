const jwt = require("jsonwebtoken");
const User = require("../models/user");

/**
 * Authentication middleware.
 * Verifies the JWT from the Authorization header and attaches
 * the decoded payload to req.user = { id, role }.
 */
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("tokenVersion role");
    const tokenVersion = decoded.tokenVersion ?? 0;
    if (!user || tokenVersion !== (user.tokenVersion || 0)) {
      return res.status(401).json({
        success: false,
        message: "Session is no longer valid. Please log in again.",
      });
    }
    req.user = { ...decoded, role: user.role }; // { id, role, tokenVersion, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

module.exports = auth;
