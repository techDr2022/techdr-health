#!/usr/bin/env python3
"""Repair broken async params migration inserts."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "app"


def fix_embedded_await(content: str) -> str:
    return re.sub(
        r"(\{)\s*const \{ ([^}]+) \} = await params;\s*",
        r"\1\n    ",
        content,
    )


def ensure_top_level_await(content: str) -> str:
    if "params: Promise<" not in content:
        return content
    if content.count("await params") >= content.count("params: Promise<"):
        return content

    match = re.search(r"params:\s*Promise<\{\s*([^}]+)\s*\}>", content)
    if not match:
        return content
    keys = [k.split(":")[0].strip() for k in match.group(1).split(",") if k.strip()]
    if not keys:
        return content

    destructure = (
        f"const {{ {', '.join(keys)} }} = await params;"
        if len(keys) > 1
        else f"const {{ {keys[0]} }} = await params;"
    )

    if destructure in content:
        return content

    patterns = [
        r"(export\s+default\s+async\s+function\s+\w+\s*\([^)]*\)\s*\{)",
        r"(export\s+async\s+function\s+(?:GET|POST|PUT|PATCH|DELETE)\s*\([^)]*\)\s*\{)",
        r"(export\s+async\s+function\s+generateMetadata\s*\([^)]*\)\s*\{)",
    ]

    for pattern in patterns:
        def repl(m: re.Match) -> str:
            block = m.group(1)
            tail = content[m.end() : m.end() + 120]
            if destructure in tail:
                return block
            return f"{block}\n  {destructure}\n"

        new_content, count = re.subn(pattern, repl, content, count=1)
        if count:
            return new_content

    return content


def fix_care_page(content: str) -> str:
    if "CareKeywordPage" not in content:
        return content
    return re.sub(
        r"export default async function CareKeywordPage\(\{\s*const page = getSeoKeywordPage\(params\.slug\);",
        "export default async function CareKeywordPage({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  const page = getSeoKeywordPage(slug);",
        content,
    )


def main() -> None:
    for path in sorted(ROOT.rglob("*")):
        if path.suffix not in {".ts", ".tsx"}:
            continue
        original = path.read_text()
        content = fix_embedded_await(original)
        content = ensure_top_level_await(content)
        content = fix_care_page(content)
        if content != original:
            path.write_text(content)
            print(f"fixed {path}")


if __name__ == "__main__":
    main()
