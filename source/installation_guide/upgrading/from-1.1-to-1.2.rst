Upgrading Dovecot v1.1 to v1.2
==============================

 * Relative home directory paths are giving errors now. They were never supported, but earlier they just didn't usually cause problems.

    * If you were using e.g. ``mail_location = maildir:/var/mail/%h``, just change it to ``mail_location = maildir:%h`` and add ``/var/mail/`` prefix to home dirs.
    * To get absolute home dir from relative path in LDAP, use something like: ``user_attrs = .., homeDirectory=home=/var/mail/%$``

 * SQL dictionary (quota, expire plugin) configuration file is different than in v1.1. See ``doc/dovecot-dict-sql-example.conf`` or for the new format.
 * When creating files or directories to mailboxes, Dovecot now uses the mailbox directory's permissions and GID for them. Previous versions simply used 0600 mode always, so you should check the directories' permissions to make sure they're strict enough. For backwards compatibility ``dovecot-shared`` file's permissions still override these with Maildir.

Authentication:

 * ``system_user`` :ref:`authentication-user_database_extra_fields` was renamed to ``system_groups_user`` to better describe its functionality.

Settings:

 * Renamed ``ssl_disable=yes`` to :ref:`ssl=no <setting-ssl>`.
 * Renamed ``auth_ntlm_use_winbind`` to :ref:`setting-auth_use_winbind`, which also determines if GSS-SPNEGO is handled by GSSAPI or winbind.
 * Removed ``login_greeting_capability``. The capabilities are now always sent `<LEMONADE <http://www.lemonadeformobiles.com/>`_ requires this and it's not that much extra traffic).
 * Removed ``auth_worker_max_request_count``. It was useful only with PAM, so it can now be specified in ``passdb pam { args = max_requests=n }``. The default is 100.
 * Removed ``umask``. It wasn't really used anywhere anymore.

ACL:

 * The global ACL file overrides per-mailbox ACL file.

Sieve:

 * You should consider :ref:`migrating from CMU Sieve to Pigeonhole <pigeonhole_migration>`

ManageSieve:

 * The :ref:`plugin-sieve-setting-sieve` and ``sieve_storage`` settings need to be placed in the ``plugin {}`` section now and ``sieve_storage`` needs to be renamed to :ref:`plugin-sieve-setting-sieve_dir`. This removes the duplication of these values with respect to the :ref:`Sieve Plugin <sieve>` for :ref:`Deliver <lda>`. So, since you are using the Sieve plugin, these settings should already be there and all that needs to be done is remove the ``sieve=`` and ``sieve_storage=`` settings from the ``protocol managesieve {}`` section.

