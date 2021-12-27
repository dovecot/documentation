Upgrading Dovecot v1.2 to v2.0
==============================

A lot of settings have changed. Dovecot v2.0 can still use most of the v1.x configuration files, but it logs a lot of warnings at startup.
A quick and easy way to convert your old config file to v2.0 format is::


   # convert old config to new temp config file
   doveconf -n -c /etc/dovecot/dovecot.conf > dovecot-2.conf
   
   # replace the old config file with the new generated file
   mv dovecot-2.conf /etc/dovecot/dovecot.conf


This command logs a warning about each obsolete setting it converts to the new format.
**You can simply ignore all the warnings** in most cases.
If you really want to, you can modify your old config file using the instructions from the warnings, but even that can be done more easily by looking at the generated config file.
Some of the warning messages aren't obvious.

Once running v2.0, it's safe to downgrade to v1.2.5 or newer.
Older versions don't understand some of the changes to index files and will log errors.

Permission related changes
--------------------------

 * Dovecot uses two system users for internal purposes now by default: ``dovenull`` and ``dovecot``. You need to create the ``dovenull`` user or change :dovecot_core:ref:`default_login_user` setting. ``dovenull`` user is used by completely untrustworthy processes, while ``dovecot`` user is used for slightly more trusted processes.

   * If you want to be using something else than ``dovecot`` as the other user, you need to change :dovecot_core:ref:`default_internal_user` setting.
   * Just like with ``dovecot`` user, ``dovenull`` doesn't need a password, home directory or anything else (but it's good to give it its own private ``dovenull`` group).

 * ``auth-master`` socket related configuration should be replaced with ``auth-userdb`` socket everywhere (auth-master should still work, but it gives more permissions than necessary)
 * If you get any kind of "permission denied" errors related to UNIX sockets, you can change their permissions from ``service { unix_listener { ... } }`` blocks. See ``example-config/conf.d/10-master.conf`` for examples or ``doveconf -a`` output for their current values.

Other major changes
-------------------

 * No more convert plugin, use ``dsync`` instead
 * No more expire-tool, use ``expire plugin`` or ``doveadm expunge`` instead. Also expire configuration is different.
 * :ref:`Post-login scripts are configured differently <post_login_scripting>` and need to be modified
 * :ref:`Quota warnings are configured differently <quota>` and the script may need to be modified (most environment settings like ``$USER`` are gone)
 * Global ACL filenames now require namespace prefix (e.g. if you use ``INBOX.`` prefix, ``/etc/acls/foo`` needs to be renamed to ``/etc/acls/INBOX.foo``
 * Maildir: Permissions for newly created mail files are no longer copied from dovecot-shared file, but instead from the mail directory (e.g. for "foo" mailbox, they're taken from ``~/Maildir/.foo`` directory)
 * dbox: v2.0 format is slightly different, but backwards compatible. The main problem is that v2.0 no longer supports maildir-dbox hybrid resulting from "fast Maildir migration". If you have any Maildir files in your dbox, you need to convert them somehow `some examples <http://dovecot.org/list/dovecot/2010-September/053012.html>`_ . You might also consider using ``dsync`` to get rid of the old unused metadata in your dbox files.
 * Pre-login and post-login CAPABILITY reply is now different. `Dovecot expects clients to recognize new automatically sent capabilities. <http://dovecot.org/list/dovecot/2010-April/048147.html>`_ This should work with all commonly used clients, but some rarely used clients might have problems. Either get the client fixed, or set :dovecot_core:ref:`imap_capability` manually.
 * `ManageSieve protocol <http://tools.ietf.org/html/rfc5804>`_ was assigned an official port by IANA: 4190. This is used by Pigeonhole by default now. If you want to listen also on the old 2000 port, add an ``inet_listener`` with
   ``port = 2000`` to the ``managesieve-login`` service. See
   :ref:`service_configuration_inet_listeners`.
 * ``dovecot --exec-mail imap`` has been replaced by simply running "imap" binary. You can also use ``imap -u <username>`` to access other users' mails more easily.

LDA
---

 * deliver binary was renamed to dovecot-lda (but a symlink still exists for now)
 * ``-n`` parameter was replaced by :dovecot_core:ref:`lda_mailbox_autocreate` setting. The default also changed to "no".
 * ``-s`` parameter was replaced by :dovecot_core:ref:`lda_mailbox_autosubscribe` setting. The default is "no", as before.
