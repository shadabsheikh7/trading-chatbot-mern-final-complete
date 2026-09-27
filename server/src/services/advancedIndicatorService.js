export function sma(values, period) {
  if (values.length < period) return null;
  const a = values.slice(-period);
  return a.reduce((s, v) => s + v, 0) / period;
}
export function emaSeries(values, period) {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  let e = values.slice(0, period).reduce((s, v) => s + v, 0) / period;
  const out = Array(period - 1).fill(null);
  out.push(e);
  for (let i = period; i < values.length; i++) {
    e = values[i] * k + e * (1 - k);
    out.push(e);
  }
  return out;
}
export function macd(values, fast = 12, slow = 26, signal = 9) {
  if (values.length < slow + signal) return null;
  const f = emaSeries(values, fast),
    s = emaSeries(values, slow);
  const line = f
    .map((v, i) => (v == null || s[i] == null ? null : v - s[i]))
    .filter((v) => v != null);
  const sig = emaSeries(line, signal);
  const m = line.at(-1),
    sg = sig.at(-1);
  return { macd: m, signal: sg, histogram: m - sg };
}
export function vwap(candles) {
  if (!candles.length) return null;
  let pv = 0,
    vol = 0;
  for (const c of candles) {
    const typical = (c.high + c.low + c.close) / 3;
    const q = Number(c.volume || 1);
    pv += typical * q;
    vol += q;
  }
  return vol ? pv / vol : null;
}
export function supportResistance(candles, lookback = 50) {
  const a = candles.slice(-lookback);
  if (!a.length) return { support: null, resistance: null };
  return {
    support: Math.min(...a.map((x) => x.low)),
    resistance: Math.max(...a.map((x) => x.high)),
  };
}
export function riskPlan({ entry, stop, target, quantity }) {
  entry = Number(entry);
  stop = Number(stop);
  target = Number(target);
  quantity = Number(quantity);
  if (
    ![entry, stop, target, quantity].every(Number.isFinite) ||
    entry <= 0 ||
    quantity <= 0
  )
    throw new Error("Invalid risk inputs");
  const riskPerUnit = Math.abs(entry - stop),
    rewardPerUnit = Math.abs(target - entry);
  return {
    entry,
    stop,
    target,
    quantity,
    riskPerUnit,
    totalRisk: riskPerUnit * quantity,
    rewardPerUnit,
    totalReward: rewardPerUnit * quantity,
    rr: riskPerUnit ? rewardPerUnit / riskPerUnit : null,
    notional: entry * quantity,
  };
}
