from collections import defaultdict

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.parsers.rst.directives.admonitions import BaseAdmonition
from docutils.statemachine import StringList

import sphinx
from sphinx import addnodes
from sphinx.directives import ObjectDescription
from sphinx.domains import Domain, Index
from sphinx.roles import XRefRole, AnyXRefRole
from sphinx.util import logging
from sphinx.util.docutils import SphinxDirective
from sphinx.util.nodes import make_refnode

import re


class DovecotDirective(ObjectDescription):

  required_arguments = 1

  def _parse_rst_txt(self, txt):
    node = nodes.Element()
    source, line = self.state_machine.get_source_and_line()
    vl = StringList()
    vl.append(txt, '%s:%d' % (source, line))
    self.state.nested_parse(vl, 0, node)
    return node.children[0]

  def _transform_content(self, contentnode):
    contentnode.parent['classes'].append('dovecotsetting')


class DovecotSettingLinkDirective(DovecotDirective):

  def add_target_and_index(self, name_cls, sig, signode):
      return

  def transform_content(self, contentnode):
      self._transform_content(contentnode)

      ref = self._parse_rst_txt(':%s:ref:`%s`' % (self.domain, self.arguments[0]))
      ref.insert(0, nodes.Text('See: '))
      contentnode += ref


class DovecotSettingDirective(DovecotDirective):

  option_spec = {
      'added': directives.unchanged,
      'changed': directives.unchanged,
      'default': directives.unchanged,
      'domain': directives.unchanged,
      'hdr_only': directives.unchanged,
      'plugin': directives.unchanged,
      'removed': directives.unchanged,
      'seealso': directives.unchanged,
      'todo': directives.unchanged,
      'values': directives.unchanged,
  }

  def handle_signature(self, sig, signode):
    signode += addnodes.desc_name(text=sig)
    return sig

  def add_target_and_index(self, name_cls, sig, signode):
    if 'domain' in self.options:
      sig = '{}-{}'.format(self.options.get('domain'), sig)
    d = self.env.get_domain(self.domain)
    anchor = '{}-{}'.format(d.set_prefix, self.dovecot_anchor(sig))
    signode['ids'].append(anchor)
    d.add_setting(sig, anchor)

  def dovecot_anchor(self, sig):
    return sig

  def transform_content(self, contentnode):
    super().transform_content(contentnode)
    self._transform_content(contentnode)

    if self.options.get('hdr_only'):
      return

    for x in ('changed', 'removed', 'added'):
      if x in self.options:
        contentnode.insert(0, self._parse_rst_txt('.. version%s:: %s' % (x, self.options.get(x))))

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

    contentnode.insert(0, blist)

    if 'seealso' in self.options:
      seealso = addnodes.seealso()
      seealso.set_class('dovecot-seealso')

      for x in self.options.get('seealso').split(','):
        x = x.strip().replace('\\', '')

        par = nodes.paragraph()
        if x.startswith('@'):
          parts = x[1:].split(';', 2)
          par += self._parse_rst_txt(':%s:ref:`%s`' % (parts[1] if len(parts) == 2 else 'std', parts[0])).children
        elif x.startswith('!'):
          par += self._parse_rst_txt(x[1:]).children
        else:
          par += nodes.literal(text=x)

        seealso += par

      contentnode += seealso

    if 'todo' in self.options:
      contentnode += self._parse_rst_txt('.. todo:: %s' % (self.options.get('todo')))

class DovecotSettingIndex(Index):

  def generate(self, docnames=None):
    content = defaultdict(list)

    # Sort the list of settings in alphabetical order
    settings = self.domain.get_objects()
    settings = sorted(settings, key=lambda setting: setting[0])

    for name, dispname, typ, docname, anchor, _ in settings:
      content[dispname[0].lower()].append(
        (dispname, 0, docname, anchor, docname, '', typ))

    # Convert the dict to the sorted list of tuples expected
    content = sorted(content.items())

    return content, True

class DovecotSettingDomain(Domain):

  roles = {
      'ref': XRefRole()
  }
  initial_data = {
      'settings': {},
  }

  def resolve_xref(self, env, fromdocname, builder, typ, target, node,
                   contnode):
    parts = target.split(';', 2)
    t = '{}-{}'.format(parts[0], parts[1]) if len(parts) == 2 else target;

    match = [(docname, anchor)
             for name, sig, typ, docname, anchor, prio
             in self.get_objects() if sig == t]

    if len(match) > 0:
      todocname = match[0][0]
      targ = match[0][1]
      if len(parts) == 2:
        contnode.replace(contnode[0], nodes.Text(parts[1]))

      return make_refnode(builder, fromdocname, todocname, targ, contnode,
                          targ)
    else:
      logger = logging.getLogger(__name__)
      logger.warning('Missing cross-reference: %r', target, location=node)
      return None

  def get_full_qualified_name(self, node):
    return '{}.{}'.format(self.set_prefix, node.arguments[0])

  def get_objects(self):
    for name, (docname, anchor) in list(self.data['settings'].items()):
      # name, dispname, type, docname, anchor, priority
      yield name, name, self.label, docname, anchor, 0

  def add_setting(self, signature, anchor):
      self.data['settings'][signature] = (self.env.docname, anchor)


