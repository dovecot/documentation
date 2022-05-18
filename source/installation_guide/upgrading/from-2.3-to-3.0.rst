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
| :ref:`Flatcurve FTS <fts_backend_flatcurve>`               | Xapian based full-text search                                                            |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| :ref:`fs_crypt` now has ``maybe`` parameter                | The fs_crypt now requires encryption and decryption keys by default. To keep the old     |
|                                                            | behavior, add the maybe parameter.                                                       |
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
| :dovecot_core:ref:`auth_worker_max_count                   | Use :ref:`service-specific process limit <service_configuration>`.                       |
| <auth_worker_max_count>`                                   |                                                                                          |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| | fts-lucene                                               | Use :ref:`Flatcurve FTS <fts_backend_flatcurve>` or :ref:`Solr FTS <fts_backend_solr>`   |
| | fts-squat                                                |                                                                                          |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| Weak password schemes                                      | Weak password schemes are disabled by default, you need to use                           |
|                                                            | :dovecot_core:ref:`auth_allow_weak_schemes` to enable them.                              |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| Global ACL directory                                       | Use :ref:`acl-global_acl_file` instead.                                                  |
|                                                            | Check `Use Global ACL Files instead of Global ACL Directories`_ for details on migration.|
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| ``ssl-parameters.dat``                                     | This file is no longer converted automatically by config process, you need to set        |
|                                                            | :dovecot_core:ref:`ssl_dh` setting if you need non-ECC Diffie-Hellman.                   |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| License plugin                                             | This plugin has been removed and ``license_checksum`` setting is marked obsolete         |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| shadow auth driver                                         | Use :ref:`authentication-pam` instead.                                                   |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| old-stats plugin                                           | Use :ref:`new stats <statistics>` instead.                                               |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| Memcached dict driver                                      | Use :ref:`redis <dict-redis>` instead.                                                   |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| dsync: Remove -D parameter                                 | Parameter for disabling mailbox rename syncing removed.                                  |
|                                                            | It hasn't been necessary for a long time, and it is broke                                |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| dsync                                                      | Use `doveadm sync` instead.                                                              |
|                                                            | `dsync` has been a symlink to `doveadm` already, this release removed the symlink        |
|                                                            | completely.                                                                              |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| :dovecot_core:ref:`login_access_sockets                    | Use :ref:`authentication-lua_based_authentication` instead.                              |
| <login_access_sockets>`                                    | Dovecot will fail to start if this setting is present in configuration.                  |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| TCP wrapper support                                        | Use :ref:`authentication-lua_based_authentication` instead.                              |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+
| checkpassword auth database                                | Use :ref:`authentication-lua_based_authentication` instead.                              |
+------------------------------------------------------------+------------------------------------------------------------------------------------------+

Use Global ACL Files instead of Global ACL Directories
------------------------------------------------------

To migrate the ACL directories into their respective files you have to do the
following:

#. create a new consolidated :ref:`acl-global_acl_file`,
#. for each subdirectory in the currently configured ACL directory add a line
   starting with the mailbox name followed by the appropriate content,
#. change the vfile parameter to the new ACL file, and finally
#. remove the old ACL directory parent.

Example
^^^^^^^

With the following starting configuration:

.. code-block:: none

   # dovecot.conf

   namespace {
     prefix = INBOX/
     separator = /
   }

   plugin {
     acl = vfile:/etc/dovecot/acls/
   }

.. code-block:: none

   # /etc/dovecot/acls/INBOX

   owner lrwstipekxa
   anyone lr
   user=kim l

.. code-block:: none

   # /etc/dovecot/acls/INBOX/foo/.DEFAULT

   user=timo lr
   user=kim lrw

.. code-block:: none

   # /etc/dovecot/acls/INBOX/foo/bar

   user=kim lrw

You have to create the new ACL file:

.. code-block:: none

   # /etc/dovecot/dovecot-acl

   # previously from /etc/dovecot/acls/INBOX
   INBOX owner lrwstipekxa
   INBOX anyone lr
   INBOX user=kim l
   # previously from /etc/dovecot/acls/foo/.DEFAULT
   INBOX/foo user=timo lr
   INBOX/foo user=kim lrw
   # previously from /etc/dovecot/acls/foo/bar
   INBOX/foo/bar user=kim lrw

Note that at this point you could simplify specific rules, e.g. use mailbox
name wildcards to replace lines for a specific user: ``INBOX/* user=kim lrw``.

And re-configure the ACL plugin:

.. code-block:: none

   # dovecot.conf

   plugin {
     acl = vfile:/etc/dovecot/dovecot-acl
   }

Afterwards you can remove the old global ACL directory parent::

   rm -rf /etc/dovecot/acls/
