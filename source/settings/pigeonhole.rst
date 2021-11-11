.. _setting-pigeonhole:

===================
Pigeonhole settings
===================

See :ref:`settings` for list of all setting groups.

Global settings
^^^^^^^^^^^^^^^

.. _setting-managesieve_client_workarounds:

``managesieve_client_workarounds``
----------------------------------

 - Default: <empty>
 - Value: none exists

Enables various workarounds for ManageSieve clients. Currently there are none.


.. _setting-managesieve_implementation_string:

``managesieve_implementation_string``
-------------------------------------

 - Default: ``Dovecot Pigeonhole``
 - Value: :ref:`string`

To fool ManageSieve clients that are focused on CMU's timesieved you can specify the ``IMPLEMENTATION`` capability that the Dovecot reports to clients (e.g. ``Cyrus timsieved v2.2.13``).


.. _setting-managesieve_logout_format:

``managesieve_logout_format``
-----------------------------

 - Default: ``bytes=%i/%o``
 - Value: :ref:`string`

Specifies the string pattern used to compose the logout message of an authenticated session. The following substitutions are available:

+--------+-----------------------------------------+
| ``%i`` | Total number of bytes read from client. |
+--------+-----------------------------------------+
| ``%o`` | Total number of bytes sent to client.   |
+--------+-----------------------------------------+


.. _setting-managesieve_max_compile_errors:

``managesieve_max_compile_errors``
----------------------------------

  - Default: ``5``
  - Value: :ref:`uint`

The maximum number of compile errors that are returned to the client upon script upload or script verification.

.. _setting-managesieve_max_line_length:

``managesieve_max_line_length``
-------------------------------

 - Default: ``65536``
 - Value: :ref:`uint`

The maximum ManageSieve command line length in bytes. This setting is directly borrowed from IMAP. But,
since long command lines are very unlikely with ManageSieve, changing this will not be very useful.

.. _setting-managesieve_notify_capability:

``managesieve_notify_capability``
---------------------------------

 - Default: dynamically determined
 - Value: :ref:`string`

``NOTIFY`` capabilities reported by the ManageSieve service before authentication.
If left unassigned, these will be assigned dynamically according to what the Sieve interpreter supports by default (after login this may differ depending on the authenticated user).


.. _setting-managesieve_sieve_capability:

``managesieve_sieve_capability``
--------------------------------

  - Default: ``fileinto reject envelope encoded-character vacation subaddress comparator-i;ascii-numeric relational regex imap4flags copy include variables body enotify environment mailbox date index ihave duplicate mime foreverypart extracttext``
  - Value:

``SIEVE`` capabilities reported by the ManageSieve service before authentication.
If left unassigned, these will be assigned dynamically according to what the Sieve interpreter supports by default (after login this may differ depending on the authenticated user).


Sieve Plugin settings
^^^^^^^^^^^^^^^^^^^^^

.. _plugin-sieve-setting-sieve:

``sieve``
---------

.. versionchanged:: v0.3.1

 - Default: ``file:~/sieve;active=~/.dovecot.sieve``
 - Value: :ref:`string`

The location of the user's main Sieve script or script storage.
The LDA Sieve plugin uses this to find the active script for Sieve filtering at delivery.
The Sieve include extension uses this location for retrieving ``:personal`` scripts.

This location is also where the ManageSieve service will store the user's scripts, if supported by the location type.
For the file location type, the location will then be the path to the storage directory for all the user's personal Sieve scripts.
ManageSieve maintains a symbolic link pointing to the currently active script (the script executed at delivery).
The location of this symbolic link can be configured using the ``;active=<path>`` option.

For Pigeonhole versions before v0.3.1, this setting can only be a filesystem path pointing to a script file,
or - when ManageSieve is used - it is the location of the symbolic link pointing to the active script in the storage directory.
That storage directory is then configured using the deprecated :ref:`plugin-sieve-setting-sieve_dir` setting.

For specifics for this see :ref:`pigeonhole_configuration_script_locations`.

.. _plugin-sieve-setting-sieve_after:

``sieve_after``
---------------

 - Default: <empty>
 - Value: :ref:`string`

This setting can be specified multiple times by adding a number after the setting name,
such as ``sieve_after2`` and so on.

