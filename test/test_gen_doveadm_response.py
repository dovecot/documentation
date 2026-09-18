import unittest
import sys
import os
import importlib.util

SCRIPT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "util", "gen-doveadm-response.py"))
spec = importlib.util.spec_from_file_location("gen_doveadm_response", SCRIPT_PATH)
gdr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gdr)


class TestFieldDescription(unittest.TestCase):
    def test_placeholder_description_generation(self):
        self.assertEqual(gdr.make_placeholder_description("hit_ratio_percent"), "Hit ratio percent.")
        self.assertEqual(gdr.make_placeholder_description("count"), "Count.")
        self.assertEqual(gdr.make_placeholder_description("pos_size"), "Pos size.")
        self.assertEqual(gdr.make_placeholder_description("last used"), "Last used.")
        self.assertEqual(gdr.make_placeholder_description("IP"), "IP.")


class TestExtractPrintHeaders(unittest.TestCase):
    def test_extract_print_headers_types(self):
        c_code = """
        doveadm_print_header_simple("hits");
        doveadm_print_header("size", "size", DOVEADM_PRINT_HEADER_FLAG_NUMBER);
        doveadm_print_header("path", "path", DOVEADM_PRINT_HEADER_FLAG_EXPAND);
        doveadm_print_header("used_size", "Used size", DOVEADM_PRINT_HEADER_FLAG_RIGHT_JUSTIFY | DOVEADM_PRINT_HEADER_FLAG_NUMBER);
        doveadm_print_header("mailbox", "mailbox", DOVEADM_PRINT_HEADER_FLAG_HIDE_TITLE);
        """
        headers = gdr.extract_print_headers(c_code)
        self.assertEqual(headers, [
            {"name": "hits", "type": "STRING", "description": "Hits."},
            {"name": "size", "type": "INTEGER", "description": "Size."},
            {"name": "path", "type": "STRING", "description": "Path."},
            {"name": "used_size", "type": "INTEGER", "description": "Used size."},
            {"name": "mailbox", "type": "STRING", "description": "Mailbox."},
        ])


class TestCategorizeCommands(unittest.TestCase):
    def test_categorize_single_and_multi_commands(self):
        c_code = """
        static void cmd_one(struct doveadm_cmd_context *cctx) {
            doveadm_print_header_simple("hits");
            doveadm_print("1");
        }

        static void cmd_two(struct doveadm_cmd_context *cctx) {
            printf("unstructured output\\n");
        }

        static void cmd_three(struct doveadm_cmd_context *cctx) {
            // do nothing
        }

        struct doveadm_cmd_ver2 cmds[] = {
            { .name = "one", .cmd = cmd_one },
            { .name = "two", .cmd = cmd_two },
            { .name = "three", .cmd = cmd_three },
        };
        """
        known_commands = {"one", "two", "three"}
        results = gdr.parse_c_content(c_code, known_commands=known_commands)
        self.assertIn("one", results)
        self.assertEqual(results["one"]["category"], "structured")
        self.assertEqual(results["one"]["fields"], [{"name": "hits", "type": "STRING", "description": "Hits."}])

        self.assertIn("two", results)
        self.assertEqual(results["two"]["category"], "unstructured")

        self.assertIn("three", results)
        self.assertEqual(results["three"]["category"], "silent")


