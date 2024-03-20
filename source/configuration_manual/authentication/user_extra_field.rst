.. _authentication-user_extra_field:

================
User extra field
================

This is mostly useful in case-insensitive username lookups to get the username
returned back using the same casing always. Otherwise depending on your
configuration it may cause problems, such as ``/var/mail/user`` and
``/var/mail/User`` mailboxes created for the same user.

An example :dovecot_core:ref:`passdb_sql_query` would be:

.. code-block:: none

  passdb sql {
    query = \
      SELECT concat(user, '@', domain) AS user, password \
      FROM users \
      WHERE user = '%n' and domain = '%d'
  }

You can also update "username" and "domain" fields separately:

.. code-block:: none

  passdb sql {
    query = \
      SELECT user AS username, domain, password \
      FROM users \
      WHERE user = '%n' and domain = '%d'
  }
