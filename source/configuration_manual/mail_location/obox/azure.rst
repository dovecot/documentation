.. _azure:

===============
Microsoft Azure
===============

Using the azure driver requires using fs-dictmap/Cassandra. See
:ref:`dictmap_configuration` and :ref:`dictmap_cassandra` for details and an
example configuration.

.. code-block:: none

   plugin {
     # Basic configuration:
     obox_fs = azure:https://ACCOUNTNAME:SHARED_KEY_BASE64@CONTAINERNAME.blob.core.windows.net/
   }

The parameters are:

+---------------------------------+----------------------------------------------------------+
| Parameter                       | Description                                              |
+=================================+==========================================================+
| See :ref:`http_storages` for common parameters                                             |
+---------------------------------+----------------------------------------------------------+

.. Note:: Please note that the Dovecot format for configuring a Azure URI is
          different from what is used in Microsoft documentation. This is
          especially relevant for the position of ACCOUNTNAME and CONTAINERNAME.

Debugging
---------

To be able to easily track requests outgoing from Dovecot and incoming from
the Azure storage the following headers should be added as `loghdr` (For more
details see :ref:`http_storages`)

.. code-block:: none

  plugin {
  # Debugging configuration:
     obox_fs = azure:https://ACCOUNTNAME:SHARED_KEY_BASE64@CONTAINERNAME.blob.core.windows.net/?loghdr=x-ms-client-request-id&loghdr=x-ms-request-id
   }

This configuration makes sure that the ``x-ms-client-request-id`` header is
added to the requests by Dovecot. This will use the current session id, which
allows to correlate Dovecot activities with requests that the server
receives. Additionally the ``x-ms-request-id`` header should be added as
loghdr as well. This header is added by the Azure storage to identify
individual requests.
