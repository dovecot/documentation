.. _sieve_configuration:

==============================
Pigeonhole Sieve Configuration
==============================

.. contents::



.. _pigeonhole_configuration_script_locations:

Script Locations
----------------

The Sieve interpreter can retrieve Sieve scripts from several types of
locations. The default :ref:`file <pigeonhole_file>` location type is a directory containing
one or more Sieve script files with a symlink pointing to the active
one. More complex setups can use other location types such as :ref:`ldap <pigeonhole_ldap>`
or :ref:`dict <pigeonhole_dict>` to fetch Sieve scripts from remote databases.

All settings that specify the location of one or more Sieve scripts
accept the following syntax::

   <setting> = [<type>:]path[;<option>[=<value>][;...]]

The following script location types are implemented by default:

:ref:`file <pigeonhole_file>`
   The location path is a file system path pointing to a directory
   containing one or more script files with names structured as
   ``<script-name>.sieve`` with the active option (default
   ``~/.dovecot.sieve``) specifying a symlink to the one that will be used,
   or without the active option specified, it may be a script file
   instead of a directory.

:ref:`dict <pigeonhole_dict>`
   The location path is a Dovecot dict uri.

:ref:`ldap <pigeonhole_ldap>`
   LDAP database lookup. The location path is a configuration file with
   LDAP options.

If the type prefix is omitted, the script location type is :ref:`file <pigeonhole_file>` and
the location is interpreted as a local filesystem path pointing to a
Sieve script file or directory.

The following options are defined for all location types:

``name=<script-name>``
   Set the name of the Sieve script that this location points to. If the
   name of the Sieve script is not contained in the location path and
   the location of a single script is specified, this option is required
   (e.g. for :ref:`dict <pigeonhole_dict>` locations that must point to a particular script).
   If the name of the script is contained in the location path, the
   value of the name option overrides the name retrieved from the
   location. If the Sieve interpreter explicitly queries for a specific
   name (e.g. to let the Sieve `include
   extension <pigeonhole_extension_include>`
   retrieve a script from the :ref:`plugin-sieve-setting-sieve_global` location), this option
   has no effect.

