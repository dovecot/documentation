.. _plugin-imapsieve:

============================
Pigeonhole: IMAPSieve plugin
============================

.. seealso:: :ref:`pigeonhole_plugin_imapsieve`

.. versionadded:: v0.4.14

.. _plugin-imapsieve-setting-imapsieve_url:

``imapsieve_url``
-----------------

 - Default: <empty>
 - Value: :ref:`url`

If set, support for user Sieve scripts in IMAP is enabled.

The value is an URL pointing to the ManageSieve server that users must use to
upload their Sieve scripts.

Leave this setting empty if you don't want users to have the ability to
associate Sieve scripts with mailboxes.

This has no effect on the administrator-controlled Sieve scripts.

.. code-block:: none

  plugin {
    imapsieve_url = sieve://sieve.example.com
  }

.. _plugin-imapsieve-setting-imapsieve_mailboxxxx_name:

``imapsieve_mailboxXXX_name``
-----------------------------

 - Default: <empty>
 - Value: :ref:`string`

This setting configures the name of a mailbox for which administrator scripts are configured.
The ``XXX`` in this setting is a sequence number, which allows configuring multiple associations between Sieve scripts and mailboxes.
The settings defined hereafter with matching sequence numbers apply to the mailbox named by this setting.
The sequence of configured mailboxes ends at the first missing ``imapsieve_mailboxXXX_name`` setting.
This setting supports wildcards with a syntax compatible with the ``IMAP LIST`` command, meaning that this setting can apply to multiple or even all ``("*")`` mailboxes. 


.. _plugin-imapsieve-setting-imapsieve_mailboxxxx_after:

``imapsieve_mailboxXXX_after``
------------------------------

 - Default: <empty>
 - Value: :ref:`string`

When an IMAP event of interest occurs, this sieve script is executed after any user script respectively.
This setting each specify the location of a single sieve script. The semantics of this setting is very similar to :ref:`plugin-sieve-setting-sieve_after`:
the specified scripts form a sequence together with the user script in which the next script is only executed when an (implicit) keep action is executed. 


.. _plugin-imapsieve-setting-imapsieve_mailboxxxx_before:

``imapsieve_mailboxXXX_before``
-------------------------------

 - Default: <empty>
 - Value: :ref:`string`

When an IMAP event of interest occurs, this sieve script is executed before any user script respectively.
This setting each specify the location of a single sieve script. The semantics of this setting is very similar to :ref:`plugin-sieve-setting-sieve_before`:
the specified scripts form a sequence together with the user script in which the next script is only executed when an (implicit) keep action is executed. 


.. _plugin-imapsieve-setting-imapsieve_mailboxxxx_causes:

``imapsieve_mailboxXXX_causes``
-------------------------------

 - Default: <empty>
 - Value: ``APPEND``, ``COPY``, ``FLAG``

Only execute the administrator Sieve scripts for the mailbox configured with :ref:`plugin-imapsieve-setting-imapsieve_mailboxxxx_name` when one of the listed ``IMAPSIEVE`` causes apply.
This has no effect on the user script, which is always executed no matter the cause.


.. _plugin-imapsieve-setting-imapsieve_mailboxxxx_from:

``imapsieve_mailboxXXX_from``
-----------------------------

 - Default: <empty>
 - Value: :ref:`string`

Only execute the administrator Sieve scripts for the mailbox configured with :ref:`plugin-imapsieve-setting-imapsieve_mailboxxxx_name` when the message originates from the indicated mailbox.
This setting supports wildcards with a syntax compatible with the ``IMAP LIST`` command.
