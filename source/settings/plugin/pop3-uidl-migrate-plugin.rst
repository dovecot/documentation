.. _plugin-pop3-uidl-migrate:

========================
pop3-uidl-migrate plugin
========================

.. note:: pop3-uidl-migrate plugin is only available as part of
  :ref:`OX Dovecot Pro <ox_dovecot_pro_releases>`.

Settings
========

.. _plugin-pop3-uidl-migrate-setting_pop3_uidl_migrate_format:

``pop3_uidl_migrate_format``
----------------------------

- Default: <empty>
- Values:  :ref:`string`

A template of the UIDL format to use when migrating messages.

The template supports variable substitution of the form ``%%{variable_name}``.

Variable substitutions available:

======================= ======================================================
Field                   Value
======================= ======================================================
``owm``                 OpenWave: If Message-ID header is valid POP3 UIDL, use
                        it. Otherwise, use MD5 of the Message-ID header.
``uid``                 IMAP message UID
``uidvalidity``         Current UID validity
======================= ======================================================

Example::

  plugin {
    # Critical Path: IMAP UIDVALIDITY-IMAP UID
    pop3_uidl_migrate_format = %%{uidvalidity}-%%{uid}
  }
