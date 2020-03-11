.. _storage_workarounds:

=========================
Storage Workarounds
=========================

These settings may be useful if it’s common with the object storage that some emails are inaccessible.

.. code-block:: none

   imap_fetch_failure=no-after

If an email is inaccessible during a FETCH, finish it as well as possible and return a tagged NO reply. The default is to disconnect the IMAP client immediately on the failure. It depends on the IMAP client whether this behavior is useful or not.


.. WARNING::  The following settings may cause problems with caching IMAP clients, which may lose emails permanently or otherwise become confused about their internal state. These settings should be enabled only towards IMAP clients that are known not to have their own local caches (e.g. webmails):

.. code-block:: none

   remote <webmail IP range> {
    plugin {
        obox_allow_inconsistency = yes
    }
   }

Even in case of object storage errors, try to allow accessing the emails as well as possible. This especially means that if the local metacache already has a copy of the indexes, they can be used to provide access to user's emails even if the object storage is unavailable.

.. code-block:: none

   remote <webmail IP range> {
    plugin {
        obox_fetch_lost_mails_as_empty = yes
    }
   }

Cassandra: `Object exists in dict, but not in storage` errors will be handled by returning empty emails to the IMAP client. The tagged FETCH response will be ``OK`` instead of ``NO``.