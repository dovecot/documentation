.. _config_file_syntax:

==========================
Dovecot Config File Syntax
==========================

See also:

 * :ref:`settings`
 * :ref:`settings_types`
 * :ref:`config_variables`

Example configuration
^^^^^^^^^^^^^^^^^^^^^

The example configuration files are split into multiple files in ``conf.d/``
directory for grouping the settings. This is just for human readability though.
Dovecot doesn't care which settings are in which files. They could all be put
into a single ``dovecot.conf`` if preferred (except for
:ref:`external_config_files`).

Basic syntax
^^^^^^^^^^^^

The syntax generally looks like this:

.. code-block:: none

   # this is a comment

   settings_key = settings_value

If Dovecot doesn't seem to be reading your configuration correctly, use `doveconf -n` to check how Dovecot actually parses it. You can also check more complex configurations by providing filters,

Example:

.. code-block:: none

   doveconf -n -f service=imap -f local=10.0.0.1 -f remote=1.2.3.4

Sections
^^^^^^^^

Sections look like this:

.. code-block:: none

   section optional_name {
      section_setting_key = section_setting_value
      subsection optional_subname {
        subkey = subvalue
      }
   }

.. Note:: The sections must be currently written with the linefeeds as shown above.

So for example this doesn't work:

.. code-block:: none

   section optional_name { key = value } # DOES NOT WORK

The sections can be optionally named. This is especially useful if you want to update the same section later on in the config.

Example:

.. code-block:: none

   namespace inbox {
      inbox = yes
   }
   # ...
   # possibly included from another file:
   namespace inbox {
      mailbox Trash {
        special_use = \Trash
      }
   }
   # The namespaces get merged into the same inbox namespace.

Without naming the namespace it would have created a new namespace. The section name may also sometimes be used as part of the settings instead of simply a name.

Example:

.. code-block:: none

   service auth {
      unix_listener auth-master {
         # ..
      }
   }

Above the "auth-master" both uniquely identifies the section name, but also it names the UNIX socket path.

Filters
^^^^^^^

There are a few different filters that can be used to apply settings conditionally. The filters look exactly like sections, which may be a bit confusing. The currently supported filters are:

* protocol <name>: Name of the service/protocol that is reading the settings. For example: imap, pop3, doveadm, lmtp, lda

* remote <ip/network>: Remote client's IP/network. For non-TCP connections this will never match. For example 10.0.0.1 or 10.0.0.0/16.

* local_name <name>: Matches TLS connection's SNI name, if it's sent by the client. Commonly used to `configure multiple TLS certificates <https://wiki.dovecot.org/SSL/DovecotConfiguration>`_

* local <ip/range>: Locally connected IP/network. For non-TCP connections this will never match. For example 127.0.0.1 or 10.0.0.0/16.


These filters work for most of the settings, but most importantly auth settings currently only support the protocol filter. Some of the other settings are also global and can't be filtered, such as log_path.

An example, which uses all of the filters::

   local 127.0.0.1 {
      local_name imap.example.com {
         remote 10.0.0.0/24 {
            protocol imap {
               # ...
            }
         }
      }
   }

The nesting of the filters must be exactly in that order or the config parsing will fail.

When applying the settings, the settings within the most-specific filters override the less-specific filter's settings, so the order of the filters in config file doesn't matter.

Example:

.. code-block:: none

   local 127.0.0.2 {
      key = 127.0.0.2
   }
   local 127.0.0.0/24 {
      key = 127.0.0.0/24
   }
   local 127.0.0.1 {
      key = 127.0.0.1
   }
   # The order of the above blocks doesn't matter:
   # If local IP=127.0.0.1, key=127.0.0.1
   # If local IP=127.0.0.2, key=127.0.0.2
   # If local IP=127.0.0.3, key=127.0.0.0/24

Similarly remote local filters override remote filters, which override local_name filters, which override protocol filters. In some situations Dovecot may also return an error if it detects that the same setting is being ambiguously set by multiple matching filters.

Including config files
^^^^^^^^^^^^^^^^^^^^^^

The main dovecot.conf file can also include other config files:

