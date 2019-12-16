.. _plugin-fts-dovecot:

===========================
fts-dovecot plugin
===========================

``fts-dovecot-plugin``
^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-fts-dovecot-setting_fts_dovecot_fs:

``fts_dovecot_fs``
--------------------

.. versionadded:: v2.2

Use ``fts_dovecot_fs`` to supply full-text search parameters to use with
Dovecot Pro's search solution. This setting specifies fscache details, for
example:

.. code-block:: none

  mail_plugins = $mail_plugins fts fts_dovecot

  plugin {
    fts = dovecot
    fts_dovecot_fs = fts-cache:fscache:500M:/tmp/fscache:scality:http://.../?timeout_msecs=50000&addhdr=...
  }


.. _plugin-fts-dovecot-setting_license_checksum:

``license_checksum``
-----------------------

This setting points to the license checksum for Dovecot Pro.

.. code-block:: none

  plugin {
    license_checksum = </var/lib/dovecot/dovecot-license.txt
  }
