.. _setting-cluster:

================
Cluster Settings
================

See :ref:`settings` for list of all setting groups.

Common Settings
^^^^^^^^^^^^^^^

These settings are for both Dovecot proxies and backends.

.. cluster:setting:: cluster_geodb
   :values: @string

   Dictionary URI used for the globally shared GeoDB. This typically points
   to Cassandra.

.. cluster:setting:: cluster_local_site
   :values: @string

   Name of the local site. This must be the same name as used by
   ``doveadm cluster site`` commands.

.. cluster:setting:: cluster_localdb
   :values: @string

   Dictionary URI used for the server-specific local database. This typically
   points to SQLite under ``/dev/shm``.

Proxy Settings
^^^^^^^^^^^^^^

These settings are only for Dovecot proxies. Don't set them in backends.

.. cluster:setting:: cluster_proxy_check_backends
   :default: yes
   :values: @boolean

   If enabled, this proxy runs checks to see whether backends are up or down.
   If disabled, this proxy never sets any backends offline. This setting is
   used only by proxies.

.. cluster:setting:: cluster_backend_test_username
   :values: @string

   This setting is used for two purposes:

   #. Username used by proxy for logging into backends to see if it's up or
      down. ``%{backend_host}`` variable expands to the hostname of the backend.
   #. Username used by backend for running ``doveadm cluster group access``
      command. This command just needs any existing user to work - it doesn't
      matter that it's not actually in the accessed group.

.. cluster:setting:: cluster_backend_test_password
   :values: @string

   Password used for logging into backends to see if it's up or down.

.. cluster:setting:: cluster_default_group_count
   :values: @uint

   Number of user groups that may be automatically created. This is used for
   creating a group for a user that doesn't yet have one. The group will be
   named ``default-N`` where N is between 1 and ``cluster_default_group_count``.

.. cluster:setting:: cluster_user_move_timeout
   :values: @time

   If user moving hasn't finished by this timeout, just assume it finished and
   continue to the next user.

Backend Settings
^^^^^^^^^^^^^^^^

These settings are only for Dovecot backends. Don't set them in proxies.

.. cluster:setting:: cluster_backend_name
   :values: @string

   Host name of the backend. This must be the same name as used by
   ``doveadm cluster backend`` commands.
