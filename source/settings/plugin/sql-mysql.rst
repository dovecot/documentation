=================
SQL Driver: MySQL
=================

Driver name ``mysql``.

Driver for MySQL / MariaDB server.

To compile support for this driver, you need to have MySQL client library and
headers installed.

For MariaDB, you need to have compatibility headers installed.

Supported Options
=================

.. dovecot_core:setting:: client_flags
   :default: 0
   :domain: sql-mysql
   :seealso: !https://dev.mysql.com/doc/c-api/8.0/en/mysql-real-connect.html
   :values: @uint

   Flags to use when connecting to the database, provided as base-10 number.


.. dovecot_core:setting:: connect_timeout
   :default: 5
   :domain: sql-mysql
   :values: @uint

   How many seconds to wait for connection.


.. dovecot_core:setting:: dbname
   :domain: sql-mysql
   :values: @string

   Database name to connect to.


.. dovecot_core:setting:: host
   :default: localhost
   :domain: sql-mysql
   :values: @string

   Host to connect to.

   Note that MySQL driver can default to using UNIX socket connection when
   host is localhost and port is left as default.

   To force it to use TCP connection, set ``host`` to ``127.0.0.1``.


.. dovecot_core:setting:: hostaddr
   :domain: sql-mysql
   :hdr_only: yes

   Alias for :dovecot_core:ref:`sql-mysql;host`.


.. dovecot_core:setting:: option_file
   :domain: sql-mysql
   :values: @string

   File to read for client library specific configuration.


.. dovecot_core:setting:: option_group
   :domain: sql-mysql
   :values: @string

   Section name to read from :dovecot_core:ref:`sql-mysql;option_file`.


.. dovecot_core:setting:: password
   :domain: sql-mysql
   :values: @string

   Password for authentication.


.. dovecot_core:setting:: port
   :default: 3306
   :domain: sql-mysql
   :values: @uint

   Port to connect to.


.. dovecot_core:setting:: read_timeout
   :default: 30
   :domain: sql-mysql
   :values: @uint

   Timeout in seconds when reading data from server.


.. dovecot_core:setting:: ssl_ca
   :domain: sql-mysql
   :values: @string

   Path to SSL certificate authority file to use to validate peer certificate.


.. dovecot_core:setting:: ssl_ca_path
   :domain: sql-mysql
   :values: @string

   Path to directory of SSL certificate authority files to use to validate
   peer certificate.


.. dovecot_core:setting:: ssl_cert
   :domain: sql-mysql
   :values: @string

   Path to a certificate file to use for authenticating against the remote
   server.


.. dovecot_core:setting:: ssl_cipher
   :default: !<library dependent>
   :domain: sql-mysql
   :values: @string

   Cipher to use when connecting. See client library documentation.


.. dovecot_core:setting:: ssl_key
   :domain: sql-mysql
   :values: @string

   Path to private key matching :dovecot_core:ref:`sql-mysql;ssl_cert` to use
   for authenticating against the remote server.


.. dovecot_core:setting:: ssl_verify_server_cert
   :default: no
   :domain: sql-mysql
   :values: @boolean

   Whether to verify server certificate.


.. dovecot_core:setting:: user
   :domain: sql-mysql
   :values: @string

   Username for authentication.


.. dovecot_core:setting:: write_timeout
   :default: 30
   :domain: sql-mysql
   :values: @uint

   Timeout in seconds when writing data to server.
