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

.. dovecot_core:setting:: mysql
   :domain: sql-mysql
   :values: @named_list_filter

   Creates a new MySQL connection. If more than one is specified, the
   connections are automatically used for load balancing and for failover. The
   filter name refers to the :dovecot_core:ref:`sql-mysql;mysql_host` setting.


.. dovecot_core:setting:: mysql_client_flags
   :default: 0
   :domain: sql-mysql
   :seealso: !https://dev.mysql.com/doc/c-api/8.0/en/mysql-real-connect.html
   :values: @uint

   Flags to use when connecting to the database, provided as base-10 number.


.. dovecot_core:setting:: mysql_connect_timeout
   :default: 5s
   :domain: sql-mysql
   :values: @time

   How long to wait for connection.


.. dovecot_core:setting:: mysql_connection_limit
   :domain: sql-mysql
   :values: @uint

   Maximum number of parallel connections. Currently MySQL queries are
   blocking, so only a single connection can be used in parallel.


.. dovecot_core:setting:: mysql_dbname
   :domain: sql-mysql
   :values: @string

   Database name to connect to.


.. dovecot_core:setting:: mysql_host
   :default: localhost
   :domain: sql-mysql
   :values: @string

   Host or UNIX socket path to connect to.
   The :dovecot_core:ref:`sql-mysql;mysql` setting defaults to this.

   Note that MySQL driver can default to using UNIX socket connection when
   host is ``localhost`` and port is 0 (default). To force it to use TCP
   connection, set ``mysql_host`` to ``127.0.0.1`` or set ``mysql_port``
   explicitly.


.. dovecot_core:setting:: mysql_option_file
   :domain: sql-mysql
   :values: @string

   File to read for client library specific configuration.


.. dovecot_core:setting:: mysql_option_group
   :domain: sql-mysql
   :values: @string

   Section name to read from :dovecot_core:ref:`sql-mysql;mysql_option_file`.


.. dovecot_core:setting:: mysql_password
   :domain: sql-mysql
   :values: @string

   Password for authentication.


.. dovecot_core:setting:: mysql_port
   :default: 0 (defaults to 3306 for TCP connections)
   :domain: sql-mysql
   :values: @uint

   Port to connect to.


.. dovecot_core:setting:: mysql_read_timeout
   :default: 30s
   :domain: sql-mysql
   :values: @time

   Timeout when reading data from server.


.. dovecot_core:setting:: mysql_ssl
   :domain: sql-mysql
   :values: @boolean

   Whether to use SSL when connecting to MySQL. Configure it using the
   ``ssl_client_*`` settings.


.. dovecot_core:setting:: mysql_user
   :domain: sql-mysql
   :values: @string

   Username for authentication.


.. dovecot_core:setting:: mysql_write_timeout
   :default: 30s
   :domain: sql-mysql
   :values: @time

   Timeout in seconds when writing data to server.
