"use client";

import { useState } from "react";
import { Role } from "@prisma/client";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

type RowState = {
  name: string;
  role: Role;
  isActive: boolean;
  saving: boolean;
  deleting: boolean;
};

export function ProfileManagementTable({
  users,
  currentAdminId,
}: {
  users: AdminUser[];
  currentAdminId: string;
}) {
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      users.map((user) => [
        user.id,
        { name: user.name, role: user.role, isActive: user.isActive, saving: false, deleting: false },
      ])
    )
  );
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);

  function updateRow(id: string, patch: Partial<RowState>) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  async function saveProfile(id: string) {
    const row = rows[id];
    if (!row) return;
    setMessage(null);
    updateRow(id, { saving: true });
    try {
      const response = await fetch(`/api/admin/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row.name,
          role: row.role,
          isActive: row.isActive,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || "Failed to update profile");
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update profile.");
    } finally {
      updateRow(id, { saving: false });
    }
  }

  async function deleteProfile(id: string) {
    if (id === currentAdminId) {
      setMessage("You cannot delete your own active admin profile.");
      return;
    }
    const confirmed = window.confirm("Delete this profile? If linked records exist, it will be deactivated.");
    if (!confirmed) return;

    setMessage(null);
    updateRow(id, { deleting: true });
    try {
      const response = await fetch(`/api/admin/profiles/${id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as { error?: string; softDeleted?: boolean } | null;
      if (!response.ok) throw new Error(payload?.error || "Failed to delete profile");
      if (payload?.softDeleted) {
        updateRow(id, { isActive: false, deleting: false });
        setMessage("Profile had related records, so it was deactivated instead of deleted.");
      } else {
        setHiddenIds((prev) => new Set(prev).add(id));
        setMessage("Profile deleted successfully.");
      }
    } catch (error) {
      updateRow(id, { deleting: false });
      setMessage(error instanceof Error ? error.message : "Failed to delete profile.");
    }
  }

  return (
    <div className="space-y-4">
      {message ? <p className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p> : null}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((user) => !hiddenIds.has(user.id))
              .map((user) => {
                const row = rows[user.id];
                if (!row) return null;
                return (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <input
                        value={row.name}
                        onChange={(event) => updateRow(user.id, { name: event.target.value })}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                      />
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={row.role}
                        onChange={(event) => updateRow(user.id, { role: event.target.value as Role })}
                        className="rounded-md border border-slate-300 px-2 py-1.5"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="DOCTOR">DOCTOR</option>
                        <option value="PATIENT">PATIENT</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={row.isActive}
                          onChange={(event) => updateRow(user.id, { isActive: event.target.checked })}
                        />
                        <span>{row.isActive ? "Active" : "Inactive"}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void saveProfile(user.id)}
                          disabled={row.saving || row.deleting}
                          className="rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {row.saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteProfile(user.id)}
                          disabled={row.saving || row.deleting}
                          className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {row.deleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
