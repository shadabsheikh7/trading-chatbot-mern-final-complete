import { Router } from "express";
import { getCandles, getPrice } from "../services/marketService.js";
import { ema, rsi } from "../services/indicatorService.js";
import {
  macd,
  vwap,
  supportResistance,
  riskPlan,
} from "../services/advancedIndicatorService.js";
const router = Router();
router.get("/:symbol", (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const candles = getCandles(symbol);
  if (!candles.length)
    return res.status(404).json({ message: "Market data unavailable" });
  const closes = candles.map((x) => x.close);
  res.json({
    symbol,
    price: getPrice(symbol),
    ema20: ema(closes, 20),
    ema50: ema(closes, 50),
    rsi14: rsi(closes),
    macd: macd(closes),
    vwap: vwap(candles),
    ...supportResistance(candles),
  });
});
router.post("/risk", (req, res) => {
  try {
    res.json(riskPlan(req.body));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});
export default router;
