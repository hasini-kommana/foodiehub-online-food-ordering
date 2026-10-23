const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const token = req.cookies?.token || (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ message: "Please log in to continue." });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Account not found. Please log in again." });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Your session is invalid or expired. Please log in again." });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Administrator access required." });
  next();
}

module.exports = { protect, adminOnly };
