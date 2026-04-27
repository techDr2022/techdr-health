import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type CashfreeOrderResponse = {
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  payment_session_id?: string;
};

function readEnvFileFallback() {
  const cwd = process.cwd().replace(/^"(.*)"$/, "$1");
  const candidatePaths = [
    join(cwd, ".env"),
    join(cwd, "teleconsult-platform", ".env"),
  ];
  const envPath = candidatePaths.find((path) => existsSync(path));
  if (!envPath) {
    return {};
  }

  const parsed: Record<string, string> = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }

  return parsed;
}

function getEnv(name: string) {
  const fromProcess = process.env[name];
  if (fromProcess && fromProcess.trim()) return fromProcess.trim();
  const fromFile = readEnvFileFallback()[name]?.trim();
  if (fromFile) {
    process.env[name] = fromFile;
    return fromFile;
  }
  return undefined;
}

function getCashfreeConfig() {
  const appId = getEnv("CASHFREE_APP_ID");
  const secretKey = getEnv("CASHFREE_SECRET_KEY");
  const mode = (getEnv("CASHFREE_ENV") || "TEST").toUpperCase();

  if (!appId || !secretKey) {
    const missing = [!appId ? "CASHFREE_APP_ID" : null, !secretKey ? "CASHFREE_SECRET_KEY" : null]
      .filter(Boolean)
      .join(", ");
    const cwd = process.cwd();
    throw new Error(`Missing Cashfree configuration: ${missing}. cwd=${cwd}`);
  }

  return {
    appId,
    secretKey,
    mode,
    baseUrl: mode === "PROD" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg",
  };
}

function getHeaders() {
  const { appId, secretKey } = getCashfreeConfig();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-client-id": appId,
    "x-client-secret": secretKey,
    "x-api-version": "2023-08-01",
  };
}

export function getCashfreeMode() {
  return getCashfreeConfig().mode;
}

function normalizeCustomerPhone(input: string | undefined) {
  const raw = (input || "").trim();
  if (!raw || raw.includes("@")) return "9999999999";

  // Keep only digits and ensure it fits gateway constraints.
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 20) return "9999999999";

  return digits;
}

export async function createCashfreeOrder(args: {
  orderId: string;
  amount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notes?: Record<string, string>;
}) {
  const { baseUrl } = getCashfreeConfig();
  const customerPhone = normalizeCustomerPhone(args.customerPhone);
  const response = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      order_id: args.orderId,
      order_amount: args.amount,
      order_currency: "INR",
      customer_details: {
        customer_id: args.customerId,
        customer_name: args.customerName,
        customer_email: args.customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: args.returnUrl,
      },
      order_note: args.notes ? JSON.stringify(args.notes) : undefined,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cashfree order creation failed: ${response.status} ${details}`);
  }

  return (await response.json()) as CashfreeOrderResponse;
}

export async function fetchCashfreeOrder(orderId: string) {
  const { baseUrl } = getCashfreeConfig();
  const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Cashfree order lookup failed: ${response.status} ${details}`);
  }

  return (await response.json()) as CashfreeOrderResponse;
}
