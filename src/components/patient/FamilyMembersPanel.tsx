"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FAMILY_GENDERS,
  FAMILY_RELATIONS,
  formatFamilyRelation,
  type FamilyMemberRecord,
} from "@/lib/family-members";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  relation: (typeof FAMILY_RELATIONS)[number];
  dob: string;
  gender: (typeof FAMILY_GENDERS)[number];
};

const emptyForm: FormState = {
  name: "",
  relation: "child",
  dob: "",
  gender: "other",
};

export function FamilyMembersPanel() {
  const [members, setMembers] = useState<FamilyMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/family/list");
      if (!response.ok) throw new Error("Unable to load family members");
      const data = (await response.json()) as { members: FamilyMemberRecord[] };
      setMembers(data.members);
    } catch {
      toast.error("Could not load family profiles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(member: FamilyMemberRecord) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      relation: member.relation as FormState["relation"],
      dob: member.dob,
      gender: member.gender as FormState["gender"],
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.dob) {
      toast.error("Name and date of birth are required");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/family/${editingId}` : "/api/family/add";
      const method = editingId ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Save failed");
      toast.success(editingId ? "Profile updated" : "Family member added");
      setDialogOpen(false);
      await loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/family/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Delete failed");
      toast.success("Family member removed");
      await loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Family profiles</h2>
              <p className="text-xs text-slate-500">Book consultations for dependents from one account.</p>
            </div>
          </div>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add member
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : members.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-slate-600">No family members added yet.</p>
            <p className="mt-1 text-xs text-slate-500">
              Add a spouse, child, or parent to book on their behalf.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {members.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFamilyRelation(member.relation)} ·{" "}
                    {new Date(member.dob).toLocaleDateString("en-IN")} · {member.gender}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(member)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deletingId === member.id}
                    onClick={() => void handleDelete(member.id)}
                  >
                    {deletingId === member.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DialogPrimitive.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40" />
          <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <DialogPrimitive.Title className="text-lg font-semibold text-slate-900">
              {editingId ? "Edit family member" : "Add family member"}
            </DialogPrimitive.Title>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="family-name">Full name</Label>
                <Input
                  id="family-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="family-relation">Relation</Label>
                  <select
                    id="family-relation"
                    value={form.relation}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        relation: e.target.value as FormState["relation"],
                      }))
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    {FAMILY_RELATIONS.map((relation) => (
                      <option key={relation} value={relation}>
                        {formatFamilyRelation(relation)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="family-gender">Gender</Label>
                  <select
                    id="family-gender"
                    value={form.gender}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        gender: e.target.value as FormState["gender"],
                      }))
                    }
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    {FAMILY_GENDERS.map((gender) => (
                      <option key={gender} value={gender}>
                        {formatFamilyRelation(gender)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="family-dob">Date of birth</Label>
                <Input
                  id="family-dob"
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm((prev) => ({ ...prev, dob: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={saving} onClick={() => void handleSave()}>
                {saving ? "Saving…" : editingId ? "Update" : "Add"}
              </Button>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

export function FamilyMemberPicker({
  members,
  selectedId,
  onSelect,
  className,
}: {
  members: FamilyMemberRecord[];
  selectedId: "self" | string;
  onSelect: (id: "self" | string) => void;
  className?: string;
}) {
  if (members.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Who is this consultation for?</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("self")}
          className={cn(
            "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
            selectedId === "self"
              ? "border-emerald-500 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-white hover:border-slate-300"
          )}
        >
          <span className="font-semibold">Myself</span>
          <span className="mt-0.5 block text-xs text-slate-500">Account holder</span>
        </button>
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => onSelect(member.id)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
              selectedId === member.id
                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <span className="font-semibold">{member.name}</span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {formatFamilyRelation(member.relation)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
