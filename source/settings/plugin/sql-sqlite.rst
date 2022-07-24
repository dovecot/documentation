==================
SQL Driver: SQLite
==================

Driver name is ``sqlite``.

To compile support for this driver. you need sqlite library and headers.

.. versionchanged:: v2.4/v3.0

   Prior to v2.4, Dovecot uses the whole value as filename to connect,
   whitespace included.

   This was changed to support options, so it will use the first encountered
   parameter that has no ``=`` as filename. Whitespace cannot be used in
   filename.

Supported Options
-----------------

.. dovecot_core:setting:: journal_mode
   :default: delete
   :domain: sql-sqlite
   :values: delete, wal

   Allows using write-ahead logging mode for database.

.. dovecot_core:setting:: readonly
   :default: no
   :domain: sql-sqlite
   :values: @boolean

   Specifies that this database is read-only and should not be attempted to be
   created or written to.
