---
layout: doc
title: MySQL
---

# SQL Driver: MySQL

Driver name `mysql`.

Driver for MySQL / MariaDB server.

To compile support for this driver, you need to have MySQL client library and
headers installed.

For MariaDB, you need to have compatibility headers installed.

## Supported Options

### `client_flags`

* Default: `0`
* Values: [[link,settings_types_uint]]
* See Also: https://dev.mysql.com/doc/c-api/8.0/en/mysql-real-connect.html

Flags to use when connecting to the database, provided as base-10 number.

### `connect_timeout`

* Default: `5`
* Values: [[link,settings_types_uint]]

How many seconds to wait for connection.

### `dbname`

* Values: [[link,settings_types_string]]

Database name to connect to.

### `host`

* Default: `localhost`
* Values: [[link,settings_types_string]]

Host to connect to.

Note that MySQL driver can default to using UNIX socket connection when
host is localhost and port is left as default.

To force it to use TCP connection, set `host` to `127.0.0.1`.

### hostaddr

Alias for [`host`](#host).

### `option_file`

* Values: [[link,settings_types_string]]

File to read for client library specific configuration.

### `option_group`

* Values: [[link,settings_types_string]]

Section name to read from [`option_file`](#option-file).

### `password`

* Values: [[link,settings_types_string]]

Password for authentication.

### `port`

* Default: `3306`
* Values: [[link,settings_types_uint]]

Port to connect to.

### `read_timeout`

* Default: `30`
* Values: [[link,settings_types_uint]]

Timeout in seconds when reading data from server.

### `ssl_ca`

* Values: [[link,settings_types_string]]

Path to SSL certificate authority file to use to validate peer certificate.

### `ssl_ca_path`

* Values: [[link,settings_types_string]]

Path to directory of SSL certificate authority files to use to validate
peer certificate.

### `ssl_cert`

* Values: [[link,settings_types_string]]

Path to a certificate file to use for authenticating against the remote
server.

### `ssl_cipher`

* Default: &lt;library dependent&gt;
* Values: [[link,settings_types_string]]

Cipher to use when connecting. See client library documentation.

### `ssl_key`

* Values: [[link,settings_types_string]]

Path to private key matching [`ssl_cert`](#ssl-cert) to use for
authenticating against the remote server.

### `ssl_verify_server_cert`

* Default: `no`
* Values: [[link,settings_types_boolean]]

Whether to verify server certificate.

### `user`

* Values: [[link,settings_types_string]]

Username for authentication.

### `write_timeout`

* Default: `30`
* Values: [[link,settings_types_uint]]

Timeout in seconds when writing data to server.
