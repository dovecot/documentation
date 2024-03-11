==================
SQL Driver: SQLite
==================

Driver name is ``sqlite``.

To compile support for this driver. you need sqlite library and headers.

Supported Options
-----------------

.. dovecot_core:setting:: sqlite_path
   :domain: sql-sqlite
   :values: @string

   Path to the sqlite database.


.. dovecot_core:setting:: sqlite_journal_mode
   :default: wal
   :domain: sql-sqlite
   :values: delete, wal

   Allows using write-ahead logging mode for database.


.. dovecot_core:setting:: sqlite_readonly
   :default: no
   :domain: sql-sqlite
   :values: @boolean

   Specifies that this database is read-only and should not be attempted to be
   created or written to.