class TestDirectoryExtraction(unittest.TestCase):
    def test_extract_from_temp_directory(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmpdir:
            file1 = os.path.join(tmpdir, "cmd1.c")
            with open(file1, "w") as f:
                f.write("""
                static void cmd_test1(struct doveadm_cmd_context *cctx) {
                    doveadm_print_header("count", "count", DOVEADM_PRINT_HEADER_FLAG_NUMBER);
                    doveadm_print_header_simple("name");
                }
                struct doveadm_cmd_ver2 cmd1 = {
                    .name = "test-one",
                    .cmd = cmd_test1,
                };
                """)

            file2 = os.path.join(tmpdir, "cmd2.c")
            with open(file2, "w") as f:
                f.write("""
                static void cmd_test2(struct doveadm_cmd_context *cctx) {
                    // silent command
                }
                struct doveadm_cmd_ver2 cmd2 = {
                    .name = "test-two",
                    .cmd = cmd_test2,
                };
                """)

            findings = gdr.extract_commands_from_directories([tmpdir], known_commands={"test one", "test two"})
            self.assertIn("test one", findings)
            self.assertEqual(findings["test one"]["category"], "structured")
            self.assertEqual(len(findings["test one"]["fields"]), 2)
            self.assertEqual(findings["test one"]["fields"][0], {"name": "count", "type": "INTEGER", "description": "Count."})
            self.assertEqual(findings["test one"]["fields"][1], {"name": "name", "type": "STRING", "description": "Name."})

            self.assertIn("test two", findings)
            self.assertEqual(findings["test two"]["category"], "silent")
            self.assertEqual(findings["test two"]["fields"], [])


class TestAuditReport(unittest.TestCase):
    def test_generate_audit_markdown(self):
        findings = {
            "auth cache status": {
                "category": "structured",
                "fields": [
                    {"name": "hits", "type": "INTEGER", "description": "Hits."},
                    {"name": "name", "type": "STRING", "description": "Name."},
                ],
                "sources": ["doveadm-auth.c"],
            },
            "pw": {
                "category": "unstructured",
                "fields": [],
                "sources": ["doveadm-pw.c"],
            },
            "stop": {
                "category": "silent",
                "fields": [],
                "sources": ["doveadm-master.c"],
            },
        }
        md = gdr.generate_audit_markdown(findings)
        self.assertIn("# Doveadm Response Audit Report", md)
        self.assertIn("auth cache status", md)
        self.assertIn("`hits` (INTEGER)", md)
        self.assertIn("`name` (STRING)", md)
        self.assertIn("pw", md)
        self.assertIn("stop", md)
        self.assertIn("structured", md.lower())
        self.assertIn("silent", md.lower())
        self.assertIn("unstructured", md.lower())


class TestJsPatcher(unittest.TestCase):
    def test_patch_doveadm_js(self):
        js_input = """export const doveadm = {
\t'silent_cmd': {
\t\targs: {},
\t\tman: 'doveadm-silent',
\t\ttext: `A silent command.`,
\t},

\t'unstructured_cmd': {
\t\targs: {},
\t\ttext: `An unstructured command.`,
\t},

\t'structured_cmd': {
\t\targs: {},
\t\ttext: `A structured command.`,
\t},

\t'existing_cmd': {
\t\targs: {},
\t\tresponse: null,
\t\ttext: `Already documented.`,
\t},
};
"""
        findings = {
            "silent_cmd": {"category": "silent", "fields": []},
            "unstructured_cmd": {"category": "unstructured", "fields": []},
            "structured_cmd": {
                "category": "structured",
                "fields": [
                    {"name": "count", "type": "INTEGER", "description": "Count."},
                    {"name": "mailbox", "type": "STRING", "description": "Mailbox."},
                ],
            },
            "existing_cmd": {
                "category": "structured",
                "fields": [{"name": "should_be_ignored", "type": "STRING", "description": "Ignored."}],
            },
        }

        patched = gdr.patch_doveadm_js(js_input, findings)
        self.assertIn("\t\tresponse: null,\n\t\tman: 'doveadm-silent',", patched)
        self.assertIn("\t\tresponse: {\n\t\t\tnote: 'Command produces unstructured stdout output.',\n\t\t},", patched)
        self.assertIn("\t\tresponse: {\n\t\t\tfields: {\n\t\t\t\tcount: {\n\t\t\t\t\ttype: doveadm_response_types.INTEGER,\n\t\t\t\t\tdescription: 'Count.',\n\t\t\t\t},\n\t\t\t\tmailbox: {\n\t\t\t\t\ttype: doveadm_response_types.STRING,\n\t\t\t\t\tdescription: 'Mailbox.',\n\t\t\t\t},\n\t\t\t},\n\t\t},", patched)
        self.assertNotIn("should_be_ignored", patched)

        # Idempotency
        patched_again = gdr.patch_doveadm_js(patched, findings)
        self.assertEqual(patched, patched_again)


class TestCliIntegration(unittest.TestCase):
    def test_cli_audit_and_patch(self):
        import tempfile
        with tempfile.TemporaryDirectory() as tmpdir:
            src_dir = os.path.join(tmpdir, "src")
            os.makedirs(src_dir)
            with open(os.path.join(src_dir, "test.c"), "w") as f:
                f.write("""
                static void cmd_test_cli(struct doveadm_cmd_context *cctx) {
                    doveadm_print_header_simple("result");
                }
                struct doveadm_cmd_ver2 c = {
                    .name = "cli-cmd",
                    .cmd = cmd_test_cli,
                };
                """)

            js_file = os.path.join(tmpdir, "doveadm.js")
            with open(js_file, "w") as f:
                f.write("""export const doveadm = {
\t'cli cmd': {
\t\targs: {},
\t\ttext: `CLI test command.`,
\t},
};
""")
            audit_file = os.path.join(tmpdir, "audit.md")

            ret = gdr.main([
                "--audit",
                "--patch",
                "--doveadm-js", js_file,
                "--audit-file", audit_file,
                src_dir,
            ])
            self.assertEqual(ret, 0)
            self.assertTrue(os.path.exists(audit_file))
            with open(audit_file) as f:
                audit_content = f.read()
            self.assertIn("cli cmd", audit_content)
            self.assertIn("`result` (STRING)", audit_content)

            with open(js_file) as f:
                patched_js = f.read()
            self.assertIn("\t\tresponse: {\n\t\t\tfields: {\n\t\t\t\tresult: {\n\t\t\t\t\ttype: doveadm_response_types.STRING,\n\t\t\t\t\tdescription: 'Result.',\n\t\t\t\t},\n\t\t\t},\n\t\t},", patched_js)

            # Re-run pass 2 (patch) and verify idempotency
            ret2 = gdr.main([
                "--patch",
                "--doveadm-js", js_file,
                "--audit-file", audit_file,
                src_dir,
            ])
            self.assertEqual(ret2, 0)
            with open(js_file) as f:
                patched_js_again = f.read()
            self.assertEqual(patched_js, patched_js_again)


if __name__ == "__main__":
    unittest.main()






