import { useState } from "react";
import { placeOrder } from "../services/api";
export default function OrderPanel({ symbol, price, onDone }) {
  const [side, setSide] = useState("BUY");
  const [qty, setQty] = useState("0.001");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!confirm(`${side} ${qty} ${symbol} in PAPER mode?`)) return;
    setLoading(true);
    try {
      const r = await placeOrder({
        symbol,
        side,
        quantity: Number(qty),
        stopLoss: sl ? Number(sl) : null,
        target: tp ? Number(tp) : null,
      });
      setMsg(
        `${r.data.side} ${r.data.quantity} ${r.data.symbol} filled at $${Number(r.data.price).toFixed(2)}`,
      );
      onDone?.();
    } catch (err) {
      setMsg(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="card dark-card h-100">
      <div className="card-body">
        <div className="section-title">
          <span>Quick Order</span>
          <span className="mini-mode">PAPER</span>
        </div>
        <div className="order-symbol">
          {symbol}
          <span>
            {price
              ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : "—"}
          </span>
        </div>
        <div className="btn-group w-100 mb-3">
          <button
            type="button"
            className={`btn ${side === "BUY" ? "btn-buy" : "btn-outline-secondary"}`}
            onClick={() => setSide("BUY")}
          >
            BUY
          </button>
          <button
            type="button"
            className={`btn ${side === "SELL" ? "btn-sell" : "btn-outline-secondary"}`}
            onClick={() => setSide("SELL")}
          >
            SELL
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="form-label small muted">Quantity</label>
          <div className="input-group mb-2">
            <input
              className="form-control trade-input"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              type="number"
              step="0.000001"
              min="0.000001"
            />
            <span className="input-group-text">
              {symbol.replace("USDT", "")}
            </span>
          </div>
          <div className="row g-2">
            <Field label="Stop Loss" value={sl} set={setSl} />
            <Field label="Target" value={tp} set={setTp} />
          </div>
          <button
            disabled={loading || !price}
            className={`btn w-100 mt-3 ${side === "BUY" ? "btn-buy" : "btn-sell"}`}
          >
            {loading ? "Submitting…" : `Place ${side}`}
          </button>
        </form>
        {msg && <div className="order-msg mt-2">{msg}</div>}
      </div>
    </div>
  );
}
function Field({ label, value, set }) {
  return (
    <div className="col-6">
      <label className="form-label small muted mb-1">{label}</label>
      <input
        className="form-control trade-input"
        type="number"
        step="any"
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder="Optional"
      />
    </div>
  );
}
