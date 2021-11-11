.. _plugin-imapsieve:

============================
Pigeonhole: IMAPSieve plugin
============================

.. seealso:: :ref:`pigeonhole_plugin_imapsieve`

.. versionadded:: v0.4.14

Settings
--------

.. pigeonhole:setting:: imapsieve_mailboxXXX_after
   :plugin: yes
   :values: @string

When an IMAP event of interest occurs, this sieve script is executed after any
user script respectively.

This setting each specify the location of a single sieve script. The semantics
of this setting is similar to :pigeonhole:ref:`sieve_after`: the specified
scripts form a sequence together with the user script in which the next script
is only executed when an (implicit) keep action is executed. 


.. pigeonhole:setting:: imapsieve_mailboxXXX_before
   :plugin: yes
   :values: @url

When an IMAP event of interest occurs, this sieve script is executed before
any user script respectively.

This setting each specify the location of a single sieve script. The semantics
of this setting is similar to :pigeonhole:ref:`sieve_before`: the specified
scripts form a sequence together with the user script in which the next script
is only executed when an (implicit) keep action is executed. 


.. pigeonhole:setting:: imapsieve_mailboxXXX_causes
   :plugin: yes
   :values: APPEND, COPY, FLAG

Only execute the administrator Sieve scripts for the mailbox configured with
:pigeonhole:ref:`imapsieve_mailboxxxx_name` when one of the listed
``IMAPSIEVE`` causes apply.

This has no effect on the user script, which is always executed no matter the
cause.


.. pigeonhole:setting:: imapsieve_mailboxXXX_from
   :plugin: yes
   :values: @string

Only execute the administrator Sieve scripts for the mailbox configured with
:pigeonhole:ref:`imapsieve_mailboxxxx_name` when the message originates from
the indicated mailbox.

This setting supports wildcards with a syntax compatible with the ``IMAP LIST``
command.


.. pigeonhole:setting:: imapsieve_mailboxXXX_name
   :plugin: yes
   :values: @string

This setting configures the name of a mailbox for which administrator scripts
are configured.

The ``XXX`` in this setting is a sequence number, which allows configuring
multiple associations between Sieve scripts and mailboxes.

The settings defined hereafter with matching sequence numbers apply to the
mailbox named by this setting.

The sequence of configured mailboxes ends at the first missing
``imapsieve_mailboxXXX_name`` setting.

This setting supports wildcards with a syntax compatible with the ``IMAP LIST``
command, meaning that this setting can apply to multiple or even all ``("*")``
mailboxes. 


.. pigeonhole:setting:: imapsieve_url
   :plugin: yes
   :values: @url

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
