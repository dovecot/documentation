.. _storage_workarounds:

=========================
Storage Workarounds
=========================

These settings may be useful if it’s common with the object storage that some emails are inaccessible.

.. code-block:: none

   imap_fetch_failure=no-after

If an email is inaccessible during a FETCH, finish it as well as possible and return a tagged NO reply. The default is to disconnect the IMAP client immediately on the failure. It depends on the IMAP client whether this behavior is useful or not.

.. code-block:: none

   remote <webmail IP range> {
    plugin {
        obox_fetch_lost_mails_as_empty = yes
    }
   }

Cassandra: `Object exists in dict, but not in storage` errors will be handled by returning empty emails to the IMAP client. The tagged FETCH response will be ``OK`` instead of ``NO``.