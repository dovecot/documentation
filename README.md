Dovecot Documentation
=====================

This repository contains documentation displayed at https://doc.dovecot.org/.

Building
--------

Initialize your python 3 virtualenv environment

```
 $ python3 -m venv venv/sphinx
 $ . venv/sphinx/bin/activate
 $ pip install -r requirements.txt
```

Create HTML version of documentation (output in `_build`) by running:
```
make html
```

Formatting
----------

### Common Setting Parameters

There are 3 Dovecot sphinx directives for documenting settings:

  * "dovecot_core" for Core settings
  * "dovecot_plugin" for Core plugin settings
  * "pigeonhole" for Pigeonhole settings (both core and plugin)

These directives share the following parameters/usage.

Format:

```
.. <directive name>:setting:: <setting name>
   :added: [vX.Y.Z <reST text>]
   :changed: [vX.Y.Z <reST text>]
   :default: [<value1>, <value2>, ...]
   :hdr_only: [yes]
   :plugin: <plugin-name>
   :removed: [vX.Y.Z <reST text>]
   :seealso: [<value1>, <value2>, ...]
   :todo: [todo text]
   :values: [<value1>, <value2>, ...]

   Blah blah blah (the setting documentation) blah blah blah
```

The `plugin` setting is REQUIRED for "dovecot_plugin". It should also be used
for plugin settings in "pigeonhole". (It is not used with "dovecot_core".)
It is the name of the plugin that the setting lives in (e.g. `quota`).

The `added`, `changed` and `removed` settings are optional. They indicate the
version the setting was added, changed, or removed. The string can contain
reST that will be parsed

The `default` setting is optional. If set, this is used to populate the
"Default" description field. If empty, `<empty>` is output.

The default field supports three types:
  * Raw text will be output as a literal (i.e. '0' will be output as `0`)
  * Text prefixed with '!' will be output as reST text
  * Text prefixed with '@' will be treated as a sphinx reference. The
    reference domain can be indicated by adding ';<domain>' to the end of the
    string (e.g. '@foo;dovecot-test')

Multiple items can be defined by delimiting with a ','.

The `hdr_only` setting is optional. If set (= `yes`), only the setting name
and index link are created - Default/Values information is not output.

The `seealso` setting is optional. If set, it will display a list of related
links/topics for the current setting. The syntax is the same as the `default`
field.

The `todo` setting is optional. If set, it will pass the text through to the
Sphinx "todo" directive.

The `values` setting is optional. If set, this is used to populate the
"Values" description field. If empty, nothing is output.

The values field supports three types:
  * Raw text will be output as a literal (i.e. '0' will be output as `0`)
  * Text prefixed with '!' will be output as raw text
  * Text prefixed with '@' will be treated as a Dovecot settings type
    reference. The allowable types are:
    * string
    * boolean
    * size
    * time
    * uint
    * time_msecs
    * ip_addresses
    * url

Multiple items can be defined by delimiting with a ','.

```
.. <directive name>:setting_link:: <setting name>
```

Output a link to the setting.


#### Sphinx Settings References

To reference Dovecot core settings in Sphinx, use this:

```
:dovecot_core:ref:`<setting_name>`
```

To reference Dovecot core *plugin* settings in Sphinx, use this:

```
:dovecot_plugin:ref:`<setting_name>`
```

To reference Pigeonhole settings in Sphinx, use this:

```
:pigeonhole:ref:`<setting_name>`
```
