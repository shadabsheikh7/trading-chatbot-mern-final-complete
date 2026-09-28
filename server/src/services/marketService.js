import WebSocket from "ws";
import axios from "axios";

const prices = new Map();
const candles = new Map();
let ioInstance = null;

export function setMarketSocket(io) {
  ioInstance = io;
}

export function getPrice(symbol) {
  return prices.get(symbol.toUpperCase()) ?? null;
}

export function getCandles(symbol) {
  return candles.get(symbol.toUpperCase()) ?? [];
}

function broadcast(payload) {
  if (ioInstance) ioInstance.emit("market", payload);
}

export async function seedCandles(symbol = "BTCUSDT") {
  try {
    const { data } = await axios.get(
      "https://api.binance.com/api/v3/klines",
      {
        params: {
          symbol,
          interval: "1m",
          limit: 200,
        },
        timeout: 8000,
      },
    );

    const rows = data.map((k) => ({
      time: Math.floor(k[0] / 1000),
      open: +k[1],
      high: +k[2],
      low: +k[3],
      close: +k[4],
    }));

    candles.set(symbol, rows);
    prices.set(symbol, rows.at(-1)?.close ?? null);
  } catch (e) {
    console.warn("Candle seed failed:", e.message);
  }
}

export function startMarketStream(
  symbols = ["btcusdt", "ethusdt"],
) {
  const streams = symbols
    .map((s) => `${s}@ticker/${s}@kline_1m`)
    .join("/");

  const ws = new WebSocket(
    `wss://stream.binance.com:9443/stream?streams=${streams}`,
  );

  ws.on("open", () => {
    console.log("Market WebSocket connected");
  });

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      const data = msg.data;
      const stream = msg.stream || "";

      if (!data) return;

      const symbol = (
        data.s ||
        stream.split("@")[0]
      ).toUpperCase();

      if (data.e === "24hrTicker") {
        const price = +data.c;

        prices.set(symbol, price);

        broadcast({
          type: "ticker",
          symbol,
          price,
          change: +data.P,
        });

        import("./paperTradingService.js")
          .then((m) =>
            m.monitorPaperPositions(symbol, price),
          )
          .catch(() => {});

        import("./strategyEngine.js")
          .then((m) =>
            m.evaluateActiveStrategies(),
          )
          .catch(() => {});
      }

      if (data.e === "kline") {
        const k = data.k;

        const row = {
          time: Math.floor(k.t / 1000),
          open: +k.o,
          high: +k.h,
          low: +k.l,
          close: +k.c,
        };

        const list = candles.get(symbol) || [];

        if (list.at(-1)?.time === row.time) {
          list[list.length - 1] = row;
        } else {
          list.push(row);
        }

        candles.set(symbol, list.slice(-300));

        broadcast({
          type: "candle",
          symbol,
          candle: row,
        });
      }
    } catch (e) {
      console.warn(
        "Market WebSocket message error:",
        e.message,
      );
    }
  });

  ws.on("close", () => {
    console.log(
      "Market stream closed; reconnecting...",
    );

    setTimeout(() => {
      startMarketStream(symbols);
    }, 3000);
  });

  ws.on("error", (err) => {
    console.warn(
      "Market WebSocket error:",
      err.message,
    );

    ws.close();
  });
}

export async function initMarket(symbols) {
  const normalizedSymbols = symbols.map((x) =>
    x.toUpperCase(),
  );

  for (const symbol of normalizedSymbols) {
    await seedCandles(symbol);
  }

  startMarketStream(symbols);
}