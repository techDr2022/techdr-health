import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type CashfreePayoutAuthResponse = {
  status?: string;
  subCode?: string;
  message?: string;
  data?: {
    token?: string;
    expiry?: number;
  };
};

type CashfreePayoutActionResponse = {
  status?: string;
  subCode?: string;
  message?: string;
  data?: Record<string, unknown>;
};

type TokenCache = {
  token: string;
  expiresAtMs: number;
};

let tokenCache: TokenCache | null = null;

function readEnvFileFallback() {
  const cwd = process.cwd().replace(/^"(.*)"$/, "$1");
  const candidatePaths = [join(cwd, ".env"), join(cwd, "teleconsult-platform", ".env")];
  const envPath = candidatePaths.find((path) => existsSync(path));
  if (!envPath) return {};

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
  if (fromProcess?.trim()) return fromProcess.trim();
  const fromFile = readEnvFileFallback()[name]?.trim();
  if (fromFile) {
    process.env[name] = fromFile;
    return fromFile;
  }
  return undefined;
}

function getPayoutConfig() {
  const clientId = getEnv("CASHFREE_PAYOUT_CLIENT_ID") || getEnv("CASHFREE_APP_ID");
  const clientSecret = getEnv("CASHFREE_PAYOUT_CLIENT_SECRET") || getEnv("CASHFREE_SECRET_KEY");
  const mode = (getEnv("CASHFREE_PAYOUT_ENV") || getEnv("CASHFREE_ENV") || "TEST").toUpperCase();
  const enabled = (getEnv("CASHFREE_PAYOUT_ENABLED") || "false").toLowerCase() === "true";

  if (!clientId || !clientSecret) {
    return { enabled: false, clientId: "", clientSecret: "", mode, baseUrl: "" };
  }

  const baseUrl =
    mode === "PROD"
      ? "https://payout-api.cashfree.com/payout/v1"
      : "https://payout-gamma.cashfree.com/payout/v1";

  return { enabled, clientId, clientSecret, mode, baseUrl };
}

export function isCashfreePayoutEnabled() {
  const config = getPayoutConfig();
  return config.enabled && Boolean(config.clientId && config.clientSecret);
}

function assertPayoutEnabled() {
  if (!isCashfreePayoutEnabled()) {
    throw new Error("Cashfree Payouts is not enabled. Set CASHFREE_PAYOUT_ENABLED=true and credentials.");
  }
}

async function authorizePayoutToken(forceRefresh = false): Promise<string> {
  assertPayoutEnabled();
  const config = getPayoutConfig();

  if (!forceRefresh && tokenCache && tokenCache.expiresAtMs > Date.now() + 15_000) {
    return tokenCache.token;
  }

  const response = await fetch(`${config.baseUrl}/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Client-Id": config.clientId,
      "X-Client-Secret": config.clientSecret,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as CashfreePayoutAuthResponse;
  if (!response.ok || payload.status !== "SUCCESS" || !payload.data?.token) {
    throw new Error(
      payload.message || `Cashfree payout authorize failed (${response.status}).`
    );
  }

  const expirySeconds = payload.data.expiry ?? 300;
  tokenCache = {
    token: payload.data.token,
    expiresAtMs: Date.now() + expirySeconds * 1000,
  };

  return payload.data.token;
}

async function payoutRequest<T>(
  path: string,
  body: Record<string, unknown>,
  retryOnAuth = true
): Promise<T> {
  const config = getPayoutConfig();
  const token = await authorizePayoutToken();

  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json()) as T & CashfreePayoutActionResponse;

  if (response.status === 401 && retryOnAuth) {
    tokenCache = null;
    return payoutRequest(path, body, false);
  }

  if (!response.ok || payload.status === "ERROR") {
    throw new Error(payload.message || `Cashfree payout request failed (${response.status}).`);
  }

  return payload;
}

export type AddBeneficiaryArgs = {
  beneId: string;
  name: string;
  email: string;
  phone: string;
  bankAccount: string;
  ifsc: string;
};

export async function addCashfreeBeneficiary(args: AddBeneficiaryArgs) {
  return payoutRequest<CashfreePayoutActionResponse>("/addBeneficiary", {
    beneId: args.beneId,
    name: args.name,
    email: args.email,
    phone: args.phone.replace(/\D/g, "").slice(-10) || "9999999999",
    bankAccount: args.bankAccount,
    ifsc: args.ifsc.toUpperCase(),
    address1: "India",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  });
}

export type RequestTransferArgs = {
  beneId: string;
  amountInr: number;
  transferId: string;
  remarks?: string;
};

export async function requestCashfreeTransfer(args: RequestTransferArgs) {
  if (args.amountInr < 1) {
    throw new Error("Transfer amount must be at least INR 1.");
  }

  return payoutRequest<CashfreePayoutActionResponse>("/requestTransfer", {
    beneId: args.beneId,
    amount: args.amountInr.toFixed(2),
    transferId: args.transferId,
    transferMode: "imps",
    remarks: args.remarks?.slice(0, 70) || "TechDrHealth doctor payout",
  });
}

export async function getCashfreeTransferStatus(transferId: string) {
  assertPayoutEnabled();
  const config = getPayoutConfig();
  const token = await authorizePayoutToken();
  const response = await fetch(
    `${config.baseUrl}/getTransferStatus?transferId=${encodeURIComponent(transferId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const payload = (await response.json()) as CashfreePayoutActionResponse;
  if (!response.ok || payload.status === "ERROR") {
    throw new Error(payload.message || `Cashfree transfer status failed (${response.status}).`);
  }

  return payload;
}

export function buildDoctorBeneficiaryId(doctorId: string) {
  return `doc_${doctorId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 32)}`;
}

export function buildPayoutTransferId(reference: string) {
  return reference.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40);
}

export async function withPayoutRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Payout request failed.");
}
