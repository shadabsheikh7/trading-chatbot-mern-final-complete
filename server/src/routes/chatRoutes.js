import { Router } from "express";
import { getPrice, getCandles } from "../services/marketService.js";
import { ema, rsi } from "../services/indicatorService.js";
import {
  macd,
  vwap,
  supportResistance,
  riskPlan,
} from "../services/advancedIndicatorService.js";
import {
  placePaperOrder,
  getPortfolio,
} from "../services/paperTradingService.js";
import Strategy from "../models/Strategy.js";
import { parseStrategyText } from "../services/strategyParser.js";

const router = Router();
function sym(t) {
  return `${(t.match(/\b(btc|eth|bnb|sol)\b/i)?.[1] || "btc").toUpperCase()}USDT`;
}

async function commandReply(text) {
  const t = text.trim().toLowerCase();
  const symbol = sym(t);
  const candles = getCandles(symbol);
  const closes = candles.map((x) => x.close);

  if (/^(help|commands?)$/.test(t))
    return "Commands: price btc, rsi btc, ema btc, analyze btc, portfolio, buy 0.001 btc, sell 0.001 btc, risk btc entry 84000 sl 83000 target 86000 qty 0.001, create strategy: BTC RSI below 30 and EMA20 crosses EMA50, buy 0.001, SL 2%, target 5%.";
  if (/^price\b/.test(t))
    return `${symbol}: $${(getPrice(symbol) ?? 0).toLocaleString()}`;
  if (t === "portfolio" || t.includes("my portfolio")) {
    const p = await getPortfolio();
    return `Cash: $${p.cash.toFixed(2)} | Positions: ${p.positions.map((x) => `${x.symbol} ${x.quantity}`).join(", ") || "None"}`;
  }
  if (/^rsi\b/.test(t))
    return `RSI(14) ${symbol}: ${rsi(closes)?.toFixed(2) ?? "N/A"}`;
  if (/^ema\b/.test(t))
    return `EMA20: ${ema(closes, 20)?.toFixed(2) ?? "N/A"} | EMA50: ${ema(closes, 50)?.toFixed(2) ?? "N/A"}`;
  if (/^analyze\b|^analysis\b|^technical\b/.test(t)) {
    const m = macd(closes),
      sr = supportResistance(candles),
      vw = vwap(candles);
    return `${symbol} analysis — Price $${getPrice(symbol)?.toFixed(2) ?? "N/A"} | RSI ${rsi(closes)?.toFixed(2) ?? "N/A"} | EMA20 ${ema(closes, 20)?.toFixed(2) ?? "N/A"} | EMA50 ${ema(closes, 50)?.toFixed(2) ?? "N/A"} | MACD ${m?.macd?.toFixed(2) ?? "N/A"} / Signal ${m?.signal?.toFixed(2) ?? "N/A"} | VWAP ${vw?.toFixed(2) ?? "N/A"} | Support ${sr.support?.toFixed(2) ?? "N/A"} | Resistance ${sr.resistance?.toFixed(2) ?? "N/A"}. Informational only; not a guaranteed forecast.`;
  }

  if (
    /^create\s+(?:a\s+)?strategy\s*:/i.test(text) ||
    /^make\s+(?:a\s+)?strategy\s*:/i.test(text)
  ) {
    const strategy = parseStrategyText(text.replace(/^.*?:/s, ""));
    const saved = await Strategy.create({ userId: "demo-user", ...strategy });
    return `Strategy created as DRAFT: ${saved.name}. Review it in My Strategies, then use Activate, Test Signal, or Backtest.`;
  }

  const risk = t.match(
    /^risk\s+(?:for\s+)?(btc|eth|bnb|sol)?\s*entry\s+([\d.]+)\s+sl\s+([\d.]+)\s+target\s+([\d.]+)\s+qty\s+([\d.]+)/i,
  );
  if (risk) {
    const out = riskPlan({
      entry: risk[2],
      stop: risk[3],
      target: risk[4],
      quantity: risk[5],
    });
    return `Risk ${symbol}: $${out.totalRisk.toFixed(2)} | Reward $${out.totalReward.toFixed(2)} | R:R ${out.rr.toFixed(2)} | Notional $${out.notional.toFixed(2)}`;
  }

  const order = t.match(/^(buy|sell)\s+([\d.]+)\s+(btc|eth|bnb|sol)$/i);
  if (order) {
    const side = order[1].toUpperCase(),
      quantity = Number(order[2]),
      s = `${order[3].toUpperCase()}USDT`,
      price = getPrice(s);
    if (!price) return "Live price unavailable.";
    await placePaperOrder({ symbol: s, side, quantity, price });
    return `Paper ${side} filled: ${quantity} ${s} @ $${price.toFixed(2)}`;
  }
  return null;
}

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ message: "Message is required." });
    const reply = await commandReply(message);
    res.json({
      reply:
        reply ||
        "I can analyze markets, paper trade, calculate risk, and create strategies. Type help for commands.",
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
