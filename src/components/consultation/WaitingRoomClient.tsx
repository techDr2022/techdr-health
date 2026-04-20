"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Clock, Video } from "lucide-react";

interface WaitingRoomBooking {
  id: string;
  doctorName: string;
  specialty: string;
  credentials: string;
  scheduledAt: string;
  duration: number;
  patientName: string;
}

export function WaitingRoomClient({
  booking,
  role,
}: {
  booking: WaitingRoomBooking;
  role: "doctor" | "patient";
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-10 text-center max-w-md w-full">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-400 rounded-full animate-spin mx-auto mb-6" />

        <div className="w-16 h-16 bg-blue-500/15 border-2 border-blue-400/20 rounded-2xl flex items-center justify-center font-bold text-2xl text-blue-300 mx-auto mb-4">
          {booking.doctorName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>

        <h1 className="font-semibold text-[22px] text-white mb-1">{booking.doctorName}</h1>
        <p className="text-white/40 text-[13px] mb-6">{booking.specialty}</p>

        <div className="space-y-3 mb-8">
          {[
            { icon: Clock, label: "Appointment", value: format(new Date(booking.scheduledAt), "dd MMM · hh:mm a") },
            { icon: Video, label: "Type", value: "Video Consultation Only" },
            { icon: Clock, label: "Duration", value: `${booking.duration} minutes` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between bg-white/[0.04] rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-white/40" />
                <span className="text-white/40 text-[11px]">{label}</span>
              </div>
              <span className="text-white text-[12px] font-semibold">{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push(`/consultation/${booking.id}/room`)}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[16px] rounded-2xl transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          {role === "doctor" ? "Start Consultation" : "Join Video Call"} →
        </button>

        <p className="text-white/20 text-[11px] mt-4">
          Allow camera and microphone access when prompted.
        </p>
      </div>
    </div>
  );
}
