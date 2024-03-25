.. _dict:

====================
Dovecot Dictionaries
====================

Dovecot's lib-dict can be used to access simple key-value databases. This is
used by, for example, :ref:`authentication-dict`,
:ref:`lastlogin_plugin`, and :ref:`imap_metadata`. The dictionaries can be
accessed either directly by the mail processes or they can be accessed via
:ref:`dict-proxy_process` processes.

Currently supported dict backends are:

=============================================== ===========================
Name                                            Description
=============================================== ===========================
:ref:`file <dict-file>`                         Flat Files
:ref:`fs <dict-fs>`                             FS (lib-fs wrapper)
:ref:`ldap <dict-ldap>`                         LDAP (read only)
:ref:`proxy <dict-proxy>`                       Proxy
:ref:`redis <dict-redis>`                       Redis
:ref:`sql <dict-sql>`                           SQL
=============================================== ===========================

Dict Settings
-------------

.. dovecot_core:setting:: dict
   :values: @named_list_filter

   Creates a new dict. The filter name refers to the
   :dovecot_core:ref:`dict_name` setting.

   Example::

     dict file {
       [...]
     }

   Since an empty :dovecot_core:ref:`dict_driver` defaults to ``dict_name``,
   there is no need to specify ``dict_driver`` setting explicitly.


.. dovecot_core:setting:: dict_name
   :values: @string

   Name of the dict. The :dovecot_core:ref:`dict_driver` setting defaults to this.


.. dovecot_core:setting:: dict_driver
   :values: @string
   :default: @dict_name;dovecot_core

   The dict driver to use. Defaults to :dovecot_core:ref:`dict_name`.

.. _dict_pool:

Connection Pooling
------------------

The SQL drivers keep a persistent connection open to the database after it's
been accessed once. The connection is reused for other SQL lookups as long as
their SQL settings are exactly the same. Opened SQL connections are currently
never closed.


.. _dict-file:

Flat Files
----------

The file will simply contain all the keys that are used. Not very efficient
for large databases, but good for small ones such as a single user's quota.

.. dovecot_core:setting:: dict_file_path
   :values: @string

   Path for the dictionary file.


.. _dict-fs:

Filesystem (lib-fs wrapper)
---------------------------

.. dovecotadded:: 2.2.11

This is a wrapper for lib-fs, which most importantly has the ``posix``
backend. Use the :dovecot_core:ref:`fs` setting to configure the filesystem.
For example:

.. code-block:: none

  dict fs {
    fs posix {
      prefix = /var/lib/dovecot/dict/
    }
  }

This creates a separate file under ``/var/lib/dovecot/dict`` for each key.


.. _dict-ldap:

LDAP
----

.. dovecotadded:: 2.2.24

LDAP support is very similar to :ref:`dict-sql` support, but there is no write
support.

Note that the LDAP backend must be used via :ref:`dict-proxy`.

See :ref:`authentication-ldap`.

Configuration
^^^^^^^^^^^^^

.. code-block:: none

  dict_legacy {
    somedict = ldap:/path/to/dovecot-ldap-dict.conf.ext
  }

Parameters in .ext file:

+--------------+----------+----------------------------------------------------+
| Parameter    | Required | Description                                        |
+==============+==========+====================================================+
| ``uri``      | **YES**  | LDAP connection URI as expected by OpenLDAP.       |
+--------------+----------+----------------------------------------------------+
| ``bind_dn``  | NO       | DN or upn to use for binding. (default: none)      |
+--------------+----------+----------------------------------------------------+
| ``debug``    | NO       | Enable debug. ``0`` = off (default), ``1`` = on.   |
+--------------+----------+----------------------------------------------------+
| ``password`` | NO       | Password to use, only SIMPLE auth is supported at  |
|              |          | the moment. (default: none)                        |
+--------------+----------+----------------------------------------------------+
| ``timeout``  | NO       | How long to wait for reply, in seconds. (default:  |
|              |          | 30 seconds)                                        |
+--------------+----------+----------------------------------------------------+
| ``tls``      | NO       | Use TLS?                                           |
|              |          |                                                    |
|              |          | * ``yes``: Require either ldaps or successful      |
|              |          |   start TLS                                        |
|              |          | * ``try``: Send start TLS if necessary (default)   |
|              |          | * ``no``:  Do not send start TLS.                  |
+--------------+----------+----------------------------------------------------+

