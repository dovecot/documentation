.. _setting-hacluster:

==================
HACluster Settings
==================

See :ref:`settings` for list of all setting groups.

Common Settings
^^^^^^^^^^^^^^^

These settings are for both Dovecot proxies and backends.

.. hacluster:setting:: hacluster_geodb
   :values: @string

   Dictionary URI used for the globally shared GeoDB. This typically points
   to Cassandra.

.. hacluster:setting:: hacluster_local_site
   :values: @string

   Name of the local site. This must be the same name as used by
   ``doveadm hacluster site`` commands.

.. hacluster:setting:: hacluster_localdb
   :values: @string

   Dictionary URI used for the server-specific local database. This typically
   points to SQLite under ``/dev/shm``.

Proxy Settings
^^^^^^^^^^^^^^

These settings are only for Dovecot proxies. Don't set them in backends.

.. hacluster:setting:: hacluster_backend_test_username
   :values: @string

   Username used for logging into backends to see if it's up or down.
   ``%{backend_host}`` variable expands to the hostname of the backend.

.. hacluster:setting:: hacluster_backend_test_password
   :values: @string

   Password used for logging into backends to see if it's up or down.

.. hacluster:setting:: hacluster_default_group_count
   :values: @uint

   Number of user groups that may be automatically created. This is used for
   creating a group for a user that doesn't yet have one. The group will be
   named ``default-N`` where N is between 1 and ``hacluster_default_group_count``.

.. hacluster:setting:: hacluster_user_move_timeout
   :values: @time

   If user moving hasn't finished by this timeout, just assume it finished and
   continue to the next user.

Backend Settings
^^^^^^^^^^^^^^^^

These settings are only for Dovecot backends. Don't set them in proxies.

.. hacluster:setting:: hacluster_backend_name
   :values: @string

   Host name of the backend. This must be the same name as used by
   ``doveadm hacluster backend`` commands.
