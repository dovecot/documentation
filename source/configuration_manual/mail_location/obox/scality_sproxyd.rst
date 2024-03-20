.. _scality_sproxyd:

===============
Scality sproxyd
===============

Using the sproxy driver requires using fs-dictmap/Cassandra. See
:ref:`dictmap_configuration` and :ref:`dictmap_cassandra` for details and an
example configuration.

.. code-block:: none

   # Basic configuration:
   fs sproxyd {
     url = http://scality.example.com/
   }

Dovecot uses its own Scality key format, which encodes the object type also to
the key itself. See :ref:`scality_key_format`.

.. _fs-sproxyd:

Sproxyd Settings
----------------

See also :ref:`fs-http`.

.. dovecot_plugin:setting_filter:: fs_sproxyd
   :filter: fs_sproxyd
   :plugin: obox
   :values: @named_filter

   Filter for sproxyd-specific settings.


.. dovecot_plugin:setting:: fs_sproxyd_url
   :plugin: obox
   :values: @string

   URL for accessing the sproxyd storage.


.. dovecot_plugin:setting:: fs_sproxyd_class
   :plugin: obox
   :values: @uint
   :default: 2

   Scality Class of Service. 2 means that the objects are written to the
   Scality RING 3 times in total. This is generally the minimum allowable
   redundancy for mail and index objects.

   FTS data is more easily reproducible, so losing those indexes is not as
   critical; Class of Service 1 may be appropriate based on customer
   requirements.


.. dovecot_plugin:setting:: fs_sproxyd_avoid_423_timeout
   :plugin: obox
   :values: @time_msecs
   :default: 0

   Using this setting allows to delay DELETE requests if the same object ID
   has been GET/HEAD/PUT by the same process within <:ref:`time_msecs`>. This
   is intended to reduce "423 Locked" sent by Scality.

   When 0, no delay is added. Normally this setting should not be used. It
   should be only be set, if it can be seen to bring a benefit. Careful
   investigation of current error-rates and consideration of the overall
   throughput of the platform are recommended before using it.


.. dovecot_plugin:setting:: fs_sproxyd_access_by_path
   :plugin: obox
   :values: @boolean
   :default: no

   Objects are accessed by path instead of by object ID. Scality sproxyd
   internally converts the paths into object IDs. This shouldn't normally be
   used.


.. _sproxyd_http_settings:

Default HTTP Settings
---------------------

fs-sproxyd overrides some of the default HTTP client settings:

 * :dovecot_core:ref:`http_client_max_idle_time` = 1s
 * :dovecot_core:ref:`http_client_max_parallel_connections` = 10
 * :dovecot_core:ref:`http_client_max_connect_attempts` = 3
 * :dovecot_core:ref:`http_client_request_max_redirects` = 2
 * :dovecot_core:ref:`http_client_request_max_attempts` = 5
 * :dovecot_core:ref:`http_client_connect_backoff_max_time` = 1s
 * :dovecot_core:ref:`http_client_user_agent` = Dovecot/VERSION
 * :dovecot_core:ref:`http_client_connect_timeout` = 5s
 * :dovecot_core:ref:`http_client_request_timeout` = 10s

You can override these and any other HTTP client or SSL settings by placing
them inside :dovecot_plugin:ref:`fs_sproxyd` named filter.

See also
********

.. toctree::
  :maxdepth: 1

  dictmap

  dictmap_cassandra_objectid
