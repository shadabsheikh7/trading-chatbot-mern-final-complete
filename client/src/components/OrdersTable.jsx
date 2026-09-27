export default function OrdersTable({ orders }) {
  return (
    <div className="card dark-card">
      <div className="card-body p-3">
        <div className="section-title mb-3">
          <span>Recent Orders</span>
          <small className="muted">Latest 50</small>
        </div>
        <div className="table-responsive">
          <table className="table table-dark table-borderless align-middle mb-0">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.length ? (
                orders.slice(0, 8).map((o) => (
                  <tr key={o._id}>
                    <td>{o.symbol}</td>
                    <td>
                      <span
                        className={
                          o.side === "BUY" ? "text-success" : "text-danger"
                        }
                      >
                        {o.side}
                      </span>
                    </td>
                    <td>{o.quantity}</td>
                    <td>
                      $
                      {Number(o.price).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <span className="table-pill">{o.mode}</span>
                    </td>
                    <td>
                      <span className="text-success">{o.status}</span>
                    </td>
                    <td className="muted">
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center muted py-4">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