``bindir=<dirpath>``
   Points to the directory where the compiled binaries for this script
   location are stored. This directory is created automatically if
   possible. If this option is omitted, the behavior depends on the
   location type. For :ref:`file <pigeonhole_file>` type locations, the binary is then stored
   in the same directory as where the script file was found if possible.
   For \`dict' type locations, the binary is not stored at all in that
   case. Don't specify the same directory for different script
   locations, as this will result in undefined behavior. Multiple mail
   users can share a single script directory if the script location is
   the same and all users share the same system credentials (uid, gid).

.. note::
  Pigeonhole versions before v0.3.1 do not support the location
  syntax described here. These versions only support bare filesystem paths
  pointing to files or directores as script storage location. Also, in
  that case a few additional :ref:`deprecated settings <pigeonhole_deprecated_settings>` are
  needed for configuration.

.. _pigeonhole_configuration_basic_configuration:

Basic Configuration
-------------------

To use Sieve, you will first need to make sure you are using Dovecot
:ref:`LDA <lda>` or :ref:`LMTP <lmtp_server>`
for delivering incoming mail to users' mailboxes. Then, you need to
enable the Pigeonhole Sieve plugin in your configuration:

::

   protocol lda {
     mail_plugins = $mail_plugins sieve
   }
   protocol lmtp {
     mail_plugins = $mail_plugins sieve
   }

The sieve plugin recognizes the following configuration options in the
``plugin`` section of the config file (default values are shown if
applicable):

:ref:`plugin-sieve-setting-sieve` = ``file:~/sieve;active=~/.dovecot.sieve``
   The location of the user's main Sieve script or script storage. The
   :ref:`LDA <lda>`
   Sieve plugin uses this to find the active script for Sieve filtering
   at delivery. The Sieve :ref:`include
   extension <pigeonhole_extension_include>`
   uses this location for retrieving ":personal" scripts.

   This location is also where the
   :ref:`ManageSieve <pigeonhole_managesieve_server>`
   service will store the user's scripts, if supported by the location
   type. For the :ref:`file <pigeonhole_file>` location type, the location will then be the
   path to the storage directory for all the user's personal Sieve
   scripts.
   :ref:`ManageSieve <pigeonhole_managesieve_server>`
   maintains a symbolic link pointing to the currently active script
   (the script executed at delivery). The location of this symbolic link
   can be configured using the ``;active=<path>`` option.

   For Pigeonhole versions before v0.3.1, this setting can only be a
   filesystem path pointing to a script file, or - when
   :ref:`ManageSieve <pigeonhole_managesieve_server>`
   is used - it is the location of the symbolic link pointing to the
   active script in the storage directory. That storage directory is
   then configured using the deprecated :ref:`plugin-sieve-setting-sieve_dir`  setting.

:ref:`plugin-sieve-setting-sieve_default` = (v0.3+)
   The location of the default personal sieve script file which gets
   executed ONLY if user's private Sieve script does not exist, e.g.
   ``file:/var/lib/dovecot/default.sieve`` (check the :ref:`multiscript
   section <pigeonhole_configuration_multiscript>` for instructions on running global Sieve
   scripts before and after the user's personal script). This is usually
   a global script, so be sure to pre-compile the specified script
   manually in that case using the ``sievec`` command line tool, as
   explained
   :doc:`here <usage>`.
   This setting used to be called :ref:`plugin-sieve-setting-sieve_global_path` , but that name
   is now deprecated.

:ref:`plugin-sieve-setting-sieve_default_name` = (v0.4.8+)
   The name by which the default Sieve script is visible to
   :ref:`ManageSieve <pigeonhole_managesieve_server>`
   clients. Normally, it is not visible at all. Refer to the :ref:`visible
   default script section <pigeonhole_configuration_visible_default_script>` for more
   information.

:ref:`plugin-sieve-setting-sieve_global`  =
   Location for :global include scripts for the Sieve :ref:`include
   extension <pigeonhole_extension_include>`.
   This setting used to be called :ref:`plugin-sieve-setting-sieve_global_dir`, but that name is
   now deprecated.

:ref:`plugin-sieve-setting-sieve_discard` = (v0.4.16+)
   The location of a Sieve script that is run for any message that is
   about to be discarded; i.e., it is not delivered anywhere by the
   normal Sieve execution. This only happens when the "implicit keep" is
   canceled, by e.g. the "discard" action, and no actions that deliver
   the message are executed. This "discard script" can prevent
   discarding the message, by executing alternative actions. If the
   discard script does nothing, the message is still discarded as it
   would be when no discard script is configured.

:ref:`plugin-sieve-setting-sieve_extensions`  =
   Which Sieve language extensions are available to users. By default,
   all supported extensions are available, except for deprecated
   extensions, extensions that add the ability to change messages,
   extensions that require explicit configuration or extensions that are
   still under development. Some system administrators may want to
   disable certain Sieve extensions or enable those that are not
   available by default. All supported extensions are listed
   :ref:`here <sieve_plugins>`.
   Normally, all enabled extensions must be listed for this setting, but
   starting with Pigeonhole verison 0.1.7, this setting can use '+' and '-'
   to specify differences relative to the default. For example
   :ref:`plugin-sieve-setting-sieve_extensions` = +imapflags will enable the `deprecated
   imapflags
   extension <http://tools.ietf.org/html/draft-melnikov-sieve-imapflags-03>`__
   in addition to all extensions enabled by default.

