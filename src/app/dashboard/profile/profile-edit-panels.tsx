"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronDown, Lock, Trash2, UploadCloud, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PanelKey = "profile" | "password" | "reports" | "delete";
type InitialProfile = {
  displayName: string;
  specialty: string;
  languages: string[];
  photoUrl: string | null;
};

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
  {
    key: "delete",
    title: "Delete Account",
    icon: Trash2,
    description: "Permanently remove your account and associated records.",
  },
];

export function ProfileEditPanels({ initialProfile }: { initialProfile: InitialProfile }) {
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
                  {panel.key === "profile" ? <ProfileForm initialProfile={initialProfile} /> : null}
                  {panel.key === "password" ? <PasswordForm /> : null}
                  {panel.key === "reports" ? <ReportsUpload /> : null}
                  {panel.key === "delete" ? <DeleteAccountPanel /> : null}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ProfileForm({ initialProfile }: { initialProfile: InitialProfile }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [specialty, setSpecialty] = useState(initialProfile.specialty);
  const [languages, setLanguages] = useState(initialProfile.languages.join(", "));
  const [photoUrl, setPhotoUrl] = useState(initialProfile.photoUrl ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialProfile.photoUrl ?? null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function uploadPhoto() {
    if (!photoFile) {
      toast.error("Choose an image first.");
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append("photo", photoFile);

      const response = await fetch("/api/dashboard/profile/photo", {
        method: "POST",
        body: formData,
      });

      const body = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !body.url) {
        toast.error(body.error || "Unable to upload photo.");
        return;
      }

      setPhotoUrl(body.url);
      setPreviewUrl(body.url);
      setPhotoFile(null);
      toast.success("Photo uploaded. Click save to update profile.");
    } catch {
      toast.error("Unable to upload photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function saveProfile() {
    try {
      setIsSaving(true);
      const response = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          specialty,
          languages: languages
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          photoUrl: photoUrl.trim(),
        }),
      });

      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(body.error || "Unable to update profile.");
        return;
      }
      toast.success("Profile updated successfully.");
      router.refresh();
    } catch {
      toast.error("Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-200">
            <img
              src={previewUrl || "/images/placeholders/doctor-avatar.svg"}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-[220px] space-y-2">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="h-10 rounded-xl bg-white"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setPhotoFile(file);
                if (file) {
                  const tempUrl = URL.createObjectURL(file);
                  setPreviewUrl(tempUrl);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => void uploadPhoto()}
              disabled={!photoFile || isUploadingPhoto}
            >
              {isUploadingPhoto ? "Uploading..." : "Upload photo"}
            </Button>
          </div>
        </div>
      </div>
      <Input
        className="h-11 rounded-xl bg-slate-50"
        placeholder="Display name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
      />
      <Input
        className="h-11 rounded-xl bg-slate-50"
        placeholder="Specialty"
        value={specialty}
        onChange={(event) => setSpecialty(event.target.value)}
      />
      <Input
        className="h-11 rounded-xl bg-slate-50 sm:col-span-2"
        placeholder="Languages (comma separated)"
        value={languages}
        onChange={(event) => setLanguages(event.target.value)}
      />
      <Input
        className="h-11 rounded-xl bg-slate-50 sm:col-span-2"
        placeholder="Profile photo URL (https://...)"
        value={photoUrl}
        onChange={(event) => setPhotoUrl(event.target.value)}
      />
      <div className="sm:col-span-2">
        <Button
          className="rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          onClick={() => void saveProfile()}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save profile updates"}
        </Button>
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

function DeleteAccountPanel() {
  const [confirmationText, setConfirmationText] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteAccount() {
    try {
      setIsDeleting(true);
      const response = await fetch("/api/dashboard/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmationText,
          password,
        }),
      });

      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(body.error || "Unable to delete account.");
        return;
      }

      toast.success("Your account has been deleted.");
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Unable to delete account.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">
        This action is permanent. Type <strong>DELETE</strong> and enter your password to continue.
      </p>
      <Input
        className="h-11 rounded-xl bg-white"
        placeholder='Type "DELETE"'
        value={confirmationText}
        onChange={(event) => setConfirmationText(event.target.value)}
      />
      <Input
        className="h-11 rounded-xl bg-white"
        type="password"
        placeholder="Current password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button
        variant="destructive"
        className="rounded-xl"
        onClick={() => void deleteAccount()}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete my account permanently"}
      </Button>
    </div>
  );
}
