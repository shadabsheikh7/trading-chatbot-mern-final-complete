import mongoose from "mongoose";

const conditionSchema = new mongoose.Schema(
  {
    indicator: {
      type: String,
      enum: [
        "RSI",
        "EMA_CROSS",
        "PRICE_ABOVE",
        "PRICE_BELOW",
        "MACD_CROSS",
        "VWAP",
      ],
      required: true,
    },
    operator: {
      type: String,
      enum: ["LT", "LTE", "GT", "GTE", "CROSS_ABOVE", "CROSS_BELOW"],
      default: "GT",
    },
    value: { type: Number, default: null },
    fast: { type: Number, default: 20 },
    slow: { type: Number, default: 50 },
  },
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    userId: { type: String, default: "demo-user", index: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true, uppercase: true },
    timeframe: { type: String, default: "1m" },
    mode: {
      type: String,
      enum: ["PAPER", "SANDBOX", "LIVE"],
      default: "PAPER",
    },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "PAUSED"],
      default: "DRAFT",
    },
    side: { type: String, enum: ["BUY", "SELL"], default: "BUY" },
    quantity: { type: Number, required: true, min: 0.000001 },
    stopLossPct: { type: Number, default: 2 },
    targetPct: { type: Number, default: 5 },
    conditions: { type: [conditionSchema], default: [] },
    lastSignalAt: { type: Date, default: null },
    stats: {
      trades: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      pnl: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Strategy", schema);
