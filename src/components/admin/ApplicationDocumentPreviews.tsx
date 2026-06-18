import type { LoadedDocumentPreview } from "@/lib/storage-documents";

export function ApplicationDocumentPreviews({
  documents,
}: {
  documents: LoadedDocumentPreview[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {documents.map((document) => (
        <DocumentPreviewCard key={document.label} document={document} />
      ))}
    </div>
  );
}

function DocumentPreviewCard({ document }: { document: LoadedDocumentPreview }) {
  if (document.status === "missing") {
    return (
      <article className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">{document.label}</p>
        <p className="mt-2 text-sm text-muted-foreground">Not uploaded</p>
      </article>
    );
  }

  if (document.status === "legacy") {
    return (
      <article className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-slate-900">{document.label}</p>
        <p className="mt-2 text-sm text-amber-900">
          File was not stored in cloud storage. Saved name:{" "}
          <span className="font-medium">{document.fileName}</span>
        </p>
        <p className="mt-1 text-xs text-amber-800">
          Ask the doctor to upload again from the join flow.
        </p>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-medium text-slate-900">{document.label}</p>
        {document.fileName ? (
          <p className="mt-1 text-xs text-muted-foreground">{document.fileName}</p>
        ) : null}
      </div>

      <div className="bg-slate-50 p-3">
        {document.previewKind === "image" && document.previewSrc ? (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={document.previewSrc}
              alt={document.label}
              className="max-h-80 w-full object-contain"
            />
          </div>
        ) : null}

        {document.previewKind === "pdf" && document.previewSrc ? (
          <iframe
            src={document.previewSrc}
            title={document.label}
            className="h-80 w-full rounded-lg border border-slate-200 bg-white"
          />
        ) : null}

        {document.previewKind === "unknown" ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-muted-foreground">
            Preview not supported for this file type.
          </div>
        ) : null}
      </div>
    </article>
  );
}
