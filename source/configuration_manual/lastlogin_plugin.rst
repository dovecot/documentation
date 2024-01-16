.. _lastlogin_plugin:

=================
Last Login Plugin
=================

.. dovecotadded:: 2.2.14

This plugin can be used to update user's last-login timestamp in a configured
dictionary.

Last login information is useful for trouble shooting scenarios, which usually
starts with end user contacting customer care agent that the mailbox is
unreachable or empty. Amongst the first things is to check when the customer
last successfully did login to the mailbox and using which protocol as this
might indicate that there might be some device with POP3 configured thus
emptying the mailbox. Last login feature is designed for this use case, to
allow easy way to search per any account the timestamp of last login or last
mail delivery to the mailbox.

Settings
========

See :ref:`plugin-last-login`.

Example Configuration
=====================

.. code-block:: none

  protocol imap {
    mail_plugins {
      last_login = yes
    }
  }
  protocol pop3 {
    mail_plugins {
      last_login = yes
    }
  }

  plugin {
    last_login_dict = redis:host=127.0.0.1:port=6379
    #last_login_key = last-login/%u # default
  }

.. Note::

  We enable last_login plugin explicitly only for imap & pop3 protocols. If
  enabled globally, it'll also update the timestamp whenever new mails are
  delivered via lda/lmtp or when doveadm is run for the user. This can also be
  thought of as a feature, so if you want to update a different timestamp for
  user when new mails are delivered, you can do that by enabling the last_login
  plugin also for lda/lmtp and changing the last_login_key setting to include
  ``%{service}``.

MySQL Example
=============

This includes the service and remote IP address as well.

dovecot.conf:

.. code-block:: none

  plugin {
    last_login_dict = proxy::sql
    last_login_key = last-login/%{service}/%{user}/%{remote_ip}
    last_login_precision = ms
  }
  dict {
    sql = mysql:/etc/dovecot/dovecot-dict-sql.conf.ext
  }

SQL schema:

.. code-block:: sql

  CREATE TABLE last_login (
    userid VARCHAR(255) NOT NULL,
    service VARCHAR(10) NOT NULL,
    last_access BIGINT NOT NULL,
    last_ip VARCHAR(40) NOT NULL,
    PRIMARY KEY (userid, service)
  );

dovecot-dict-sql.conf.ext:

.. code-block:: none

  connect = host=sql.example.com dbname=mails user=dovecot password=pass

  map {
    pattern = shared/last-login/$service/$user/$remote_ip
    table = last_login
    value_field = last_access
    value_type = uint

    fields {
      userid = $user
      service = $service
      last_ip = $remote_ip
    }
  }

Cassandra Example
=================

This includes the service and remote IP address as well.

dovecot.conf:

.. code-block:: none

  plugin {
    last_login_dict = proxy:dict-async:cassandra
    last_login_key = last-login/%{service}/%{user}/%{remote_ip}
    last_login_precision = ms
  }
  dict {
    cassandra = cassandra:/etc/dovecot/dovecot-dict-cql.conf.ext
  }

Cassandra schema:

.. code-block:: sql

  CREATE TABLE last_login (
    userid TEXT,
    service TEXT,
    last_access TIMESTAMP,
    last_ip TEXT,
    PRIMARY KEY ((userid), service)
  );

dovecot-dict-cql.conf.ext:

.. code-block:: none

  connect = host=sql.example.com dbname=mails user=dovecot password=pass

  map {
    pattern = shared/last-login/$service/$user/$remote_ip
    table = last_login
    value_field = last_access
    value_type = uint

    fields {
      userid = $user
      service = $service
      last_ip = $remote_ip
    }
  }

Alternative Schema Cassandra Example
====================================

Instead of using a separate last_login table, add different services as
separate fields to the main users table.

dovecot.conf:

.. code-block:: none

  plugin {
    last_login_dict = proxy:dict-async:cassandra
    last_login_key = last-login/%{service}/%{user}/%{remote_ip}
    last_login_precision = ms
  }
  dict {
    cassandra = cassandra:/etc/dovecot/dovecot-dict-cql.conf.ext
  }

Cassandra schema:

.. code-block:: sql

  CREATE TABLE users (
    userid TEXT,
    last_imap_access TIMESTAMP,
    last_pop3_access TIMESTAMP,
    last_lmtp_access TIMESTAMP,
    last_imap_ip TEXT,
    last_pop3_ip TEXT,
    last_lmtp_ip TEXT,
    PRIMARY KEY ((userid))
  );

dovecot-dict-cql.conf.ext:

.. code-block:: none

  connect = host=sql.example.com dbname=mails user=dovecot password=pass

  map {
    pattern = shared/last-login/imap/$user/$remote_ip
    table = users
    value_field = last_imap_access
    value_type = uint

    fields {
      userid = $user
      last_imap_ip = $remote_ip
    }
  }
  map {
    pattern = shared/last-login/pop3/$user/$remote_ip
    table = users
    value_field = last_pop3_access
    value_type = uint

    fields {
      userid = $user
      last_pop3_ip = $remote_ip
    }
  }
  map {
    pattern = shared/last-login/lmtp/$user/$remote_ip
    table = users
    value_field = last_lmtp_access
    value_type = uint

    fields {
      userid = $user
      last_lmtp_ip = $remote_ip
    }
  }
