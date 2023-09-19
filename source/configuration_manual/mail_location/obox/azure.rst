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
     obox_fs = azure:https://ACCOUNTNAME:SHARED_KEY@CONTAINERNAME.blob.core.windows.net/
   }

The parameters are:

+---------------------------------+----------------------------------------------------------+
| Parameter                       | Description                                              |
+=================================+==========================================================+
| See :ref:`http_storages` for common parameters                                             |
+---------------------------------+----------------------------------------------------------+