:ref:`plugin-sieve-setting-sieve_global_extensions` = (v0.3+)
   Which Sieve language extensions are ONLY avalable in global scripts.
   This can be used to restrict the use of certain Sieve extensions to
   administrator control, for instance when these extensions can cause
   security concerns. This setting has higher precedence than the
   :ref:`plugin-sieve-setting-sieve_extensions`  setting (above), meaning that the extensions
   enabled with this setting are never available to the user's personal
   script no matter what is specified for the :ref:`plugin-sieve-setting-sieve_extensions`
   setting. The syntax of this setting is similar to the
   :ref:`plugin-sieve-setting-sieve_extensions` setting, with the difference that extensions are
   enabled or disabled for exclusive use in global scripts. Currently,
   no extensions are marked as such by default.

:ref:`plugin-sieve-setting-sieve_implicit_extensions` = (v0.4.13+)
   Which Sieve language extensions are implicitly available to users.
   The extensions listed in this setting do not need to be enabled
   explicitly using the Sieve "require" command. This behavior directly
   violates the Sieve standard, but can be necessary for compatibility
   with some existing implementations of Sieve (notably jSieve). Do not
   use this setting unless you really need to! The syntax and semantics
   of this setting are otherwise identical to the :ref:`plugin-sieve-setting-sieve_extensions`
   setting.

:ref:`plugin-sieve-setting-sieve_plugins` =
   The Pigeonhole Sieve interpreter can have plugins of its own. Using
   this setting, the used plugins can be specified. Check the :ref:`sieve_plugins`
   for available plugins.

:ref:`plugin-sieve-setting-sieve_user_email` = (v0.4.14+)
   The primary e-mail address for the user. This is used as a default
   when no other appropriate address is available for sending messages.
   If this setting is not configured, either the postmaster or null "<>"
   address is used as a sender, depending on the action involved. This
   setting is important when there is no message envelope to extract
   addresses from, such as when the script is executed in IMAP.

:ref:`plugin-sieve-setting-sieve_user_log` =
   The path to the file where the user log file is written. If not
   configured, a default location is used. If the main user's personal
   Sieve (as configured with :ref:`plugin-sieve-setting-sieve`) is a :ref:`file <pigeonhole_file>`, the logfile is set
   to ``<filename>.log`` by default. If it is not a file, the default
   user log file is ``~/.dovecot.sieve.log``.

:ref:`setting-recipient_delimiter` = +
   The separator that is expected between the :user and :detail address
   parts introduced by the `subaddress
   extension <http://tools.ietf.org/html/rfc5233/>`__. This may also be
   a sequence of characters (e.g. '--'). The current implementation
   looks for the separator from the left of the localpart and uses the
   first one encountered. The :user part is left of the separator and
   the :detail part is right. This setting is also used by Dovecot's
   :ref:`LMTP <lmtp_server>`
   service with identical semantics.

:ref:`plugin-sieve-setting-sieve_redirect_envelope_from` = sender (v0.4.4+)
   Specifies what envelope sender address is used for redirected
   messages. Normally, the Sieve "redirect" command copies the sender
   address for the redirected message from the processed message. So,
   the redirected message appears to originate from the original sender.
   The following values are supported for this setting:

   "sender"
      The sender address is used (default)

   "recipient"
      The final recipient address is used

   "orig_recipient"
      The original recipient is used

   "user_email" (v0.4.14+)
      The user's primary address is used. This is configured with the
      "sieve_user_email" setting. If that setting is not configured,
      "user_mail" is equal to "sender" (the default).

   "postmaster"
      The postmaster_address configured for LDA/LMTP.

   ``"<user@domain>"``
      Redirected messages are always sent from ``user@domain``. The angle
      brackets are mandatory. The null "<>" address is also supported.

   When the envelope sender of the processed message is the null address
   "<>", the envelope sender of the redirected message is also always
   "<>", irrespective of what is configured for this setting.

For example:

