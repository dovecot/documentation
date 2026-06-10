---
layout: doc
title: MySQL
dovecotlinks:
  sql_mysql: MySQL/MariaDB Configuration
---

# SQL Driver: MySQL/MariaDB

Driver name `mysql`.

The mysql driver works with both MySQL and MariaDB. MariaDB is the recommended
choice, as a community-governed, fully open-source drop-in replacement.

To compile support for this driver, you need to have the MySQL or MariaDB
client library and development headers installed (for example
`libmysqlclient-dev`, or `libmariadb-dev` for MariaDB).

## Example Configuration

See [[link,auth_mysql]].

## Settings

<SettingsComponent tag="sql-mysql" />

## SSL/TLS Settings

Not all of Dovecot SSL settings are supported by the MySQL library. Below
is the list of supported settings:

<SettingsComponent tag="ssl-mysql" />
