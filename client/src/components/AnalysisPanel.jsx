/** @format */

import { useEffect, useState } from "react";
import { getAnalysis } from "../services/api";
export default function AnalysisPanel({ symbol }) {
  const [a, setA] = useState({});
  const load = () =>
    getAnalysis(symbol)
      .then((r) => setA(r.data))
      .catch(() => setA({}));
  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [symbol]);
  return (
    <div className="card dark-card">
      <div className="card-body">
        <div className="section-title">
          <span>Technical Analysis</span>
          <span className="mini-mode">LIVE</span>
        </div>
        <div className="analysis-grid mt-3">
          <Metric n="MACD" v={a.macd?.macd?.toFixed(2)} />
          <Metric n="Signal" v={a.macd?.signal?.toFixed(2)} />
          <Metric n="Histogram" v={a.macd?.histogram?.toFixed(2)} />
          <Metric n="VWAP" v={a.vwap?.toFixed(2)} />
          <Metric n="Support" v={a.support?.toFixed(2)} />
          <Metric n="Resistance" v={a.resistance?.toFixed(2)} />
        </div>
        <div className="risk-note mt-3">
          Indicators are calculations from the available market candles and are
          not guarantees of future price movement.
        </div>
      </div>
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
