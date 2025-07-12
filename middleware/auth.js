const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 Verify Token
const requireLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("🔍 Auth Header:", authHeader); // Optional Debug

    // Step 1: Check format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Step 2: Extract token
    const token = authHeader.split(" ")[1];

    // Step 3: Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Step 4: Attach user
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verify error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 🛡 Role-based Access
const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { requireLogin, checkRole };
