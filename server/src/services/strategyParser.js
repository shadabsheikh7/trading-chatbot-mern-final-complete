export function parseStrategyText(text = {}) {
  const raw = typeof text === "string" ? text : text.prompt || "";
  const t = raw.toLowerCase();
  const symbol = `${(t.match(/\b(btc|eth|bnb|sol)\b/)?.[1] || "btc").toUpperCase()}USDT`;
  const side = /\b(sell|short)\b/.test(t) ? "SELL" : "BUY";
  const quantity = Number(
    t.match(/(?:buy|sell|quantity|qty)\s*(?:is|=)?\s*(\d*\.\d+|\d+)/)?.[1] ||
      0.001,
  );
  const sl = Number(
    t.match(/(?:stop\s*loss|sl)\s*(?:is|=)?\s*(\d+(?:\.\d+)?)\s*%?/)?.[1] || 2,
  );
  const target = Number(
    t.match(
      /(?:target|take\s*profit|tp)\s*(?:is|=)?\s*(\d+(?:\.\d+)?)\s*%?/,
    )?.[1] || 5,
  );
  const conditions = [];

  const rsi = t.match(/rsi\s*(?:below|under|less than|<)\s*(\d+(?:\.\d+)?)/);
  if (rsi)
    conditions.push({
      indicator: "RSI",
      operator: "LT",
      value: Number(rsi[1]),
      fast: 14,
      slow: 0,
    });

  if (
    /ema\s*20.*(?:cross(?:es)?|above).*ema\s*50|ema20.*(?:cross(?:es)?|above).*ema50/.test(
      t,
    )
  ) {
    conditions.push({
      indicator: "EMA_CROSS",
      operator: "CROSS_ABOVE",
      value: null,
      fast: 20,
      slow: 50,
    });
  } else if (/ema\s*20.*below.*ema\s*50|ema20.*below.*ema50/.test(t)) {
    conditions.push({
      indicator: "EMA_CROSS",
      operator: "CROSS_BELOW",
      value: null,
      fast: 20,
      slow: 50,
    });
  }

  if (/macd.*(?:cross(?:es)?|above).*signal/.test(t)) {
    conditions.push({
      indicator: "MACD_CROSS",
      operator: "CROSS_ABOVE",
      value: null,
      fast: 12,
      slow: 26,
    });
  } else if (/macd.*below.*signal/.test(t)) {
    conditions.push({
      indicator: "MACD_CROSS",
      operator: "CROSS_BELOW",
      value: null,
      fast: 12,
      slow: 26,
    });
  }

  const above = t.match(/price\s*(?:above|>)\s*(\d+(?:\.\d+)?)/);
  const below = t.match(/price\s*(?:below|<)\s*(\d+(?:\.\d+)?)/);
  if (above)
    conditions.push({
      indicator: "PRICE_ABOVE",
      operator: "GT",
      value: Number(above[1]),
    });
  if (below)
    conditions.push({
      indicator: "PRICE_BELOW",
      operator: "LT",
      value: Number(below[1]),
    });

  if (/vwap.*(?:above|price.*above)|price.*above.*vwap/.test(t))
    conditions.push({ indicator: "VWAP", operator: "GT", value: null });
  if (/vwap.*(?:below|price.*below)|price.*below.*vwap/.test(t))
    conditions.push({ indicator: "VWAP", operator: "LT", value: null });

  if (!conditions.length)
    conditions.push({
      indicator: "RSI",
      operator: "LT",
      value: 30,
      fast: 14,
      slow: 0,
    });

  return {
    name: `${symbol} Conversational Strategy`,
    symbol,
    side,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 0.001,
    stopLossPct: sl > 0 ? sl : 2,
    targetPct: target > 0 ? target : 5,
    status: "DRAFT",
    mode: "PAPER",
    timeframe: "1m",
    conditions,
  };
}
