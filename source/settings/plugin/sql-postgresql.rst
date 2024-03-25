.. _sql-pgsql:

======================
SQL Driver: PostgreSQL
======================

Driver name is ``postgresql``.

To compile support for this driver, you need PostgreSQL client library and headers.

Supported Options
-----------------

.. dovecot_core:setting:: pgsql
   :domain: sql-pgsql
   :values: @named_list_filter

   Creates a new PostgreSQL connection. If more than one is specified, the
   connections are automatically used for load balancing and for failover. The
   filter name refers to the :dovecot_core:ref:`sql-pgsql;pgsql_host` setting.


.. dovecot_core:setting:: pgsql_connection_limit
   :domain: sql-pgsql
   :values: @uint

   Maximum number of parallel connections.


.. dovecot_core:setting:: pgsql_host
   :domain: sql-pgsql
   :values: @string

   Host to connect to.
   The :dovecot_core:ref:`sql-pgsql;pgsql` setting defaults to this.


.. dovecot_core:setting:: pgsql_parameters
   :domain: sql-pgsql
   :values: @strlist

   List of key/value settings passed to PostgreSQL. See
   https://www.postgresql.org/docs/current/libpq-connect.html for
   available parameters.
