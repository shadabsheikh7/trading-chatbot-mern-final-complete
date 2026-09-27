import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { auth } from "../middleware/auth.js";
const router = Router();
const sign = (u) =>
  jwt.sign(
    { id: u._id.toString(), name: u.name, email: u.email, role: u.role },
    process.env.JWT_SECRET || "dev-secret-change-me",
    { expiresIn: "7d" },
  );
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6)
      return res
        .status(400)
        .json({ message: "Name, email and password (6+ chars) are required" });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ message: "Email already registered" });
    const u = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
    });
    await ActivityLog.create({
      userId: u._id,
      action: "REGISTER",
      details: "Account created",
    });
    res
      .status(201)
      .json({
        token: sign(u),
        user: { id: u._id, name: u.name, email: u.email, role: u.role },
      });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email: email?.toLowerCase() });
    if (!u || !(await bcrypt.compare(password || "", u.passwordHash)))
      return res.status(401).json({ message: "Invalid email or password" });
    await ActivityLog.create({
      userId: u._id,
      action: "LOGIN",
      details: "User login",
    });
    res.json({
      token: sign(u),
      user: { id: u._id, name: u.name, email: u.email, role: u.role },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});
router.get("/me", auth, async (req, res) => {
  const u = await User.findById(req.user.id).select(
    "_id name email role createdAt",
  );
  res.json({ user: u });
});
export default router;
