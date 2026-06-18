import { readFile } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const templatePath = path.join(process.cwd(), "data", "doctor-bulk-import-template.csv");
    const content = await readFile(templatePath, "utf8");
    const format = request.nextUrl.searchParams.get("format")?.toLowerCase();

    if (format === "xlsx") {
      const workbook = XLSX.read(content, { type: "string" });
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="doctor-bulk-import-template.xlsx"',
        },
      });
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="doctor-bulk-import-template.csv"',
      },
    });
  } catch (error) {
    console.error("bulk import template error", error);
    return NextResponse.json({ error: "Template file not found." }, { status: 500 });
  }
}
