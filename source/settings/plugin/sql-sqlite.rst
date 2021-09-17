=================
SQL Driver SQLite
=================

Driver name is ``sqlite``.

To compile support for this driver. you need sqlite library and headers.

Supported options
-----------------

.. versionchanged:: v2.4/v3.0

Prior v2.3.18, Dovecot uses the whole value as filename to connect, whitespace included.
This was changed to support options, so it will use the first encountered parameter that has no ``=`` as filename.
Whitespace cannot be used in filename.

``journal_mode``
----------------
- Default: ``delete``
- Values: ``delete``, ``wal``.

Allows using write-ahead logging mode for database.

``readonly``
-------------
- Default: ``no``
- Values: :ref:`boolean`

Specifies that this database is read-only and should not be attempted to be created or written to.

