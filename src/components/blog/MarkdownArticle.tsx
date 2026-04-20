function parseMarkdownSections(md: string) {
  const lines = md.trim().split("\n");
  let heading = "Overview";
  let buffer: string[] = [];
  const sections: { heading: string; body: string }[] = [];

  const flush = () => {
    const body = buffer.join("\n").trim();
    if (body) sections.push({ heading, body });
    buffer = [];
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flush();
      heading = line.slice(3).trim();
    } else {
      buffer.push(line);
    }
  }
  flush();

  return sections;
}

export function MarkdownArticle({ markdown }: { markdown: string }) {
  const sections = parseMarkdownSections(markdown);
  return (
    <div className="max-w-none">
      {sections.map((sec) => (
        <section key={sec.heading + sec.body.slice(0, 40)} className="mb-10">
          <h2 id={slugify(sec.heading)} className="scroll-mt-24 text-2xl font-heading font-semibold text-[#0A1628]">
            {sec.heading}
          </h2>
          {sec.body.split("\n\n").map((p, i) => (
            <p key={i} className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

export function TableOfContents({ markdown }: { markdown: string }) {
  const headings = markdown
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => l.slice(3).trim());
  if (headings.length === 0) return null;
  return (
    <nav
      aria-label="Table of contents"
      className="rounded-xl border border-border bg-[#F8FAFC] p-5 text-sm"
    >
      <p className="font-semibold text-[#0A1628]">On this page</p>
      <ol className="mt-3 space-y-2">
        {headings.map((h) => (
          <li key={h}>
            <a href={`#${slugify(h)}`} className="text-[#0EA5E9] hover:underline">
              {h}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function slugify(h: string) {
  return h
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
