---
layout: doc
title: PostgreSQL
dovecotlinks:
  sql_postgresql: PostgreSQL Configuration
---

# SQL Driver: PostgreSQL

Driver name is `postgresql`.

To compile support for this driver, you need PostgreSQL client library and
headers.

## Supported Options

PostgreSQL parses the connection string directly. Dovecot only parses the
`host` argument.

::: info
See Also:
* https://www.postgresql.org/docs/9.0/libpq-connect.html
:::
