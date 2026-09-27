import { useEffect, useState } from "react";
import { adminApi } from "../services/auth";

export default function AdminPanel({ token }) {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  const load = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const [
        statsResponse,
        usersResponse,
        ordersResponse,
        strategiesResponse,
        logsResponse,
      ] = await Promise.all([
        adminApi.stats(token),
        adminApi.users(token),
        adminApi.orders(token),
        adminApi.strategies(token),
        adminApi.logs(token),
      ]);

      setStats(statsResponse.data || {});
      setUsers(usersResponse.data || []);
      setOrders(ordersResponse.data || []);
      setStrategies(strategiesResponse.data || []);
      setLogs(logsResponse.data || []);
    } catch (err) {
      console.error("Admin Panel Error:", err);

      setError(err.response?.data?.message || "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  return (
    <section id="admin" className="card dark-card mt-4">
      <div className="card-body p-3 p-lg-4">
        {/* ================= HEADER ================= */}

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <div className="eyebrow">ADMIN CONTROL CENTER</div>

            <h4 className="mb-1">System Overview</h4>

            <div className="text-secondary small">
              Manage users, trades, strategies and activity.
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-light btn-sm"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="alert alert-danger">
            <strong>Admin Error:</strong> {error}
          </div>
        )}

        {/* ================= STAT CARDS ================= */}

        <div className="row g-3 mb-4">
          <StatCard title="Total Users" value={stats.users} icon="👥" />

          <StatCard title="Total Orders" value={stats.orders} icon="📈" />

          <StatCard title="Strategies" value={stats.strategies} icon="🤖" />

          <StatCard title="Activity Logs" value={stats.logs} icon="📝" />
        </div>

        {/* ================= TABS ================= */}

        <div className="d-flex flex-wrap gap-2 mb-4">
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            👥 Users
          </TabButton>

          <TabButton
            active={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
          >
            📈 Orders
          </TabButton>

          <TabButton
            active={activeTab === "strategies"}
            onClick={() => setActiveTab("strategies")}
          >
            🤖 Strategies
          </TabButton>

          <TabButton
            active={activeTab === "logs"}
            onClick={() => setActiveTab("logs")}
          >
            📝 Activity Logs
          </TabButton>
        </div>

        {/* ================= USERS ================= */}

        {activeTab === "users" && (
          <DataTable title="Users Management">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <EmptyRow colSpan={4} />
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name || "—"}</strong>
                    </td>

                    <td>{user.email || "—"}</td>

                    <td>
                      <span
                        className={`badge ${
                          user.role === "admin"
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>

                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </DataTable>
        )}

        {/* ================= ORDERS ================= */}

        {activeTab === "orders" && (
          <DataTable title="Trading Orders">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <EmptyRow colSpan={7} />
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>{order.symbol || "—"}</strong>
                    </td>

                    <td>
                      <span
                        className={
                          order.side === "BUY"
                            ? "text-success fw-semibold"
                            : "text-danger fw-semibold"
                        }
                      >
                        {order.side || "—"}
                      </span>
                    </td>

                    <td>{order.quantity ?? "—"}</td>

                    <td>${Number(order.price || 0).toLocaleString()}</td>

                    <td>{order.mode || "—"}</td>

                    <td>
                      <StatusBadge value={order.status} />
                    </td>

                    <td>{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </DataTable>
        )}

        {/* ================= STRATEGIES ================= */}

        {activeTab === "strategies" && (
          <DataTable title="Trading Strategies">
            <thead>
              <tr>
                <th>Name</th>
                <th>Symbol</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Side</th>
                <th>Trades</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>P&L</th>
              </tr>
            </thead>

            <tbody>
              {strategies.length === 0 ? (
                <EmptyRow colSpan={9} />
              ) : (
                strategies.map((strategy) => {
                  const pnl = Number(strategy.stats?.pnl || 0);

                  return (
                    <tr key={strategy._id}>
                      <td>
                        <strong>{strategy.name || "—"}</strong>
                      </td>

                      <td>{strategy.symbol || "—"}</td>

                      <td>{strategy.mode || "—"}</td>

                      <td>
                        <StatusBadge value={strategy.status} />
                      </td>

                      <td>{strategy.side || "—"}</td>

                      <td>{strategy.stats?.trades || 0}</td>

                      <td className="text-success">
                        {strategy.stats?.wins || 0}
                      </td>

                      <td className="text-danger">
                        {strategy.stats?.losses || 0}
                      </td>

                      <td
                        className={
                          pnl >= 0
                            ? "text-success fw-semibold"
                            : "text-danger fw-semibold"
                        }
                      >
                        ${pnl.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </DataTable>
        )}

        {/* ================= ACTIVITY LOGS ================= */}

        {activeTab === "logs" && (
          <DataTable title="Activity Logs">
            <thead>
              <tr>
                <th>Action</th>
                <th>User ID</th>
                <th>Details</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 ? (
                <EmptyRow colSpan={4} />
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <span className="badge bg-secondary">
                        {log.action || "—"}
                      </span>
                    </td>

                    <td>{log.userId || "—"}</td>

                    <td>{log.details || "—"}</td>

                    <td>{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </DataTable>
        )}
      </div>
    </section>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({ title, value, icon }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="stat h-100 p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small>{title}</small>

          <span>{icon}</span>
        </div>

        <strong className="fs-3">{value ?? "—"}</strong>
      </div>
    </div>
  );
}

/* =====================================================
   TAB BUTTON
===================================================== */

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`btn btn-sm ${
        active ? "btn-light text-dark" : "btn-outline-light"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* =====================================================
   TABLE
===================================================== */

function DataTable({ title, children }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{title}</h5>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-sm table-hover align-middle mb-0">
          {children}
        </table>
      </div>
    </div>
  );
}

/* =====================================================
   EMPTY TABLE
===================================================== */

function EmptyRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center text-secondary py-4">
        No data available
      </td>
    </tr>
  );
}

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({ value }) {
  if (!value) {
    return <span className="badge bg-secondary">—</span>;
  }

  let className = "bg-secondary";

  if (value === "ACTIVE" || value === "FILLED" || value === "COMPLETED") {
    className = "bg-success";
  }

  if (value === "PAUSED" || value === "OPEN") {
    className = "bg-warning text-dark";
  }

  if (value === "REJECTED" || value === "CANCELLED" || value === "FAILED") {
    className = "bg-danger";
  }

  return <span className={`badge ${className}`}>{value}</span>;
}

/* =====================================================
   DATE HELPERS
===================================================== */

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}

function formatDateTime(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}
