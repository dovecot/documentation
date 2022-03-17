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

Removed features and their replacements
=======================================

+-------------------------------+------------------------------------------------------------------------------------------+
| Feature                       | Notes                                                                                    |
+===============================+==========================================================================================+
| | Dict quota                  | The dict and dirsize backends are removed.                                               |
| | Dirsize quota               | You should use :ref:`count <quota_backend_count>` instead along with                     |
|                               | :ref:`quota_clone plugin <quota_clone_plugin>`.                                          |
|                               |                                                                                          |
|                               | Note that switching to quota count can cause all user's indexes to update,               |
|                               | so reserve time for this.                                                                |
+-------------------------------+------------------------------------------------------------------------------------------+
| XZ Compression                | You need to perform migration using different plugin. With maildir, you can try          |
|                               | uncompressing all your mail and compressing them with another algorithm while Dovecot is |
|                               | not running.                                                                             |
+-------------------------------+------------------------------------------------------------------------------------------+

