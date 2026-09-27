# TradePilot — AI Conversational Trading Automation Platform

MERN + Bootstrap trading dashboard inspired by conversational/rule-based trading products.

## Included
- Responsive navbar, login/signup and JWT authentication
- MongoDB persistence for users, orders, strategies, portfolio and activity logs
- Admin dashboard with users/orders/strategy/system stats
- Live crypto market feed via WebSocket/Socket.IO
- Candlestick chart, EMA, RSI, MACD, VWAP, support/resistance
- Paper trading, portfolio, P&L, stop loss and target
- Natural-language strategy builder and paper automation
- Backtesting and Upstox sandbox adapter

## Setup
1. `cd server && npm install`
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
3. `npm run dev`
4. In another terminal: `cd client && npm install && npm run dev`
5. Open `http://localhost:5173`

The default trading mode is PAPER. No live-money execution is enabled by default.
