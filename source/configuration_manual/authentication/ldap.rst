.. _authentication-ldap:

=====
LDAP
=====

There are two ways to do LDAP authentication:

* `Password lookups
  <https://wiki.dovecot.org/AuthDatabase/LDAP/PasswordLookups>`_
* `Authentication binds
  <https://wiki.dovecot.org/AuthDatabase/LDAP/AuthBinds>`_

Both of these have their own advantages and disadvantages.

* `LDAP as userdb <https://wiki.dovecot.org/AuthDatabase/LDAP/Userdb>`_ and
  other common LDAP query settings.

Configuration common to LDAP passdb and userdb
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Connecting
**********

There are two alternative ways to specify what LDAP server(s) to connect to:

* ``hosts``: A space separated list of LDAP hosts to connect to. You can also
  use host:port syntax to use different ports.
* ``uris``: A space separated list of LDAP URIs to connect to. This isn't
  supported by all LDAP libraries. The URIs are in syntax
  ``protocol://host:port``. For example ``ldap://localhost or
  ldaps://secure.domain.org``

If multiple LDAP servers are specified, it's decided by the LDAP library how
the server connections are handled. Typically the first working server is used,
and it's never disconnected from. So there is no load balancing or automatic
reconnecting to the "primary" server.

SSL/TLS
*******

You can enable TLS in two alternative ways:

* Connect to ldaps port (636) by using "ldaps" protocol, e.g. ``uris =
  ldaps://secure.domain.org``
* Connect to ldap port (389) and use STARTTLS command. Use ``tls=yes`` to
  enable this.

See the ``tls_*`` settings in ``dovecot-ldap-example.conf`` for how to
configure TLS. (I think they apply to ldaps too?)

Getting Dovecot to talk to a LDAPS signed against a custom certificate of authority
***********************************************************************************

If you need to connect to ldaps secured against a custom certificate of
authority (CA), you will need to install the custom CA on your system. On Red
Hat Enterprise Linux 6, Dovecot uses the OpenLDAP library. By default, the CA
must be installed under the directory specified in the TLS_CACERTDIR option
found under /etc/openldap/ldap.conf (default value is /etc/openldap/certs).
After copying the CA, you'll need to run "c_rehash ." inside the directory,
this will create a symlink pointing to the CA.

You can test the CA installation with this: openssl s_client -connect
yourldap.example.org:636 -CApath /etc/openldap/certs -showcerts

This should report "Verify return code: 0 (ok)".

SASL binds
**********

It's possible to use SASL binds instead of the regular simple binds if your
LDAP library supports them. See the ``sasl_*`` settings in
``dovecot-ldap-example.conf``.

.. Note:: SASL binds are currently incompatible with authentication binds.

Active Directory
****************

When connecting to AD, you may need to use port 3268. Then again, not all LDAP
fields are available in port 3268. Use whatever works.
https://technet.microsoft.com/en-us/library/cc978012.aspx

LDAP Backend Configuration
**************************

.. code-block:: none

  passdb {
    args = /etc/dovecot/dovecot-ldap.conf.ext
    driver = ldap
  }

This enables LDAP to be used as passdb.

The included dovecot-ldap-backend.conf.ext can be used as template for the
``/etc/dovecot/dovecot-ldap.conf.ext.`` Its most important settings are:

Configure how the LDAP server is reached.
(Active directory allows binding with username@domain):

.. code-block:: none

  hosts = ldap.example.com
  dn = cn=admin,dc=example,dc=com
  dnpass = secret
  base = dc=example,dc=com

Use LDAP authentication binding for verifying users' passwords:

.. code-block:: none

  auth_bind_userdn = %u
  auth_bind = yes

Use auth worker processes to perform LDAP lookups in order to use multiple
concurrent LDAP connections. Otherwise only a single LDAP connection is used.

.. code-block:: none

   blocking = yes

Normalize the username to exactly the mailRoutingAddress field's value
regardless of how the ``pass_filter`` found the user:

.. code-block:: none

  pass_attrs =
  =proxy=y,
  =proxy_timeout=10,
  =user=%{ldap:mailRoutingAddress},
  =password=%{ldap:userPassword}

Returns userdb fields when prefetch userdb wasn't used (LMTP & doveadm).
The username is again normalized in case ``user_filter`` found it via some
other means:

.. code-block:: none

   user_attrs = \
   =user=%{ldap:mailRoutingAddress}, \
   =quota_rule=*:storage=%{ldap:messageQuotaHard}

How to find the user for passdb lookup:
.. code-block:: none

   pass_filter = (mailRoutingAddress=%u)
   user_filter = (mailRoutingAddress=%u)

How to iterate through all the valid usernames:

.. code-block:: none

  pass_filter = (mailRoutingAddress=%u)
  iterate_attrs = mailRoutingAddress=user
  iterate_filter = (objectClass= messageStoreRecipient)

Ldap-specific Variables
***********************

The following variables can be used inside the ``dovecot-ldap.conf.ext`` files:

+----------------------------------------+-------------------------------------+
| ``%{ldap}``                                                                  |
+----------------------------------------+-------------------------------------+
| ``%{ldap:attrName:default}``           | Fetches a single-valued attribute.  |
|                                        | If the attribute is not present,    |
|                                        | the specified default is taken      |
|                                        | instead.  If there are multiple     |
|                                        | values, all except the first are    |
|                                        | ignored (with warning).             |
+----------------------------------------+-------------------------------------+
| ``%{ldap:attrName}``                   | If the default is omitted, empty    |
|                                        | string ``""`` is assumed.           |
+----------------------------------------+-------------------------------------+
| ``%{ldap_multi}``                                                            |
+----------------------------------------+-------------------------------------+
| ``%{ldap_multi:attrName:sep:default}`` | Fetches a multi-valued attribute.   |
|                                        | If the attribute is not present, the|
|                                        | specified default is taken instead. |
|                                        | If there are multiple values, they  |
|                                        | are concatenated using sep as the   |
|                                        | separator.                          |
+----------------------------------------+-------------------------------------+
| ``%{ldap_multi:attrName:sep}``         | If the default is omitted, empty    |
|                                        | string is assumed ``""``.           |
+----------------------------------------+-------------------------------------+
| ``%{ldap_multi:attrName::default}``    | The default for the separator is a  |
|                                        | single space ``" "``.               |
+----------------------------------------+-------------------------------------+
| ``%{ldap_multi:attrName::}``           | How to specify a column ``":"`` as  |
|                                        | separator, default is ``""``.       |
+----------------------------------------+-------------------------------------+
| ``%{ldap_multi:attrName:::default}``   | How to specify a column ``":"`` as  |
|                                        | separator, default explicitly       |
|                                        | defined.                            |
+----------------------------------------+-------------------------------------+
| ``%{ldap_multi:attrName:,}``           | How to specify a comma ``","`` as   |
|                                        | separator, default is ``""``.       |
+----------------------------------------+-------------------------------------+
| ``%{ldap_multi:attrName:,:default}``   | How to specify a comma ``","`` as   |
|                                        | separator, default explicitly       |
|                                        | defined.                            |
+----------------------------------------+-------------------------------------+
| ``%{ldap_dn}``                                                               |
+----------------------------------------+-------------------------------------+
| ``%{ldap_dn}``                         | Retrieves the Distinguished Name of |
|                                        | the entry.                          |
+----------------------------------------+-------------------------------------+
