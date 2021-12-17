.. _plugin-pop3-migration:

=====================
pop3-migration plugin
=====================

The pop3-migration plugin is used to preserve POP3 UIDLs. 

When dsync is handling IMAP INBOX and requests a POP3 UIDL, the plugin
connects to the POP3 server and figures out which IMAP messages match the
POP3 messages and returns the appropriate POP3 UIDL.

.. seealso:: `Migrating from any IMAP/POP3 server to Dovecot via dsync <https://wiki.dovecot.org/Migration/Dsync>`_

Settings
========

.. _plugin-pop3-migration-setting_pop3_migration_all_mailboxes:

``pop3_migration_all_mailboxes``
--------------------------------

- Default: ``no``
- Values:  :ref:`boolean`

.. todo


.. _plugin-pop3-migration-setting_pop3_migration_ignore_extra_uidls:

``pop3_migration_ignore_extra_uidls``
-------------------------------------

- Default: ``no``
- Values:  :ref:`boolean`

.. todo


.. _plugin-pop3-migration-setting_pop3_migration_ignore_missing_uidls:

``pop3_migration_ignore_missing_uidls``
---------------------------------------

- Default: ``no``
- Values:  :ref:`boolean`

.. todo


.. _plugin-pop3-migration-setting_pop3_migration_mailbox:

``pop3_migration_mailbox``
--------------------------

- Default: <empty>
- Values:  :ref:`string`

This setting is required for the plugin to be active.

.. todo

Example::

  plugin {
    pop3_migration_mailbox = POP3-MIGRATION-NS/INBOX
  }


.. _plugin-pop3-migration-setting_pop3_migration_skip_size_check:

``pop3_migration_skip_size_check``
----------------------------------

- Default: ``no``
- Values:  :ref:`boolean`

.. todo


.. _plugin-pop3-migration-setting_pop3_migration_skip_uidl_check:

``pop3_migration_skip_uidl_check``
----------------------------------

- Default: ``no``
- Values:  :ref:`boolean`

.. todo
