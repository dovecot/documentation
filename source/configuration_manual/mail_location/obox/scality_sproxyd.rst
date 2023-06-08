.. _scality_sproxyd:

======================
 Scality sproxyd
======================

Using the sproxy driver requires using fs-dictmap/Cassandra. See
:ref:`dictmap_configuration` and :ref:`dictmap_cassandra` for details and an
example configuration.

.. code-block:: none

   plugin {
     # Basic configuration:
     obox_fs = sproxyd:http://scality.example.com/?parameters
   }

The parameters are:

+---------------------------------+----------------------------------------------------------+
| Parameter                       | Description                                              |
+=================================+==========================================================+
| See :ref:`http_storages` for common parameters                                             |
+---------------------------------+----------------------------------------------------------+
| class                           | Scality Class of Service. 2 means that the objects are   |
|                                 | written to the Scality RING 3 times in total. This is    |
|                                 | generally the minimum allowable redundancy for mail and  |
|                                 | index objects.                                           |
|                                 |                                                          |
|                                 | FTS data is more easily reproducible, so losing those    |
|                                 | indexes is not as critical; Class of Service 1 may be    |
|                                 | appropriate based on customer requirements.              |
+---------------------------------+----------------------------------------------------------+
| by-path                         | Objects are accessed by path instead of by object ID.    |
|                                 | Scality sproxyd internally converts the paths into       |
|                                 | object IDs. This shouldn't normally be used.             |
+---------------------------------+----------------------------------------------------------+
| avoid_423=<:ref:`time_msecs`>   | Using this setting allows to delay DELETE requests if the|
|                                 | same object ID has been GET/HEAD/PUT by the same process |
|                                 | within <:ref:`time_msecs`>. This is intended to reduce   |
|                                 | "423 Locked" sent by Scality.                            |
|                                 |                                                          |
|                                 | When ``avoid_423`` is not set, no delay is added.        |
|                                 | Normally this setting should not be used. It should be   |
|                                 | only be set, if it can be seen to bring a benefit.       |
|                                 | Careful investigation of current error-rates and         |
|                                 | consideration of the overall throughput of the platform  |
|                                 | are recommended before using it.                         |
|                                 |                                                          |
|                                 | .. dovecotadded:: 2.3.15                                 |
+---------------------------------+----------------------------------------------------------+

Dovecot uses its own Scality key format, which encodes the object type also to
the key itself. See :ref:`scality_key_format`.

See also
********

.. toctree::
  :maxdepth: 1

  dictmap

  dictmap_cassandra_objectid
