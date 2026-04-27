import { type ReactNode } from "react";

export function Callout({ type = "info", children }: { type?: "info" | "tip" | "warning"; children: ReactNode }) {
  const style =
    type === "warning"
      ? "border-yellow-500 bg-yellow-50"
      : type === "tip"
        ? "border-green-500 bg-green-50"
        : "border-blue-500 bg-blue-50";
  return <aside className={`my-6 rounded-lg border-l-4 p-4 ${style}`}>{children}</aside>;
}

export function CostTable({ rows }: { rows: Array<{ hospital: string; price: string; notes: string }> }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-[#faf7f2]">
          <tr>
            <th className="p-2 text-left">Hospital</th>
            <th className="p-2 text-left">Estimated Cost</th>
            <th className="p-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.hospital} className="border-t">
              <td className="p-2">{row.hospital}</td>
              <td className="p-2">{row.price}</td>
              <td className="p-2">{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DoctorCard({ name, specialty, experience }: { name: string; specialty: string; experience: string }) {
  return (
    <aside className="my-6 rounded-xl border border-gray-200 bg-white p-4">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-[#556577]">{specialty} • {experience}</p>
    </aside>
  );
}
