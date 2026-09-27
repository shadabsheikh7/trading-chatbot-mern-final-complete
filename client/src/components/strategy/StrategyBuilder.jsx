import { useState } from "react";
import { createStrategy } from "../../services/api";

const initial = {
  name: "BTC RSI + EMA Strategy",
  symbol: "BTCUSDT",
  side: "BUY",
  quantity: 0.001,
  stopLossPct: 2,
  targetPct: 5,
  status: "DRAFT",
  conditions: [
    { indicator: "RSI", operator: "LT", value: 30, fast: 20, slow: 50 },
    {
      indicator: "EMA_CROSS",
      operator: "CROSS_ABOVE",
      value: null,
      fast: 20,
      slow: 50,
    },
  ],
};

function parseNatural(text) {
  const t = text.toLowerCase();
  const symbol =
    (t.match(/\b(btc|eth|bnb|sol)\b/)?.[1] || "btc").toUpperCase() + "USDT";
  const rsiMatch = t.match(/rsi\s*(?:below|under|<)\s*(\d+(?:\.\d+)?)/);
  const qty = +(
    t.match(/(?:qty|quantity)\s*(?:is|=)?\s*(\d*\.\d+)/)?.[1] || 0.001
  );
  const sl = +(
    t.match(/(?:stop\s*loss|sl)\s*(?:is|=)?\s*(\d+(?:\.\d+)?)\s*%?/)?.[1] || 2
  );
  const target = +(
    t.match(
      /(?:target|take\s*profit|tp)\s*(?:is|=)?\s*(\d+(?:\.\d+)?)\s*%?/,
    )?.[1] || 5
  );
  const conditions = [];
  if (rsiMatch)
    conditions.push({
      indicator: "RSI",
      operator: "LT",
      value: +rsiMatch[1],
      fast: 20,
      slow: 50,
    });
  if (/ema\s*20.*(?:above|cross).*ema\s*50|ema20.*ema50/.test(t))
    conditions.push({
      indicator: "EMA_CROSS",
      operator: "CROSS_ABOVE",
      value: null,
      fast: 20,
      slow: 50,
    });
  if (/macd.*cross|macd.*above/.test(t))
    conditions.push({
      indicator: "MACD_CROSS",
      operator: "CROSS_ABOVE",
      value: null,
      fast: 12,
      slow: 26,
    });
  return {
    ...initial,
    name: `${symbol} Conversational Strategy`,
    symbol,
    quantity: qty,
    stopLossPct: sl,
    targetPct: target,
    conditions: conditions.length ? conditions : initial.conditions,
  };
}

export default function StrategyBuilder({ onCreated }) {
  const [form, setForm] = useState(initial);
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addCondition = () =>
    setForm((f) => ({
      ...f,
      conditions: [
        ...f.conditions,
        { indicator: "RSI", operator: "LT", value: 30, fast: 20, slow: 50 },
      ],
    }));
  const updateCondition = (i, key, value) =>
    setForm((f) => ({
      ...f,
      conditions: f.conditions.map((c, idx) =>
        idx === i
          ? {
              ...c,
              [key]:
                value === ""
                  ? null
                  : ["value", "fast", "slow"].includes(key)
                    ? Number(value)
                    : value,
            }
          : c,
      ),
    }));
  const removeCondition = (i) =>
    setForm((f) => ({
      ...f,
      conditions: f.conditions.filter((_, idx) => idx !== i),
    }));
  const generate = () => {
    if (!prompt.trim()) return;
    setForm(parseNatural(prompt));
    setMessage(
      "Strategy generated from your instruction. Review it before saving.",
    );
  };
  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      await createStrategy(form);
      setMessage("Strategy saved as DRAFT.");
      onCreated?.();
    } catch (e) {
      setMessage(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="dark-card p-3 p-lg-4">
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div className="eyebrow">CONVERSATIONAL STRATEGY BUILDER</div>
          <h5 className="mb-1">Describe a strategy in plain English</h5>
          <div className="muted small">
            Example: “BTC RSI below 30 and EMA20 crosses EMA50, buy 0.001, SL
            2%, target 5%.”
          </div>
        </div>
        <span className="badge paper-badge">PAPER ONLY</span>
      </div>
      <div className="strategy-ai-input mt-3">
        <textarea
          className="form-control trade-input"
          rows="2"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tell TradePilot what strategy you want..."
        />
        <button className="btn btn-info mt-2" onClick={generate}>
          Generate Strategy
        </button>
      </div>
      <div className="row g-2 mt-3">
        <div className="col-md-6">
          <label className="form-label small muted">Strategy name</label>
          <input
            className="form-control trade-input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label small muted">Symbol</label>
          <select
            className="form-select trade-input"
            value={form.symbol}
            onChange={(e) => update("symbol", e.target.value)}
          >
            {["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label small muted">Side</label>
          <select
            className="form-select trade-input"
            value={form.side}
            onChange={(e) => update("side", e.target.value)}
          >
            <option>BUY</option>
            <option>SELL</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label small muted">Quantity</label>
          <input
            type="number"
            step="0.000001"
            className="form-control trade-input"
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label small muted">Stop loss %</label>
          <input
            type="number"
            className="form-control trade-input"
            value={form.stopLossPct}
            onChange={(e) => update("stopLossPct", e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label small muted">Target %</label>
          <input
            type="number"
            className="form-control trade-input"
            value={form.targetPct}
            onChange={(e) => update("targetPct", e.target.value)}
          />
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-4">
        <strong>Entry conditions</strong>
        <button className="btn btn-sm btn-outline-light" onClick={addCondition}>
          + Add condition
        </button>
      </div>
      <div className="mt-2 d-grid gap-2">
        {form.conditions.map((c, i) => (
          <div className="condition-row" key={i}>
            <select
              className="form-select trade-input"
              value={c.indicator}
              onChange={(e) => updateCondition(i, "indicator", e.target.value)}
            >
              <option>RSI</option>
              <option>EMA_CROSS</option>
              <option>PRICE_ABOVE</option>
              <option>PRICE_BELOW</option>
              <option>MACD_CROSS</option>
              <option>VWAP</option>
            </select>
            <select
              className="form-select trade-input"
              value={c.operator}
              onChange={(e) => updateCondition(i, "operator", e.target.value)}
            >
              <option>LT</option>
              <option>LTE</option>
              <option>GT</option>
              <option>GTE</option>
              <option>CROSS_ABOVE</option>
              <option>CROSS_BELOW</option>
            </select>
            <input
              type="number"
              className="form-control trade-input"
              value={c.value ?? ""}
              placeholder="value"
              onChange={(e) => updateCondition(i, "value", e.target.value)}
            />
            {c.indicator === "EMA_CROSS" && (
              <>
                <input
                  type="number"
                  className="form-control trade-input"
                  value={c.fast}
                  onChange={(e) => updateCondition(i, "fast", e.target.value)}
                />
                <input
                  type="number"
                  className="form-control trade-input"
                  value={c.slow}
                  onChange={(e) => updateCondition(i, "slow", e.target.value)}
                />
              </>
            )}
            <button
              className="btn btn-outline-danger"
              onClick={() => removeCondition(i)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {message && <div className="order-msg mt-3">{message}</div>}
      <button
        className="btn btn-success mt-3 fw-bold"
        onClick={save}
        disabled={saving || !form.conditions.length}
      >
        {saving ? "Saving..." : "Save Strategy"}
      </button>
    </div>
  );
}
