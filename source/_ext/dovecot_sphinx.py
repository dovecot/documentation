from collections import defaultdict

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.statemachine import StringList

import sphinx
from sphinx import addnodes
from sphinx.directives import ObjectDescription, SphinxDirective
from sphinx.domains import Domain, Index
from sphinx.domains.changeset import VersionChange
from sphinx.roles import XRefRole
from sphinx.util import logging
from sphinx.util.nodes import make_refnode

import re


class DovecotDirective(ObjectDescription):
    required_arguments = 1

    def _parse_rst(self, txt):
        node = nodes.Element()
        source, line = self.state_machine.get_source_and_line()
        vl = StringList()
        for x in txt.splitlines():
            vl.append(x, "%s:%d" % (source, line))
        self.state.nested_parse(vl, 0, node)
        return node.children

    def _generate_ref(self, arg, prefix = None):
        return self._parse_rst(
            "%s:ref:`%s`" % ((":" + prefix) if prefix != None else "", arg)
        )[0]

    def _transform_content(self, contentnode):
        contentnode.parent["classes"].append("dovecotsetting")

    def dovecot_anchor(self, sig):
        return sig


class DovecotSettingLinkDirective(DovecotDirective):
    def add_target_and_index(self, name_cls, sig, signode):
        return

    def transform_content(self, contentnode):
        self._transform_content(contentnode)

        ref = self._generate_ref(self.arguments[0], self.domain)
        ref.insert(0, nodes.Text("See: "))
        contentnode += ref


class DovecotSettingDirective(DovecotDirective):
    option_spec = {
        "added": directives.unchanged,
        "changed": directives.unchanged,
        "default": directives.unchanged,
        "domain": directives.unchanged,
        "hdr_only": directives.unchanged,
        "plugin": directives.unchanged,
        "removed": directives.unchanged,
        "seealso": directives.unchanged,
        "todo": directives.unchanged,
        "values": directives.unchanged,
    }

    def handle_signature(self, sig, signode):
        signode += addnodes.desc_name(text=sig)
        return sig

    def add_target_and_index(self, name_cls, sig, signode):
        if "domain" in self.options:
            sig = "{}-{}".format(self.options.get("domain"), sig)
        d = self.env.get_domain(self.domain)
        anchor = "{}-{}".format(d.set_prefix, self.dovecot_anchor(sig))
        signode["ids"].append(anchor)
        d.add_entry(sig, anchor)

    def transform_content(self, contentnode):
        super().transform_content(contentnode)
        self._transform_content(contentnode)

        if self.options.get("hdr_only"):
            return

        for x in ("changed", "removed", "added"):
            if x in self.options:
                contentnode.insert(
                    0,
                    self._parse_rst(
                        ".. dovecot%s:: %s" % (x, self.options.get(x))
                    ),
                )

        par = nodes.paragraph(text="Default: ")
        if "default" in self.options:
            multi = False
            for x in self.options.get("default").split(","):
                x = x.strip().replace("\\", "")
                if multi:
                    par += nodes.Text(", ")
                multi = True

                if x.startswith("@"):
                    parts = x[1:].split(";", 2)
                    par += self._generate_ref(
                        parts[0], parts[1] if len(parts) == 2 else "std"
                    ).children
                elif x.startswith("!"):
                    par += self._parse_rst(x[1:])[0].children
                else:
                    par += nodes.literal(text=x)
        else:
            par += nodes.Text("<empty>")

        blist = nodes.bullet_list()
        blist += nodes.list_item("", par)

        if "values" in self.options:
            par = nodes.paragraph(text="Values: ")
            multi = False

            for x in self.options.get("values").split(","):
                x = x.strip().replace("\\", "")

                if multi:
                    par += nodes.Text(", ")
                multi = True

                if x.startswith("@"):
                    x = x[1:]
                    par += self._generate_ref(x).children
                elif x.startswith("!"):
                    par += self._parse_rst(x[1:])[0].children
                else:
                    par += nodes.literal(text=x)

            blist += nodes.list_item("", par)

        contentnode.insert(0, blist)

        if "seealso" in self.options:
            seealso = addnodes.seealso()
            seealso.set_class("dovecot-seealso")

            for x in self.options.get("seealso").split(","):
                x = x.strip().replace("\\", "")

                par = nodes.paragraph()
                if x.startswith("@"):
                    parts = x[1:].split(";", 2)
                    par += self._generate_ref(
                        parts[0], parts[1] if len(parts) == 2 else "std"
                    ).children
                elif x.startswith("!"):
                    par += self._parse_rst(x[1:])[0].children
                else:
                    par += nodes.literal(text=x)

                seealso += par

            contentnode += seealso

        if "todo" in self.options:
            contentnode += self._parse_rst(
                ".. todo:: %s" % (self.options.get("todo"))
            )


