#!/usr/bin/env python3
"""gen-doveadm-response.py

Extracts doveadm response field metadata from C source files and produces
an audit report or patches data/doveadm.js with structured response stubs.
"""

import os
import re
from collections import deque
from typing import List, Dict, Any


def make_placeholder_description(key: str) -> str:
    """Generate a placeholder description from a field key name."""
    cleaned = key.replace("_", " ").strip()
    if not cleaned:
        return "."
    return cleaned[0].upper() + cleaned[1:] + "."


def extract_print_headers(code: str) -> List[Dict[str, Any]]:
    """Extract doveadm_print_header and doveadm_print_header_simple call sites.

    Returns a list of dicts with: name, type, description.
    """
    fields = []
    seen = set()

    # Pattern for doveadm_print_header_simple("key")
    # and doveadm_print_header("key", "title", flags)
    # We match calls across lines if needed.
    call_pattern = re.compile(
        r'doveadm_print_header(?:_simple)?\s*\(\s*"([^"]+)"(?:\s*,\s*(?:[^\),]+)\s*,\s*([^\)]+))?\s*\)',
        re.DOTALL
    )

    for match in call_pattern.finditer(code):
        name = match.group(1)
        flags = match.group(2) or ""
        field_type = "INTEGER" if "DOVEADM_PRINT_HEADER_FLAG_NUMBER" in flags else "STRING"
        if name not in seen:
            seen.add(name)
            fields.append({
                "name": name,
                "type": field_type,
                "description": make_placeholder_description(name)
            })

    return fields


def extract_functions(clean: str) -> Dict[str, str]:
    """Extract top-level C function names and their bodies from comment-free C text."""
    clean_no_attrs = re.sub(r"\bATTR_[A-Z0-9_]+\([^\)]*\)", "", clean)
    fn_header = re.compile(
        r"(?:^|\n)\s*(?:static\s+|inline\s+|extern\s+)*[a-zA-Z0-9_* \t\n]+?\b([a-zA-Z0-9_]+)\s*\([^;{]*?\)\s*\{"
    )
    funcs = {}
    for m in fn_header.finditer(clean_no_attrs):
        name = m.group(1)
        if name in {"if", "while", "for", "switch", "container_of", "T_BEGIN", "DOVEADM_CMD_PARAMS_START"}:
            continue
        start = m.end() - 1
        depth = 0
        end = start
        in_string = False
        idx = start
        while idx < len(clean_no_attrs):
            ch = clean_no_attrs[idx]
            if ch == '"' and (idx == 0 or clean_no_attrs[idx - 1] != '\\'):
                in_string = not in_string
            elif not in_string:
                if ch == "{":
                    depth += 1
                elif ch == "}":
                    depth -= 1
                    if depth == 0:
                        end = idx + 1
                        break
            idx += 1
        funcs[name] = clean_no_attrs[start:end]
    return funcs


STDOUT_RE = re.compile(
    r"\b(?:printf|puts|putchar|vprintf)\s*\(|"
    r"\bfprintf\s*\([^,]*\bstdout\b|"
    r"\bfputs\s*\([^,]*,\s*stdout\b|"
    r"\bstdout\b|"
    r"\bSTDOUT_FILENO\b"
)
PRINT_RE = re.compile(r"\bdoveadm_print(?:_num|_empty|_stream|_istream|_sticky)?\s*\(")


def extract_handlers_from_text(text: str) -> tuple[str | None, str | None]:
    """Extract .cmd and .mail_cmd function names from a struct definition or code snippet."""
    cmd_match = re.search(r"\.cmd\s*=\s*([A-Za-z0-9_]+)", text)
    mail_cmd_match = re.search(r"\.mail_cmd\s*=\s*([A-Za-z0-9_]+)", text)
    cmd_fn = cmd_match.group(1) if cmd_match else None
    mail_cmd_fn = mail_cmd_match.group(1) if mail_cmd_match else None
    return cmd_fn, mail_cmd_fn