:ref:`Location <pigeonhole_configuration_script_locations>` of scripts that need to be executed after the user's personal script.
If a :ref:`file <pigeonhole_file>` location path points to a directory, all the Sieve scripts contained therein (with the proper .sieve extension) are executed.
The order of execution within that directory is determined by the file names, using a normal 8bit per-character comparison.
Multiple script locations can be specified by appending an increasing number to the setting name.
The Sieve scripts found from these locations are added to the script execution sequence in the specified order.
Reading the numbered :ref:`plugin-sieve-setting-sieve_before` settings stops at the first missing setting, so no numbers may be skipped.


.. _plugin-sieve-setting-sieve_before:

``sieve_before``
----------------

 - Default: <empty>
 - Value: :ref:`string`

This setting can be specified multiple times by adding a number after the setting name,
such as ``sieve_before2`` and so on.

See :ref:`plugin-sieve-setting-sieve_after` for details, this setting behaves the same way,
except the scripts are run **before** user's personal scripts.


.. _plugin-sieve-setting-sieve_default:

``sieve_default``
-----------------

  - Default: <empty>
  - Value: :ref:`string`

.. versionadded:: v0.3

The :ref:`location <pigeonhole_configuration_script_locations>` of the default personal sieve script file which gets executed ONLY if user's private Sieve script does not exist,
e.g. ``file:/var/lib/dovecot/default.sieve`` (check the :ref:`multiscript section <pigeonhole_configuration_multiscript>` for instructions on running global Sieve scripts before and after the user's personal script).
This is usually a global script, so be sure to pre-compile the specified script manually in that case using the sievec command line tool, as explained :ref:`here <sieve_usage-compiling_sieve_script>`.
This setting used to be called :ref:`plugin-sieve-setting-sieve_global_path`, but that name is now deprecated.


.. _plugin-sieve-setting-sieve_default_name:

``sieve_default_name``
----------------------

  - Defalt: <empty>
  - Value: :ref:`string`

.. versionadded:: v0.4.8

The name by which the default Sieve script is visible to ManageSieve clients.
Normally, it is not visible at all.

See :ref:`pigeonhole_configuration_visible_default_script`.


.. _plugin-sieve-setting-sieve_dir:

``sieve_dir``
-------------

 - Default: ``~/sieve``
 - Value: :ref:`string`

.. deprecated:: 0.3.1

Directory for :personal `include scripts <http://tools.ietf.org/html/draft-ietf-sieve-include-05>`_ for the include extension.
The Sieve interpreter only recognizes files that end with a .sieve extension,
so the include extension expects a file called name.sieve to exist in the sieve_dir directory for a script called name.
When using ManageSieve, this is also the directory where scripts are uploaded.
For recent Pigeonhole versions, this location is configured as part of the :ref:`sieve setting <plugin-sieve-setting-sieve>`.


.. _plugin-sieve-setting-sieve_discard:

``sieve_discard``
-----------------

  - Default: <empty>
  - Value: :ref:`string`

.. versionadded:: v0.4.16

The location of a Sieve script that is run for any message that is about to be discarded;
i.e., it is not delivered anywhere by the normal Sieve execution.
This only happens when the "implicit keep" is canceled, by e.g. the "discard" action,
and no actions that deliver the message are executed.
This "discard script" can prevent discarding the message, by executing alternative actions.
If the discard script does nothing, the message is still discarded as it would be when no discard script is configured.


.. _plugin-sieve-setting-sieve_extensions:

``sieve_extensions``
--------------------

 - Default: See description.
 - Value: :ref:`string`

Which Sieve language extensions are available to users.
By default, all supported extensions are available, except for deprecated extensions,
extensions that add the ability to change messages, extensions that require explicit
configuration or extensions that are still under development.
Some system administrators may want to disable certain Sieve extensions or enable those that are not available by default.
All supported extensions are listed :ref:`here <sieve_plugins>`. Normally, all enabled extensions must be listed for this setting,
but starting with Sieve version 0.1.7, this setting can use '+' and '-' to specify differences relative to the default.
For example ``sieve_extensions = +imapflags`` will enable the deprecated ``imapflags`` extension in addition to all extensions enabled by default.


.. _plugin-sieve-setting-sieve_global:

``sieve_global``
----------------

  - Default: <empty>
  - Value: :ref:`string`

.. versionadded:: v0.3.1

Location for ``:global`` include scripts for the Sieve include extension.
This setting used to be called `plugin-sievei-setting-sieve_global_dir`, but that name is now deprecated.


.. _plugin-sieve-setting-sieve_global_dir:

``sieve_global_dir``
--------------------

 - Default: <empty>
 - Value: :ref:`string`

.. deprecated:: v0.3.1

Directory for ``:global`` include scripts for the include extension.
The Sieve interpreter only recognizes files that end with a .sieve extension,
so the include extension expects a file called name.sieve to exist in the ``sieve_global_dir`` directory for a script called name.
For recent Pigeonhole versions, a more generic version of this setting is called :ref:`plugin-sieve-setting-sieve_global` and allows locations other than file system directories.

.. _plugin-sieve-setting-sieve_global_extensions:

``sieve_global_extensions``
---------------------------

 - Default: See :ref:`plugin-sieve-setting-sieve_extensions`
 - Value: :ref:`string`

.. versionadded:: v0.3

Which Sieve language extensions are **only** available in global scripts.
This can be used to restrict the use of certain Sieve extensions to administrator control,
for instance when these extensions can cause security concerns.
This setting has higher precedence than the :ref:`plugin-sieve-setting-sieve_extensions` setting,
meaning that the extensions enabled with this setting are never available to the user's personal script no matter what is specified for the sieve_extensions setting.
The syntax of this setting is similar to the sieve_extensions setting,
with the difference that extensions are enabled or disabled for exclusive use in global scripts.
Currently, no extensions are marked as such by default.


.. _plugin-sieve-setting-sieve_global_path:

``sieve_global_path``
---------------------

 - Default: <empty>
 - Value: :ref:`string`

.. deprecated:: 0.2

The deprecated name for the :ref:`plugin-sieve-setting-sieve_default` setting.


.. _plugin-sieve-setting-sieve_implicit_extensions:

``sieve_implicit_extensions``
-----------------------------

 - Default: <empty>
 - Value: :ref:`string`

.. versionadded: v0.4.13

Which Sieve language extensions are implicitly available to users.
The extensions listed in this setting do not need to be enabled explicitly using the Sieve "require" command.
This behavior directly violates the Sieve standard, but can be necessary for compatibility with some existing implementations of Sieve (notably jSieve).
Do not use this setting unless you really need to!
The syntax and semantics of this setting are otherwise identical to the :ref:`plugin-sieve-setting-sieve_extensions` setting.


.. _plugin-sieve-setting-sieve_max_script_size:

``sieve_max_script_size``
-------------------------

  - Default: ``1M``
  - Value: :ref:`size`

The maximum size of a Sieve script. The compiler will refuse to compile any script larger than this limit.
If set to 0, no limit on the script size is enforced.


.. _plugin-sieve-setting-sieve_max_actions:

``sieve_max_actions``
---------------------

  - Default: ``32``
  - Value: :ref:`uint`

The maximum number of actions that can be performed during a single script execution. If set to 0, no limit on the total number of actions is enforced.


.. _plugin-sieve-setting-sieve_max_redirects:

``sieve_max_redirects``
-----------------------

  - Default: ``4``
  - Value: :ref:`uint`

.. versionchanged:: v0.3

The maximum number of redirect actions that can be performed during a single script execution.
The meaning of 0 differs based on your version. For versions v0.3.0 and beyond this means that redirect is prohibited.
For older versions, however, this means that the number of redirects is unlimited, so be careful.


.. _plugin-sieve-setting-sieve_plugins:

``sieve_plugins``
-----------------

 - Default: <empty>
 - Value: Space separated list of :ref:`string`

The Pigeonhole Sieve interpreter can have plugins of its own.
Using this setting, the used plugins can be specified.
Check the :ref:`Sieve plugin section <sieve_plugins>` for available plugins.


.. _plugin-sieve-setting-sieve_redirect_envelope_from:

``sieve_redirect_envelope_from``
--------------------------------

 - Default: ``sender``
 - Value: see table

.. versionadded:: v0.4.4

Specifies what envelope sender address is used for redirected messages.
Normally, the Sieve ``redirect`` command copies the sender address for the redirected message from the processed message.
So, the redirected message appears to originate from the original sender.

The following values are supported for this setting:

``sender``
        The sender address is used (default)
``recipient``
        The final recipient address is used
``orig_recipient``
        The original recipient is used
``user_email`` (v0.4.14+)
        The user's primary address is used. This is configured with the :ref:`plugin-sieve-setting-sieve_user_email` setting.
        If that setting is not configured, ``user_email`` is equal to ``sender`` (the default).
``postmaster``
        The postmaster_address configured for LDA/LMTP.
``<user@domain>``
        Redirected messages are always sent from ``user@domain``.
        The angle brackets are mandatory. The null ``<>`` address is also supported.

When the envelope sender of the processed message is the null address ``<>``,
the envelope sender of the redirected message is also always ``<>``,
irrespective of what is configured for this setting.


.. _plugin-sieve-setting-sieve_subaddress_sep:

``sieve_subaddress_sep``
------------------------

 - Default: ``+``
 - Value: :ref:`string`

.. versionremoved:: v0.2

The separator that is expected between the ``:user`` and ``:detail`` address parts introduced by the `subaddress extension <http://tools.ietf.org/html/rfc5233/>`_.
This may also be a sequence of characters (e.g. ``--``).
The current implementation looks for the separator from the left of the localpart and uses the first one encountered.
The ``:user`` part is left of the separator and the ``:detail`` part is right.

This setting has been replaced with :dovecot_core:ref:`recipient_delimiter`.


.. _plugin-sieve-setting-sieve_trace_dir:

``sieve_trace_dir``
-------------------

 - Default: <empty>
 - Value: :ref:`string`

The directory where trace files are written.
Trace debugging is disabled if this setting is not configured or if the directory does not exist.
If the path is relative or it starts with ``~/`` it is interpreted relative to the current user's home directory.

See :ref:`pigeonhole_trace_debugging`.


.. _plugin-sieve-setting-sieve_trace_level:

``sieve_trace_level``
---------------------

 - Default: <empty>
 - Values: actions, commands, tests, matching

The verbosity level of the trace messages. Trace debugging is disabled if this setting is not configured. Possible values are:

``actions``
	Only print executed action commands, like keep, fileinto, reject and redirect.
``commands``
	Print any executed command, excluding test commands.
``tests``
	Print all executed commands and performed tests.
``matching``
	Print all executed commands, performed tests and the values matched in those tests.

See :ref:`pigeonhole_trace_debugging`.


.. _plugin-sieve-setting-sieve_trace_debug:

``sieve_trace_debug``
---------------------

 - Default: ``no``
 - Value: :ref:`boolean`

Enables highly verbose debugging messages that are usually only useful for developers.

See :ref:`pigeonhole_trace_debugging`.


.. _plugin-sieve-setting-sieve_trace_addresses:

``sieve_trace_addresses``
-------------------------

 - Default: ``no``
 - Value: :ref:`boolean`

Enables showing byte code addresses in the trace output, rather than only the source line numbers.

See :ref:`pigeonhole_trace_debugging`.


.. _plugin-sieve-setting-sieve_user_email:

``sieve_user_email``
--------------------

  - Default: <empty>
  - Value: :ref:`string`

.. versionadded:: v0.4.14

The primary e-mail address for the user.
This is used as a default when no other appropriate address is available for sending messages.
If this setting is not configured, either the postmaster or null ``<>`` address is used as a sender, depending on the action involved.
This setting is important when there is no message envelope to extract addresses from, such as when the script is executed in IMAP.


.. _plugin-sieve-setting-sieve_user_log:

``sieve_user_log``
------------------

  - Default: ``~/.dovecot.sieve.log``
  - Value: :ref:`string`

The path to the file where the user log file is written. If not configured, a default location is used.
If the main user's personal Sieve (as configured with :ref:`plugin-sieve-setting-sieve`) is a file, the logfile is set to ``<filename>.log`` by default.
If it is not a file, the default user log file is ``~/.dovecot.sieve.log``.
