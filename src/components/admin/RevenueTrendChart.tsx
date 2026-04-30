"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendPoint = {
  date: string;
  bookings: number;
  revenueINR: number;
};

export function RevenueTrendChart({ data }: { data: TrendPoint[] }) {
  const points = data.slice(-12).map((item) => ({
    ...item,
    label: new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip
            formatter={(value) => {
              const numericValue = Number(value ?? 0);
              return [`INR ${Math.round(numericValue).toLocaleString("en-IN")}`, "Revenue"];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="revenueINR"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ r: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