class DovecotPluginSettingDirective(DovecotSettingDirective):

  def dovecot_anchor(self, sig):
    return '{}-{}'.format(self.options.get('plugin').strip(), sig)

class DovecotPluginSettingIndex(DovecotSettingIndex):

  name = 'plugin_setting'
  localname = 'Dovecot Plugin Settings Index'
  shortname = 'Plugin'

class DovecotPluginSettingDomain(DovecotSettingDomain):

  name = 'dovecot_plugin'
  label = 'Dovecot Plugin Settings'
  set_prefix = 'plugin_setting'

  directives = {
      'setting': DovecotPluginSettingDirective,
      'setting_link': DovecotSettingLinkDirective
  }
  indices = {
      DovecotPluginSettingIndex
  }


class DovecotCoreSettingDirective(DovecotSettingDirective):

  """Plugin information is ignored in this class, for now"""
  pass

class DovecotCoreSettingIndex(DovecotSettingIndex):

  name = 'core_setting'
  localname = 'Dovecot Core Settings Index'
  shortname = 'Core'

class DovecotCoreSettingDomain(DovecotSettingDomain):

  name = 'dovecot_core'
  label = 'Dovecot Core Settings'
  set_prefix = 'core_setting'

  directives = {
      'setting': DovecotCoreSettingDirective,
      'setting_link': DovecotSettingLinkDirective
  }
  indices = {
      DovecotCoreSettingIndex
  }


class PigeonholeSettingDirective(DovecotCoreSettingDirective):

  """Plugin information is ignored in this class, for now"""
  pass

class PigeonholeSettingIndex(DovecotSettingIndex):

  name = 'pigeonhole_setting'
  localname = 'Dovecot Pigeonhole Settings Index'
  shortname = 'Pigeonhole'

class PigeonholeSettingDomain(DovecotSettingDomain):

  name = 'pigeonhole'
  label = 'Dovecot Pigeonhole Settings'
  set_prefix = 'pigeonhole_setting'

  directives = {
      'setting': PigeonholeSettingDirective,
      'setting_link': DovecotSettingLinkDirective
  }
  indices = {
      PigeonholeSettingIndex
  }


class ClusterSettingDirective(DovecotCoreSettingDirective):

  """Plugin information is ignored in this class, for now"""
  pass

class ClusterSettingIndex(DovecotSettingIndex):

  name = 'cluster_setting'
  localname = 'Dovecot Cluster Settings Index'
  shortname = 'cluster'

class ClusterSettingDomain(DovecotSettingDomain):

  name = 'cluster'
  label = 'Dovecot Cluster Settings'
  set_prefix = 'cluster_setting'

  directives = {
      'setting': ClusterSettingDirective,
      'setting_link': DovecotSettingLinkDirective
  }
  indices = {
      ClusterSettingIndex
  }


class ManRole(XRefRole):
    def process_link(self, env, refnode, has_explicit_title, title, target):
        """Called after initial processing. We convert manpage (section) into
        target link to man- namespace."""

        g = re.match('^(.+)\s?[(](.+)[)]$', target)
        if not g:
            raise ValueError("Invalid target '%s'" % target)
        return ('%s(%s)' % (g.group(1), g.group(2)), 'man-%s_%s' % (g.group(2), g.group(1)))

    def result_nodes(self, document, env, node, is_ref):
        """Ensure node object is a std reference with explicit title"""
        node['refdomain'] = 'std'
        node['reftype'] = 'ref'
        node['refexplicit'] = True

        return [node], []


def setup(app):
  app.add_domain(DovecotCoreSettingDomain)
  app.add_domain(DovecotPluginSettingDomain)
  app.add_domain(PigeonholeSettingDomain)
  app.add_domain(ClusterSettingDomain)
  app.add_role('man', ManRole(warn_dangling=True, innernodeclass=nodes.strong))

  return {
    'version': sphinx.__display_version__,
    'parallel_read_safe': True,
    'parallel_write_safe': True,
  }
