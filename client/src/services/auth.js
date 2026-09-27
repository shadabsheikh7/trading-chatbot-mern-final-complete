import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const authApi = {
  login: (data) => axios.post(`${BASE}/auth/login`, data),

  register: (data) => axios.post(`${BASE}/auth/register`, data),

  me: (token) => axios.get(`${BASE}/auth/me`, authHeader(token)),
};

export const adminApi = {
  stats: (token) => axios.get(`${BASE}/admin/stats`, authHeader(token)),

  users: (token) => axios.get(`${BASE}/admin/users`, authHeader(token)),

  orders: (token) => axios.get(`${BASE}/admin/orders`, authHeader(token)),

  strategies: (token) =>
    axios.get(`${BASE}/admin/strategies`, authHeader(token)),

  logs: (token) => axios.get(`${BASE}/admin/logs`, authHeader(token)),
};
