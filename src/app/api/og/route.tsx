import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title =
    searchParams.get("title") || "Online Doctor Consultation - TechDrHealth";
  const subtitle =
    searchParams.get("subtitle") ||
    "Consult verified doctors online from ₹200";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #052e16, #166534)",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
        >
          <div
            style={{
              color: "#4ade80",
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            TechDrHealth
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 20,
              maxWidth: 800,
            }}
          >
            {title}
          </div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 24, lineHeight: 1.5 }}>
            {subtitle}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 40 }}>
            <div style={{ color: "#4ade80", fontSize: 18, fontWeight: 600 }}>
              ★ 4.9/5 Rating
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>·</div>
            <div style={{ color: "#4ade80", fontSize: 18, fontWeight: 600 }}>
              100+ Verified Doctors
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>·</div>
            <div style={{ color: "#4ade80", fontSize: 18, fontWeight: 600 }}>
              From ₹200
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