::

   plugin {
   ...
      # The location of the user's main script storage. The active script
      # in this storage is used as the main user script executed during
      # delivery. The include extension fetches the :personal scripts
      # from this location. When ManageSieve is used, this is also where
      # scripts are uploaded. This example uses the file system as
      # storage, with all the user's scripts located in the directory
      # `~/sieve' and the active script (symbolic link) located at
      # `~/.dovecot.sieve'.
      sieve = file:~/sieve;active=~/.dovecot.sieve

      # If the user has no personal active script (i.e. if the location
      # indicated in sieve= does not exist or has no active script), use
      # this one:
      sieve_default = /var/lib/dovecot/sieve/default.sieve

      # The include extension fetches the :global scripts from this
      # location.
      sieve_global = /var/lib/dovecot/sieve/global/
   }

Configurable Limits
-------------------

:ref:`plugin-sieve-setting-sieve_max_script_size` = 1M
   The maximum size of a Sieve script. The compiler will refuse to
   compile any script larger than this limit. If set to 0, no limit on
   the script size is enforced.

:ref:`plugin-sieve-setting-sieve_max_actions` = 32
   The maximum number of actions that can be performed during a single
   script execution. If set to 0, no limit on the total number of
   actions is enforced.

:ref:`plugin-sieve-setting-sieve_max_redirects` = 4
   The maximum number of redirect actions that can be performed during a
   single script execution. The meaning of 0 differs based on your
   version. For versions v0.3.0 and beyond this means that redirect is
   prohibited. For older versions, however, this means that the number
   of redirects is *unlimited*, so be careful.

Extension-specific Configuration
--------------------------------

The following Sieve language extensions have specific configuration
options/needs:

-  :doc:`extensions/duplicate`

-  :doc:`extensions/editheader`
   (configuration required)

-  :doc:`plugins/extprograms`
   (plugin configuration required)

-  :doc:`plugins/imapsieve`
   (plugin configuration required)

-  :doc:`extensions/include`

-  :doc:`spamtest and virustest <extensions/spamtest_virustest>`
   (configuration required)

-  :doc:`vacation and vacation-seconds <extensions/vacation>`

-  :doc:`extensions/vacation`

Per-user Sieve script location
------------------------------

By default, the Dovecot Sieve plugin looks for the user's Sieve script
file in the user's home directory (``~/.dovecot.sieve``). This requires
that the :ref:`home
directory <home_directories_for_virtual_users>`
is set for the user.

If you want to store the script elsewhere, you can override the default
using the ``sieve`` setting, which specifies the path to the user's
script file. This can be done in two ways:

1. Define the ``sieve`` setting in the plugin section of
   ``dovecot.conf``.

2. Return ``sieve`` extra field from :ref:`userdb extra
   fields <authentication-user_database_extra_fields>`.

For example, to use a Sieve script file named ``<username>.sieve`` in
``/var/sieve-scripts``, use:

::

   plugin {
   ...

    sieve = /var/sieve-scripts/%u.sieve
   }

You may use templates like %u, as shown in the example. See all
:ref:`variables <config_variables>`.

A relative path (or just a filename) will be interpreted to point under
the user's home directory.

.. _pigeonhole_configuration_multiscript:

Executing Multiple Scripts Sequentially
---------------------------------------

The Dovecot Sieve plugin allows executing multiple Sieve scripts
sequentially. The extra scripts can be executed before and after the
user's private script. For example, this allows executing global Sieve
policies before the user's script. This is not possible using the
:ref:`plugin-sieve-setting-sieve_default`  setting, because that is only used when the user's
private script does not exist. The following settings in the ``plugin``
section of the Dovecot config file control the execution sequence:

:ref:`plugin-sieve-setting-sieve_before` =

sieve_before2 =

``sieve_before3 = (etc..)``
   Location Sieve of scripts that need to be executed before the user's
   personal script. If a :ref:`file <pigeonhole_file>` location path points to a directory,
   all the Sieve scripts contained therein (with the proper ``.sieve``
   extension) are executed. The order of execution within that directory
   is determined by the file names, using a normal 8bit per-character
   comparison. Multiple script locations can be specified by appending
   an increasing number to the setting name. The Sieve scripts found
   from these locations are added to the script execution sequence in
   the specified order. Reading the numbered sieve_before settings stops
   at the first missing setting, so no numbers may be skipped.

