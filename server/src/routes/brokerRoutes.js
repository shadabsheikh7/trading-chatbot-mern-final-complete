import { Router } from "express";
import {
  placeSandboxOrder,
  cancelSandboxOrder,
  getSandboxOrders,
} from "../services/upstoxSandboxService.js";

const router = Router();

router.get("/status", (req, res) =>
  res.json({
    sandboxConfigured: Boolean(process.env.UPSTOX_SANDBOX_TOKEN),
    mode: process.env.TRADING_MODE || "PAPER",
  }),
);

router.post("/sandbox/order", async (req, res) => {
  try {
    if (process.env.UPSTOX_SANDBOX_ENABLED !== "true")
      return res
        .status(403)
        .json({
          message:
            "Upstox sandbox is disabled. Set UPSTOX_SANDBOX_ENABLED=true.",
        });
    const {
      instrumentToken,
      transactionType,
      quantity,
      orderType,
      product,
      validity,
      price,
      triggerPrice,
      tag,
    } = req.body;
    const data = await placeSandboxOrder({
      instrumentToken,
      transactionType,
      quantity,
      orderType,
      product,
      validity,
      price,
      triggerPrice,
      tag,
    });
    res.json(data);
  } catch (e) {
    res
      .status(e.response?.status || 400)
      .json({
        message:
          e.response?.data?.errors?.[0]?.message ||
          e.response?.data?.message ||
          e.message,
      });
  }
});

router.get("/sandbox/orders", async (req, res) => {
  try {
    if (process.env.UPSTOX_SANDBOX_ENABLED !== "true")
      return res.status(403).json({ message: "Upstox sandbox is disabled." });
    res.json(await getSandboxOrders());
  } catch (e) {
    res
      .status(e.response?.status || 400)
      .json({ message: e.response?.data?.message || e.message });
  }
});

router.delete("/sandbox/order/:orderId", async (req, res) => {
  try {
    if (process.env.UPSTOX_SANDBOX_ENABLED !== "true")
      return res.status(403).json({ message: "Upstox sandbox is disabled." });
    res.json(await cancelSandboxOrder(req.params.orderId));
  } catch (e) {
    res
      .status(e.response?.status || 400)
      .json({ message: e.response?.data?.message || e.message });
  }
});

export default router;
