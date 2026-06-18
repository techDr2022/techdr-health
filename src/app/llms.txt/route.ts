import { generateLlmsTxt } from "@/lib/llms-content";

export async function GET() {
  const content = generateLlmsTxt();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