def parse_c_content(c_text: str, known_commands: set | None = None) -> Dict[str, Dict[str, Any]]:
    """Parse C source text to identify implemented doveadm commands and their response fields."""
    clean = re.sub(r"/\*.*?\*/", "", c_text, flags=re.DOTALL)
    clean = re.sub(r"//.*", "", clean)

    # Macro definitions (handling multiline \ continuations)
    define_re = re.compile(r"#define\s+([A-Za-z0-9_]+)(?:[ \t]+((?:[^\n]*\\\n)*[^\n]*))?")
    defines = {}
    for m in define_re.finditer(clean):
        macro_name = m.group(1)
        macro_val = (m.group(2) or "").replace("\\\n", " ").strip()
        defines[macro_name] = macro_val

    # Expand relevant macros that define commands or names
    for m_name, m_val in defines.items():
        if m_val and (".cmd" in m_val or ".mail_cmd" in m_val or (m_val.startswith('"') and m_val.endswith('"'))):
            clean = re.sub(r"\b" + re.escape(m_name) + r"\b", lambda match, val=m_val: val, clean)

    funcs = extract_functions(clean)
    all_fn_names = set(funcs.keys())
    fn_tokens = {fn: set(re.findall(r"\b[A-Za-z0-9_]+\b", body)) for fn, body in funcs.items()}

    # Extract struct vtables / variables that map to function pointers (e.g. dump_vfuncs)
    struct_var_re = re.compile(
        r"struct\s+[A-Za-z0-9_]+\s+([A-Za-z0-9_]+)\s*=\s*\{([^{}]*)\};",
        re.DOTALL
    )
    struct_fn_map = {}
    for m in struct_var_re.finditer(clean):
        var_name = m.group(1)
        var_body = m.group(2)
        assigned_fns = set(re.findall(r"=\s*([A-Za-z0-9_]+)", var_body)).intersection(all_fn_names)
        if assigned_fns:
            struct_fn_map[var_name] = assigned_fns

    # Find command definitions
    found_commands = []
    for line in clean.splitlines():
        if ".name" in line:
            name_m = re.search(r"\.name\s*=\s*(?:\"([^\"]+)\"|([A-Za-z0-9_]+))", line)
            if name_m:
                raw_name = name_m.group(1) or defines.get(name_m.group(2))
                if raw_name:
                    found_commands.append(raw_name)

    # Deduplicate while preserving order
    unique_commands = []
    for c in found_commands:
        if c not in unique_commands:
            unique_commands.append(c)

    results = {}

    for raw_name in unique_commands:
        norm_name = raw_name
        if known_commands:
            if raw_name in known_commands:
                norm_name = raw_name
            elif raw_name.replace("-", " ") in known_commands:
                norm_name = raw_name.replace("-", " ")
            else:
                continue

        cmd_fn = None
        mail_cmd_fn = None

        name_re = re.escape(raw_name)
        ctx_m = re.search(r"\{[^{}]*?\.name\s*=\s*(?:\"" + name_re + r"\"|" + name_re + r")[^{}]*?\}", clean, re.DOTALL)
        if not ctx_m:
            lines = clean.splitlines()
            for idx, line in enumerate(lines):
                if f'"{raw_name}"' in line or (raw_name in defines and any(k == raw_name for k in defines)):
                    window = "\n".join(lines[max(0, idx - 15):min(len(lines), idx + 15)])
                    cmd_fn, mail_cmd_fn = extract_handlers_from_text(window)
                    break
        else:
            cmd_fn, mail_cmd_fn = extract_handlers_from_text(ctx_m.group(0))

        # Collect entry functions
        entry_fns = set()
        if cmd_fn and cmd_fn != "NULL":
            entry_fns.add(cmd_fn)
        if mail_cmd_fn and mail_cmd_fn != "NULL":
            entry_fns.add(mail_cmd_fn)
            if mail_cmd_fn in fn_tokens:
                entry_fns.update(fn_tokens[mail_cmd_fn].intersection(all_fn_names))

        # BFS call graph traversal
        visited = set(fn for fn in entry_fns if fn in funcs)
        queue = deque(visited)
        while queue:
            curr = queue.popleft()
            tokens = fn_tokens.get(curr, set())
            called = tokens.intersection(all_fn_names) - visited
            # Also check if any referenced struct variable contains functions
            for var_name, fns in struct_fn_map.items():
                if var_name in tokens:
                    called.update(fns - visited)
            visited.update(called)
            queue.extend(called)

        if visited:
            reachable_code = "".join(funcs[fn] for fn in visited if fn in funcs)
        elif len(unique_commands) == 1:
            reachable_code = clean
        else:
            reachable_code = ""

        fields = extract_print_headers(reachable_code)
        has_header = len(fields) > 0
        has_stdout = bool(STDOUT_RE.search(reachable_code))
        has_print = bool(PRINT_RE.search(reachable_code))

        if has_header:
            cat = "structured"
        elif has_stdout or has_print:
            cat = "unstructured"
        else:
            cat = "silent"

        results[norm_name] = {
            "category": cat,
            "fields": fields,
        }

    return results



