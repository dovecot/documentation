Upgrading Dovecot v2.1 to v2.2
==============================

v2.2 has a couple of changes to settings since v2.1:

 * ``doveadm_proxy_port`` setting renamed to :ref:`setting-doveadm_port` (but the old exists still as an alias)
 * ``imapc_ssl_ca_dir`` and ``pop3c_ssl_ca_dir`` settings replaced by a common :ref:`setting-ssl_client_ca_dir`

There are also some changes you should be aware of:

 * :ref:`plugin-fts-solr` no longer does "hard commits" to the Solr index for performance reasons. `You must do this manually once in a while <plugin-fts_solr_soft_commits>`.
 * When creating home directories, the permissions are copied from the parent directory if it has setgid-bit set. For full details, see
   :ref:`admin_manual_permissions_in_shared_mailboxes`.
 * ``doveadm auth`` command was renamed to ``doveadm auth test``
 * IMAP: ID command now advertises server name as Dovecot by default. It was already trivial to guess this from command replies.
 * LDA/LMTP: If saving a mail brings user from under quota to over quota, allow it based on quota_grace setting (default: 10% above quota limit).
 * :ref:`pop3_lock_session=yes <setting-pop3_lock_session>` now uses a POP3-only ``dovecot-pop3-session.lock`` file instead of actually locking the mailbox (and causing IMAP/LDA/LMTP to wait for the POP3 session to close).
 * :ref:`setting-mail_shared_explicit_inbox` setting's default switched to "no".
 * dsync isn't compatible with v2.1 protocol. (The new protocol will be compatible with future Dovecot versions.)
 * autocreate plugin is being deprecated and it will log warnings. Convert the configuration to :ref:`mailbox_settings` instead.

Downgrading can be done fully safely to v2.1.16.

 * v2.1.16 adds support for "attribute changes", which are used by URLAUTH command and dsync with ACLs and/or Sieve scripts. If none of these features are used, you can downgrade safely to v2.1.11.

    * The error message for these attribute changes is: ``Log synchronization error at seq=..,offset=.. for .../dbox-Mails/dovecot.index: Unknown transaction record type 0x0``

 * v2.1.11 adds support for cache file changes. Older versions may think that the ``dovecot.index.cache`` files are corrupted and complain about "Invalid magic in hole header".

