export default function Watchlist({ symbols, prices, selected, onSelect }) {
  return (
    <div className="card dark-card">
      <div className="card-body p-3">
        <div className="section-title mb-2">
          <span>Watchlist</span>
          <small className="muted">Live prices</small>
        </div>
        <div className="watch-grid">
          {symbols.map((s) => (
            <button
              key={s}
              className={`watch-item ${selected === s ? "active" : ""}`}
              onClick={() => onSelect(s)}
            >
              <span>
                <strong>{s.replace("USDT", "")}</strong>
                <small>/ USDT</small>
              </span>
              <b>
                {prices[s]
                  ? `$${prices[s].toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                  : "—"}
              </b>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