def extract_commands_from_directories(directories: List[str], known_commands: set | None = None) -> Dict[str, Dict[str, Any]]:
    """Scan directories for .c files and extract doveadm response metadata."""
    c_files = []
    for d in directories:
        if os.path.isfile(d) and d.endswith(".c"):
            c_files.append(d)
        elif os.path.isdir(d):
            for root, _, files in os.walk(d):
                for f in files:
                    if f.endswith(".c"):
                        c_files.append(os.path.join(root, f))

    all_findings = {}

    for path in c_files:
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fp:
                content = fp.read()
        except OSError:
            continue

        if ".name" not in content:
            continue

        file_findings = parse_c_content(content, known_commands=known_commands)

        for cmd, info in file_findings.items():
            if cmd not in all_findings:
                all_findings[cmd] = {
                    "category": info["category"],
                    "fields": info["fields"],
                    "sources": [path],
                }
            else:
                existing = all_findings[cmd]
                existing["sources"].append(path)
                # Structured takes precedence over unstructured / silent
                if info["category"] == "structured":
                    if existing["category"] != "structured":
                        existing["category"] = "structured"
                        existing["fields"] = info["fields"]
                    else:
                        # Merge fields if missing
                        existing_field_names = {f["name"] for f in existing["fields"]}
                        for f in info["fields"]:
                            if f["name"] not in existing_field_names:
                                existing["fields"].append(f)
                                existing_field_names.add(f["name"])
                elif info["category"] == "unstructured" and existing["category"] == "silent":
                    existing["category"] = "unstructured"

    return all_findings


def generate_audit_markdown(findings: Dict[str, Dict[str, Any]], base_dir: str | None = None) -> str:
    """Generate a human-readable audit Markdown report listing findings per command."""
    structured = []
    unstructured = []
    silent = []

    for cmd_name, data in sorted(findings.items()):
        cat = data["category"]
        if cat == "structured":
            structured.append((cmd_name, data))
        elif cat == "unstructured":
            unstructured.append((cmd_name, data))
        else:
            silent.append((cmd_name, data))

    def format_sources(src_list: List[str]) -> str:
        if not src_list:
            return "-"
        formatted = []
        for s in sorted(set(src_list)):
            if base_dir:
                try:
                    formatted.append(os.path.relpath(s, base_dir))
                except ValueError:
                    formatted.append(s)
            else:
                formatted.append(s)
        return ", ".join(formatted)

    lines = [
        "# Doveadm Response Audit Report",
        "",
        f"Audit of doveadm command response categorization generated by `util/gen-doveadm-response.py`.",
        "",
        "## Summary",
        "",
        f"- **Total commands analyzed:** {len(findings)}",
        f"- **Structured:** {len(structured)}",
        f"- **Unstructured:** {len(unstructured)}",
        f"- **Silent:** {len(silent)}",
        "",
        "## Structured Commands",
        "",
        "Commands that emit output via `doveadm_print_header` (statically identifiable fields).",
        "",
        "| Command | Inferred Fields (Name: Type) | Sources |",
        "|---|---|---|",
    ]

    for cmd_name, data in structured:
        fields_str = ", ".join(f"`{f['name']}` ({f['type']})" for f in data["fields"]) or "*(none detected)*"
        srcs = format_sources(data.get("sources", []))
        lines.append(f"| `{cmd_name}` | {fields_str} | {srcs} |")

    lines.extend([
        "",
        "## Unstructured Commands",
        "",
        "Commands that write output directly to stdout or bypass `doveadm_print_header`.",
        "",
        "| Command | Note | Sources |",
        "|---|---|---|",
    ])

    for cmd_name, data in unstructured:
        srcs = format_sources(data.get("sources", []))
        lines.append(f"| `{cmd_name}` | Direct stdout output / unstructured | {srcs} |")

    lines.extend([
        "",
        "## Silent Commands",
        "",
        "Commands that produce no output on success (candidates for `response: null`).",
        "",
        "| Command | Sources |",
        "|---|---|",
    ])

    for cmd_name, data in silent:
        srcs = format_sources(data.get("sources", []))
        lines.append(f"| `{cmd_name}` | {srcs} |")

    lines.append("")
    return "\n".join(lines)


