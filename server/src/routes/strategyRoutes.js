import { Router } from "express";
import Strategy from "../models/Strategy.js";
import { runBacktest } from "../services/backtestService.js";
import { evaluateStrategy } from "../services/strategyEngine.js";

const router = Router();

router.get("/", async (req, res) => {
  res.json(
    await Strategy.find({ userId: "demo-user" }).sort({ createdAt: -1 }),
  );
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const strategy = await Strategy.create({
      userId: "demo-user",
      name: body.name || "My Strategy",
      symbol: String(body.symbol || "BTCUSDT").toUpperCase(),
      timeframe: body.timeframe || "1m",
      mode: "PAPER",
      status: body.status || "DRAFT",
      side: body.side || "BUY",
      quantity: Number(body.quantity || 0.001),
      stopLossPct: Number(body.stopLossPct || 2),
      targetPct: Number(body.targetPct || 5),
      conditions: body.conditions || [],
    });
    res.status(201).json(strategy);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const strategy = await Strategy.findOneAndUpdate(
      { _id: req.params.id, userId: "demo-user" },
      req.body,
      { new: true },
    );
    res.json(strategy);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  await Strategy.deleteOne({ _id: req.params.id, userId: "demo-user" });
  res.json({ ok: true });
});

router.post("/:id/toggle", async (req, res) => {
  const s = await Strategy.findOne({ _id: req.params.id, userId: "demo-user" });
  if (!s) return res.status(404).json({ message: "Strategy not found" });
  s.status = s.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
  await s.save();
  res.json(s);
});

router.post("/:id/test", async (req, res) => {
  const s = await Strategy.findOne({ _id: req.params.id, userId: "demo-user" });
  if (!s) return res.status(404).json({ message: "Strategy not found" });
  res.json({ signal: evaluateStrategy(s), symbol: s.symbol });
});

router.post("/:id/backtest", async (req, res) => {
  const s = await Strategy.findOne({ _id: req.params.id, userId: "demo-user" });
  if (!s) return res.status(404).json({ message: "Strategy not found" });
  res.json(runBacktest(s.toObject()));
});

router.post("/backtest", async (req, res) => {
  try {
    res.json(runBacktest(req.body));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
