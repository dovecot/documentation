---
layout: doc
title: MySQL
dovecotlinks:
  sql_mysql: MySQL Configuration
---

# SQL Driver: MySQL

Driver name `mysql`.

Driver for MySQL / MariaDB server.

To compile support for this driver, you need to have MySQL client library and
headers installed.

For MariaDB, you need to have compatibility headers installed.

## Settings

<SettingsComponent tag="sql-mysql" />

## SSL/TLS Settings

Not all of Dovecot SSL settings are supported by the MySQL library. Below
is the list of supported settings:

<SettingsComponent tag="ssl-mysql" />