def format_response_stub(category: str, fields: List[Dict[str, Any]]) -> str:
    """Format the response property string with proper tabs."""
    if category == "silent":
        return "\t\tresponse: null,\n"
    elif category == "unstructured":
        return (
            "\t\tresponse: {\n"
            "\t\t\tnote: 'Command produces unstructured stdout output.',\n"
            "\t\t},\n"
        )
    elif category == "structured":
        if not fields:
            return (
                "\t\tresponse: {\n"
                "\t\t\tfields: {},\n"
                "\t\t},\n"
            )
        field_lines = []
        for f in fields:
            name = f["name"]
            ftype = f["type"]
            desc = f["description"].replace("'", "\\'")
            # Quote name if it has spaces or special chars
            safe_name = f"'{name}'" if (" " in name or "-" in name) else name
            field_lines.append(
                f"\t\t\t\t{safe_name}: {{\n"
                f"\t\t\t\t\ttype: doveadm_response_types.{ftype},\n"
                f"\t\t\t\t\tdescription: '{desc}',\n"
                f"\t\t\t\t}},\n"
            )
        return (
            "\t\tresponse: {\n"
            "\t\t\tfields: {\n"
            + "".join(field_lines)
            + "\t\t\t},\n"
            "\t\t},\n"
        )
    return ""



def patch_doveadm_js(js_content: str, findings: Dict[str, Dict[str, Any]]) -> str:
    """Idempotently patch data/doveadm.js inserting response stubs for undocumented commands."""
    cmd_start_re = re.compile(r"^(\t(?:\x27([^\x27]+)\x27|([a-zA-Z0-9_-]+)):\s*\{)", re.MULTILINE)
    starts = list(cmd_start_re.finditer(js_content))
    if not starts:
        return js_content

    # Determine command blocks (start to end)
    blocks = []
    for idx, start_m in enumerate(starts):
        cmd_name = start_m.group(2) or start_m.group(3)
        start_pos = start_m.start()
        # End is the next start or end of the doveadm object
        if idx + 1 < len(starts):
            next_start = starts[idx + 1].start()
            # find \n\t\}, before next_start
            end_match = None
            for em in re.finditer(r"^\t\},", js_content[start_pos:next_start], re.MULTILINE):
                end_match = em
            end_pos = start_pos + end_match.end() if end_match else next_start
        else:
            end_match = re.search(r"^\t\},", js_content[start_pos:], re.MULTILINE)
            end_pos = start_pos + end_match.end() if end_match else len(js_content)
        blocks.append((cmd_name, start_pos, end_pos))

    # Process blocks in reverse order so character offsets remain valid
    patched = js_content
    insert_target_re = re.compile(r"^(\t\t(?:flags|plugin|man|text)\s*:)", re.MULTILINE)

    for cmd_name, start_pos, end_pos in reversed(blocks):
        if cmd_name not in findings:
            continue

        block = patched[start_pos:end_pos]
        # Skip if response: is already present (uncommented)
        if re.search(r"^\t\tresponse\s*:", block, re.MULTILINE):
            continue

        finding = findings[cmd_name]
        stub = format_response_stub(finding["category"], finding.get("fields", []))
        if not stub:
            continue

        # Find where to insert inside block
        target_m = insert_target_re.search(block)
        if target_m:
            insert_idx = start_pos + target_m.start()
        else:
            # Right before closing \t},
            close_m = re.search(r"^\t\},", block, re.MULTILINE)
            insert_idx = start_pos + close_m.start() if close_m else end_pos

        patched = patched[:insert_idx] + stub + patched[insert_idx:]

    return patched