class DovecotSettingIndex(Index):
    def generate(self, docnames=None):
        content = defaultdict(list)

        # Sort the list of settings in alphabetical order
        settings = self.domain.get_objects()
        settings = sorted(settings, key=lambda setting: setting[0])

        for name, dispname, typ, docname, anchor, _ in settings:
            content[dispname[0].lower()].append(
                (dispname, 0, docname, anchor, docname, "", typ)
            )

        # Convert the dict to the sorted list of tuples expected
        content = sorted(content.items())

        return content, True


class DovecotSettingDomain(Domain):
    roles = {"ref": XRefRole()}
    initial_data = {
        "entry": {},
    }

    def resolve_xref(
        self, env, fromdocname, builder, typ, target, node, contnode
    ):
        parts = target.split(";", 2)
        t = "{}-{}".format(parts[0], parts[1]) if len(parts) == 2 else target

        match = [
            (docname, anchor)
            for name, sig, typ, docname, anchor, prio in self.get_objects()
            if sig == t
        ]

        if len(match) > 0:
            todocname = match[0][0]
            targ = match[0][1]
            if len(parts) == 2:
                contnode.replace(contnode[0], nodes.Text(parts[1]))

            return make_refnode(
                builder, fromdocname, todocname, targ, contnode, targ
            )
        else:
            logger = logging.getLogger(__name__)
            logger.warning(
                "Missing cross-reference: %r", target, location=node
            )
            return None

    def get_full_qualified_name(self, node):
        return "{}.{}".format(self.set_prefix, node.arguments[0])

    def get_objects(self):
        for name, (docname, anchor, label) in list(self.data["entry"].items()):
            # name, dispname, type, docname, anchor, priority
            yield name, name, label, docname, anchor, 0

    def add_entry(self, signature, anchor):
        self.data["entry"][signature] = (self.env.docname, anchor, self.label)


class DovecotPluginSettingDirective(DovecotSettingDirective):
    def dovecot_anchor(self, sig):
        return "{}-{}".format(self.options.get("plugin").strip(), sig)


class DovecotPluginSettingIndex(DovecotSettingIndex):
    name = "plugin_setting"
    localname = "Dovecot Plugin Settings Index"
    shortname = "Plugin"


class DovecotPluginSettingDomain(DovecotSettingDomain):
    name = "dovecot_plugin"
    label = "Dovecot Plugin Settings"
    set_prefix = "plugin_setting"

    directives = {
        "setting": DovecotPluginSettingDirective,
        "setting_link": DovecotSettingLinkDirective,
    }
    indices = {DovecotPluginSettingIndex}


class DovecotCoreSettingDirective(DovecotSettingDirective):

    """Plugin information is ignored in this class, for now"""

    pass


class DovecotCoreSettingIndex(DovecotSettingIndex):
    name = "core_setting"
    localname = "Dovecot Core Settings Index"
    shortname = "Core"


class PigeonholeSettingDirective(DovecotCoreSettingDirective):

    """Plugin information is ignored in this class, for now"""

    pass


class PigeonholeSettingIndex(DovecotSettingIndex):
    name = "pigeonhole_setting"
    localname = "Dovecot Pigeonhole Settings Index"
    shortname = "Pigeonhole"


class PigeonholeSettingDomain(DovecotSettingDomain):
    name = "pigeonhole"
    label = "Dovecot Pigeonhole Settings"
    set_prefix = "pigeonhole_setting"

    directives = {
        "setting": PigeonholeSettingDirective,
        "setting_link": DovecotSettingLinkDirective,
    }
    indices = {PigeonholeSettingIndex}


class ClusterSettingDirective(DovecotCoreSettingDirective):

    """Plugin information is ignored in this class, for now"""

    pass


class ClusterSettingIndex(DovecotSettingIndex):
    name = "cluster_setting"
    localname = "Dovecot Cluster Settings Index"
    shortname = "cluster"


class ClusterSettingDomain(DovecotSettingDomain):
    name = "cluster"
    label = "Dovecot Cluster Settings"
    set_prefix = "cluster_setting"

    directives = {
        "setting": ClusterSettingDirective,
        "setting_link": DovecotSettingLinkDirective,
    }
    indices = {ClusterSettingIndex}


