import { Router } from "express";
import Order from "../models/Order.js";
import {
  getPortfolio,
  placePaperOrder,
  getMarkedPortfolio,
  closePaperPosition,
} from "../services/paperTradingService.js";
import { getPrice } from "../services/marketService.js";
const router = Router();
router.get("/portfolio", async (req, res) =>
  res.json(await getMarkedPortfolio()),
);
router.get("/orders", async (req, res) =>
  res.json(
    await Order.find({ userId: "demo-user" }).sort({ createdAt: -1 }).limit(50),
  ),
);
router.post("/order", async (req, res) => {
  try {
    const { symbol, side, quantity, stopLoss, target } = req.body;
    const s = symbol.toUpperCase();
    const p = getPrice(s);
    if (!["BUY", "SELL"].includes(side) || !quantity || !p)
      return res.status(400).json({ message: "Invalid order" });
    if (process.env.TRADING_MODE !== "PAPER")
      return res
        .status(403)
        .json({
          message: "Use the broker sandbox route when broker mode is enabled.",
        });
    const order = await placePaperOrder({
      symbol: s,
      side,
      quantity: Number(quantity),
      price: Number(p),
      stopLoss: Number(stopLoss) || null,
      target: Number(target) || null,
    });
    res.json(order);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
router.post("/position/close", async (req, res) => {
  try {
    const { symbol } = req.body;
    const p = getPrice(symbol);
    if (!p) return res.status(400).json({ message: "Price unavailable" });
    res.json(
      await closePaperPosition({ symbol: symbol.toUpperCase(), price: p }),
    );
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
export default router;
