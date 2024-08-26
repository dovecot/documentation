---
layout: doc
title: SQLite
dovecotlinks:
  sql_sqlite: SQLite Configuration
---

# SQL Driver: SQLite

Driver name is `sqlite`.

To compile support for this driver. you need sqlite library and headers.

::: tip [[changed,sqlite_filename]]
Prior to v2.3.18, Dovecot uses the whole value as filename to connect,
whitespace included.

This was changed to support options, so it will use the first encountered
parameter that has no `=` as filename. Whitespace cannot be used in
filename.
:::

## Settings

<SettingsComponent tag="sql-sqlite" />
