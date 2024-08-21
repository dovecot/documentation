---
layout: doc
title: Lua Director
dovecotlinks:
  lua_director: Lua Director
---

# Lua Director

::: warning
This is an unsupported method of running Dovecot. Caveat emptor.

It is only intended for small-scale deployments - this is NOT designed to
scale for more than a few servers.
:::

Small scale deployments using NFS or other shared storage need a way to
ensure users end up in same backend. For this purpose, a simple
[[link,lua,Lua script]] can be used.

The example Lua scripts comes in two variants.

* username &lt;-&gt; hostname mapping only
  * https://github.com/dovecot/tools/blob/main/director.lua
* sharding (16-bit)
  * https://github.com/dovecot/tools/blob/main/director-shard.lua

The script can be run on a proxy directly, or one can have one dedicated
proxy node acting as a Lua director node running the script.

## Prerequisites

This script can use any SQL driver supported by
[Lua DBI](https://github.com/mwild1/luadbi).

If you have multiple Dovecot proxies, they all need the same data to route
users to the correct backend. Therefore, if you use a database engine
that supports data replication (such as MySQL or PostgreSQL), you can run
the script on each of your proxies.

For the shard version, you will also need to install
[CRC32 library](https://github.com/hjelmeland/luacrc32).

## Schema

::: code-group
```sql[username to hostname schema]
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
```

```sql[sharding schema]
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
```
:::

The user is routed to the backend in the `user_backend` table. If no entry
exists, the script creates one. If you used Dovecot 2.x's `director_tag`
functionality, you can create an entry yourself with the appropriate backend.

## Configuration

There are few ways you can use this script.

First, is drop-in replacement for director with no authentication.

```[dovecot.conf]
passdb db1 {
  driver = lua
  args = file=/etc/dovecot/director.lua nopassword
  # or password=masterpass
  # you can include other keys here too, they will be
  # included in the response.
}
```

Alternatively, if you wish to do authentication:

```[dovecot.conf]
passdb db1 {
  driver = pam
  result_success = continue-ok
}

passdb db2 {
  skip = unauthenticated
  driver = lua
  args = file=/etc/dovecot/director.lua noauthenticate
}
```

## Operations

There are no built-in tools in Dovecot to manage the database (such as
adding backends, kicking users, monitoring backends, etc.). You need to
build your own tooling.
