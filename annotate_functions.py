#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
from typing import List, Tuple


FUNCTION_DEF_RE = re.compile(r"^(\s*)function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*{\s*$")
ASYNC_FUNCTION_DEF_RE = re.compile(r"^(\s*)async\s+function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*{\s*$")
ARROW_DEF_RE = re.compile(r"^(\s*)(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*{\s*$")
# Arrow function with single param without parentheses: const fn = x => { ... }
ARROW_SINGLE_PARAM_RE = re.compile(r"^(\s*)(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?([A-Za-z0-9_]+)\s*=>\s*{\s*$")
# Assigned function expression: window.saveData = function (...) { ... }
ASSIGNED_FUNC_EXPR_RE = re.compile(r"^(\s*)([A-Za-z0-9_\.$\[\]\'\"]+)\s*=\s*(?:async\s*)?function\s*\(([^)]*)\)\s*{\s*$")
# Object literal property: key: function (...) { ... }
OBJ_PROP_FUNC_RE = re.compile(r"^(\s*)([A-Za-z0-9_]+)\s*:\s*(?:async\s*)?function\s*\(([^)]*)\)\s*{\s*$")
# ES6 short method in object/class (best-effort, exclude control keywords)
SHORT_METHOD_RE = re.compile(r"^(\s*)(?:async\s*)?(?!if\b|for\b|while\b|switch\b|catch\b|with\b)([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*{\s*$")
# Exported function declarations
EXPORT_FUNCTION_RE = re.compile(r"^(\s*)export\s+(?:default\s+)?function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*{\s*$")


def has_note_above(lines: List[str], index: int) -> bool:
    # Look up a few non-empty lines directly above for an existing comment or note
    i = index - 1
    empty_seen = 0
    while i >= 0 and empty_seen < 5:
        line = lines[i].rstrip("\n")
        if line.strip() == "":
            empty_seen += 1
            i -= 1
            continue
        stripped = line.lstrip()
        # If there's already a block or single-line comment, assume documented
        if stripped.startswith("/**") or stripped.startswith("/*") or stripped.startswith("//"):
            return True
        # Stop if we hit any other code
        return False
    return False


def build_note(indent: str, name: str, params: str) -> List[str]:
    params_clean = params.strip()
    params_text = params_clean if params_clean else "بدون"
    note_lines = [
        f"{indent}/**",
        f"{indent} * ملاحظة: الدالة {name} — وصف تلقائي موجز لوظيفتها.",
        f"{indent} * المدخلات: {params_text}",
        f"{indent} * المخرجات: راجع التنفيذ",
        f"{indent} */",
    ]
    return [l + "\n" for l in note_lines]


def annotate_file(path: str) -> Tuple[int, int]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except Exception as e:
        print(f"تخطي {path}: {e}")
        return 0, 0

    additions = 0
    i = 0
    out: List[str] = []

    while i < len(lines):
        line = lines[i]

        match = None
        for regex in (
            FUNCTION_DEF_RE,
            ASYNC_FUNCTION_DEF_RE,
            EXPORT_FUNCTION_RE,
            ARROW_DEF_RE,
            ARROW_SINGLE_PARAM_RE,
            ASSIGNED_FUNC_EXPR_RE,
            OBJ_PROP_FUNC_RE,
            SHORT_METHOD_RE,
        ):
            m = regex.match(line)
            if m:
                match = (regex, m)
                break

        if match:
            regex, m = match
            indent, name, params = m.groups()
            # ARROW_SINGLE_PARAM_RE has params in group 3 as single identifier
            if regex is ARROW_SINGLE_PARAM_RE:
                params = params or ""
            # SHORT_METHOD_RE might catch control statements if mis-detected; guard by ensuring next non-empty line isn't a control-only block
            if regex is SHORT_METHOD_RE and name in {"if","for","while","switch","catch","with"}:
                out.append(line)
                i += 1
                continue
            if not has_note_above(out, len(out)):
                out.extend(build_note(indent, name, params))
                additions += 1
            out.append(line)
            i += 1
            continue

        out.append(line)
        i += 1

    if additions > 0:
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(out)
    return additions, len(lines)


def main():
    target_files: List[str] = []
    # Recursively collect JS files under /workspace, skipping common ignored dirs
    ignore_dirs = {"node_modules", ".git", "build", "dist", "__pycache__"}
    for root, dirs, files in os.walk("/workspace"):
        # prune ignored directories
        dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('.')]
        for fname in files:
            if fname.endswith(".js"):
                target_files.append(os.path.join(root, fname))

    total_added = 0
    processed = 0
    for fp in sorted(set(target_files)):
        added, _ = annotate_file(fp)
        processed += 1
        total_added += added
        if added:
            print(f"[تمت الإضافة] {added} ملاحظات في: {os.path.basename(fp)}")
    print(f"الملفات المعالجة: {processed}, إجمالي الملاحظات المضافة: {total_added}")


if __name__ == "__main__":
    main()

