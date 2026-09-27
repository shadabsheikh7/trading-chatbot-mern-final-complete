import { Router } from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Strategy from "../models/Strategy.js";
import ActivityLog from "../models/ActivityLog.js";
import { auth, admin } from "../middleware/auth.js";
const router = Router();
router.use(auth, admin);
router.get("/stats", async (req, res) =>
  res.json({
    users: await User.countDocuments(),
    orders: await Order.countDocuments(),
    strategies: await Strategy.countDocuments(),
    logs: await ActivityLog.countDocuments(),
  }),
);
router.get("/users", async (req, res) =>
  res.json(
    await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .limit(200),
  ),
);
router.get("/orders", async (req, res) =>
  res.json(await Order.find().sort({ createdAt: -1 }).limit(200)),
);
router.get("/strategies", async (req, res) =>
  res.json(await Strategy.find().sort({ createdAt: -1 }).limit(200)),
);
router.get("/logs", async (req, res) =>
  res.json(await ActivityLog.find().sort({ createdAt: -1 }).limit(200)),
);
export default router;