dovecot_versionlabel_mapping = {
    'dovecotadded': 'versionadded',
    'dovecotchanged': 'versionchanged',
    'dovecotdeprecated': 'deprecated',
    'dovecotremoved': 'versionremoved'
}

# If version begins with this string, it will be replaced by
# the value text. First match wins, so more exact matches
# should appear before more general matches.
dovecot_product_mapping = {
    '3.0': '%s (Pro)',
    '2.4': '%s (CE)'
}

class DovecotVersionChange(VersionChange):

    def run(self):
        self.name = dovecot_versionlabel_mapping[self.name]

        # TODO: - Link version to RNs/Version page
        #       - Hide older versions (e.g. v2.2)

        ret = []

        # Use of ';' to separate versions is now deprecated
        if self.arguments[0].find(';') != -1:
            raise ValueError(f'Version string should not contain ";": {self.arguments[0]}')

        for x in sorted(self.arguments[0].split(',')):
            # Remove "pigeonhole-" prefix
            if x.startswith('pigeonhole-'):
                x = x[11:]
                pigeonhole = True
            else:
                pigeonhole = False

            # 'v' prefix is invalid
            if x.startswith('v'):
                raise ValueError(f'Version should not start with v: {x}')
            # Version needs to always be major.minor.point
            if len(x.split('.')) == 2:
                raise ValueError(f'Version should be in the format x.y.z: {x}')

            # Do product/version matching
            if pigeonhole:
                x = f'{x} (Pigeonhole)'
            else:
                for k,v in dovecot_product_mapping.items():
                    if x.startswith(k):
                        x = v % x
                        break

            self.arguments[0] = x
            ret += super().run()

        return ret


class ManRole(XRefRole):
    def process_link(self, env, refnode, has_explicit_title, title, target):
        """Called after initial processing. We convert manpage (section) into
        target link to man- namespace."""

        g = re.match("^(.+)\\s?[(](.+)[)]$", target)
        if not g:
            raise ValueError("Invalid target '%s'" % target)
        return (
            "%s(%s)" % (g.group(1), g.group(2)),
            "man-%s_%s" % (g.group(2), g.group(1)),
        )

    def result_nodes(self, document, env, node, is_ref):
        """Ensure node object is a std reference with explicit title"""
        node["refdomain"] = "std"
        node["reftype"] = "ref"
        node["refexplicit"] = True

        return [node], []


class DovecotEventFieldDirectiveBase(SphinxDirective):
    domain = "dovecot_event"
    has_content = True

    def run(self):
        self.assert_has_content()
        self._run()

        node = nodes.Element()
        ret = []
        self.state.nested_parse(self.content, self.content_offset, node)

        for child in node:
            if isinstance(child, nodes.field_list):
                for field in child:
                    """name = field[0], body = field[1]"""
                    ftype, farg = field[0].astext().split(None, 1)
                    if ftype != "field":
                        raise ValueError("Incorrect field type %s", ftype)
                    self._add_field(farg, field[1])

        return ret

    def _run(self):
        pass

    def _add_field(self, arg, body):
        pass


class DovecotEventFieldGlobalDirective(DovecotEventFieldDirectiveBase):
    def _add_field(self, arg, body):
        self.env.get_domain(self.domain).add_global_event_field(arg, body)


class DovecotEventFieldGroupDirective(DovecotEventFieldDirectiveBase):
    option_spec = {
        "inherit": directives.unchanged,
    }
    required_arguments = 1

    def _run(self):
        if "inherit" in self.options:
            self.env.get_domain(self.domain).add_group_inherit_field(
                self.arguments[0], self.options.get("inherit")
            )

    def _add_field(self, arg, body):
        self.env.get_domain(self.domain).add_group_event_field(
            self.arguments[0], arg, body
        )


