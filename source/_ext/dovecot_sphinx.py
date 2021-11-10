from collections import defaultdict

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.statemachine import StringList

from sphinx import addnodes
from sphinx.directives import ObjectDescription
from sphinx.domains import Domain, Index
from sphinx.roles import XRefRole
from sphinx.util.nodes import make_refnode

class DovecotPluginSettingDirective(ObjectDescription):

  required_arguments = 1
  option_spec = {
      'added': directives.unchanged,
      'changed': directives.unchanged,
      'default': directives.unchanged,
      'hdr_only': directives.unchanged,
      'plugin': directives.unchanged_required,
      'removed': directives.unchanged,
      'values': directives.unchanged,
  }

  def handle_signature(self, sig, signode):
    signode += addnodes.desc_name(text=sig)
    return sig

  def add_target_and_index(self, name_cls, sig, signode):
    anchor = 'plugin_setting-{}-{}'.format(self.options.get('plugin').strip(),
                                           sig)
    signode['ids'].append(anchor)
    dplugin = self.env.get_domain('dovecot_plugin')
    dplugin.add_plugin_setting(sig, anchor)

  def _parse_rst_txt(self, txt):
    node = nodes.Element()
    source, line = self.state_machine.get_source_and_line()
    vl = StringList()
    vl.append(txt, '%s:%d' % (source, line))
    self.state.nested_parse(vl, 0, node)
    return node.children[0]

  def transform_content(self, contentnode):
    super().transform_content(contentnode)

    if self.options.get('hdr_only'):
      return

    par = nodes.paragraph(text='Default: ')
    if 'default' in self.options:
      multi = False
      for x in self.options.get('default').split(','):
        x = x.strip().replace('\\', '')
        if multi:
          par += nodes.Text(', ')
        multi = True

        if x.startswith('@'):
          parts = x[1:].split(';', 2)
          par += self._parse_rst_txt(':%s:ref:`%s`' % (parts[1] if len(parts) == 2 else 'std', parts[0])).children
        elif x.startswith('!'):
          par += self._parse_rst_txt(x[1:]).children
        else:
          par += nodes.literal(text=x)
    else:
      par += nodes.Text('<empty>')

    blist = nodes.bullet_list()
    blist += nodes.list_item('', par)

    if 'values' in self.options:
      par = nodes.paragraph(text='Values: ')
      multi = False

      for x in self.options.get('values').split(','):
        x = x.strip().replace('\\', '')

        if multi:
          par += nodes.Text(', ')
        multi = True

        if x.startswith('@'):
          x = x[1:]
          par += self._parse_rst_txt(':ref:`%s`' % x).children
        elif x.startswith('!'):
          par += self._parse_rst_txt(x[1:]).children
        else:
          par += nodes.literal(text=x)

      blist += nodes.list_item('', par)

    contentnode += blist

    for x in ('changed', 'removed', 'added'):
      if x in self.options:
        contentnode.insert(0, self._parse_rst_txt('.. version%s:: %s' % (x, self.options.get(x))))

class DovecotPluginSettingIndex(Index):

  name = 'plugin_setting'
  localname = 'Dovecot Plugin Setting Index'
  shortname = 'Plugin Setting'

  def generate(self, docnames=None):
    content = defaultdict(list)

    # Sort the list of settings in alphabetical order
    settings = self.domain.get_objects()
    settings = sorted(settings, key=lambda plugin_setting: plugin_setting[0])

    for name, dispname, typ, docname, anchor, _ in settings:
      content[dispname[0].lower()].append(
        (dispname, 0, docname, anchor, docname, '', typ))

    # Convert the dict to the sorted list of tuples expected
    content = sorted(content.items())

    return content, True


class DovecotPluginDomain(Domain):

  name = 'dovecot_plugin'
  label = 'Dovecot Plugin Sphinx Extensions'
  roles = {
      'ref': XRefRole()
  }
  directives = {
      'setting': DovecotPluginSettingDirective
  }
  indices = {
      DovecotPluginSettingIndex
  }
  initial_data = {
      'plugin_settings': [],
  }

  def get_full_qualified_name(self, node):
    return '{}.{}'.format('plugin_setting', node.arguments[0])

  def get_objects(self):
    for obj in self.data['plugin_settings']:
      yield(obj)

  def resolve_xref(self, env, fromdocname, builder, typ, target, node,
                   contnode):
    match = [(docname, anchor)
             for name, sig, typ, docname, anchor, prio
             in self.get_objects() if sig == target]

    if len(match) > 0:
      todocname = match[0][0]
      targ = match[0][1]

      return make_refnode(builder, fromdocname, todocname, targ, contnode,
                          targ)
    else:
      return None

  def add_plugin_setting(self, signature, anchor):
      name = '{}.{}'.format('plugin_setting', signature)

      self.data['plugin_settings'].append(
        (name, signature, 'Plugin Setting', self.env.docname, anchor, 0))


def setup(app):
  app.add_domain(DovecotPluginDomain)

  return {
    'version': sphinx.__display_version__,
    'parallel_read_safe': True,
    'parallel_write_safe': True,
  }