:ref:`plugin-sieve-setting-sieve_after` =

sieve_after2 =

``sieve_after3 = (etc..)``
   Identical to :ref:`plugin-sieve-setting-sieve_before` , but the specified scripts are executed
   after the user's script (only when keep is still in effect, as
   explained below).

The script execution ends when the currently executing script in the
sequence does not yield a "keep" result: when the script terminates, the
next script is only executed if an implicit or explicit "keep" is in
effect. Thus, to end all script execution, a script must not execute
keep and it must cancel the implicit keep, e.g. by executing
"``discard; stop;``". This means that the command "``keep;``" has
different semantics when used in a sequence of scripts. For normal Sieve
execution, "``keep;``" is equivalent to "``fileinto "INBOX";``", because
both cause the message to be stored in INBOX. However, in sequential
script execution, it only controls whether the next script is executed.
Storing the message into INBOX (the default folder) is not done until
the last script in the sequence executes (implicit) keep. To force
storing the message into INBOX earlier in the sequence, the fileinto
command can be used (with "``:copy``" or together with "``keep;``").

Apart from the keep action, all actions triggered in a script in the
sequence are executed before continuing to the next script. This means
that when a script in the sequence encounters an error, actions from
earlier executed scripts are not affected. The sequence is broken
however, meaning that the script execution of the offending script is
aborted and no further scripts are executed. An implicit keep is
executed in stead.

Just as for executing a single script the normal way, the Dovecot Sieve
plugin takes care never to duplicate deliveries, forwards or responses.
When vacation actions are executed multiple times in different scripts,
the usual error is not triggered: the subsequent duplicate vacation
actions are simply discarded.

For example:

::

   plugin {
   ...
      # Global scripts executed before the user's personal script.
      #   E.g. handling messages marked as dangerous
      sieve_before = /var/lib/dovecot/sieve/discard-virusses.sieve

      # Domain-level scripts retrieved from LDAP
      sieve_before2 = ldap:/etc/dovecot/sieve-ldap.conf;name=ldap-domain

      # User-specific scripts executed before the user's personal script.
      #   E.g. a vacation script managed through a non-ManageSieve GUI.
      sieve_before3 = /var/vmail/%d/%n/sieve-before

      # User-specific scripts executed after the user's personal script.
      # (if keep is still in effect)
      #   E.g. user-specific default mail filing rules
      sieve_after = /var/vmail/%d/%n/sieve-after

      # Global scripts executed after the user's personal script
      # (if keep is still in effect)
      #   E.g. default mail filing rules.
      sieve_after2 = /var/lib/dovecot/sieve/after.d/
   }
   }

.. note::
   Be sure to manually pre-compile the scripts specified by
   :ref:`plugin-sieve-setting-sieve_before` and :ref:`plugin-sieve-setting-sieve_after` using the ``sievec`` tool, as
   explained :doc:`here <usage>`.

.. _pigeonhole_configuration_visible_default_script:

Visible Default Script
----------------------

The :ref:`plugin-sieve-setting-sieve_default`  setting specifies the location of a default
script that is executed when the user has no active personal script.
Normally, this default script is invisible to the user; i.e., it is not
listed in
:ref:`ManageSieve <pigeonhole_managesieve_server>`.
To give the user the ability to see and read the default script, it is
possible to make it visible under a specific configurable name using the
:ref:`plugin-sieve-setting-sieve_default_name`  setting. This feature is only supported for
Pigeonhole versions 0.4.8 and higher.

ManageSieve will magically list the default script under that name, even
though it does not actually exist in the user's normal script storage
location. This way, the ManageSieve client can see that it exists and it
can retrieve its contents. If no normal script is active, the default is
always listed as active. The user can replace the default with a custom
script, by uploading it under the default script's name. If that custom
script is ever deleted, the default script will reappear from the
shadows implicitly.

