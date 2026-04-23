"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PusherClient from "pusher-js";
import { Circle, Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { HMSRoomProvider } from "@100mslive/react-sdk";
import { useVideoRoom } from "@/hooks/useVideoRoom";
import { useConsultTimer } from "@/hooks/useConsultTimer";
import { cn } from "@/lib/utils";
import { ChatPanel } from "@/components/consultation/ChatPanel";
import { PrescriptionPanel } from "@/components/consultation/PrescriptionPanel";

type PrescriptionSnapshot = {
  diagnosis?: string;
  medicines?: Array<{
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }>;
  instructions?: string | null;
  followUpDate?: string | null;
  sentAt?: string | null;
};

interface VideoRoomClientProps {
  bookingId: string;
  role: "doctor" | "patient";
  doctorName: string;
  patientName: string;
  specialty: string;
  duration: number;
  existingPrescription?: PrescriptionSnapshot | null;
}

function VideoRoomClientInner({
  bookingId,
  role,
  doctorName,
  patientName,
  specialty,
  duration,
  existingPrescription,
}: VideoRoomClientProps) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [activePanel, setActivePanel] = useState<"prescription" | "chat">("prescription");
  const [prescription, setPrescription] = useState<PrescriptionSnapshot | null>(existingPrescription || null);
  const [isEnding, setIsEnding] = useState(false);
  const participantName = role === "doctor" ? doctorName : patientName;

  const timer = useConsultTimer(duration, () => {
    window.alert("Consultation time is up. Please wrap up.");
  });

  const {
    localVideoRef,
    remoteVideoRef,
    remoteParticipant,
    isConnected,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
    disconnect,
  } = useVideoRoom({ token, userName: participantName });

  useEffect(() => {
    async function getToken() {
      const response = await fetch("/api/video/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { token: string };
      setToken(data.token);
    }

    void getToken();
  }, [bookingId]);

  useEffect(() => {
    if (isConnected) timer.start();
  }, [isConnected, timer]);

  useEffect(() => {
    if (role !== "patient") return;
    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe(`booking-${bookingId}`);
    channel.bind("prescription-update", (data: PrescriptionSnapshot) => {
      setPrescription(data);
      setActivePanel("prescription");
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`booking-${bookingId}`);
    };
  }, [bookingId, role]);

  async function handleEndCall() {
    setIsEnding(true);
    disconnect();
    await fetch("/api/video/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });

    const redirectPath = role === "doctor" ? "/dashboard/bookings" : "/dashboard/patient";
    router.push(redirectPath);
  }

  const otherParticipant = useMemo(() => (role === "doctor" ? patientName : doctorName), [doctorName, patientName, role]);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Connecting to video room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 backdrop-blur-xl border-b border-white/[0.06] flex-none">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[15px] text-white">
            TechDr<span className="text-blue-400">Health</span>
          </span>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-white/50 text-[12px]">
            {role === "doctor" ? (
              <>
                Consulting <strong className="text-white">{patientName}</strong>
              </>
            ) : (
              <>
                Consulting <strong className="text-white">{doctorName}</strong> · {specialty}
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {role === "doctor" ? (
            <div className="flex items-center gap-1.5 bg-red-500/15 border border-red-400/25 rounded-lg px-2.5 py-1.5">
              <Circle className="w-2 h-2 fill-red-400 stroke-none animate-pulse" />
              <span className="text-red-400 text-[11px] font-semibold">REC</span>
            </div>
          ) : null}

          <div
            className={cn(
              "flex items-center gap-2.5 border rounded-xl px-3.5 py-2 transition-all",
              timer.isCritical
                ? "bg-red-500/15 border-red-400/30"
                : timer.isWarning
                  ? "bg-amber-500/15 border-amber-400/30"
                  : "bg-white/[0.06] border-white/10"
            )}
          >
            <Circle
              className={cn(
                "w-2 h-2 animate-pulse fill-current stroke-none",
                timer.isCritical ? "text-red-400" : timer.isWarning ? "text-amber-400" : "text-red-400"
              )}
            />
            <div>
              <div
                className={cn(
                  "font-semibold text-[18px] leading-none tracking-wider",
                  timer.isCritical ? "text-red-400" : timer.isWarning ? "text-amber-400" : "text-white"
                )}
              >
                {timer.elapsedFormatted}
              </div>
              <div className="text-white/30 text-[9px]">of {timer.totalFormatted}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-[#0d0d18] overflow-hidden">
          <video ref={remoteVideoRef} autoPlay playsInline muted={false} className="absolute inset-0 h-full w-full object-cover bg-[#0d0d18]" />
          {!remoteParticipant ? (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500/15 border-2 border-blue-400/20 rounded-2xl flex items-center justify-center font-bold text-[26px] text-blue-300 mx-auto mb-3">
                  {otherParticipant
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <p className="text-white/30 text-[13px]">Waiting for other participant...</p>
              </div>
            </div>
          ) : null}

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute top-4 right-4 h-24 w-36 rounded-xl overflow-hidden border-2 border-white/10 bg-[#1c1c2e] object-cover"
          />

          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white text-[12px] font-semibold">{role === "doctor" ? doctorName : patientName}</span>
          </div>
        </div>

        <div className="w-[320px] bg-[#0f0f1a] border-l border-white/[0.06] flex flex-col flex-none">
          <div className="flex border-b border-white/[0.06] flex-none">
            {[
              { id: "prescription", label: "Prescription" },
              { id: "chat", label: "Chat" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id as "prescription" | "chat")}
                className={cn(
                  "flex-1 py-3 text-[11px] font-semibold transition-all border-b-2",
                  activePanel === id
                    ? "text-blue-400 border-blue-400 bg-blue-500/[0.05]"
                    : "text-white/30 border-transparent hover:text-white/60"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {activePanel === "prescription" ? (
            <PrescriptionPanel bookingId={bookingId} role={role} initialData={prescription} onSent={setPrescription} />
          ) : (
            <ChatPanel bookingId={bookingId} role={role} />
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 px-6 py-3 bg-black/80 backdrop-blur-xl border-t border-white/[0.06] flex-none">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={toggleCamera}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              isCameraOn ? "bg-white/10 hover:bg-white/15 text-white" : "bg-red-500/20 border border-red-400/30 text-red-400"
            )}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <span className="text-white/25 text-[9px]">Camera</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={toggleMic}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              isMicOn ? "bg-white/10 hover:bg-white/15 text-white" : "bg-red-500/20 border border-red-400/30 text-red-400"
            )}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <span className="text-white/25 text-[9px]">Mic</span>
        </div>

        <button
          onClick={() => void handleEndCall()}
          disabled={isEnding}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-[13px] rounded-2xl transition-all shadow-lg shadow-red-600/30 disabled:opacity-60 ml-4"
        >
          <PhoneOff className="w-4 h-4" />
          {isEnding ? "Ending..." : role === "doctor" ? "End Consultation" : "Leave Call"}
        </button>
      </div>
    </div>
  );
}

export function VideoRoomClient(props: VideoRoomClientProps) {
  return (
    <HMSRoomProvider>
      <VideoRoomClientInner {...props} />
    </HMSRoomProvider>
  );
}
