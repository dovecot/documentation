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

### Dovecot Core Settings

The `dovecot_core::setting` sphinx directive should be used to document
Dovecot core settings.

Format:

```
.. dovecot_core:setting:: <setting name>
   :added: [vX.Y.Z <reST text>]
   :changed: [vX.Y.Z <reST text>]
   :default: [<value1>, <value2>, ...]
   :hdr_only: [yes | no_index]
   :plugin: <plugin-name>
   :removed: [vX.Y.Z <reST text>]
   :values: [<value1>, <value2>, ...]

.. versionadded: vX.Y.Z (if needed)

Blah blah blah (the setting documentation) blah blah blah
```

The `hdr_only` setting is optional. If set (= `yes`), only the setting name
and index link are created - Default/Values information is not output. If
set (= `no_index`), only the setting name is output.

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

#### Dovecot Core Settings References

To reference a Dovecot core setting in Sphinx, the following should be used:

```
:dovecot_core:ref:`<setting_name>`
```

### Dovecot Plugin Settings

The `dovecot_plugin::setting` sphinx directive should be used to document
Dovecot plugin settings.

Format:

```
.. dovecot_plugin:setting:: <setting name>
   :added: [vX.Y.Z <reST text>]
   :changed: [vX.Y.Z <reST text>]
   :default: [<value1>, <value2>, ...]
   :hdr_only: [yes]
   :plugin: <plugin-name>
   :removed: [vX.Y.Z <reST text>]
   :values: [<value1>, <value2>, ...]

   Blah blah blah (the setting documentation) blah blah blah
```

The `plugin` setting is REQUIRED. It is the name of the plugin that the
setting lives in (e.g. `quota`).

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

#### Dovecot Plugin Settings References

To reference a Dovecot plugin setting in Sphinx, the following should be used:

```
:dovecot_plugin:ref:`<setting_name>`
```
