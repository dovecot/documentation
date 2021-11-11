.. _setting-pigeonhole:

===================
Pigeonhole Settings
===================

See :ref:`settings` for list of all setting groups.

Global Settings
^^^^^^^^^^^^^^^

.. pigeonhole:setting:: managesieve_client_workarounds
   :values: !<none>

Enables various workarounds for ManageSieve clients. Currently there are none.


.. pigeonhole:setting:: managesieve_implementation_string
   :default: Dovecot Pigeonhole
   :values: @string

To fool ManageSieve clients that are focused on CMU's timesieved you can
specify the ``IMPLEMENTATION`` capability that the Dovecot reports to clients
(e.g. ``Cyrus timsieved v2.2.13``).


.. pigeonhole:setting:: managesieve_logout_format
   :default: bytes=%i/%o
   :values: @string

Specifies the string pattern used to compose the logout message of an
authenticated session. The following substitutions are available:

+--------+-----------------------------------------+
| ``%i`` | Total number of bytes read from client. |
+--------+-----------------------------------------+
| ``%o`` | Total number of bytes sent to client.   |
+--------+-----------------------------------------+


.. pigeonhole:setting:: managesieve_max_compile_errors
   :default: 5
   :values: @uint

The maximum number of compile errors that are returned to the client upon
script upload or script verification.


.. pigeonhole:setting:: managesieve_max_line_length
   :default: 65536
   :values: @uint

The maximum ManageSieve command line length in bytes.

Since long command lines are very unlikely with ManageSieve, changing this
will generally not be useful.


.. pigeonhole:setting:: managesieve_notify_capability
   :default: !<dynamically determined>
   :values: @string

``NOTIFY`` capabilities reported by the ManageSieve service before
authentication.

If left unassigned, these will be assigned dynamically according to what the
Sieve interpreter supports by default (after login this may differ depending
on the authenticated user).


.. pigeonhole:setting:: managesieve_sieve_capability
   :default: fileinto reject envelope encoded-character vacation subaddress comparator-i;ascii-numeric relational regex imap4flags copy include variables body enotify environment mailbox date index ihave duplicate mime foreverypart extracttext
   :values: @string

``SIEVE`` capabilities reported by the ManageSieve service before
authentication.

If left unassigned, these will be assigned dynamically according to what the
Sieve interpreter supports by default (after login this may differ depending
on the authenticated user).


Sieve Plugin Settings
^^^^^^^^^^^^^^^^^^^^^

.. pigeonhole:setting:: sieve
   :default: file:~/sieve;active=~/.dovecot.sieve
   :plugin: yes
   :values: @string

The location of the user's main Sieve script or script storage.

The LDA Sieve plugin uses this to find the active script for Sieve filtering
at delivery.

The Sieve include extension uses this location for retrieving ``:personal``
scripts.

This location is also where the ManageSieve service will store the user's
scripts, if supported by the location type.

For the file location type, the location will then be the path to the storage
directory for all the user's personal Sieve scripts.

ManageSieve maintains a symbolic link pointing to the currently active script
(the script executed at delivery).  The location of this symbolic link can be
configured using the ``;active=<path>`` option.

.. versionchanged:: v0.3.1

  For Pigeonhole versions before v0.3.1, this setting can only be a
  filesystem path pointing to a script file, or - when ManageSieve is used -
  it is the location of the symbolic link pointing to the active script in the
  storage directory. That storage directory is then configured using the
  deprecated :pigeonhole:ref:`sieve_dir` setting.

.. seealso:: :ref:`pigeonhole_configuration_script_locations`


.. pigeonhole:setting:: sieve_after
   :plugin: yes
   :values: @string

This setting can be specified multiple times by adding a number after the
setting name, such as ``sieve_after2`` and so on.

:ref:`Location <pigeonhole_configuration_script_locations>` of scripts that
need to be executed after the user's personal script.

If a :ref:`file <pigeonhole_file>` location path points to a directory, all
the Sieve scripts contained therein (with the proper .sieve extension) are
executed. The order of execution within that directory is determined by the
file names, using a normal 8bit per-character comparison.

Multiple script locations can be specified by appending an increasing number
to the setting name.

The Sieve scripts found from these locations are added to the script execution
sequence in the specified order.

Reading the numbered :pigeonhole:ref:`sieve_before` settings stops at the
first missing setting, so no numbers may be skipped.


.. pigeonhole:setting:: sieve_before
   :plugin: yes
   :values: @string

This setting can be specified multiple times by adding a number after the
setting name, such as ``sieve_before2`` and so on.

See :pigeonhole:ref:`sieve_after` for configuration details, as this setting
behaves the same way, except the scripts are run **before** user's personal
scripts (instead of **after**).


.. pigeonhole:setting:: sieve_default
   :added: v0.3.0
   :plugin: yes
   :values: @string

The :ref:`location <pigeonhole_configuration_script_locations>` of the default
personal sieve script file which gets executed ONLY if user's private Sieve
script does not exist, e.g. ``file:/var/lib/dovecot/default.sieve`` (check
the :ref:`multiscript section <pigeonhole_configuration_multiscript>` for
instructions on running global Sieve scripts before and after the user's
personal script).

