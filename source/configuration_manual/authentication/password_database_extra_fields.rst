.. _authentication-password_database_extra_fields:

Password database extra fields
==============================

The primary purpose of a password database lookup is to return the password for
a given user. It may however also return other fields which are treated
specially:

* **user**: Change the username (eg. lowercase it). See
  :ref:`authentication-user_extra_field`.
* **login_user**: Master passdb can use this to change the username.

  .. dovecotadded:: 2.2.13

* **allow_nets**: Allow user to log in from only specified IPs (checks against remote client IP). See :ref:`authentication-allow_nets`.

   * **allow_real_nets**: Allow user's network connection to log in from only
     specified IPs (checks against real remote IP, e.g. a Dovecot proxy).

* **proxy and proxy_maybe**: Proxy the connection to another IMAP/POP3 server.
  See :ref:`authentication-proxies`.
* **host**: Send login referral to client (if proxy=y field isn't set). See
  :ref:`authentication-host`.
* **nologin**: User isn't actually allowed to log in even if the password
  matches, with optionally a different reason given as the authentication
  failure message. See :ref:`authentication-nologin`.
* **nodelay**: Don't delay reply to client in case of an authentication
  failure. See :ref:`authentication-nodelay`.
* **nopassword**: If you want to allow all passwords, use an empty password and
  this field.
* **fail**: If set, explicitly fails the passdb lookup.

  .. dovecotadded:: 2.2.22

* **k5principals**: if using :dovecot_core:ref:`auth_mechanisms` = gssapi, may contain
  Kerberos v5 principals allowed to map to the current user, bypassing the
  internal call to ``krb5_kuserok()`` . The database must support credentials
  lookup.

  .. dovecotadded:: 2.2.0

* **delay_until=** ``<UNIX timestamp>[+<max random secs>]`` : Delay login until
  this time. The timestamp must be less than 5 minutes into future or the login
  will fail with internal error. The extra random seconds can be used to avoid
  a load spike of everybody getting logged in at exactly the same time.

  .. dovecotadded:: 2.2.25

* **noauthenticate**: Do not perform any authentication, just store extra
  fields if user is found.

  .. dovecotadded:: 2.2.26

* **forward_<anything>**: In a proxy, pass the variable to the next hop (backend) as
  ``forward_<anything>``.

  .. seealso:: :ref:`forward_fields`

  .. dovecotadded:: 2.2.26

* **event_<name>**: Import ``name=value`` to login events.

  .. dovecotadded:: 2.3.21

.. dovecotchanged:: 2.4.0,3.0.0
   Extra fields can now also be set to empty string, while previously they were
   changed to ``yes``. Extra fields without value (without ``=``) will default to
   ``yes``.

How to return these extra fields depends on the password database you use. See
:ref:`authentication-password_databases` pages on how to do it. Some passdbs however
don't support returning them at all, such as :ref:`authentication-pam`.

The password database may also return fields prefixed with ``userdb_``. These
fields are only saved and used later as if they came from the
:ref:`authentication-user_database` extra fields. Typically this is done only when
using :ref:`authentication-prefetch_userdb`.

.. Note:: Boolean fields are true always if the field exists. So nodelay,
          ``nodelay=yes``, ``nodelay=no`` and ``nodelay=0`` all mean that the
          nodelay field is true. With SQL the field is considered to be
          nonexistent if its value is NULL.

The following suffixes added to a field name are handled specially:

``:protected``
  Set this field only if it hasn't been set before.
``:remove``
  Remove this field entirely.

Examples
--------

SQL
^^^

dovecot-sql.conf.ext:

.. code-block:: none

  password_query = SELECT userid as user, password, 'Y' as proxy, host \
  FROM users WHERE userid = '%u'

LDAP
^^^^^
dovecot-ldap.conf:

.. code-block:: none

  pass_attrs = \
    =user=%{ldap:user}, \
    =password=%{ldap:userPassword},
    =proxy=%{ldap:proxyEnabled}, \
    =host=%{ldap:hostName}

.. Note:: about the ``proxy``, ``proxy_maybe`` and any other boolean type
          fields: these represent an existence test. Currently this translates
          to ``will proxy (or proxy_maybe) if this attribute exists``. This
          allows the proxy behaviour to be selectable per user. To have it
          ``always`` on, use a template, e.g.:

.. code-block:: none

  pass_attrs = \
    =user=%{ldap:user}, \
    =password=%{ldap:userPassword},
    =proxy=y, \
    =host=%{ldap:hostName}

passwd-file
^^^^^^^^^^^

.. code-block:: none

  user:{plain}pass::::::proxy=y host=127.0.0.1

.. toctree::
  :maxdepth: 1


  allow_nets
  host
  nologin
  nodelay
  prefetch_userdb