This way, ManageSieve clients will not need any special handling for
this feature. If the name of the default script is equal to the name the
client uses for the main script, it will initially see and read the
default script when the user account is freshly created. The user can
edit the script, and when the edited script is saved through the
ManageSieve client, it will will override the default script. If the
user ever wants to revert to the default, the user only needs to delete
the edited script and the default will reappear.

The name by which the default script will be known is configured using
the :ref:`plugin-sieve-setting-sieve_default_name` setting. Of course, the :ref:`plugin-sieve-setting-sieve_default`
setting needs to point to a valid script location as well for this to
work. If the default script does not exist at the indicated location, it
is not shown.

For example:

::

   plugin {
   ...
     sieve = file:~/sieve;active=~/.dovecot.sieve

     sieve_default = /var/lib/dovecot/sieve/default.sieve
     sieve_default_name = roundcube
   }

.. _pigeonhole_trace_debugging:

Trace Debugging
---------------

Trace debugging provides detailed insight in the operations performed by
the Sieve script. Messages about what the Sieve script is doing are
written to the specified directory. This feature is only supported for
Pigeonhole versions 0.4.14 and higher.

.. warning::
  On a busy server, this functionality can quickly fill up
  the trace directory with a lot of trace files. Enable this only
  temporarily and as selective as possible; e.g., enable this only for a
  few users by returning the settings below from userdb as :ref:`userdb extra
  fields <authentication-user_database_extra_fields>`,
  rather than enabling these for everyone.

The following settings apply to both the LDA/LMTP Sieve plugin and the
:doc:`IMAPSieve <plugins/imapsieve>` plugin:

:ref:`plugin-sieve-setting-sieve_trace_dir` =
   The directory where trace files are written. Trace debugging is
   disabled if this setting is not configured or if the directory does
   not exist. If the path is relative or it starts with "~/" it is
   interpreted relative to the current user's home directory.

:ref:`plugin-sieve-setting-sieve_trace_level` =
   The verbosity level of the trace messages. Trace debugging is
   disabled if this setting is not configured. Possible values are:

   "actions"
      Only print executed action commands, like keep, fileinto, reject
      and redirect.

   "commands"
      Print any executed command, excluding test commands.

   "tests"
      Print all executed commands and performed tests.

   "matching"
      Print all executed commands, performed tests and the values
      matched in those tests.

:ref:`plugin-sieve-setting-sieve_trace_debug` = no
   Enables highly verbose debugging messages that are usually only
   useful for developers.

:ref:`plugin-sieve-setting-sieve_trace_addresses` = no
   Enables showing byte code addresses in the trace output, rather than
   only the source line numbers.


.. _pigeonhole_deprecated_settings:

Deprecated Settings
-------------------

These settings are deprecated in newer versions, but still recognized:

:ref:`plugin-sieve-setting-sieve_global_path` = (< v0.2)
   The deprecated name for the :ref:`plugin-sieve-setting-sieve_default`  setting.

:ref:`plugin-sieve-setting-sieve_dir` = ~/sieve (< v0.3.1)
   Directory for :personal include scripts for the :ref:`include
   extension <pigeonhole_extension_include>`.
   The Sieve interpreter only recognizes files that end with a
   ``.sieve`` extension, so the include extension expects a file called
   ``name.sieve`` to exist in the :ref:`plugin-sieve-setting-sieve_dir`  directory for a script
   called ``name``. When using
   `ManageSieve <pigeonhole_managesieve_server>`,
   this is also the directory where scripts are uploaded. For recent
   Pigeonhole versions, this location is configured as part of the
   ``sieve`` setting.

:ref:`plugin-sieve-setting-sieve_global_dir` = (< v0.3.1)
   Directory for :global include scripts for the :ref:`include
   extension <pigeonhole_extension_include>`.
   The Sieve interpreter only recognizes files that end with a
   ``.sieve`` extension, so the include extension expects a file called
   ``name.sieve`` to exist in the :ref:`plugin-sieve-setting-sieve_global_dir`  directory for a
   script called ``name``. For recent Pigeonhole versions, a more
   generic version of this setting is called :ref:`plugin-sieve-setting-sieve_global`  and allows
   locations other than file system directories.