This is usually a global script, so be sure to pre-compile the specified
script manually in that case using the sievec command line tool, as
explained :ref:`here <sieve_usage-compiling_sieve_script>`.

This setting used to be called :pigeonhole:ref:`sieve_global_path`, but that
name is now deprecated.


.. pigeonhole:setting:: sieve_default_name
   :added: v0.4.8
   :plugin: yes
   :values: @string

The name by which the default Sieve script is visible to ManageSieve clients.
Normally, it is not visible at all.

.. seealso:: :ref:`pigeonhole_configuration_visible_default_script`


.. pigeonhole:setting:: sieve_dir
   :default: ~/sieve
   :plugin: yes
   :values: @string

.. deprecated:: 0.3.1

   This location is configured as part of
   :pigeonhole:ref:`sieve setting <sieve>`.

Directory for :personal
`include scripts <http://tools.ietf.org/html/draft-ietf-sieve-include-05>`_
for the include extension.

The Sieve interpreter only recognizes files that end with a .sieve extension,
so the include extension expects a file called name.sieve to exist in this
directory for a script called name.

When using ManageSieve, this is also the directory where scripts are uploaded.


.. pigeonhole:setting:: sieve_discard
   :added: v0.4.16
   :plugin: yes
   :values: @string

The location of a Sieve script that is run for any message that is about to be
discarded; i.e., it is not delivered anywhere by the normal Sieve execution.

This only happens when the "implicit keep" is canceled, by e.g. the "discard"
action, and no actions that deliver the message are executed.

This "discard script" can prevent discarding the message, by executing
alternative actions.

If the discard script does nothing, the message is still discarded as it would be when no discard script is configured.


.. pigeonhole:setting:: sieve_extensions
   :default: !<see description>
   :plugin: yes
   :values: @string

The Sieve language extensions available to users.

By default, all supported extensions are available, except for deprecated
extensions, extensions that add the ability to change messages, extensions
that require explicit configuration, or extensions that are still under
development.

Some system administrators may want to disable certain Sieve extensions or
enable those that are not available by default.

All supported extensions are listed :ref:`here <sieve_plugins>`. Normally, all
enabled extensions must be listed for this setting, but starting with Sieve
version 0.1.7, this setting can use '+' and '-' to specify differences
relative to the default.

For example:

.. code-block:: none

  # Enable the deprecated ``imapflags`` extension in addition to all
  # extensions enabled by default.
  plugin {
    sieve_extensions = +imapflags``
  }


.. pigeonhole:setting:: sieve_global
   :added: v0.3.1
   :plugin: yes
   :values: @string

Location for ``:global`` include scripts for the Sieve include extension.

This setting used to be called :pigeonhole:ref:`sieve_global_dir`, but that
name is now deprecated.


.. pigeonhole:setting:: sieve_global_dir
   :plugin: yes
   :values: @string

.. deprecated:: v0.3.1

   A more generic version of this setting called
   :pigeonhole:ref:`sieve_global` has been added and allows locations other
   than file system directories.

Directory for ``:global`` include scripts for the include extension.

The Sieve interpreter only recognizes files that end with a .sieve extension,
so the include extension expects a file called name.sieve to exist in this
directory for a script called name.


.. pigeonhole:setting:: sieve_global_extensions
   :added: v0.3
   :default: @sieve_extensions;pigeonhole
   :plugin: yes
   :values: @string

Which Sieve language extensions are **only** available in global scripts.

This can be used to restrict the use of certain Sieve extensions to
administrator control, for instance when these extensions can cause security
concerns.

This setting has higher precedence than the :pigeonhole:ref:`sieve_extensions`
setting, meaning that the extensions enabled with this setting are never
available to the user's personal script no matter what is specified for the
sieve_extensions setting.

The syntax of this setting is similar to the :pigeonhole:ref:`sieve_extensions`
setting, with the difference that extensions are enabled or disabled for
exclusive use in global scripts.

Currently, no extensions are marked as such by default.


.. pigeonhole:setting:: sieve_global_path
   :plugin: yes
   :values: @string

.. deprecated:: 0.2

   Replaced by :pigeonhole:ref:`sieve_default`.


.. pigeonhole:setting:: sieve_implicit_extensions
   :added: v0.4.13
   :plugin: yes
   :values: @string

The Sieve language extensions implicitly available to users.

The extensions listed in this setting do not need to be enabled explicitly
using the Sieve "require" command.

This behavior directly violates the Sieve standard, but can be necessary for
compatibility with some existing implementations of Sieve (notably jSieve).

Do not use this setting unless you really need to!

The syntax and semantics of this setting are otherwise identical to
:pigeonhole:ref:`sieve_extensions`.


.. pigeonhole:setting:: sieve_max_actions
   :default: 32
   :plugin: yes
   :values: @uint

The maximum number of actions that can be performed during a single script
execution.

If set to ``0``, no limit on the total number of actions is enforced.


.. pigeonhole:setting:: sieve_max_redirects
   :default: 4
   :plugin: yes
   :values: @uint

