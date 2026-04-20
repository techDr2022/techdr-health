"use client";

import { useState } from "react";
import { ChevronDown, Lock, UploadCloud, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PanelKey = "profile" | "password" | "reports";

const panels: { key: PanelKey; title: string; icon: typeof UserRound; description: string }[] = [
  {
    key: "profile",
    title: "Edit Public Profile",
    icon: UserRound,
    description: "Update consultation bio, language preferences, and profile details.",
  },
  {
    key: "password",
    title: "Change Password",
    icon: Lock,
    description: "Protect your account with a stronger password and periodic updates.",
  },
  {
    key: "reports",
    title: "Upload Reports",
    icon: UploadCloud,
    description: "Attach supporting documents and health records for upcoming visits.",
  },
];

export function ProfileEditPanels() {
  const [active, setActive] = useState<PanelKey | null>("profile");

  return (
    <section className="space-y-3">
      {panels.map((panel) => {
        const Icon = panel.icon;
        const isOpen = active === panel.key;

        return (
          <article
            key={panel.key}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300"
          >
            <button
              type="button"
              onClick={() => setActive(isOpen ? null : panel.key)}
              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-xl bg-cyan-50 p-2 text-cyan-700">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{panel.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{panel.description}</p>
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <div className="border-t border-slate-100 p-4">
                  {panel.key === "profile" ? <ProfileForm /> : null}
                  {panel.key === "password" ? <PasswordForm /> : null}
                  {panel.key === "reports" ? <ReportsUpload /> : null}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ProfileForm() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input className="h-11 rounded-xl bg-slate-50" placeholder="Display name" />
      <Input className="h-11 rounded-xl bg-slate-50" placeholder="Specialty" />
      <Input className="h-11 rounded-xl bg-slate-50 sm:col-span-2" placeholder="Languages (comma separated)" />
      <div className="sm:col-span-2">
        <Button className="rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400">Save profile updates</Button>
      </div>
    </div>
  );
}

function PasswordForm() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input className="h-11 rounded-xl bg-slate-50 sm:col-span-2" type="password" placeholder="Current password" />
      <Input className="h-11 rounded-xl bg-slate-50" type="password" placeholder="New password" />
      <Input className="h-11 rounded-xl bg-slate-50" type="password" placeholder="Confirm new password" />
      <div className="sm:col-span-2">
        <Button className="rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400">Update password</Button>
      </div>
    </div>
  );
}

function ReportsUpload() {
  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-sm text-slate-600 transition-colors hover:border-cyan-400 hover:bg-cyan-50">
        Click to upload report (PDF/JPG)
      </label>
      <Button className="rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400">Upload selected file</Button>
    </div>
  );
}
