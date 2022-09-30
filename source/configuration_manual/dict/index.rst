.. _dict:

====================
Dovecot Dictionaries
====================

Dovecot's lib-dict can be used to access simple key-value databases. This is
used by, for example, :ref:`quota_backend_dict`, :ref:`authentication-dict`,
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
:ref:`memcached-ascii <dict-memcached_ascii>`   Memcached (ASCII protocol)
:ref:`memcached-binary <dict-memcached_binary>` Memcached (Binary protocol)
:ref:`proxy <dict-proxy>`                       Proxy
:ref:`redis <dict-redis>`                       Redis
:ref:`sql <dict-sql>`                           SQL
=============================================== ===========================

.. _dict_pool:

Connection Pooling
------------------

The :ref:`dict-sql` driver keeps a maximum of 10 unused SQL connections open
(infinitely) and reuses them for SQL dict lookup requests.

.. versionadded:: v2.3.17

Starting version 2.3.17, the dict server process keeps the last 10 idle dict
backends cached for maximum of 30 seconds. Practically this acts as a
connection pool for :ref:`dict-redis`, :ref:`dict-memcached` and :ref:`dict-ldap`. Note that this
doesn't affect dict-sql, because it already had its own internal cache.


.. _dict-file:

Flat Files
----------

.. code-block:: none

  file:<path>

The file will simply contain all the keys that are used. Not very efficient
for large databases, but good for small ones such as a single user's quota.


.. _dict-fs:

Filesystem (lib-fs wrapper)
---------------------------

.. versionadded:: v2.2.11

.. code-block:: none

  fs:<driver>:<driver args>

This is a wrapper for lib-fs, which most importantly has the ``posix``
backend. So using:

.. code-block:: none

  fs:posix:prefix=/var/lib/dovecot/dict/

Would create a separate file under ``/var/lib/dovecot/dict`` for each key.


.. _dict-ldap:

LDAP
----

.. versionadded:: v2.2.24

LDAP support is very similar to :ref:`dict-sql` support, but there is no write
support.

Note that the LDAP backend must be used via :ref:`dict-proxy`.

See :ref:`authentication-ldap`.

Configuration
^^^^^^^^^^^^^

.. code-block:: none

  dict {
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

.. note:: Memcached dict support is considered deprecated and will be
          removed in the future. Users are advised to upgrade to Redis.

.. versionadded:: v2.2.9 

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

.. note:: Memcached dict support is considered deprecated and will be
          removed in the future. Users are advised to upgrade to Redis.

.. versionadded:: v2.2.9 

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

.. code-block:: none

  proxy:[<dict path>]:<destination dict>

Proxying is used to perform all dictionary accessing via the dict processes.
(The dict processes exist only if dict proxying is used.) This is especially
useful with backends where their initialization is relatively expensive, such
as SQL. The dict processes will perform connection pooling.

If ``<dict path>`` is specified, it points to the socket where the dict server
is answering. The default is to use ``$base_dir/dict``. Usually this is
changed to ``dict-async`` if the dict backend support asynchronous lookups
(e.g. ldap, pgsql, cassandra). The dict-async service allows more than one
client, so this configuration prevents creating unnecessarily many dict
processes.

The ``<destination dict>`` contains the dict name in the ``dict { .. }``
settings. For example: ``proxy:dict-async:quota``.

See :ref:`dict-proxy_process` for more information about the dict server.


.. _dict-redis:

Redis
-----

.. versionadded:: v2.2.9

Note that Redis backend is recommended to be used via :ref:`dict-proxy` to
support :ref:`connection pooling <dict_pool>`. Also, currently using Redis
without proxying may cause crashes.

.. code-block:: none

  redis:param=value:param2=value2:...

Supported parameters are:

+-------------------+----------+-----------------------------------------------+
| Parameter         | Required | Description                                   |
+===================+==========+===============================================+
| ``db``            | NO       | Database number (default: ``0``)              |
+-------------------+----------+-----------------------------------------------+
| ``expire_secs``   | NO       | Expiration value for all keys (in seconds)    |
|                   |          | (default: no expiration)                      |
+-------------------+----------+-----------------------------------------------+
| ``host``          | NO       | Redis server host (default: ``127.0.0.1``)    |
+-------------------+----------+-----------------------------------------------+
| ``port``          | NO       | Redis server port (default: ``11211``)        |
+-------------------+----------+-----------------------------------------------+
| ``prefix``        | NO       | Prefix to add to all keys (default: none)     |
+-------------------+----------+-----------------------------------------------+
| ``timeout_msecs`` | NO       | Abort lookups after specified number of       |
|                   |          | milliseconds (default: ``30000``)             |
+-------------------+----------+-----------------------------------------------+


.. _dict-sql:

SQL
---

Note that the SQL backend must be used via :ref:`dict-proxy`.

.. code-block:: none

  <sql driver>:<path to dict-sql config>

The ``<sql driver>`` component contains the SQL driver name, such as
``mysql``, ``pgsql``, ``sqlite``, or ``cassandra``.

The dict-sql config file consists of SQL server configuration and mapping of
keys to SQL tables/fields.

See :ref:`authentication-sql`.

SQL Connect String
^^^^^^^^^^^^^^^^^^

.. code-block:: none

  connect = host=localhost dbname=mails user=sqluser password=sqlpass

The connect setting is exactly the same as used for
:ref:`SQL Authentication <authentication-sql>`.

SQL Mapping
^^^^^^^^^^^

SQL mapping is done with a dict key pattern and fields. When a dict lookup or
update is done, Dovecot goes through all the maps and uses the first one whose
pattern matches the dict key.

For example when using dict for a per-user quota value the map looks like:

.. code-block:: none

  map {
    pattern = priv/quota/storage
    table = quota
    username_field = username
    value_field = quota_bytes
  }

* The dict key must match exactly ``priv/quota/storage``. The dict keys are
  hardcoded in the Dovecot code, so depending on what functionality you're
  configuring you need to know the available dict keys used it.
* This is a private dict key (``priv/`` prefix), which means that there must
  be a username_field. The ``username_field`` is assumed to be (at least part
  of) the primary key. In this example we don't have any other primary keys.
* With MySQL the above map translates to SQL queries:

  * ``SELECT quota_bytes FROM quota WHERE username = '$username_field'``
  * ``INSERT INTO quota (username, quota_bytes) VALUES ('$username_field',
    '$value') ON DUPLICATE KEY UPDATE quota_bytes='$value'``

You can also access multiple SQL fields. For example
:dovecot_plugin:ref:`acl_shared_dict` can contain:

.. code-block:: none

  map {
    pattern = shared/shared-boxes/user/$to/$from
    table = user_shares
    value_field = dummy

    fields {
      from_user = $from
      to_user = $to
    }
  }

* The ``acl_shared_dict`` always uses ``1`` as the value, so here the
  ``value_field`` is called ``dummy``.
* The SQL ``from_user`` and ``to_user`` fields are the interesting ones.
  Typically the extra fields would be part of the primary key.
* With MySQL the above map translates to SQL queries:

  * ``SELECT dummy FROM user_shares WHERE from_user = '$from' AND to_user =
    '$to'``
  * ``INSERT INTO user_shares (from_user, to_user, dummy) VALUES ('$from',
    '$to', '$value') ON DUPLICATE KEY UPDATE dummy='$value'``

See Also
--------

.. toctree::
  :maxdepth: 1

  proxy
