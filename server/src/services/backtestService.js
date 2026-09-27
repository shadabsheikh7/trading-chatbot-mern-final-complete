import { getCandles } from "./marketService.js";
import { ema, rsi } from "./indicatorService.js";

function conditionAt(strategy, candles, i) {
  const subset = candles.slice(0, i + 1);
  const closes = subset.map((c) => c.close);
  return strategy.conditions.every((c) => {
    if (c.indicator === "RSI") {
      const v = rsi(closes, 14);
      if (v == null) return false;
      return c.operator === "LT" ? v < c.value : v > c.value;
    }
    if (c.indicator === "EMA_CROSS") {
      const f = ema(closes, c.fast || 20),
        s = ema(closes, c.slow || 50);
      const prev = closes.slice(0, -1);
      const pf = ema(prev, c.fast || 20),
        ps = ema(prev, c.slow || 50);
      if ([f, s, pf, ps].some((v) => v == null)) return false;
      return c.operator === "CROSS_BELOW"
        ? pf >= ps && f < s
        : pf <= ps && f > s;
    }
    return true;
  });
}

export function runBacktest(strategyInput) {
  const candles = getCandles(strategyInput.symbol);
  const initialCash = Number(strategyInput.initialCash || 100000);
  const qty = Number(strategyInput.quantity || 0.001);
  const slPct = Number(strategyInput.stopLossPct || 2) / 100;
  const targetPct = Number(strategyInput.targetPct || 5) / 100;
  let cash = initialCash;
  let position = null;
  let trades = [];
  let equityPeak = initialCash;
  let maxDrawdown = 0;

  for (let i = 60; i < candles.length; i++) {
    const c = candles[i];
    if (!position && conditionAt(strategyInput, candles, i)) {
      const cost = c.close * qty;
      if (cash >= cost) {
        position = { entry: c.close, qty, entryTime: c.time };
        cash -= cost;
      }
    }
    if (position) {
      const stop = position.entry * (1 - slPct);
      const target = position.entry * (1 + targetPct);
      let exit = null;
      let reason = "";
      if (c.low <= stop) {
        exit = stop;
        reason = "STOP_LOSS";
      } else if (c.high >= target) {
        exit = target;
        reason = "TARGET";
      }
      if (exit != null) {
        const pnl = (exit - position.entry) * position.qty;
        cash += exit * position.qty;
        trades.push({
          entry: position.entry,
          exit,
          pnl,
          reason,
          entryTime: position.entryTime,
          exitTime: c.time,
        });
        position = null;
      }
    }
    const equity = cash + (position ? position.qty * c.close : 0);
    equityPeak = Math.max(equityPeak, equity);
    maxDrawdown = Math.max(
      maxDrawdown,
      equityPeak ? ((equityPeak - equity) / equityPeak) * 100 : 0,
    );
  }
  const wins = trades.filter((t) => t.pnl > 0).length;
  const pnl = trades.reduce((s, t) => s + t.pnl, 0);
  return {
    initialCash,
    finalCash: cash,
    pnl,
    returnPct: (pnl / initialCash) * 100,
    trades: trades.length,
    wins,
    losses: trades.length - wins,
    winRate: trades.length ? (wins / trades.length) * 100 : 0,
    maxDrawdown,
    recentTrades: trades.slice(-10).reverse(),
  };
}