class DovecotEventDirective(DovecotDirective):
    required_arguments = 1
    option_spec = {
        "added": directives.unchanged,
        "changed": directives.unchanged,
        "inherit": directives.unchanged,
        """ plugin is not currently used """ "plugin": directives.unchanged,
        "removed": directives.unchanged,
    }

    def handle_signature(self, sig, signode):
        signode += addnodes.desc_name(text=sig)
        return sig

    def add_target_and_index(self, name_cls, sig, signode):
        anchor = "{}-{}".format("event", self.dovecot_anchor(sig))
        signode["ids"].append(anchor)
        self.env.get_domain(self.domain).add_entry(sig, anchor)

    def transform_content(self, contentnode):
        super().transform_content(contentnode)
        contentnode.parent["classes"].append("dovecotevent")

        for x in ("changed", "removed", "added"):
            if x in self.options:
                contentnode.insert(
                    0,
                    self._parse_rst(
                        ".. dovecot%s:: %s" % (x, self.options.get(x))
                    ),
                )

        table = nodes.table(cols=3)
        group = nodes.tgroup()
        head = nodes.thead()
        body = nodes.tbody()

        table += group
        group += nodes.colspec(colwidth=1)
        group += nodes.colspec(colwidth=5)
        group += head
        group += body

        row = nodes.row()
        row += nodes.entry("", nodes.paragraph("", nodes.Text("Field")))
        row += nodes.entry("", nodes.paragraph("", nodes.Text("Description")))
        head += row

        d = self.env.get_domain("dovecot_event")
        entries = []

        for key, content in d.get_global_event_fields():
            entries.append((key, content))

        for key, content in d.get_event_fields(self.arguments[0]):
            entries.append((key, content))

        if "inherit" in self.options:
            for x in self.options.get("inherit").split(","):
                for key, content in d.get_event_fields(x.strip()):
                    entries.append((key, content))

        """ Go through and move all event-specific fields into description, and
        then remove them from content. """
        for node in contentnode.traverse(nodes.field_list):
            for field in node:
                """name = field[0], body = field[1]"""
                ftype, farg = field[0].astext().split(None, 1)
                if ftype == "field":
                    entries.append((farg, field[1]))
            node.parent.remove(node)

        entries = sorted(entries, key=lambda entry: entry[0])

        for key, content in entries:
            subparts = None
            kind = None
            parts = key.split(None, 1)
            if len(parts) == 2:
                subparts = parts[1].split(";", 1)
                if len(subparts) != 2:
                    raise ValueError("Invalid field modifier %s", parts[1])
                kind = subparts[0][1:]
                key = parts[0]

            row = nodes.row()
            row += nodes.entry("", nodes.literal(text=key))
            entry = nodes.entry()
            entry += content.children[0].deepcopy()
            if kind == None:
                pass
            elif kind == "added" or kind == 'changed' or kind == 'removed':
                entry += self._parse_rst(
                    ".. dovecot%s:: %s" % (kind, subparts[1])
                )
            else:
                raise ValueError("Invalid field modifier %s", subparts[1])
            row += entry
            body += row

        """ Create collapsible container for event fields """
        collapse = self._parse_rst(".. dropdown:: View Event Fields")[0]
        collapse += table
        contentnode += collapse


class DovecotEventDomain(Domain):
    name = "dovecot_event"

    initial_data = {"global": {}, "group": {}, "inherit": {}}

    directives = {
        "field_global": DovecotEventFieldGlobalDirective,
        "field_group": DovecotEventFieldGroupDirective,
    }

    def get_global_event_fields(self):
        for k, content in list(self.data["global"].items()):
            yield k, content

    def get_event_fields(self, key):
        if key in self.data["inherit"]:
            self.get_event_fields(self.data["inherit"][key])
        if key in self.data["group"]:
            for k, content in list(self.data["group"][key].items()):
                yield k, content

    def add_global_event_field(self, key, content):
        self.data["global"][key] = content

    def add_group_event_field(self, group, key, content):
        if group not in self.data["group"]:
            self.data["group"][group] = {}
        self.data["group"][group][key] = content

    def add_group_inherit_field(self, group, key):
        self.data["inherit"][group] = key


class DovecotCoreDomain(DovecotSettingDomain):
    name = "dovecot_core"
    label = "Dovecot Core Settings"
    set_prefix = "core_setting"

    directives = {
        "event": DovecotEventDirective,
        "setting": DovecotCoreSettingDirective,
        "setting_link": DovecotSettingLinkDirective,
    }
    indices = {DovecotCoreSettingIndex}


def setup(app):
    app.add_directive('dovecotadded', DovecotVersionChange)
    app.add_directive('dovecotchanged', DovecotVersionChange)
    app.add_directive('dovecotdeprecated', DovecotVersionChange)
    app.add_directive('dovecotremoved', DovecotVersionChange)
    app.add_domain(DovecotCoreDomain)
    app.add_domain(DovecotEventDomain)
    app.add_domain(DovecotPluginSettingDomain)
    app.add_domain(PigeonholeSettingDomain)
    app.add_domain(ClusterSettingDomain)
    app.add_role(
        "man", ManRole(warn_dangling=True, innernodeclass=nodes.strong)
    )

    return {
        "version": sphinx.__display_version__,
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
