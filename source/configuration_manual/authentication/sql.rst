.. _authentication-sql:

====
SQL
====

SQL can be used for both passdb and userdb lookups. If the args parameter in
passdb sql and userdb sql contain the exact same filename, only one SQL
connection is used for both passdb and userdb lookups.

.. contents::

Dovecot configuration
=====================

``dovecot.conf``:

.. code-block:: none

  passdb {
    driver = sql
    args = /etc/dovecot/dovecot-sql.conf.ext
  }

Password database lookups
=========================

password_query setting contains the SQL query to look up the password. It must
return a field named ``password``. If you have it by any other name in the
database, you can use the SQL's ``AS`` keyword (``SELECT pw AS password ..``).
You can use all the normal :ref:`config_variables`
such as ``%u`` in the SQL query.

If all the passwords are in same format, you can use ``default_pass_scheme`` to
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

  password_query = SELECT NULL AS password, 'Y' as nopassword, userid AS user \
    FROM users WHERE userid = '%u' AND mysql_pass = password('%w')

This of course makes the verbose logging a bit wrong, since password mismatches
are also logged as ``unknown user``.

User database lookups
=====================

Usually your SQL database contains also the userdb information. This means
user's UID, GID and home directory. If you're using only static UID and GID,
and your home directory can be specified with a template, you could use static
userdb instead. It is also a bit faster since it avoids doing the userdb SQL
query.

``user_query`` setting contains the SQL query to look up the userdb
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
userdb this is done with ``iterate_query`` setting. You can either return

* ``user`` field containing either user or user@domain style usernames, or
* ``username`` and ``domain`` fields

Any other fields are ignored.

Prefetching
===========

If you want to avoid doing two SQL queries when logging in with IMAP/POP3, you
can make the ``password_query`` return all the necessary userdb fields and use
prefetch userdb to use those fields. If you're using Dovecot's deliver you'll
still need to have the ``user_query`` working.

See :ref:`authentication-prefetch_userdb` for example configuration.

High availability
=================

You can add multiple ``host`` parameters to the SQL connect string. Dovecot
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

Add to your ``dovecot-sql.conf`` file:

.. code-block:: none

  driver = mysql
  # The mysqld.sock socket may be in different locations in different systems.
  # Use "host= ... pass=foo#bar" with double-quotes if your password has '#' character.
  # If you need SSL connection, you can add ssl_ca or ssl_ca_path
  # You can also use ssl_cert/ssl_key, ssl_cipher, ssl_verify_server_cert
  # or provide option_file and option_group
  connect = host=/var/run/mysqld/mysqld.sock dbname=mails user=admin password=pass
  # Alternatively you can connect to localhost as well:
  #connect = host=localhost dbname=mails user=admin password=pass # port=3306

  password_query = SELECT userid AS username, domain, password \
  FROM users WHERE userid = '%n' AND domain = '%d'
  user_query = SELECT home, uid, gid FROM users WHERE userid = '%n' AND domain = '%d'

  # For using doveadm -A:
  iterate_query = SELECT userid AS username, domain FROM users

PostgreSQL
==========

Add to your ``dovecot-sql.conf`` file:

.. code-block:: none

  # You can also set up non-password authentication by modifying PostgreSQL's pg_hba.conf
  driver = pgsql
  # Use "host= ... pass=foo#bar" if your password has '#' character
  connect = host=localhost dbname=mails user=admin password=pass

  password_query = SELECT userid AS username, domain, password \
  FROM users WHERE userid = '%n' AND domain = '%d'
  user_query = SELECT home, uid, gid FROM users WHERE userid = '%n' AND domain = '%d'

  # For using doveadm -A:
  iterate_query = SELECT userid AS username, domain FROM users

SQLite
======

Add to your ``dovecot-sql.conf`` file:

.. code-block:: none

  driver = sqlite
  connect = /path/to/sqlite.db

  password_query = SELECT userid AS username, domain, password \
  FROM users WHERE userid = '%n' AND domain = '%d'
  user_query = SELECT home, uid, gid FROM users WHERE userid = '%n' AND domain = '%d'

  # For using doveadm -A:
  iterate_query = SELECT userid AS username, domain FROM users

PostgreSQL/Horde
================

I used the following in ``dovecot-sql.conf`` file to authenticate directly
against the Horde user/password database (with static userdb) on PostgreSQL:

.. code-block:: none

  driver = pgsql
  connect = host=localhost dbname=horde user=dovecot password=
  default_pass_scheme = MD5-CRYPT
  password_query = SELECT user_uid AS username, user_pass AS password \
  FROM horde_users WHERE user_uid = '%u'
  iterate_query = SELECT user_uid AS username FROM users

.. Note:: You will have to change the password encryption in Horde to
          MD5-CRYPT. Also, the example above requires a 'dovecot' user in
          PostgreSQL with read (SELECT) privileges on the 'horde_users' table.
