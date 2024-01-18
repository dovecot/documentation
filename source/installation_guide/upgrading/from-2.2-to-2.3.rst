Upgrading Dovecot v2.2 to v2.3
==============================

Downgrading is possible to v2.2.27 and later. (v2.2.27 accidentally broke ``dovecot.index*`` backwards compatibility a bit.)

Settings Changes
-----------------

 * ``director_consistent_hashing`` setting removed. It's always assumed to be "yes" now.

   * **WARNING**: You can't run a director ring with mixed `director_consistent_hashing` settings. If you already didn't have it set to "yes", upgrading to v2.3 will require you to shutdown the entire director ring. It may be safer to first do this setting change in v2.2 before the upgrade.
   * If you really don't wish to shutdown the ring, an alternative would be to set up a whole new director ring. Then start moving users to the new ring in the Dovecot proxy. To avoid the same user having connections to both rings at the same time (-> two backends at the same time), this would need to be done so that passdb moves the user to the new ring and old connections are kicked. See :ref:`authentication-proxies`

 * ``director_doveadm_port`` setting removed. Name the ``inet_listener doveadm { .. }`` instead.
 * ``mdbox_purge_preserve_alt`` setting removed. It's always assumed to be "yes" now.
 * :dovecot_core:ref:`recipient_delimiter` setting used to be treated as a separator string. Now it's instead treated as a list of alternative delimiter characters.
 * Time interval based settings no longer default to "seconds". All numbers must explicitly be followed by the time unit (except 0). This is important, because some settings now support milliseconds as well.
 * ``fs-posix``: ``prefix=path`` parameter no longer automatically appends ``/`` to the path if it's not there. This allows using it properly as a prefix, instead of only a directory prefix. Make sure you have the ``/`` appended to the prefix, or the "dir/filename" will be accessed just as "dirnamename".
 * ``ssl_protocols`` setting was replaced by :dovecot_core:ref:`ssl_min_protocol`. Now you only specify the minimum ssl protocol version Dovecot accepts, defaulting to TLSv1.
 * ``ssl_parameters`` was replaced with :dovecot_core:ref:`ssl_dh`. See `Diffie-Hellman Parameters for SSL`.
 * ``SSLv2`` is no longer supported as SSL protocol.

Statistics Redesign
-------------------

The statistics code was redesigned.

  * Statistics is no longer optional - it is always there.
  * The old "stats" plugin was renamed to old_stats
  * The ``doveadm stats`` command was renamed to ``doveadm oldstats``.

     * There's a new ``doveadm stats`` command that isn't compatible with the old one.

  * The new stats code doesn't require a plugin, so make sure you remove ``stats`` from :dovecot_core:ref:`mail_plugins` setting. For more details see :ref:`statistics`.

Config changes required to 2.2.x config to keep using the "old" stats:
 * ``mail_plugins = stats`` -> ``mail_plugins = old_stats``
 * ``mail_plugins = imap_stats`` -> ``mail_plugins = imap_old_stats``
 * ``service stats`` -> ``service old-stats``

   * ``executable = stats`` -> ``executable = old-stats``
   * ``fifo_listener stats-mail`` -> ``fifo_listener old-stats-mail``
   * ``fifo_listener stats-user`` -> ``fifo_listener old-stats-user``
   * ``unix_listener stats`` -> ``unix_listener old-stats``

 * ``plugin { stats_refresh }`` -> ``plugin { old_stats_refresh }``
 * ``plugin { stats_notify_path }`` -> ``plugin { old_stats_notify_path }``
 * ``plugin { stats_track_cmds }`` -> ``plugin { old_stats_track_cmds }``
 * ``auth_stats`` -> keep as ``auth_stats``
 * ``stats_*`` settings -> ``old_stats_*``

Submission Service (new)
------------------------

Dovecot can now act as a submission service. See :ref:`submission_server` for more information.

Localhost Auth Penalty
----------------------

Dovecot no longer disables auth penalty waits for clients connecting from localhost (or :dovecot_core:ref:`login_trusted_networks` in general). The previous idea was that it would likely be a webmail that would have its own delays, but there are no guarantees about this.

If the old behavior is still wanted, it's possible to do nowadays even more generically with e.g. setting following as the first passdb::

   passdb db1 {
    driver = passwd-file
    auth_username_format = %{rip}
     passwd_file_path = /etc/dovecot/passdb
    default_fields = noauthenticate=y
   }


``/etc/dovecot/passdb``::

   127.0.0.1:::::::nodelay=yes
   192.168.10.124:::::::nodelay=yes

Changed Setting Defaults
------------------------