def load_known_commands_from_js(js_path: str) -> set:
    """Read command names from data/doveadm.js."""
    try:
        with open(js_path, "r", encoding="utf-8") as f:
            content = f.read()
    except OSError:
        return set()

    matches = re.findall(r"^\t(?:\x27([^\x27]+)\x27|([a-zA-Z0-9_-]+)):\s*\{", content, re.MULTILINE)
    commands = set()
    for quoted_name, unquoted_name in matches:
        commands.add(quoted_name or unquoted_name)
    return commands



def main(argv=None) -> int:
    import argparse
    import sys

    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    default_js_path = os.path.join(repo_root, "data", "doveadm.js")
    default_audit_path = os.path.join(repo_root, "util", "doveadm-response-audit.md")

    parser = argparse.ArgumentParser(
        description="Extract doveadm response field metadata from C source files and audit or patch data/doveadm.js."
    )
    parser.add_argument(
        "source_dirs",
        nargs="+",
        help="One or more directories or source files containing doveadm C source code.",
    )
    parser.add_argument(
        "--audit",
        action="store_true",
        help="Pass 1: write audit markdown report listing findings per command.",
    )
    parser.add_argument(
        "--patch",
        action="store_true",
        help="Pass 2: patch data/doveadm.js inserting stubs for undocumented commands.",
    )
    parser.add_argument(
        "--doveadm-js",
        default=default_js_path,
        help=f"Path to data/doveadm.js (default: {default_js_path})",
    )
    parser.add_argument(
        "--audit-file",
        default=default_audit_path,
        help=f"Path to output audit Markdown file (default: {default_audit_path})",
    )

    args = parser.parse_args(argv)

    # Default to audit if neither specified
    run_audit = args.audit
    run_patch = args.patch
    if not run_audit and not run_patch:
        run_audit = True

    known_commands = load_known_commands_from_js(args.doveadm_js)
    findings = extract_commands_from_directories(args.source_dirs, known_commands=known_commands)

    if run_audit:
        audit_md = generate_audit_markdown(findings, base_dir=repo_root)
        try:
            os.makedirs(os.path.dirname(os.path.abspath(args.audit_file)), exist_ok=True)
            with open(args.audit_file, "w", encoding="utf-8") as f:
                f.write(audit_md)
        except OSError as e:
            print(f"Error: cannot write {args.audit_file}: {e}", file=sys.stderr)
            return 1
        print(f"Audit report written to {args.audit_file} ({len(findings)} commands)")

    if run_patch:
        try:
            with open(args.doveadm_js, "r", encoding="utf-8") as f:
                js_content = f.read()
        except OSError:
            print(f"Error: {args.doveadm_js} not found", file=sys.stderr)
            return 1

        patched_content = patch_doveadm_js(js_content, findings)
        try:
            with open(args.doveadm_js, "w", encoding="utf-8") as f:
                f.write(patched_content)
        except OSError as e:
            print(f"Error: cannot write {args.doveadm_js}: {e}", file=sys.stderr)
            return 1
        print(f"Patched {args.doveadm_js}")

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
