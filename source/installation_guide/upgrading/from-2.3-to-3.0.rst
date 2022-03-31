=====================================
Upgrading Dovecot from 2.3 to 2.4/3.0
=====================================

.. contents::
   :depth: 1
   :local:


About version numbers
=====================

With 2.4 / 3.0 release, the CE and Pro releases have different major version numbers.
In documentation any reference to 2.4 applies to 3.0 as well,
and usually (but not always) vice versa.

Upgrade path
============

Before upgrading, please look at the list of removed features carefully.

If you are doing in-place upgrade, ensure that you first upgrade to latest 2.3 release,
and then upgrade to 2.4/3.0.

Alternatively, you can migrate your data to new setup.

.. seealso::
  :ref:`migrating_mailboxes`.

New features
============

+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| Feature                                                    | Notes                                                                                    |
+============================================================+==========================================================================================+
| Flatcurve FTS                                              | Xapian based full-text search                                                            |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+

Removed features and their replacements
=======================================

+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| Feature                                                    | Notes                                                                                    |
+============================================================+==========================================================================================+
| | Dict quota                                               | The dict and dirsize backends are removed.                                               |
| | Dirsize quota                                            | You should use :ref:`count <quota_backend_count>` instead along with                     |
|                                                            | :ref:`quota_clone plugin <quota_clone_plugin>`.                                          |
|                                                            |                                                                                          |
|                                                            | Note that switching to quota count can cause all user's indexes to update,               |
|                                                            | so reserve time for this.                                                                |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| XZ Compression                                             | You need to perform migration using different plugin. With maildir, you can try          |
|                                                            | uncompressing all your mail and compressing them with another algorithm while Dovecot is |
|                                                            | not running.                                                                             |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| setting                                                    |                                                                                          |
| ``auth_worker_max_count``                                  | Use service-specific process limit.                                                      |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| | fts-lucene                                               | Use ``fts-flatcurve`` or :ref:`Solr FTS <fts_backend_solr>`                              |
| | fts-squat                                                |                                                                                          |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| Weak password schemes                                      | Weak password schemes are disabled by default, you need to use                           |
|                                                            | :dovecot_core:ref:`auth_allow_weak_schemes` to enable them.                              |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| Global ACL directory                                       | Use global acl file instead.                                                             |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| ``ssl-parameters.dat``                                     | This file is no longer converted automatically by config process, you need to set        |
|                                                            | :dovecot_core:ref:`ssl_dh` setting if you need non-ECC Diffie-Hellman.                   |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| License plugin                                             | This plugin has been removed and ``license_checksum`` setting is marked obsolete         |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| shadow auth driver                                         | Use :ref:`authentication-pam` instead.                                                   |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| old-stats plugin                                           | Use new stats instead.                                                                   |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| Memcached dict driver                                      | Use redis instead.                                                                       |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| dsync: Remove -D parameter                                 | Parameter for disabling mailbox rename syncing removed.                                  |
|                                                            | It hasn't been necessary for a long time, and it is broke                                |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| :dovecot_core:ref:`login_access_sockets                    | Use :ref:`authentication-lua_based_authentication` instead.                              |
| <login_access_sockets>`                                    | Dovecot will fail to start if this setting is present in configuration.                  |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| TCP wrapper support                                        | Use :ref:`authentication-lua_based_authentication` instead.                              |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