+----------------------------------------------+------------------------------+-------------------------------------------------------------------------+
| Setting                                      | Old Default Value            | New Default Value                                                       |
+==============================================+==============================+=========================================================================+
| :dovecot_core:ref:`mdbox_rotate_size`        | 2M                           | 10M                                                                     |
+----------------------------------------------+------------------------------+-------------------------------------------------------------------------+
| :dovecot_core:ref:`mailbox_list_index`       | no                           | yes                                                                     |
+----------------------------------------------+------------------------------+-------------------------------------------------------------------------+
| :dovecot_core:ref:`imap_logout_format`       | n=%i out=%o                  | in=%i out=%o deleted=%{deleted} expunged=%{expunged} trashed=%{trashed} |
|                                              |                              | hdr_count=%{fetch_hdr_count} hdr_bytes=%{fetch_hdr_bytes}               |
|                                              |                              | body_count=%{fetch_body_count} body_bytes=%{fetch_body_bytes}           |
+----------------------------------------------+------------------------------+-------------------------------------------------------------------------+
| :dovecot_core:ref:`ssl_cipher_list`          | ALL:!LOW:!SSLv2:!EXP:!aNULL  | ALL:!kRSA:!SRP:!kDHd:!DSS:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK:   |
|                                              |                              | !RC4:!ADH:!LOW@STRENGTH                                                 |
+----------------------------------------------+------------------------------+-------------------------------------------------------------------------+
| :dovecot_core:ref:`mail_log_prefix`          | "%s(%u): "                   | "%s(%u)<%{pid}><%{session}>: "                                          |
+----------------------------------------------+------------------------------+-------------------------------------------------------------------------+
| mysql: ``ssl_verify_server_cert``            | no                           | yes                                                                     |
+----------------------------------------------+------------------------------+-------------------------------------------------------------------------+
| :dovecot_core:ref:`ssl_options`              |                              | no_compression is now the default, and a new compression option is      |
|                                              |                              | introduced for enabling compression                                     |
+----------------------------------------------+------------------------------+-------------------------------------------------------------------------+

.. _dhparams:

Diffie-Hellman Parameters for SSL
---------------------------------

 * ``ssl-parameters.dat`` file is now obsolete. You should use :dovecot_core:ref:`ssl_dh` setting instead: ``ssl_dh=</etc/dovecot/dh.pem``

   * You can convert an existing ssl-parameters.dat to dh.pem: ``dd if=/var/lib/dovecot/ssl-parameters.dat bs=1 skip=88 | openssl dhparam -inform der > /etc/dovecot/dh.pem``

 * ssl-params process has also been removed, as it is no longer used to generate these parameters.
 * You are encouraged to create at least 2048 bit parameters. 4096 is industry recommendation.
 * Note that it will take LONG TIME to generate the parameters, and it should be done with a machine that has GOOD SOURCE OF ENTROPY. Running it on a virtual machine is not recommended, unless there is some entropy helper/driver installed. Running this on your production proxy can starve connections due to lack of entropy.

 * Since v2.3.3+ DH parameter usage is **optional** and can be omitted. In that case one must also remove (or rename) ``/var/lib/dovecot/ssl-parameters.dat`` . You are invited to amend ciphers to disallow non-ECC based DH algorithms, but if you don't and someone does try to use them, error will be emitted.

    * Example: ``ssl_cipher_list=ALL:!kRSA:!SRP:!kDHd:!DSS:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK:!RC4:!ADH:!LOW:!DH@STRENGTH``

Other Changes
-------------

 * Invalid :dovecot_core:ref:`postmaster_address` now causes a failure early on with sieve/imap_sieve plugin enabled. It still defaults to ``postmaster@%d``, which expands to invalid ``postmaster@`` address if your usernames do not contain a domain, or are converted into domainless usernames by passdb/userdb. See :ref:`authentication-domain_lost`.
 * Linux: Dovecot no longer enables core dumping for "setuid processes", which most of them are.

  * To enable them with Linux kernel v3.6+: Make sure core dumps get written to a globally shared directory and enable them with: ``sysctl -w fs.suid_dumpable=2``

   * With older Linux kernel versions you can set it to 1, but that's not good for security of your system.

  * You can also revert to old behavior with: ``import_environment = $import_environment PR_SET_DUMPABLE``

   * However, this also may have some security implications depending on the setup. Mainly if you have system users and you've enabled chrooting or mail_access_groups, this could allow the system users to gain unintentional access.

 * userdb nss was removed. Use userdb passwd instead.
 * doveadm: table formatter prints the header now to stdout, not stderr
 * doveadm: Removed mount commands
 * OpenSSL version is required to be at least 1.0.1 for Dovecot to build
 * subscriptions file is written in a new version 2 format. Dovecot v2.2.17 and newer can read this file.
 * mail_log plugin: Headers are logged as UTF-8 (instead of MIME-encoded)
 * auth: When iterating users in userdb passwd, skip users that aren't in the first/last_valid_gid range
 * auth protocol has changed some error fields:

   * temp -> code=temp_fail
   * authz -> code=authz_fail
   * user_disabled -> code=user_disabled
   * pass_expired -> code=pass_expired

 * auth now supports bcrypt algorithm by default.
 * Some API changes have been made, if you have your own plugins please be aware that they might require change(s) to be compatible again.
 * Due to the new stats environment, for now some environments may get harmless errors about not being able to connect to stats-writer socket. To avoid these errors, give enough permissions for the processes to connect to the stats-writer, for example:

.. code::

   service stats {
     client_limit = 10000 # make this large enough so all Dovecot processes (especially imap, pop3, lmtp) can connect to it
     unix_listener stats-writer {
        user = vmail
        #mode = 0666 # Use only if nothing else works. It's a bit insecure, since it allows any user in the system to mess up with the statistics.
     }
   }


