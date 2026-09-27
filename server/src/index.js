import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import marketRoutes from "./routes/marketRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import brokerRoutes from "./routes/brokerRoutes.js";
import strategyRoutes from "./routes/strategyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { initMarket, setMarketSocket } from "./services/marketService.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" },
});
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));
app.get("/api/health", (req, res) =>
  res.json({ ok: true, mode: process.env.TRADING_MODE || "PAPER" }),
);
app.use("/api/market", marketRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/broker", brokerRoutes);
app.use("/api/strategies", strategyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
setMarketSocket(io);
io.on("connection", (socket) => console.log("client connected", socket.id));

const port = process.env.PORT || 5000;
connectDB()
  .then(async () => {
    await initMarket(
      (process.env.MARKET_SYMBOLS || "btcusdt,ethusdt,bnbusdt,solusdt").split(
        ",",
      ),
    );
    server.listen(port, () => console.log(`Server http://localhost:${port}`));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
