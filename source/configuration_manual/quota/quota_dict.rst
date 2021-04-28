.. _quota_backend_dict:

===================
Quota Backend: dict
===================

.. note::

  Using :ref:`quota_backend_count` (possibly together with
  :ref:`quota_clone_plugin`) is now preferred to using this backend. It has
  less of a chance of quota usage becoming wrong.

The ``dict`` (dictionary) quota backend supports both ``storage`` and
``messages`` quota limits. The current quota is kept in the specified
dictionary.

See `dictionary`_ for full description of the available backends.

The quota root format is:

.. code-block:: none

  quota = dict:<quota root name>:<username>[:<option>[...]]:<dictionary URI>

If ``username`` is left empty, the logged in username is used (this is
typically what you want). Another useful username is ``%d`` for supporting
domain-wide quotas (see :ref:`config_variables`).

Driver specific parameters:

=================== ============================================================
Name                Description
=================== ============================================================
``hidden``          Hide the quota root from ``IMAP GETQUOTA`` commands.

``ignoreunlimited`` If user has unlimited quota, don't track it.

``no-unset``        When recalculating quota, don't unset the quota first.
                    This is needed if you wish to store the quota usage among
                    other data in the same SQL row - otherwise the entire row
                    could get deleted. Note that the unset is required with
                    PostgreSQL or the merge_quota() trigger doesn't work
                    correctly.

                    .. versionadded:: 2.2.20

``ns=<prefix>``     This quota root is tracked only for the given namespace.
=================== ============================================================

.. note::

  The dictionary stores only the current quota usage. The quota limits are
  still configured in userdb the same way as with other quota backends.

.. note::

  By default the quota dict may delete rows from the database when it
  wants to rebuild the quota. You must use a separate table that contains only
  the quota information, or you'll lose the other data. This can be avoided
  with the "no-unset" parameter.

Examples
^^^^^^^^

Simple Per-user Flat File
-------------------------

This will create one quota-accounting file for each user.

The Dovecot user process (imap, pop3 or lda) needs write access to this file,
so ``%h`` or ``mail_location`` are good candidates to store it.

.. warning::

  If a user has shell or file access to this location, he can
  mangle his quota file, thus overcoming his quota limit by lying about his
  used capacity.

.. code-block:: none

  plugin {
    quota = dict:User quota::file:%h/mdbox/dovecot-quota
    quota_rule = *:storage=10M:messages=1000
  }

Server-based Dictionaries
-------------------------

.. code-block:: none

  plugin {
    # SQL backend:
    quota = dict:User quota::proxy::sqlquota
    # Redis backend (v2.1.9+):
    quota = dict:User quota::redis:host=127.0.0.1:prefix=user/

    quota_rule = *:storage=10M:messages=1000
  }

  dict {
    sqlquota = mysql:/etc/dovecot/dovecot-dict-sql.conf.ext
  }

The above SQL example uses dictionary proxy process (see below), because SQL
libraries aren't linked to all Dovecot binaries. The file and Redis examples
use direct access.

Example ``dovecot-dict-sql.conf.ext``:

.. code-block:: none

  connect = host=localhost dbname=mails user=sqluser password=sqlpass

  map {
    pattern = priv/quota/storage
    table = quota
    username_field = username
    value_field = bytes
  }

  map {
    pattern = priv/quota/messages
    table = quota
    username_field = username
    value_field = messages
  }

Create the table like this:

.. code-block:: sql

  CREATE TABLE quota (
    username varchar(100) not null,
    bytes bigint not null default 0,
    messages integer not null default 0,
    primary key (username)
  );

MySQL uses the following queries to update the quota. You need suitable
privileges.

.. code-block:: mysql

  INSERT INTO table (bytes,username)
    VALUES ('112497180','foo@example.com')
    ON DUPLICATE KEY UPDATE bytes='112497180';
  INSERT INTO table (messages,username)
    VALUES ('1743','foo@example.com')
    ON DUPLICATE KEY UPDATE messages='1743';
  UPDATE table SET bytes=bytes-14433,messages=messages-2
    WHERE username = 'foo@example.com';
  DELETE FROM table WHERE username = 'foo@example.com';

If you're using SQLite, then take a look at the trigger in this
post: http://dovecot.org/pipermail/dovecot/2013-July/091421.html

If you're using PostgreSQL, you'll need a trigger:

.. code-block:: postgresql

  CREATE OR REPLACE FUNCTION merge_quota() RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.messages < 0 OR NEW.messages IS NULL THEN
      -- ugly kludge: we came here from this function, really do try to insert
      IF NEW.messages IS NULL THEN
        NEW.messages = 0;
      ELSE
        NEW.messages = -NEW.messages;
      END IF;
      return NEW;
    END IF;

    LOOP
      UPDATE quota SET bytes = bytes + NEW.bytes,
        messages = messages + NEW.messages
        WHERE username = NEW.username;
      IF found THEN
        RETURN NULL;
      END IF;

      BEGIN
        IF NEW.messages = 0 THEN
          INSERT INTO quota (bytes, messages, username)
            VALUES (NEW.bytes, NULL, NEW.username);
        ELSE
          INSERT INTO quota (bytes, messages, username)
            VALUES (NEW.bytes, -NEW.messages, NEW.username);
        END IF;
        return NULL;
      EXCEPTION WHEN unique_violation THEN
        -- someone just inserted the record, update it
      END;
    END LOOP;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER mergequota BEFORE INSERT ON quota
     FOR EACH ROW EXECUTE PROCEDURE merge_quota();

Dictionary Proxy Server
^^^^^^^^^^^^^^^^^^^^^^^

To avoid each process making a new SQL connection, you can make all
dictionary communications go through a dictionary server process which keeps
the connections permanently open.

The dictionary server is referenced with URI
``proxy:<dictionary server socket path>:<dictionary name>``. The socket path
may be left empty if you haven't changed :ref:`setting-base_dir` in
``dovecot.conf``. Otherwise set it to ``<base_dir>/dict-server``. The
dictionary names are configured in ``dovecot.conf``. For example:

.. code-block:: none

  dict {
    quota = mysql:/etc/dovecot/dovecot-dict-sql.conf.ext
    expire = mysql:/etc/dovecot/dovecot-dict-sql.conf.ext
  }

See `dictionary`_ for more information, especially about permission issues.

.. _`dictionary`: https://wiki.dovecot.org/Dictionary
