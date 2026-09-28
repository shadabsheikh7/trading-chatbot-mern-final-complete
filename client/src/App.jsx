/** @format */

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { getIndicators, getOrders, getPrice } from "./services/api";
import { authApi } from "./services/auth";
import Navbar from "./components/Navbar";
import AuthPage from "./components/auth/AuthPage";
import AdminPanel from "./components/AdminPanel";
import MarketChart from "./components/MarketChart";
import Chat from "./components/Chat";
import Portfolio from "./components/Portfolio";
import OrderPanel from "./components/OrderPanel";
import Watchlist from "./components/Watchlist";
import OrdersTable from "./components/OrdersTable";
import AnalysisPanel from "./components/AnalysisPanel";
import RiskPanel from "./components/RiskPanel";
import BrokerSandbox from "./components/BrokerSandbox";
import StrategyBuilder from "./components/strategy/StrategyBuilder";
import StrategyList from "./components/strategy/StrategyList";

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function App() {
  const [auth, setAuth] = useState(() =>
    JSON.parse(localStorage.getItem("tradepilot_auth") || "null"),
  );

  // First-time visitor ko Register page dikhega
  const [mode, setMode] = useState("register");

  const [authError, setAuthError] = useState("");

  if (!auth) {
    return (
      <AuthPage
        mode={mode}
        error={authError}
        onSwitch={() => {
          setMode(mode === "login" ? "register" : "login");
          setAuthError("");
        }}
        onSubmit={async (f) => {
          try {
            // Registration
            if (mode === "register") {
              await authApi.register(f);

              // Registration ke baad Login page
              setMode("login");
              setAuthError(
                "Registration successful. Please login with your email and password.",
              );

              return;
            }

            // Login
            const r = await authApi.login(f);

            localStorage.setItem(
              "tradepilot_auth",
              JSON.stringify(r.data),
            );

            setAuth(r.data);
            setAuthError("");
          } catch (e) {
            setAuthError(
              e.response?.data?.message || "Authentication failed",
            );
          }
        }}
      />
    );
  }

  return (
    <TradingApp
      auth={auth}
      onLogout={() => {
        localStorage.removeItem("tradepilot_auth");
        setAuth(null);
        setMode("login");
        setAuthError("");
      }}
    />
  );
}

function TradingApp({ auth, onLogout }) {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [prices, setPrices] = useState({});
  const [ind, setInd] = useState({});
  const [liveCandle, setLiveCandle] = useState(null);
  const [orders, setOrders] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [online, setOnline] = useState(false);
  const [strategyRefresh, setStrategyRefresh] = useState(0);

  const price = prices[symbol] ?? null;

  const load = async () => {
    try {
      const [p, i, o] = await Promise.all([
        getPrice(symbol),
        getIndicators(symbol),
        getOrders(),
      ]);

      setPrices((x) => ({
        ...x,
        [symbol]: p.data.price,
      }));

      setInd(i.data);
      setOrders(o.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();

    const id = setInterval(load, 10000);

    return () => clearInterval(id);
  }, [symbol, refresh]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => setOnline(true));

    socket.on("disconnect", () => setOnline(false));

    socket.on("market", (m) => {
      if (m.type === "ticker") {
        setPrices((x) => ({
          ...x,
          [m.symbol]: m.price,
        }));
      }

      if (m.type === "candle" && m.symbol === symbol) {
        setLiveCandle(m.candle);
      }
    });

    return () => socket.disconnect();
  }, [symbol]);

  const formatted = useMemo(
    () =>
      price == null
        ? "—"
        : `$${price.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`,
    [price],
  );

  return (
    <div id="top" className="app">
      <Navbar user={auth.user} onLogout={onLogout} />

      <main className="container-fluid px-3 px-lg-4 py-3">
        <div id="dashboard" className="row g-3">
          <div className="col-xl-8">
            <div className="card dark-card hero-card">
              <div className="card-body p-3 p-lg-4">
                <div className="d-flex flex-wrap justify-content-between gap-3 align-items-start">
                  <div>
                    <div className="eyebrow">MARKET OVERVIEW</div>

                    <div className="d-flex align-items-center gap-2">
                      <select
                        className="symbol-select"
                        value={symbol}
                        onChange={(e) => {
                          setSymbol(e.target.value);
                          setLiveCandle(null);
                        }}
                      >
                        {symbols.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>

                      <span className="live-pill">● LIVE</span>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="price">{formatted}</div>
                    <div className="muted small">
                      Real-time market price
                    </div>
                  </div>
                </div>

                <div className="chart-wrap mt-3">
                  <MarketChart
                    symbol={symbol}
                    liveCandle={liveCandle}
                  />
                </div>

                <div className="row g-2 mt-2">
                  <Stat
                    label="EMA 20"
                    value={ind.ema20?.toFixed(2)}
                  />

                  <Stat
                    label="EMA 50"
                    value={ind.ema50?.toFixed(2)}
                  />

                  <Stat
                    label="RSI 14"
                    value={ind.rsi14?.toFixed(2)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <Watchlist
                symbols={symbols}
                prices={prices}
                selected={symbol}
                onSelect={setSymbol}
              />
            </div>

            <div className="mt-3">
              <AnalysisPanel symbol={symbol} />
            </div>

            <div id="orders" className="mt-3">
              <OrdersTable orders={orders} />
            </div>
          </div>

          <div className="col-xl-4">
            <div className="row g-3">
              <div
                id="portfolio"
                className="col-md-6 col-xl-12"
              >
                <Portfolio
                  refreshKey={refresh}
                  prices={prices}
                />
              </div>

              <div className="col-md-6 col-xl-12">
                <OrderPanel
                  symbol={symbol}
                  price={price}
                  onDone={() =>
                    setRefresh((x) => x + 1)
                  }
                />
              </div>

              <div className="col-md-6 col-xl-12">
                <RiskPanel price={price} />
              </div>

              <div className="col-md-6 col-xl-12">
                <BrokerSandbox />
              </div>
            </div>
          </div>
        </div>

        <div id="strategies" className="row g-3 mt-3">
          <div className="col-12">
            <StrategyBuilder
              onCreated={() =>
                setStrategyRefresh((x) => x + 1)
              }
            />
          </div>

          <div className="col-12">
            <StrategyList
              refreshKey={strategyRefresh}
            />
          </div>
        </div>

        <div id="assistant" className="terminal-banner mt-3">
          <div>
            <div className="eyebrow">
              AI TRADING ASSISTANT
            </div>

            <h5 className="mb-1">
              Build and test strategies with natural language.
            </h5>

            <p className="muted mb-0">
              Try: <code>price btc</code>,{" "}
              <code>rsi btc</code>,{" "}
              <code>portfolio</code>,{" "}
              <code>buy 0.001 btc</code>.
            </p>
          </div>

          <span className="badge paper-badge">
            SAFE PAPER EXECUTION
          </span>
        </div>

        <div className="chat-shell mt-3">
          <Chat />
        </div>

        {auth.user.role === "admin" && (
          <AdminPanel token={auth.token} />
        )}

        <footer className="text-center text-secondary small py-4">
          © 2026 TradePilot • Designed & Developed by Shadab Sheikh
        </footer>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="col-4">
      <div className="stat">
        <small>{label}</small>
        <strong>{value || "—"}</strong>
      </div>
    </div>
  );
}