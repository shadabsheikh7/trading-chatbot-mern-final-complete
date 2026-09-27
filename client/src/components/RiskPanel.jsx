import { useEffect, useState } from "react";
import { calculateRisk } from "../services/api";
export default function RiskPanel({ price }) {
  const [entry, setEntry] = useState("");
  const [stop, setStop] = useState("");
  const [target, setTarget] = useState("");
  const [qty, setQty] = useState("0.001");
  const [r, setR] = useState(null);
  useEffect(() => {
    if (price && !entry) setEntry(String(Number(price.toFixed(2))));
  }, [price]);
  const run = async () => {
    try {
      setR((await calculateRisk({ entry, stop, target, quantity: qty })).data);
    } catch (e) {
      setR({ error: e.response?.data?.message || e.message });
    }
  };
  return (
    <div className="card dark-card">
      <div className="card-body">
        <div className="section-title">
          <span>Risk Calculator</span>
          <span className="mini-mode">PAPER</span>
        </div>
        <div className="row g-2 mt-2">
          <Field l="Entry" v={entry} s={setEntry} />
          <Field l="Stop Loss" v={stop} s={setStop} />
          <Field l="Target" v={target} s={setTarget} />
          <Field l="Quantity" v={qty} s={setQty} />
        </div>
        <button
          className="btn btn-sm btn-outline-info w-100 mt-3"
          onClick={run}
        >
          Calculate Risk
        </button>
        {r && !r.error && (
          <div className="analysis-grid mt-3">
            <Metric n="Risk" v={`$${r.totalRisk.toFixed(2)}`} />
            <Metric n="Reward" v={`$${r.totalReward.toFixed(2)}`} />
            <Metric n="R:R" v={r.rr?.toFixed(2)} />
            <Metric n="Notional" v={`$${r.notional.toFixed(2)}`} />
          </div>
        )}
        {r?.error && <div className="risk-error mt-2">{r.error}</div>}
      </div>
    </div>
  );
}
function Field({ l, v, s }) {
  return (
    <div className="col-6">
      <label className="form-label small muted mb-1">{l}</label>
      <input
        className="form-control trade-input"
        type="number"
        step="any"
        value={v}
        onChange={(e) => s(e.target.value)}
      />
    </div>
  );
}
function Metric({ n, v }) {
  return (
    <div className="analysis-metric">
      <small>{n}</small>
      <b>{v ?? "—"}</b>
    </div>
  );
}
