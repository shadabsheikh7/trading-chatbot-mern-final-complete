import axios from "axios";

const BASE_URL =
  process.env.UPSTOX_SANDBOX_BASE_URL || "https://api-sandbox.upstox.com/v3";

function token() {
  if (!process.env.UPSTOX_SANDBOX_TOKEN)
    throw new Error("UPSTOX_SANDBOX_TOKEN is not configured on the server.");
  return process.env.UPSTOX_SANDBOX_TOKEN;
}

function client() {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

export async function placeSandboxOrder({
  instrumentToken,
  transactionType,
  quantity,
  orderType = "MARKET",
  product = "D",
  validity = "DAY",
  price = 0,
  triggerPrice = 0,
  tag = "tradepilot",
}) {
  if (!instrumentToken) throw new Error("instrumentToken is required.");
  if (!["BUY", "SELL"].includes(transactionType))
    throw new Error("transactionType must be BUY or SELL.");
  if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0)
    throw new Error("Sandbox quantity must be a positive integer.");
  const payload = {
    quantity: Number(quantity),
    product,
    validity,
    price: Number(price) || 0,
    tag,
    instrument_token: instrumentToken,
    order_type: orderType,
    transaction_type: transactionType,
    disclosed_quantity: 0,
    trigger_price: Number(triggerPrice) || 0,
    is_amo: false,
    slice: false,
  };
  const { data } = await client().post("/order/place", payload);
  return data;
}

export async function cancelSandboxOrder(orderId) {
  if (!orderId) throw new Error("orderId is required.");
  const { data } = await client().delete(
    `/order/cancel?order_id=${encodeURIComponent(orderId)}`,
  );
  return data;
}

export async function getSandboxOrders() {
  const { data } = await client().get("/order/retrieve-all");
  return data;
}
