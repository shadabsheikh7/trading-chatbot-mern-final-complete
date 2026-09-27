import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
export const getPrice = (s) => api.get(`/market/price/${s}`);
export const getCandles = (s) => api.get(`/market/candles/${s}`);
export const getIndicators = (s) => api.get(`/market/indicators/${s}`);
export const getOrders = () => api.get("/trade/orders");
export const getPortfolio = () => api.get("/trade/portfolio");
export const placeOrder = (body) => api.post("/trade/order", body);
export const getAnalysis = (s) => api.get(`/analysis/${s}`);
export const calculateRisk = (body) => api.post("/analysis/risk", body);
export const sendChat = (message) => api.post("/chat", { message });
export const getBrokerStatus = () => api.get("/broker/status");
export const placeSandboxOrder = (body) =>
  api.post("/broker/sandbox/order", body);
export const getSandboxOrders = () => api.get("/broker/sandbox/orders");
export const closePosition = (body) => api.post("/trade/position/close", body);
export const getStrategies = () => api.get("/strategies");
export const createStrategy = (body) => api.post("/strategies", body);
export const toggleStrategy = (id) => api.post(`/strategies/${id}/toggle`);
export const deleteStrategy = (id) => api.delete(`/strategies/${id}`);
export const backtestStrategy = (id) => api.post(`/strategies/${id}/backtest`);
export const testStrategy = (id) => api.post(`/strategies/${id}/test`);
