.. _authentication-sql:

====
SQL
====

SQL can be used for both passdb and userdb lookups. If all the SQL settings for
the passdb and userdb are equal, only one SQL connection is used for both
passdb and userdb lookups.

.. contents::

Dovecot configuration
=====================

``dovecot.conf``:

.. code-block:: none

  #sql driver-specific settings

  passdb sql {
    sql_driver = ...
    sql_query = ...
  }

Settings
========

.. dovecot_core:setting:: passdb_sql_query
   :values: @string

   SQL query to lookup the passdb fields (``password`` and other extra fields).


.. dovecot_core:setting:: passdb_sql_update_query
   :values: @string

   SQL query to update the password. Currently used only by the ``OTP``
   auth mechanism.


.. dovecot_core:setting:: userdb_sql_query
   :values: @string

   SQL query to lookup the userdb fields.


.. dovecot_core:setting:: userdb_sql_iterate_query
   :values: @string

   SQL query to list all available usernames.


Password database lookups
=========================

:dovecot_core:ref:`passdb_sql_query` setting contains the SQL query to look up the password. It must
return a field named ``password``. If you have it by any other name in the
database, you can use the SQL's ``AS`` keyword (``SELECT pw AS password ..``).
You can use all the normal :ref:`config_variables`
such as ``%u`` in the SQL query.

If all the passwords are in same format, you can use :dovecot_core:ref:`passdb_default_password_scheme` to
specify it. Otherwise each password needs to be prefixed with
``{password-scheme}``, for example ``{plain}cleartext-password``. See
:ref:`authentication-password_schemes` for a list of supported password schemes.

By default MySQL does case-insensitive string comparisons, so you may have a
problem if your users are logging with different as ``user``, ``User`` and
``uSer``. To fix this, you can make the SQL database return a
:ref:`authentication-user_extra_field`, which makes
Dovecot modify the username to the returned value.

.. Note:: If you're using separate user and domain fields, a common problem is
          that you're returning only the ``user`` field from the database.
          **This drops out the domain from the username**. So make sure you're
          returning a concatenated ``user@domain`` string or username/domain
          fields separately. See the examples below.

The query can also return other
:ref:`authentication-password_database_extra_fields` which have special
meaning.

You can't use multiple statements in one query, but you could use a stored
procedure. If you want something like a last login update, use
:ref:`post_login_scripting` instead.

Password verification by SQL server
===================================

If the passwords are in some special format in the SQL server that Dovecot
doesn't recognize, it's still possible to use them. Change the SQL query to
return NULL as the password and return the row only if the password matches.
You'll also need to return a non-NULL ``nopassword`` field. The password is in
``%w`` variable. For example:

.. code-block:: none

  passdb sql {
    sql_query = SELECT NULL AS password, 'Y' as nopassword, userid AS user \
      FROM users WHERE userid = '%u' AND mysql_pass = password('%w')
  }

This of course makes the verbose logging a bit wrong, since password mismatches
are also logged as ``unknown user``.

User database lookups
=====================

Usually your SQL database contains also the userdb information. This means
user's UID, GID and home directory. If you're using only static UID and GID,
and your home directory can be specified with a template, you could use static
userdb instead. It is also a bit faster since it avoids doing the userdb SQL
query.

:dovecot_core:ref:`userdb_sql_query` setting contains the SQL query to look up the userdb
information. The commonly returned userdb fields are uid, gid, home and mail.
See :ref:`authentication-user_database_extra_fields` for more information
about these and other fields that can be returned.

If you're using a single UID and GID for all users, you can set them in
dovecot.conf with:

.. code-block:: none

  mail_uid = vmail
  mail_gid = vmail

User iteration
==============

Some commands, such as ``doveadm -A`` need to get a list of users. With SQL
userdb this is done with :dovecot_core:ref:`userdb_sql_iterate_query` setting. You can either return

* ``user`` field containing either user or user@domain style usernames, or
* ``username`` and ``domain`` fields

Any other fields are ignored.

Prefetching
===========

If you want to avoid doing two SQL queries when logging in with IMAP/POP3, you
can make the :dovecot_core:ref:`passdb_sql_query` return all the necessary userdb fields and use
prefetch userdb to use those fields. If you're using Dovecot's deliver you'll
still need to have the :dovecot_core:ref:`userdb_sql_query` working.

See :ref:`authentication-prefetch_userdb` for example configuration.

High availability
=================

You can add multiple :dovecot_core:ref:`sql-mysql;mysql` or
:dovecot_core:ref:`sql-pgsql;pgsql` settings to specify multiple hosts for
MySQL and PostgreSQL. Dovecot
will do round robin load balancing between them. If one of them goes down, the
others will handle the traffic.

Examples
========

.. Note:: ``user`` can have a special meaning in some SQL databases, so we're
          using ``userid`` instead.

SQL table creation command:

.. code-block:: none

  CREATE TABLE users (
    userid VARCHAR(128) NOT NULL,
    domain VARCHAR(128) NOT NULL,
    password VARCHAR(64) NOT NULL,
    home VARCHAR(255) NOT NULL,
    uid INTEGER NOT NULL,
    gid INTEGER NOT NULL
  );

MySQL
=====

Add to your ``dovecot.conf`` file:

.. code-block:: none

  sql_driver = mysql

  # The mysqld.sock socket may be in different locations in different systems.
  mysql /var/run/mysqld/mysqld.sock {
    user = admin
    password = pass
    dbname = mails

    #ssl = yes
    #ssl_client_ca_dir = /etc/ssl/certs
  }
  # Alternatively you can connect to localhost as well:
  #mysql localhost {
  #}

  passdb sql {
    sql_query = SELECT userid AS username, domain, password \
      FROM users WHERE userid = '%n' AND domain = '%d'
  }
  userdb sql {
    sql_query = SELECT home, uid, gid FROM users WHERE userid = '%n' AND domain = '%d'
    # For using doveadm -A:
    sql_iterate_query = SELECT userid AS username, domain FROM users
  }

PostgreSQL
==========

Add to your ``dovecot.conf`` file:

.. code-block:: none

  sql_driver = pgsql

  pgsql localhost {
    parameters {
      user = admin
      # You can also set up non-password authentication by modifying PostgreSQL's pg_hba.conf
      password = pass
      dbname = mails
    }
  }

  passdb sql {
    sql_query = SELECT userid AS username, domain, password \
    FROM users WHERE userid = '%n' AND domain = '%d'
  }
  userdb sql {
    sql_query = SELECT home, uid, gid FROM users WHERE userid = '%n' AND domain = '%d'
    # For using doveadm -A:
    sql_iterate_query = SELECT userid AS username, domain FROM users
  }

SQLite
======

Add to your ``dovecot.conf`` file:

.. code-block:: none

  sql_driver = sqlite
  sqlite_path = /path/to/sqlite.db

  passdb sql {
    sql_query = SELECT userid AS username, domain, password \
    FROM users WHERE userid = '%n' AND domain = '%d'
  }
  userdb sql {
    sql_query = SELECT home, uid, gid FROM users WHERE userid = '%n' AND domain = '%d'
    # For using doveadm -A:
    sql_iterate_query = SELECT userid AS username, domain FROM users
  }
