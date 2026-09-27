import { useEffect, useState } from "react";
import { getBrokerStatus, placeSandboxOrder } from "../services/api";
export default function BrokerSandbox() {
  const [status, setStatus] = useState({ sandboxConfigured: false });
  const [token, setToken] = useState("");
  const [side, setSide] = useState("BUY");
  const [qty, setQty] = useState("1");
  const [orderType, setOrderType] = useState("MARKET");
  const [product, setProduct] = useState("D");
  const [instrumentToken, setInstrumentToken] = useState("");
  const [price, setPrice] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getBrokerStatus()
      .then((r) => setStatus(r.data))
      .catch(() => {});
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!status.sandboxConfigured) {
      setMsg("Server par UPSTOX_SANDBOX_TOKEN configure karein.");
      return;
    }
    if (!instrumentToken) {
      setMsg("Upstox instrument token required.");
      return;
    }
    if (!confirm(`Send ${side} sandbox order?`)) return;
    setLoading(true);
    try {
      const r = await placeSandboxOrder({
        instrumentToken,
        transactionType: side,
        quantity: Number(qty),
        orderType,
        product,
        validity: "DAY",
        price: Number(price) || 0,
        tag: "tradepilot-ui",
      });
      setMsg(`Sandbox response: ${JSON.stringify(r.data.data || r.data)}`);
    } catch (e) {
      setMsg(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="card dark-card">
      <div className="card-body">
        <div className="section-title">
          <span>Upstox Sandbox</span>
          <span
            className={`mini-mode ${status.sandboxConfigured ? "" : "warning-mode"}`}
          >
            {status.sandboxConfigured ? "READY" : "NOT CONFIGURED"}
          </span>
        </div>
        <p className="muted small mt-2 mb-3">
          Sandbox testing only. Broker credentials stay on the server.
        </p>
        <form onSubmit={submit}>
          <input
            className="form-control trade-input mb-2"
            value={instrumentToken}
            onChange={(e) => setInstrumentToken(e.target.value)}
            placeholder="Instrument token e.g. NSE_EQ|..."
          />
          <div className="row g-2">
            <div className="col-4">
              <select
                className="form-select trade-input"
                value={side}
                onChange={(e) => setSide(e.target.value)}
              >
                <option>BUY</option>
                <option>SELL</option>
              </select>
            </div>
            <div className="col-4">
              <input
                className="form-control trade-input"
                type="number"
                min="1"
                step="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Qty"
              />
            </div>
            <div className="col-4">
              <select
                className="form-select trade-input"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option>MARKET</option>
                <option>LIMIT</option>
              </select>
            </div>
          </div>
          {orderType === "LIMIT" && (
            <input
              className="form-control trade-input mt-2"
              type="number"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Limit price"
            />
          )}
          <select
            className="form-select trade-input mt-2"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          >
            <option value="D">Delivery (D)</option>
            <option value="I">Intraday (I)</option>
          </select>
          <button
            className="btn btn-outline-info w-100 mt-3"
            disabled={loading}
          >
            {loading ? "Sending…" : "Send Sandbox Order"}
          </button>
        </form>
        {msg && <div className="order-msg mt-2 small text-break">{msg}</div>}
      </div>
    </div>
  );
}