.. _pigeonhole_migration:

Migration
---------

General Dovecot 2.0 changes
~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  Note that the Dovecot v2.0
   :ref:`LDA <lda>`
   does not create mailfolders automatically by default anymore. If your
   configuration relies on this, you need to enable the
   :ref:`setting-lda_mailbox_autocreate` setting for
   :ref:`LDA <lda>`
   or start using the Sieve mailbox extension's ``:create`` tag for
   **fileinto** commands.

-  Dovecot v2.0 adds support for :ref:`LMTP <lmtp_server>`.
   Much like the :ref:`LDA <lda>` it can make use of the Pigeonhole Sieve plugin.
   Since the :ref:`LMTP <lmtp_server>`
   service has its own ``prototocol lmtp`` section in the config file,
   you need to add the Sieve plugin to the :ref:`setting-mail_plugins` setting
   there too when you decide to use :ref:`LMTP <lmtp_server>`.

From CMUSieve (Dovecot v1.0/v1.1)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

For the most part, migration from CMUSieve to Pigeonhole Sieve is just a
matter of changing the used plugin name from **cmusieve** to **sieve**
in the :ref:`setting-mail_plugins` option in the ``protocol lda`` section of the
config file (as explained :ref:`above <pigeonhole_configuration_basic_configuration>`).
However, there are a few important differences in the supported Sieve language features:

-  The **imapflags** extension is now called **imap4flags**. The
   CMUSieve implementation is based on an `old draft
   specification <http://tools.ietf.org/html/draft-melnikov-sieve-imapflags-03>`__
   that is not completely compatible with the `new
   version <http://tools.ietf.org/html/rfc5232/>`__. Particularly, the
   **mark** and **unmark** commands were removed from the new
   specification. For backwards compatibility, support for the old
   imapflags extension can be enabled using the :ref:`plugin-sieve-setting-sieve_extensions`
   setting (as explained `above <#configuration>`__). This is disabled
   by default.

-  The **notify** extension is now called **enotify**. The CMUSieve
   implementation is based on an `old draft
   specification <http://tools.ietf.org/html/draft-martin-sieve-notify-01>`__
   that is not completely compatible with the `new
   version <http://tools.ietf.org/html/rfc5435/>`__. Particularly, the
   **denotify** command and **$text$** substitutions were removed from
   the new specification. For backwards compatibility, support for the
   old imapflags extension can be enabled using the :ref:`plugin-sieve-setting-sieve_extensions`
   setting. This is disabled by default.

-  The :ref:`include
   extension <pigeonhole_extension_include>`
   now requires your script *file* names to end with ".sieve". This
   means that ``include :personal "myscript"`` won't work unless your
   script file is called "``myscript.sieve``" on disk. Also note that
   the "``.sieve``" extension has no special meaning within the Sieve
   script; if you ``include "myscript.sieve"``, the Sieve interpreter
   will look for a script file called ``myscript.sieve.sieve`` and not
   ``myscript.sieve``.

-  Be sure to use **UTF8** for the mailbox argument of the **fileinto**
   command. Older CMUSieve installations used modified UTF7 (as IMAP
   does) for the mailbox parameter. If not adjusted, the Pigeonhole
   Sieve plugin will use the wrong folder name for storing the message.

From Dovecot Sieve v0.1.x (Dovecot v1.2)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

-  The :ref:`plugin-sieve-setting-sieve_subaddress_sep` setting for the `Sieve subaddress
   extension <http://tools.ietf.org/html/rfc5233/>`__ is now known as
   :ref:`setting-recipient_delimiter`. Although :ref:`plugin-sieve-setting-sieve_subaddress_sep` is still
   recognized for backwards compatibility, it is recommended to update
   the setting to the new name, since the :ref:`LMTP <lmtp_server>`
   service also uses the :ref:`setting-recipient_delimiter` setting.
