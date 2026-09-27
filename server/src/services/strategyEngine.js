import Strategy from "../models/Strategy.js";
import { getCandles, getPrice } from "./marketService.js";
import { ema, rsi } from "./indicatorService.js";
import { macd, vwap } from "./advancedIndicatorService.js";
import { placePaperOrder, getPortfolio } from "./paperTradingService.js";

function compare(a, operator, b) {
  if (a == null || b == null) return false;
  if (operator === "LT") return a < b;
  if (operator === "LTE") return a <= b;
  if (operator === "GTE") return a >= b;
  return a > b;
}

function evaluateCondition(condition, candles) {
  const closes = candles.map((c) => c.close);
  const price = closes.at(-1);
  if (!price || closes.length < 20) return false;

  if (condition.indicator === "RSI")
    return compare(
      rsi(closes, condition.fast || 14),
      condition.operator,
      condition.value,
    );

  if (condition.indicator === "EMA_CROSS") {
    const fast = ema(closes, condition.fast || 20),
      slow = ema(closes, condition.slow || 50);
    const previous = closes.slice(0, -1);
    const pf = ema(previous, condition.fast || 20),
      ps = ema(previous, condition.slow || 50);
    if ([fast, slow, pf, ps].some((v) => v == null)) return false;
    if (condition.operator === "CROSS_ABOVE") return pf <= ps && fast > slow;
    if (condition.operator === "CROSS_BELOW") return pf >= ps && fast < slow;
    return fast > slow;
  }

  if (condition.indicator === "PRICE_ABOVE")
    return compare(price, "GT", condition.value);
  if (condition.indicator === "PRICE_BELOW")
    return compare(price, "LT", condition.value);

  if (condition.indicator === "MACD_CROSS") {
    const m = macd(closes);
    if (!m) return false;
    return condition.operator === "CROSS_BELOW"
      ? m.macd < m.signal
      : m.macd > m.signal;
  }

  if (condition.indicator === "VWAP") {
    const value = vwap(candles);
    return compare(price, condition.operator === "GT" ? "GT" : "LT", value);
  }
  return false;
}

export function evaluateStrategy(strategy) {
  const candles = getCandles(strategy.symbol);
  return (
    strategy.conditions?.length > 0 &&
    strategy.conditions.every((c) => evaluateCondition(c, candles))
  );
}

export async function evaluateActiveStrategies() {
  const strategies = await Strategy.find({
    userId: "demo-user",
    status: "ACTIVE",
    mode: "PAPER",
  });
  const portfolio = await getPortfolio();
  const results = [];

  for (const strategy of strategies) {
    const signal = evaluateStrategy(strategy);
    if (!signal) continue;
    const now = Date.now();
    if (strategy.lastSignalAt && now - strategy.lastSignalAt.getTime() < 60000)
      continue;

    // Avoid repeatedly stacking a position for the same active strategy.
    const existing = portfolio.positions.find(
      (p) => p.symbol === strategy.symbol,
    );
    if (existing) continue;

    const price = getPrice(strategy.symbol);
    if (!price) continue;
    const isBuy = strategy.side === "BUY";
    const stopLoss = isBuy
      ? price * (1 - strategy.stopLossPct / 100)
      : price * (1 + strategy.stopLossPct / 100);
    const target = isBuy
      ? price * (1 + strategy.targetPct / 100)
      : price * (1 - strategy.targetPct / 100);

    try {
      const order = await placePaperOrder({
        symbol: strategy.symbol,
        side: strategy.side,
        quantity: strategy.quantity,
        price,
        stopLoss,
        target,
      });
      strategy.lastSignalAt = new Date();
      strategy.stats.trades += 1;
      await strategy.save();
      results.push({
        strategyId: strategy._id,
        orderId: order._id,
        symbol: strategy.symbol,
        price,
      });
    } catch (e) {
      results.push({ strategyId: strategy._id, error: e.message });
    }
  }
  return results;
}
