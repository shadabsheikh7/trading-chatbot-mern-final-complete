import mongoose from "mongoose";
const positionSchema = new mongoose.Schema(
  {
    symbol: String,
    quantity: Number,
    avgPrice: Number,
    stopLoss: { type: Number, default: null },
    target: { type: Number, default: null },
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, default: "demo-user" },
    cash: { type: Number, default: 100000 },
    positions: [positionSchema],
  },
  { timestamps: true },
);
export default mongoose.model("Portfolio", schema);
