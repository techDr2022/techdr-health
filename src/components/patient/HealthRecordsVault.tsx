"use client";

import { useCallback, useEffect, useState, type DragEvent } from "react";
import {
  AlertCircle,
  Download,
  FileText,
  Loader2,
  Share2,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiCrossBorderNotice } from "@/components/consent/AiCrossBorderNotice";
import { cn } from "@/lib/utils";

type HealthRecord = {
  id: string;
  name: string;
  type: string;
  filesize: number;
  mimetype: string;
  sharedwith: string[];
  uploadedat: string;
};

type ShareDoctor = {
  userId: string;
  displayName: string;
  specialty: string;
};

type AnalysisResult = {
  summary: string;
  parameters: Array<{
    name: string;
    value: string;
    unit: string;
    normalRange: string;
    status: "normal" | "low" | "high" | "critical";
  }>;
  flaggedCount: number;
  recommendedSpecialty: string;
  recommendedAction: string;
  disclaimer: string;
};

const TYPE_LABELS: Record<string, string> = {
  LAB_REPORT: "Lab report",
  PRESCRIPTION: "Prescription",
  SCAN: "Scan",
  OTHER: "Other",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function HealthRecordsVault() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [usedBytes, setUsedBytes] = useState(0);
  const [quotaBytes, setQuotaBytes] = useState(50 * 1024 * 1024);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shareRecord, setShareRecord] = useState<HealthRecord | null>(null);
  const [shareDoctors, setShareDoctors] = useState<ShareDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [sharing, setSharing] = useState(false);

  const [analyseRecord, setAnalyseRecord] = useState<HealthRecord | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [aiAcknowledged, setAiAcknowledged] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/health-records");
      const data = (await response.json()) as {
        records?: HealthRecord[];
        storage?: { usedBytes: number; quotaBytes: number };
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Unable to load records.");
        return;
      }
      setRecords(data.records ?? []);
      setUsedBytes(data.storage?.usedBytes ?? 0);
      setQuotaBytes(data.storage?.quotaBytes ?? 50 * 1024 * 1024);
    } catch {
      setError("Unable to load records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  async function uploadFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError("Each file must be under 10MB.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name.replace(/\.[^.]+$/, ""));

      const response = await fetch("/api/health-records/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      await loadRecords();
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void uploadFile(file);
  }

  async function deleteRecord(id: string) {
    if (!confirm("Delete this health record permanently?")) return;
    setError(null);
    try {
      const response = await fetch(`/api/health-records/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Unable to delete record.");
        return;
      }
      await loadRecords();
    } catch {
      setError("Unable to delete record.");
    }
  }

  async function openShareDialog(record: HealthRecord) {
    setShareRecord(record);
    setSelectedDoctor("");
    setError(null);
    try {
      const response = await fetch("/api/health-records/share-targets");
      const data = (await response.json()) as { doctors?: ShareDoctor[]; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Unable to load doctors.");
        return;
      }
      setShareDoctors(data.doctors ?? []);
    } catch {
      setError("Unable to load doctors.");
    }
  }

  async function shareWithDoctor() {
    if (!shareRecord || !selectedDoctor) return;
    setSharing(true);
    setError(null);
    try {
      const response = await fetch(`/api/health-records/${shareRecord.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorUserId: selectedDoctor }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Unable to share record.");
        return;
      }
      setShareRecord(null);
      await loadRecords();
    } catch {
      setError("Unable to share record.");
    } finally {
      setSharing(false);
    }
  }

  async function runAnalysis(record: HealthRecord) {
    if (!aiAcknowledged) {
      setError("Please acknowledge the AI data processing notice before analysing.");
      return;
    }
    setAnalyseRecord(record);
    setAnalysis(null);
    setAnalysing(true);
    setError(null);
    try {
      const response = await fetch(`/api/health-records/${record.id}/analyse`, {
        method: "POST",
      });
      const data = (await response.json()) as AnalysisResult & { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Analysis failed.");
        return;
      }
      setAnalysis(data);
    } catch {
      setError("Analysis failed.");
    } finally {
      setAnalysing(false);
    }
  }

  const usagePercent = Math.min(100, Math.round((usedBytes / quotaBytes) * 100));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatBytes(usedBytes)} used</span>
            <span>{formatBytes(quotaBytes)} total</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                usagePercent >= 90 ? "bg-red-500" : usagePercent >= 70 ? "bg-amber-500" : "bg-blue-600"
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed p-8 text-center transition",
          dragging ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
        )}
      >
        <Upload className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-800">Drag and drop a file here</p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG, WEBP · Max 10MB per file</p>
        <label className="mt-4 inline-block">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadFile(file);
              event.target.value = "";
            }}
          />
          <Button type="button" variant="outline" disabled={uploading} asChild>
            <span>{uploading ? "Uploading…" : "Browse files"}</span>
          </Button>
        </label>
        {uploading && <Loader2 className="mx-auto mt-3 h-5 w-5 animate-spin text-blue-600" />}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
            <FileText className="h-10 w-10 text-slate-300" />
            <p>No health records yet. Upload lab reports, prescriptions, or scans to keep them in one place.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{record.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.uploadedat).toLocaleDateString("en-IN")} · {formatBytes(record.filesize)}
                    </p>
                  </div>
                  <Badge variant="secondary">{TYPE_LABELS[record.type] ?? record.type}</Badge>
                </div>

                {record.sharedwith.length > 0 && (
                  <p className="text-xs text-emerald-700">Shared with {record.sharedwith.length} doctor(s)</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={`/api/health-records/${record.id}/download`} target="_blank" rel="noreferrer">
                      <Download className="mr-1 h-3.5 w-3.5" />
                      View
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void openShareDialog(record)}>
                    <Share2 className="mr-1 h-3.5 w-3.5" />
                    Share
                  </Button>
                  {record.type === "LAB_REPORT" && record.mimetype === "application/pdf" && (
                    <Button size="sm" variant="outline" onClick={() => void runAnalysis(record)}>
                      <Sparkles className="mr-1 h-3.5 w-3.5" />
                      Analyse
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => void deleteRecord(record.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={Boolean(shareRecord)} onOpenChange={(open: boolean) => !open && setShareRecord(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Share with doctor</SheetTitle>
          </SheetHeader>
          {shareDoctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Book a consultation first to share records with your doctor.
            </p>
          ) : (
            <div className="space-y-4 px-4">
              <Select
                value={selectedDoctor}
                onValueChange={(value) => setSelectedDoctor(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {shareDoctors.map((doctor) => (
                    <SelectItem key={doctor.userId} value={doctor.userId}>
                      {doctor.displayName} · {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button disabled={!selectedDoctor || sharing} onClick={() => void shareWithDoctor()}>
                {sharing ? "Sharing…" : "Share record"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(analyseRecord)}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setAnalyseRecord(null);
            setAnalysis(null);
          }
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>AI lab report analysis</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            {!analysis && !analysing && (
              <AiCrossBorderNotice onAcknowledgedChange={setAiAcknowledged} />
            )}
            {analysing && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Analysing report…
              </div>
            )}
            {analysis && (
              <div className="space-y-4 text-sm">
                <p className="text-slate-800">{analysis.summary}</p>
                {analysis.parameters.length > 0 && (
                  <div className="space-y-2">
                    {analysis.parameters.slice(0, 8).map((param) => (
                      <div key={param.name} className="rounded-lg border border-slate-200 px-3 py-2">
                        <p className="font-medium">{param.name}</p>
                        <p className="text-muted-foreground">
                          {param.value} {param.unit} · Ref: {param.normalRange}
                        </p>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {param.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{analysis.disclaimer}</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
