.. _howto_director_with_lua:

==============================
Run director with Lua on proxy
==============================


.. note:: Lua director is not supported for Dovecot Pro.

Small scale deployments using NFS or other shared storage need a way to ensure users
end up in same backend. For this purpose, a simple :ref:`Lua script <lua>` can be used.

As an example, there are two versions provided. One with direct user to backend mapping,
and one which uses 16-bit shard for each user. This can be useful for larger environments.

The Lua script comes in two variants, first one simply does username <-> hostname mapping,
and can be found at `<https://github.com/dovecot/tools/blob/main/director.lua>`_.
The second does sharding and can be found at `<https://github.com/dovecot/tools/blob/main/director-shard.lua>`_.

The script can be run on a proxy directly, or one can have one dedicated proxy node acting
as a Lua director node running the script.

Prerequisites
-------------

This script can use any SQL driver supported by `Lua DBI <https://github.com/mwild1/luadbi>`_.

If you have multiple Dovecot proxies, they all need the same data to route users to the correct
backend. Therefore, if you use a database engine that supports data replication (such as MySQL or
PostgreSQL), you can run the script on each of your proxies.

You will need `Lua DBI <https://github.com/mwild1/luadbi>`_, and a database driver for it.
For the shard version, you will need to install `CRC32 library <https://github.com/hjelmeland/luacrc32>`_.

Schema
------

Example SQL schema for the direct user to backend mapping.

.. code:: sql

  CREATE TABLE backends (
     id int not null primary key,
     hostname varchar(255) not null unique,
     hostip varchar(255),
     state smallint not null default 0
  );

  CREATE TABLE user_backend (
     backend_id int not null,
     user varchar(255),
     primary key(backend_id, user)
  );

And schema for the sharded version.

.. code:: sql

  CREATE TABLE backends (
     id INT NOT NULL PRIMARY KEY,
     hostname VARCHAR(255) NOT NULL,
     hostip VARCHAR(255)
  );

  CREATE TABLE user_backend (
     backend_id INT NOT NULL,
     user_hash INT NOT NULL,
     PRIMARY KEY (backend_id, user_hash)
  );

The user is routed to the backend in the `user_backend` table. If no entry exists, the script
creates one. If you used Dovecot 2.x's `director_tag` functionality, you can create an entry
yourself with the appropriate backend.

Configuration
-------------

There are few ways you can use this script.
First, and the most simple, is drop-in replacement for director with no authentication.

.. code::

  passdb {
    driver = lua
    args = file=/etc/dovecot/director.lua nopassword
    # or password=masterpass
    # you can include other keys here too, they will be
    # included in the response.
  }

If you wish to do authentication, you can do

.. code::

  passdb {
    driver = pam
    result_success = continue-ok
  }

  passdb {
    skip = unauthenticated
    driver = lua
    args = file=/etc/dovecot/director.lua noauthenticate
  }


Operations
----------

There are no built-in tools in Dovecot to manage the database (such as adding backends,
kicking users, monitoring backends, etc.). You need to build your own tooling.
