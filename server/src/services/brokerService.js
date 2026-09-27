/**
 * Broker abstraction. Replace these methods with your broker SDK/API.
 * Never expose broker secrets to the React client.
 */
export const brokerService = {
  async placeOrder({ symbol, side, quantity, price }) {
    throw new Error(
      "LIVE broker adapter not configured. Keep TRADING_MODE=PAPER.",
    );
  },
  async cancelOrder(orderId) {
    throw new Error("LIVE broker adapter not configured.");
  },
  async getPositions() {
    throw new Error("LIVE broker adapter not configured.");
  },
};
