const User = require("../models/User");
const { createToken, setTokenCookie } = require("../utils/createToken");

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters." });
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name, email, password });
    setTokenCookie(res, createToken(user._id));
    res.status(201).json({ user: publicUser(user) });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: "Incorrect email or password." });
    setTokenCookie(res, createToken(user._id));
    res.json({ user: publicUser(user) });
  } catch (err) { next(err); }
}

async function logout(req, res) {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  res.json({ message: "Logged out successfully." });
}

async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

module.exports = { register, login, logout, me };
