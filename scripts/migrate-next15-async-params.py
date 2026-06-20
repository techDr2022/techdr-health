#!/usr/bin/env python3
"""Migrate Next.js 15 sync params/searchParams to async Promise types."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "app"

PARAM_TYPE = re.compile(
    r"(?P<prefix>\bparams:\s*)\{(?P<body>[^}]+)\}(?!(\s*\|\s*Promise|\s*\)))"
)
SEARCH_TYPE = re.compile(
    r"(?P<prefix>\bsearchParams:\s*)\{(?P<body>[^}]+)\}(?!(\s*\|\s*Promise|\s*\)))"
)


def extract_keys(body: str) -> list[str]:
    keys = []
    for part in body.split(","):
        part = part.strip()
        if not part:
            continue
        key = part.split(":")[0].strip()
        if key:
            keys.append(key)
    return keys


def already_has_await(content: str, fn_start: int) -> bool:
    snippet = content[fn_start : fn_start + 400]
    return "await params" in snippet or "await searchParams" in snippet


def migrate_function_body(content: str, fn_match: re.Match, keys: list[str], var_name: str) -> str:
    start = fn_match.end()
    if already_has_await(content, start):
        return content

    brace = content.find("{", start)
    if brace == -1:
        return content

    insert_at = brace + 1
    indent_match = re.search(r"\n(\s+)", content[insert_at : insert_at + 80])
    indent = indent_match.group(1) if indent_match else "  "

    if len(keys) == 1:
        destructure = f"{indent}const {{ {keys[0]} }} = await {var_name};\n"
    else:
        destructure = f"{indent}const {{ {', '.join(keys)} }} = await {var_name};\n"

    content = content[:insert_at] + destructure + content[insert_at:]

    for key in keys:
        content = re.sub(rf"\b{var_name}\.{re.escape(key)}\b", key, content)

    return content


def migrate_file(path: Path) -> bool:
    original = path.read_text()
    content = original

    if "params: Promise<" in content and "searchParams: Promise<" in content:
        return False
    if "params:" not in content and "searchParams:" not in content:
        return False

    param_keys: list[str] = []
    search_keys: list[str] = []

    def repl_param(m: re.Match) -> str:
        nonlocal param_keys
        param_keys = extract_keys(m.group("body"))
        return f"{m.group('prefix')}Promise<{{ {m.group('body').strip()} }}>"

    def repl_search(m: re.Match) -> str:
        nonlocal search_keys
        search_keys = extract_keys(m.group("body"))
        return f"{m.group('prefix')}Promise<{{ {m.group('body').strip()} }}>"

    content = PARAM_TYPE.sub(repl_param, content)
    content = SEARCH_TYPE.sub(repl_search, content)

    if content == original:
        return False

    fn_pattern = re.compile(
        r"(export\s+(?:async\s+)?function\s+\w+\s*\([^)]*\{[^}]*\bparams\b[^)]*\)\s*\{)",
        re.MULTILINE,
    )
    for m in list(fn_pattern.finditer(content))[::-1]:
        if param_keys:
            content = migrate_function_body(content, m, param_keys, "params")

    default_pattern = re.compile(
        r"(export\s+default\s+async\s+function\s+\w+\s*\([^)]*\)\s*\{)",
        re.MULTILINE,
    )
    for m in list(default_pattern.finditer(content))[::-1]:
        if param_keys:
            content = migrate_function_body(content, m, param_keys, "params")
        if search_keys:
            content = migrate_function_body(content, m, search_keys, "searchParams")

    # Route handlers: export async function GET/POST/PATCH/DELETE
    route_pattern = re.compile(
        r"(export\s+async\s+function\s+(?:GET|POST|PUT|PATCH|DELETE)\s*\([^)]*\)\s*\{)",
        re.MULTILINE | re.IGNORECASE,
    )
    for m in list(route_pattern.finditer(content))[::-1]:
        if param_keys:
            content = migrate_function_body(content, m, param_keys, "params")

    # Non-async default exports need async + await
    sync_default = re.compile(
        r"export\s+default\s+function\s+(\w+)\s*\(\{[^}]*params[^}]*\}[^)]*\)\s*\{"
    )
    if sync_default.search(content) and param_keys:
        content = sync_default.sub(r"export default async function \1({", content, count=1)

    if content != original:
        path.write_text(content)
        print(f"migrated {path}")
        return True
    return False


def main() -> int:
    changed = 0
    patterns = ["**/page.tsx", "**/layout.tsx", "**/route.ts"]
    files: set[Path] = set()
    for pattern in patterns:
        files.update(ROOT.rglob(pattern.replace("**/", "")))

    for path in sorted(files):
        if migrate_file(path):
            changed += 1

    print(f"Updated {changed} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
