import { Router } from "express";
import { getPrice, getCandles } from "../services/marketService.js";
import { ema, rsi } from "../services/indicatorService.js";
const router = Router();
router.get("/price/:symbol", (req, res) =>
  res.json({
    symbol: req.params.symbol.toUpperCase(),
    price: getPrice(req.params.symbol),
  }),
);
router.get("/candles/:symbol", (req, res) =>
  res.json(getCandles(req.params.symbol)),
);
router.get("/indicators/:symbol", (req, res) => {
  const rows = getCandles(req.params.symbol);
  const closes = rows.map((x) => x.close);
  res.json({
    ema20: ema(closes, 20),
    ema50: ema(closes, 50),
    rsi14: rsi(closes, 14),
  });
});
export default router;
