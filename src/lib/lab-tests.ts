import { getLabTestPanel } from "@/data/lab-test-panels";

export function buildLabTestAffiliateUrl(params: {
  panelId: string;
  orderId: string;
  city?: string;
}) {
  const base =
    process.env.LAB_TEST_PARTNER_BASE_URL?.trim() || "https://www.healthians.com";
  const affiliateId = process.env.LAB_TEST_AFFILIATE_ID?.trim();

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    url = new URL("https://www.healthians.com");
  }

  url.searchParams.set("utm_source", "techdrhealth");
  url.searchParams.set("utm_medium", "lab_booking");
  if (affiliateId) {
    url.searchParams.set("utm_campaign", affiliateId);
  }
  url.searchParams.set("ref", params.orderId);
  url.searchParams.set("panel", params.panelId);
  if (params.city) {
    url.searchParams.set("city", params.city);
  }

  return url.toString();
}

export function resolveLabTestPanel(panelId: string) {
  const panel = getLabTestPanel(panelId);
  if (!panel) {
    return null;
  }
  return {
    panelId: panel.id,
    panelName: panel.name,
    testNames: panel.tests,
  };
}
