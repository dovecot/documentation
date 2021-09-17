================
SQL Driver MySQL
================

Driver name ``mysql``.

Driver for MySQL / MariaDB server.

To compile support for this driver, you need to have MySQL client library and headers installed.
For MariaDB, you need to have compability headers installed.

Supported options
=================

``host``
--------
- Default: localhost
- Value: :ref:`string`

Host to connect to.

Note that MySQL driver can default to using UNIX socket connection when host is localhost and port is left as default.
To force it to use TCP connection, set ``host`` to ``127.0.0.1``.

``hostaddr``
------------
Alias for ``host``.

``port``
--------
- Default: ``3306``
- Values: :ref:`uint`

``user``
--------
- Default: <empty>
- Values: :ref:`string`

Username for authentication.

``password``
------------
- Default: <empty>
- Values: :ref:`string`

Password for authentication.

``dbname``
----------
- Default: <empty>
- Values: :ref:`string`

Database name to connect.

``client_flags``
----------------
- Default: 0
- Values: :ref:`uint`

Flags to use when connecting to the database, provided as base-10 number.

.. seealso:: https://dev.mysql.com/doc/c-api/8.0/en/mysql-real-connect.html

``connect_timeout``
-------------------
- Default: 5
- Values: :ref:`uint`

How many seconds to wait for connection.

``read_timeout``
----------------
- Default: 30
- Values: :ref:`uint`

Timeout in seconds when reading data from server.

``write_timeout``
-----------------
- Default: 30
- Values: :ref:`uint`

Timeout in seconds when writing data to server.

``ssl_ca``
----------
- Default: <empty>
- Values: :ref:`string`

Path to SSL certificate authority file to use to validate peer certificate.

``ssl_ca_path``
---------------
- Default: <empty>
- Values: :ref:`string`

Path to directory of SSL certificate authority files to use to validate peer certificate.

``ssl_cert``
------------
- Default: <empty>
- Values: :ref:`string`

Path to a certificate file to use for authenticating against the remote server.

``ssl_key``
-----------
- Default: <empty>
- Values: :ref:`string`

Path to private key matching ``ssl_cert`` to use for authenticating against the remote server.

``ssl_cipher``
---------------
- Default: <library dependent>
- Values: :ref:`string`

Cipher to use when connecting. See client library documentation.

``ssl_verify_server_cert``
--------------------------
- Default: no
- Values: :ref:`boolean`

Whether to verify server certificate.

``option_file``
---------------
- Default: <empty>
- Values: :ref:`string`

File to read for client library specific configuration.

``option_group``
----------------
- Default: <empty>
- Values: :ref:`string`

Section name to read from ``option_file``.
