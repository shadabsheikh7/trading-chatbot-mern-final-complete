import { useEffect, useState } from "react";
import {
  backtestStrategy,
  deleteStrategy,
  getStrategies,
  testStrategy,
  toggleStrategy,
} from "../../services/api";

export default function StrategyList({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const load = async () => {
    try {
      const { data } = await getStrategies();
      setItems(data);
    } catch (e) {}
  };
  useEffect(() => {
    load();
  }, [refreshKey]);
  const toggle = async (id) => {
    await toggleStrategy(id);
    load();
  };
  const remove = async (id) => {
    await deleteStrategy(id);
    load();
  };
  const test = async (id) => {
    const { data } = await testStrategy(id);
    setResults((r) => ({
      ...r,
      [id]: `Current signal: ${data.signal ? "TRIGGERED" : "Waiting"}`,
    }));
  };
  const backtest = async (id) => {
    setLoading(true);
    try {
      const { data } = await backtestStrategy(id);
      setResults((r) => ({
        ...r,
        [id]: `Backtest: ${data.trades} trades • Win rate ${data.winRate.toFixed(1)}% • P&L $${data.pnl.toFixed(2)} • Max DD ${data.maxDrawdown.toFixed(2)}%`,
      }));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="dark-card p-3 p-lg-4">
      <div className="section-title">
        <span>My Strategies</span>
        <span className="badge paper-badge">AUTOMATION: PAPER</span>
      </div>
      <div className="muted small mt-1">
        Active strategies are evaluated against the live feed. Orders remain
        paper-only.
      </div>
      <div className="strategy-list mt-3">
        {!items.length && (
          <div className="empty-state">
            No strategies yet. Create one above.
          </div>
        )}
        {items.map((s) => (
          <div className="strategy-card" key={s._id}>
            <div className="d-flex justify-content-between gap-2">
              <div>
                <strong>{s.name}</strong>
                <div className="muted small mt-1">
                  {s.symbol} • {s.side} {s.quantity} • SL {s.stopLossPct}% •
                  Target {s.targetPct}%
                </div>
              </div>
              <span className={`strategy-status ${s.status.toLowerCase()}`}>
                {s.status}
              </span>
            </div>
            <div className="condition-chips mt-2">
              {s.conditions.map((c, i) => (
                <span key={i}>
                  {c.indicator} {c.operator} {c.value ?? ""}
                </span>
              ))}
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => toggle(s._id)}
              >
                {s.status === "ACTIVE" ? "Pause" : "Activate"}
              </button>
              <button
                className="btn btn-sm btn-outline-info"
                onClick={() => test(s._id)}
              >
                Test Signal
              </button>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => backtest(s._id)}
                disabled={loading}
              >
                Backtest
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => remove(s._id)}
              >
                Delete
              </button>
            </div>
            {results[s._id] && (
              <div className="order-msg mt-2">{results[s._id]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