The maximum number of redirect actions that can be performed during a single
script execution.

``0`` means redirect is prohibited.

The meaning of 0 differs based on your version. For versions v0.3.0 and beyond
this means that redirect is prohibited.

.. versionchanged:: v0.3

   In prior versions, ``0`` means the number of redirects is unlimited.


.. pigeonhole:setting:: sieve_max_script_size
   :default: 1M
   :plugin: yes
   :values: @size

The maximum size of a Sieve script. The compiler will refuse to compile any
script larger than this limit.

If set to ``0``, no limit on the script size is enforced.


.. pigeonhole:setting:: sieve_plugins
   :plugin: yes
   :values: @string

The Pigeonhole Sieve interpreter can have plugins of its own.

Using this setting, the used plugins can be specified. Plugin names should be
space-separated in the setting.

Check the :ref:`Sieve plugin section <sieve_plugins>` for available plugins.


.. pigeonhole:setting:: sieve_redirect_envelope_from
   :added: v0.4.4
   :default: sender
   :plugin: yes
   :values: @string

Specifies what envelope sender address is used for redirected messages.

Normally, the Sieve ``redirect`` command copies the sender address for the
redirected message from the processed message  So, the redirected message
appears to originate from the original sender.

The following options are supported for this setting:

=================== ==========================================================
Option              Description      
=================== ==========================================================
``sender``          The sender address is used
``recipient``       The final recipient address is used
``orig_recipient``  The original recipient is used
``user_email``      The user's primary address is used. This is configured
                    with the :pigeonhole:ref:`sieve_user_email` setting.
                    If that setting is not configured, ``user_email`` is equal
                    to ``sender``.

                    .. versionadded:: 0.4.14
``postmaster``      The :dovecot_core:ref:`postmaster_address` configured for
                    LDA/LMTP.
``<user@domain>``   Redirected messages are always sent from ``user@domain``.
                    The angle brackets are mandatory. The null ``<>`` address
                    is also supported.
=================== ==========================================================

When the envelope sender of the processed message is the null address ``<>``,
the envelope sender of the redirected message is also always ``<>``,
irrespective of what is configured for this setting.


.. pigeonhole:setting:: sieve_subaddress_sep
   :default: +
   :plugin: yes
   :removed: v0.2 Replaced with :dovecot_core:ref:`recipient_delimiter`
   :values: @string

The separator that is expected between the ``:user`` and ``:detail`` address
parts introduced by the
`subaddress extension <http://tools.ietf.org/html/rfc5233/>`_.

This may also be a sequence of characters (e.g. ``--``).

The current implementation looks for the separator from the left of the
localpart and uses the first one encountered.

The ``:user`` part is left of the separator and the ``:detail`` part is right.


.. pigeonhole:setting:: sieve_trace_addresses
   :default: no
   :plugin: yes
   :values: @boolean

Enables showing byte code addresses in the trace output, rather than only the
source line numbers.

.. seealso:: :ref:`pigeonhole_trace_debugging`


.. pigeonhole:setting:: sieve_trace_debug
   :default: no
   :plugin: yes
   :values: @boolean

Enables highly verbose debugging messages that are usually only useful for
developers.

.. seealso:: :ref:`pigeonhole_trace_debugging`


.. pigeonhole:setting:: sieve_trace_dir
   :plugin: yes
   :values: @string

The directory where trace files are written.

Trace debugging is disabled if this setting is not configured or if the
directory does not exist.

If the path is relative or it starts with ``~/`` it is interpreted relative to
the current user's home directory.

.. seealso:: :ref:`pigeonhole_trace_debugging`


.. pigeonhole:setting:: sieve_trace_level
   :plugin: yes
   :values: actions, commands, tests, matching

The verbosity level of the trace messages. Trace debugging is disabled if this
setting is not configured. Options are:

============= ==================================================================
Option        Description      
============= ==================================================================
``actions``   Only print executed action commands, like keep, fileinto, reject
              and redirect.
``commands``  Print any executed command, excluding test commands.
``tests``     Print all executed commands and performed tests.
``matching``  Print all executed commands, performed tests and the values
              matched in those tests.
============= ==================================================================

.. seealso:: :ref:`pigeonhole_trace_debugging`


.. pigeonhole:setting:: sieve_user_email
   :added: v0.4.14
   :plugin: yes
   :values: @string

The primary e-mail address for the user.

This is used as a default when no other appropriate address is available for
sending messages.

If this setting is not configured, either the postmaster or null ``<>``
address is used as a sender, depending on the action involved.

This setting is important when there is no message envelope to extract
addresses from, such as when the script is executed in IMAP.


.. pigeonhole:setting:: sieve_user_log
   :plugin: ~/.dovecot.sieve.log
   :values: @string

The path to the file where the user log file is written. If not configured, a
default location is used.

If the main user's personal Sieve (as configured with :pigeonhole:ref:`sieve`)
is a file, the logfile is set to ``<filename>.log`` by default.

If it is not a file, the default user log file is ``~/.dovecot.sieve.log``.
