import Portfolio from "../models/Portfolio.js";
import Order from "../models/Order.js";
import { getPrice } from "./marketService.js";

export async function getPortfolio() {
  let p = await Portfolio.findOne({ userId: "demo-user" });
  if (!p) p = await Portfolio.create({ userId: "demo-user" });
  return p;
}

export async function getMarkedPortfolio() {
  const p = await getPortfolio();
  const positions = p.positions.map((x) => {
    const marketPrice = getPrice(x.symbol) ?? x.avgPrice;
    const marketValue = x.quantity * marketPrice;
    const invested = x.quantity * x.avgPrice;
    const unrealizedPnl = marketValue - invested;
    return {
      ...x.toObject(),
      marketPrice,
      marketValue,
      unrealizedPnl,
      pnlPct: invested ? (unrealizedPnl / invested) * 100 : 0,
    };
  });
  const invested = positions.reduce((s, x) => s + x.quantity * x.avgPrice, 0);
  const marketValue = positions.reduce((s, x) => s + x.marketValue, 0);
  const unrealizedPnl = positions.reduce((s, x) => s + x.unrealizedPnl, 0);
  return {
    cash: p.cash,
    positions,
    invested,
    marketValue,
    unrealizedPnl,
    equity: p.cash + marketValue,
  };
}

export async function placePaperOrder({
  symbol,
  side,
  quantity,
  price,
  stopLoss = null,
  target = null,
}) {
  const p = await getPortfolio();
  const cost = quantity * price;
  let pos = p.positions.find((x) => x.symbol === symbol);

  if (side === "BUY") {
    if (p.cash < cost)
      throw new Error(`Insufficient paper cash. Need $${cost.toFixed(2)}`);
    if (!pos) {
      pos = { symbol, quantity: 0, avgPrice: 0, stopLoss: null, target: null };
      p.positions.push(pos);
    }
    pos.avgPrice =
      (pos.quantity * pos.avgPrice + cost) / (pos.quantity + quantity);
    pos.quantity += quantity;
    if (stopLoss != null) pos.stopLoss = stopLoss;
    if (target != null) pos.target = target;
    p.cash -= cost;
  } else {
    if (!pos || pos.quantity < quantity)
      throw new Error(`Insufficient ${symbol} position.`);
    pos.quantity -= quantity;
    p.cash += cost;
    if (pos.quantity <= 0)
      p.positions = p.positions.filter((x) => x.symbol !== symbol);
  }

  await p.save();
  return Order.create({
    userId: "demo-user",
    symbol,
    side,
    quantity,
    price,
    mode: "PAPER",
    status: "FILLED",
    stopLoss,
    target,
  });
}

export async function closePaperPosition({ symbol, price }) {
  const p = await getPortfolio();
  const pos = p.positions.find((x) => x.symbol === symbol);
  if (!pos) throw new Error(`No open ${symbol} position.`);
  const quantity = pos.quantity;
  const avg = pos.avgPrice;
  const order = await placePaperOrder({
    symbol,
    side: "SELL",
    quantity,
    price,
  });
  return { order, realizedPnl: (price - avg) * quantity };
}

export async function monitorPaperPositions(symbol, price) {
  const p = await getPortfolio();
  const pos = p.positions.find((x) => x.symbol === symbol);
  if (!pos) return null;
  const hitStop = pos.stopLoss != null && price <= pos.stopLoss;
  const hitTarget = pos.target != null && price >= pos.target;
  if (!hitStop && !hitTarget) return null;
  const reason = hitStop ? "STOP_LOSS" : "TARGET";
  const qty = pos.quantity;
  const avg = pos.avgPrice;
  const order = await placePaperOrder({
    symbol,
    side: "SELL",
    quantity: qty,
    price,
  });
  return { reason, order, realizedPnl: (price - avg) * qty };
}