Configuration Examples
**********************

To map a key to a search:

.. code-block:: none

  map {
    pattern = priv/test/mail
    filter = (mail=*)  # the () is required
    base_dn = ou=container,dc=domain
    username_attribute = uid # default is cn
    value_attribute = mail
  }

To do a more complex search:

.. code-block:: none

  map {
    pattern = priv/test/mail/$location
    filter = (&(mail=*)(location=%{location}) # the () is required
    base_dn = ou=container,dc=domain
    username_attribute = uid # default is cn
    value_attribute = mail

    fields {
      location=$location
    }
  }


.. _dict-memcached_ascii:

Memcached (ASCII Protocol)
--------------------------

.. dovecotadded:: 2.2.9
.. dovecotremoved:: 2.4.0,3.0.0

.. note:: Users are advised to upgrade to Redis.

This driver uses the "legacy" Memcache ASCII protocol.

https://github.com/memcached/memcached/blob/master/doc/protocol.txt

.. code-block:: none

  memcached_ascii:param=value:param2=value2:...

Supported parameters are:

+-------------------+----------+-----------------------------------------------+
| Parameter         | Required | Description                                   |
+===================+==========+===============================================+
| ``host``          | NO       | Memcached server host (default:               |
|                   |          | ``127.0.0.1``)                                |
+-------------------+----------+-----------------------------------------------+
| ``port``          | NO       | Memcached server port (default: ``11211``)    |
+-------------------+----------+-----------------------------------------------+
| ``prefix``        | NO       | Prefix to add to all keys (default: none)     |
+-------------------+----------+-----------------------------------------------+
| ``timeout_msecs`` | NO       | Abort lookups after specified number of       |
|                   |          | milliseconds (default: ``30000``)             |
+-------------------+----------+-----------------------------------------------+


.. _dict-memcached_binary:

Memcached (Binary Protocol)
---------------------------

.. dovecotadded:: 2.2.9
.. dovecotremoved:: 2.4.0,3.0.0

.. note:: Users are advised to upgrade to Redis.

This driver uses the "new" Memcache binary protocol.

See: https://code.google.com/p/memcached/wiki/MemcacheBinaryProtocol

.. code-block:: none

  memcached:param=value:param2=value2:...

Supported parameters are:

+-------------------+----------+-----------------------------------------------+
| Parameter         | Required | Description                                   |
+===================+==========+===============================================+
| ``host``          | NO       | Memcached server host (default:               |
|                   |          | ``127.0.0.1``)                                |
+-------------------+----------+-----------------------------------------------+
| ``port``          | NO       | Memcached server port (default: ``11211``)    |
+-------------------+----------+-----------------------------------------------+
| ``prefix``        | NO       | Prefix to add to all keys (default: none)     |
+-------------------+----------+-----------------------------------------------+
| ``timeout_msecs`` | NO       | Abort lookups after specified number of       |
|                   |          | milliseconds (default: ``30000``)             |
+-------------------+----------+-----------------------------------------------+


.. _dict-proxy:

Proxy
-----

The proxy driver performs dictionary accessing via the :ref:`dict-proxy_process`.
(The dict processes exist only if dict proxying is used.) This is especially
useful with backends where their initialization is relatively expensive, such
as SQL. The dict processes will perform connection pooling.

.. dovecot_core:setting:: dict_proxy_name
   :values: @string

   Name of the dict to access in the dict server. This refers to the
   :dovecot_core:ref:`dict_name` setting.


.. dovecot_core:setting:: dict_proxy_socket_path
   :values: @string
   :default: dict

   Points to the dict server's UNIX socket. The path is relative to the
   :dovecot_core:ref:`base_dir` setting. This should be changed to
   ``dict-async`` if the dict backend support asynchronous lookups
   (e.g. ldap, pgsql, cassandra, NOT mysql). The ``dict-async`` service allows
   more than one client, so this configuration prevents creating unnecessarily
   many dict processes.


.. dovecot_core:setting:: dict_proxy_idle_timeout
   :values: @time_msecs
   :default: 0

   How long to keep connection open to dict server before disconnecting.
   0 means immediate disconnection after finishing the operation.


.. dovecot_core:setting:: dict_proxy_slow_warn
   :values: @time_msecs
   :default: 5s

   Log a warning about dict lookups that take longer than this interval.


.. _dict-redis:

Redis
-----

.. dovecotadded:: 2.2.9

Redis backend is recommended to be used via :ref:`dict-proxy` to
support connection pooling.

.. dovecot_core:setting:: dict_redis_socket_path
   :values: @string

   UNIX socket path to the Redis server. This is used over
   :dovecot_core:ref:`dict_redis_host` if both are set.


.. dovecot_core:setting:: dict_redis_host
   :values: @string
   :default: 127.0.0.1

   Redis server host.


.. dovecot_core:setting:: dict_redis_port
   :values: !<1-65535>
   :default: 6379

   Redis server port.


.. dovecot_core:setting:: dict_redis_password
   :values: @string

   Redis server password.


.. dovecot_core:setting:: dict_redis_db_id
   :values: @uint
   :default: 0

   Database number.


.. dovecot_core:setting:: dict_redis_key_prefix
   :values: @string

   Prefix to add to all keys.


.. dovecot_core:setting:: dict_redis_expire
   :values: @time
   :default: 0

   Expiration value for all keys. 0 = no expiration.


.. dovecot_core:setting:: dict_redis_request_timeout
   :values: @time_msecs
   :default: 30s

   How long to wait for answer before aborting request.


.. _dict-sql:

SQL
---

Note that the SQL backend must be used via :ref:`dict-proxy`. See :ref:`sql`
for SQL-driver specific settings.

.. dovecot_core:setting:: dict_map
   :values: @named_list_filter

   Creates a new dict mapping. The filter name refers to the
   :dovecot_core:ref:`dict_map_pattern` setting.


.. dovecot_core:setting:: dict_map_pattern
   :values: @string

   Pattern that is matched to the accessed dict keys. The
   :dovecot_core:ref:`dict_map` filter name refers to this setting.
   If the pattern matches the key, this dict map (and no other) is used.
   The dict maps are processed in the order list in configuration file.


.. dovecot_core:setting:: dict_map_sql_table
   :values: @string

   SQL table to use for accessing this dict map.


.. dovecot_core:setting:: dict_map_username_field
   :values: @string

   Field in the SQL table to use for accessing private dict keys in this dict
   map. This setting is optional if only shared keys are accessed.


.. dovecot_core:setting:: dict_map_expire_field
   :values: @string

   Field in the SQL table to use for tracking dict key expiration. This field
   is optional if no expiration is used by the code accessing the dict map.


.. dovecot_core:setting:: dict_map_value
   :values: @named_list_filter

   Creates a new value for the dict map. The filter name refers to the
   :dovecot_core:ref:`dict_map_value_name` setting. Dict supports
   reading/writing multiple values for the same key.


.. dovecot_core:setting:: dict_map_field
   :values: @named_list_filter

   Creates a new field for the dict map. The filter name refers to the
   :dovecot_core:ref:`dict_map_field_pattern` setting. The fields are part of
   the SQL query looking up the dict key.


.. dovecot_core:setting:: dict_map_value_name
   :values: @string

   Field in the SQL table to use for the :dovecot_core:ref:`dict_map_value`.


.. dovecot_core:setting:: dict_map_value_type
   :default: string
   :values: string, int, uint, double, hexblob, uuid

   Type of the field in the SQL table for the :dovecot_core:ref:`dict_map_value`.


.. dovecot_core:setting:: dict_map_field_pattern
   :values: @string

   Variable in the :dovecot_core:ref:`dict_map_pattern` that maps to this
   :dovecot_core:ref:`dict_map_field`. The value must always begin with ``$``.


.. dovecot_core:setting:: dict_map_field_name
   :values: @string

   Field in the SQL table to use for the :dovecot_core:ref:`dict_map_field`.


.. dovecot_core:setting:: dict_map_field_type
   :default: string
   :values: string, int, uint, double, hexblob, uuid

   Type of the field in the SQL table for the :dovecot_core:ref:`dict_map_field`.


SQL Mapping
^^^^^^^^^^^

The SQL database fields are mapped into dict keys using
:dovecot_core:ref:`dict_map` setting. When a dict lookup or update is done,
Dovecot goes through all the maps and uses the first one whose pattern matches
the dict key.

For example when using dict for a per-user quota value the map looks like:

.. code-block:: none

  dict_map priv/quota/storage {
    sql_table = quota
    username_field = username
    value quota_bytes {
    }
  }

* The dict key must match exactly ``priv/quota/storage``. The dict keys are
  hardcoded in the Dovecot code, so depending on what functionality you're
  configuring you need to know the available dict keys used it.
* This is a private dict key (``priv/`` prefix), which means that there must
  be a ``username_field``. The ``username_field`` is assumed to be (at least part
  of) the primary key. In this example we don't have any other primary keys.
* With MySQL the above map translates to SQL queries:

  * ``SELECT quota_bytes FROM quota WHERE username = '$username_field'``
  * ``INSERT INTO quota (username, quota_bytes) VALUES ('$username_field',
    '$value') ON DUPLICATE KEY UPDATE quota_bytes='$value'``

You can also access multiple SQL fields. For example
:dovecot_plugin:ref:`acl_sharing_map` can contain:

.. code-block:: none

  dict_map shared/shared-boxes/user/$to/$from {
    sql_table = user_shares
    value dummy {
    }

    field from_user {
      pattern = $from
    }
    field to_user {
      pattern = $to
    }
  }

* The :dovecot_plugin:ref:`acl_sharing_map` always uses ``1`` as the value, so here the
  ``value`` field is called ``dummy``.
* The SQL ``from_user`` and ``to_user`` fields are the interesting ones.
  Typically the extra fields would be part of the primary key.
* With MySQL the above map translates to SQL queries:

  * ``SELECT dummy FROM user_shares WHERE from_user = '$from' AND to_user =
    '$to'``
  * ``INSERT INTO user_shares (from_user, to_user, dummy) VALUES ('$from',
    '$to', '$value') ON DUPLICATE KEY UPDATE dummy='$value'``

SQL dict with mail_attribute
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

It's possible to implement :dovecot_core:ref:`mail_attribute` also with
SQL dict.

.. warning:: Using shared attributes in ``mail_attribute`` requires the
             mailbox GUID to be unique between users. This is not the case when
	     mails were migrated via imapc, because it uses a hash of the
	     mailbox name as the GUID. So every migrated user would have
	     exactly the same INBOX GUID, preventing the use of dict-sql. It is
	     currently not possible to add a username as an additional unique
	     identifier.

.. code-block:: none

  # CREATE TABLE mailbox_private_attributes (
  #   username VARCHAR(255),
  #   mailbox_guid VARCHAR(32),
  #   attr_key VARCHAR(255),
  #   attr_value TEXT,
  #   PRIMARY KEY (username, mailbox_guid, attr_key)
  # )
  dict_map priv/$mailbox_guid/$key {
    sql_table = mailbox_private_attributes
    username_field = user
    value attr_value {
    }

    field attr_key {
      pattern = $key
    }
    field mailbox_guid {
      pattern = $mailbox_guid
    }
  }

  # CREATE TABLE mailbox_shared_attributes (
  #   mailbox_guid VARCHAR(32),
  #   attr_key VARCHAR(255),
  #   attr_value TEXT,
  #   PRIMARY KEY (mailbox_guid, attr_key)
  # );
  dict_map shared/$mailbox_guid/$key {
    sql_table = mailbox_shared_attributes
    value attr_value {
    }

    field attr_key {
      pattern = $key
    }
    field mailbox_guid {
      pattern = $mailbox_guid
    }
  }

See Also
--------

.. toctree::
  :maxdepth: 1

  proxy
