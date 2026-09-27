import mongoose from "mongoose";
const schema = new mongoose.Schema({
  userId: { type: String, default: "demo-user" },
  symbol: { type: String, required: true, uppercase: true },
  side: { type: String, enum: ["BUY", "SELL"], required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  stopLoss: { type: Number, default: null },
  target: { type: Number, default: null },
  mode: { type: String, enum: ["PAPER", "LIVE", "SANDBOX"], default: "PAPER" },
  status: {
    type: String,
    enum: ["FILLED", "REJECTED", "OPEN", "CANCELLED"],
    default: "FILLED",
  },
  brokerOrderId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("Order", schema);
