import { useEffect, useState } from "react";
import { closePosition, getPortfolio } from "../services/api";
export default function Portfolio({ refreshKey }) {
  const [p, setP] = useState({
    cash: 0,
    positions: [],
    invested: 0,
    marketValue: 0,
    unrealizedPnl: 0,
    equity: 0,
  });
  const [busy, setBusy] = useState("");
  const load = () =>
    getPortfolio()
      .then((r) => setP(r.data))
      .catch(() => {});
  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [refreshKey]);
  const close = async (symbol) => {
    if (!confirm(`Close ${symbol} paper position?`)) return;
    setBusy(symbol);
    try {
      await closePosition({ symbol });
      await load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setBusy("");
    }
  };
  return (
    <div className="card dark-card h-100">
      <div className="card-body">
        <div className="section-title">
          <span>Paper Portfolio</span>
          <span className="mini-mode">LIVE P&amp;L</span>
        </div>
        <div className="cash">
          $
          {Number(p.equity).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </div>
        <small className="muted">Estimated equity</small>
        <div className="portfolio-stats mt-3">
          <div>
            <small>Cash</small>
            <b>
              $
              {Number(p.cash).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </b>
          </div>
          <div>
            <small>Unrealized P&amp;L</small>
            <b
              className={p.unrealizedPnl >= 0 ? "text-success" : "text-danger"}
            >
              {p.unrealizedPnl >= 0 ? "+" : ""}$
              {Number(p.unrealizedPnl).toFixed(2)}
            </b>
          </div>
        </div>
        <hr />
        {p.positions.length ? (
          p.positions.map((x) => (
            <div className="position" key={x.symbol}>
              <div>
                <strong>{x.symbol}</strong>
                <small className="d-block muted">
                  {x.quantity} units · avg ${Number(x.avgPrice).toFixed(2)}
                </small>
                <small className="d-block muted">
                  LTP ${Number(x.marketPrice).toFixed(2)} ·{" "}
                  {x.stopLoss ? `SL ${x.stopLoss}` : "No SL"} ·{" "}
                  {x.target ? `TP ${x.target}` : "No TP"}
                </small>
              </div>
              <div className="text-end">
                <strong
                  className={
                    x.unrealizedPnl >= 0 ? "text-success" : "text-danger"
                  }
                >
                  {x.unrealizedPnl >= 0 ? "+" : ""}$
                  {Number(x.unrealizedPnl).toFixed(2)}
                </strong>
                <button
                  disabled={busy === x.symbol}
                  onClick={() => close(x.symbol)}
                  className="btn btn-sm btn-outline-danger d-block mt-1 ms-auto"
                >
                  {busy === x.symbol ? "Closing…" : "Close"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="muted py-2">No open positions</div>
        )}
      </div>
    </div>
  );
}