.. code-block:: none

   !include local.conf
   !include /path/to/another.conf
   !include conf.d/*.conf

The paths are relative to the currently parsed config file's directory.

Example:

.. code-block:: none

   # /etc/dovecot/dovecot.conf:
   !include conf.d/imap.conf
   # /etc/dovecot/conf.d/imap.conf:
   !include imap2.conf
   # /etc/dovecot/conf.d/imap2.conf is being included

If any of the includes fail (e.g. file doesn't exist or permission denied), it results in an error. It's not an error if wildcards don't result in any matching files. To avoid these errors, you can use !include_try instead:

.. code-block:: none

   !include_try passwords.conf

Including a file preserves the context where it's included from.

Example:

.. code-block:: none

   protocol imap {
      plugin {
         !include imap-plugin-settings.conf
      }
   }

.. _external_config_files:

External config files
^^^^^^^^^^^^^^^^^^^^^
Due to historical reasons there are still some config files that are external to the main `dovecot.conf`, which are typically named `*.conf.ext`.

Example:

.. code-block:: none

   passdb/userdb { args } for ldap/sql points to a dovecot-ldap.conf.ext and dovecot-sql.conf.ext.

   dict { .. } points to dovecot-dict-*.conf.ext

Although these external config files look similar to the main `dovecot.conf` file, they have quite a lot of differences in details. Their parsing is done with a completely different config parser, so things like `filters`, `$variables`, `!includes` and `<files` don't work.

The external config files are also not loaded by the config process at startup, but instead they're parsed whenever the value is being used. So the external passdb/userdb files are loaded by auth process at startup, while the dict config is loaded by dict process at startup.

Eventually these external config files will hopefully be removed.

Long lines
^^^^^^^^^^
It's possible to split the setting values into multiple lines. Unfortunately this was broken for a long time, so outside `*.conf.ext` files this works only in

.. versionadded:: v2.2.22

.. code-block:: none

   # This works in *.conf.ext files, but in the main dovecot.conf only with v2.2.22+:
   setting_key = \
   long \
   value
   # equivalent to: "long value"

All the whitespace between lines is converted to a single space regardless of how many spaces or tabs are at the beginning of the line or before the '\'. Even if there is zero whitespace a single space is added.

Reading value from file
^^^^^^^^^^^^^^^^^^^^^^^

It's possible to read the value for a setting from a file:

.. code-block:: none

   key = </path/to/file

The value is read exactly as the entire contents of the file. This includes all the whitespace and newlines. The paths are relative to the currently parsed config file's directory, similar to how !include works. The file is read immediately whenever parsing the configuration file, so if it changes afterwards it requires a configuration reload to see the changes. This functionality is especially useful for reading SSL certificates and keys.

Variable expansion
^^^^^^^^^^^^^^^^^^

It's possible to refer to other earlier settings as $name.

Example:

.. code-block:: none

   key = value1
   key2 = $key value2
   # Equivalent to key2 = value1 value2

This is commonly used with `mail_plugins` settings to easily add more plugins e.g. inside imap protocol:

.. code-block:: none

   mail_plugins = acl quota
   protocol imap {
      mail_plugins = $mail_plugins imap_acl imap_quota
   }

However, you must be careful with the ordering of these in the configuration file, because the `$variables` are expanded immediately while parsing the config file and they're not updated later.

For example this is a common problem:

.. code-block:: none

   # NON-WORKING EXAMPLE
   # Enable ACL plugin:
   mail_plugins = $mail_plugins acl
   protocol imap {
      mail_plugins = $mail_plugins imap_acl
   }
   # Enable quota plugin:
   mail_plugins = $mail_plugins quota
   protocol imap {
     mail_plugins = $mail_plugins imap_quota
   }
   # The end result is:
   # mail_plugins = " acl quota" - OK
   # protocol imap {
   #   mail_plugins = " acl imap_acl imap_quota" - NOT OK
   # }
   # v2.2.24+ also gives a warning about this:
   # doveconf: Warning: /etc/dovecot/dovecot.conf line 8: Global setting mail_plugins won't change the setting inside an earlier filter at /etc/dovecot/dovecot.conf line 5 (if this is intentional, avoid this warning by moving the global setting before /etc/dovecot/dovecot.conf line 5)

This is because the second mail_plugins change that added `quota` globally didn't update anything inside the existing `protocol { .. }` or other filters.

Some variables exist in the plugin section only, such as `sieve_extensions`. Those variables cannot be referred to, that is `$sieve_extensions` won't work.

Environment variables
^^^^^^^^^^^^^^^^^^^^^

.. versionadded:: v2.3.14

It is possible use ``$ENV:name`` to expand values from environment.
Expansion only works when it's surrounded by spaces, and is not inside ``"quotes"`` or ``'quotes'``.
Note that these are also Case Sensitive.
These can also be used for external config files, but you need to list them in :ref:`setting-import_environment` so that processes can see them.
