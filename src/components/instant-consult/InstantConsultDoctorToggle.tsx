"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { Loader2, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function InstantConsultDoctorToggle() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [acceptInstantConsult, setAcceptInstantConsult] = useState(false);
  const [instantOnline, setInstantOnline] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/doctor/instant-consult");
        if (!response.ok) throw new Error("Unable to load instant consult settings.");
        const data = (await response.json()) as {
          doctorId: string;
          acceptInstantConsult: boolean;
          instantOnline: boolean;
        };
        setDoctorId(data.doctorId);
        setAcceptInstantConsult(data.acceptInstantConsult);
        setInstantOnline(data.instantOnline);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey || !pusherCluster || !acceptInstantConsult || !doctorId) return;

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster });
    const channelName = `doctor-${doctorId}`;
    const channel = pusher.subscribe(channelName);
    channel.bind("instant-consult-queue", (payload: { patientName?: string }) => {
      setAlert(
        payload.patientName
          ? `${payload.patientName} joined the instant consult queue.`
          : "A patient joined the instant consult queue."
      );
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [acceptInstantConsult, doctorId]);

  async function save(patch: { acceptInstantConsult?: boolean; instantOnline?: boolean }) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/doctor/instant-consult", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await response.json()) as {
        error?: string;
        acceptInstantConsult: boolean;
        instantOnline: boolean;
      };
      if (!response.ok) throw new Error(data.error || "Unable to save settings.");
      setAcceptInstantConsult(data.acceptInstantConsult);
      setInstantOnline(data.instantOnline);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading instant consult settings…
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 text-amber-700">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Instant consult pool</p>
          <p className="text-sm text-slate-600">
            Accept walk-in video consults when you are online. Patients are matched by specialty.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-white bg-white px-4 py-3">
        <div>
          <Label htmlFor="accept-instant">Accept instant consults</Label>
          <p className="text-xs text-muted-foreground">Opt in to the instant consult doctor pool.</p>
        </div>
        <Checkbox
          id="accept-instant"
          checked={acceptInstantConsult}
          disabled={saving}
          onCheckedChange={(checked) => {
            const value = checked === true;
            setAcceptInstantConsult(value);
            if (!value) setInstantOnline(false);
            void save({ acceptInstantConsult: value, instantOnline: value ? instantOnline : false });
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-white bg-white px-4 py-3">
        <div>
          <Label htmlFor="instant-online">Go online now</Label>
          <p className="text-xs text-muted-foreground">Available for immediate patient matching.</p>
        </div>
        <Checkbox
          id="instant-online"
          checked={instantOnline}
          disabled={saving || !acceptInstantConsult}
          onCheckedChange={(checked) => {
            const value = checked === true;
            setInstantOnline(value);
            void save({ instantOnline: value });
          }}
        />
      </div>

      {alert ? <p className="text-sm font-medium text-emerald-700">{alert}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
