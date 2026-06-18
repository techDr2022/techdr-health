import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { bulkImportDoctors, parseBulkImportFileDetailed } from "@/lib/doctor-bulk-import";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 200;
const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".xlsm"];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File;
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin();
  if (authResult.error) return authResult.error;

  try {
    const formData = await req.formData();
    const entry = formData.get("file");

    if (!isUploadFile(entry)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const filename = entry.name ? entry.name.toLowerCase() : "upload.csv";
    if (!ALLOWED_EXTENSIONS.some((ext) => filename.endsWith(ext))) {
      return NextResponse.json(
        {
          error: "Upload a CSV or Excel file (.csv, .xlsx, .xls).",
          filename,
        },
        { status: 400 }
      );
    }

    if (entry.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File must be under 5MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await entry.arrayBuffer());
    const parsed = parseBulkImportFileDetailed(buffer, filename);
    const { rows, headers, sheetName } = parsed;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "No doctor rows found. Fill entityName and email in each row, then upload again. Keep the header row unchanged.",
          filename,
          sheetName,
          detectedHeaders: headers,
          hint:
            headers.length === 0
              ? "The sheet looks empty. Download the template and add doctor rows below the header."
              : `Found columns: ${headers.slice(0, 8).join(", ")}${headers.length > 8 ? "..." : ""}`,
        },
        { status: 400 }
      );
    }

    if (rows.length > MAX_ROWS) {
      return NextResponse.json({ error: `Maximum ${MAX_ROWS} doctors per upload.` }, { status: 400 });
    }

    const results = await bulkImportDoctors(rows);
    const created = results.filter((result) => result.status === "created").length;
    const failed = results.filter((result) => result.status === "failed").length;

    return NextResponse.json({
      total: rows.length,
      created,
      failed,
      results,
    });
  } catch (error) {
    console.error("bulk doctor import error", error);
    return NextResponse.json({ error: "Unable to process upload." }, { status: 500 });
  }
}
