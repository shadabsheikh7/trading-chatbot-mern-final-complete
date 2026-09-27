import mongoose from "mongoose";
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  details: String,
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("ActivityLog", schema);
