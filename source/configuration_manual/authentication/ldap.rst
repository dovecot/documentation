.. _authentication-ldap:

=====
LDAP
=====

There are two ways to do LDAP authentication:

* :ref:`Password lookups <authentication-ldap_passwords>`
* :ref:`Authentication binds <authentication-ldap_bind>`

Both of these have their own advantages and disadvantages.

* :ref:`LDAP as userdb <authentication-ldap_userdb>` and
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

  passdb db1 {
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

  pass_attrs =                        \
    =proxy=y,                         \
    =proxy_timeout=10,                \
    =user=%{ldap:mailRoutingAddress}, \
    =password=%{ldap:userPassword}

Returns userdb fields when prefetch userdb wasn't used (LMTP & doveadm).
The username is again normalized in case ``user_filter`` found it via some
other means:

.. code-block:: none

   user_attrs =                        \
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
| ``%{ldap_ptr}``                                                              |
+----------------------------------------+-------------------------------------+
| ``%{ldap_ptr:attrName}``               | Indirect fetch.                     |
|                                        | Retrieves the attribute attrName,   |
|                                        | then it uses its content as a 2nd   |
|                                        | attrName where to fetch the actual  |
|                                        | value.                              |
+----------------------------------------+-------------------------------------+

Subqueries and pointers (v2.2)
******************************
LDAP values can now have DN pointers to other entries that are queried.

Note: These aren't actually very useful anymore. See the next section for how
to do multiple queries more easily using multiple userdbs.

Examples:

.. code-block:: none

   user_attrs = \
     =user=%{ldap:uid}, \
     @mail=%{ldap:mailDN}, \
     =uid=%{ldap:uidNumber@mail}, \
     =gid=%{ldap:gidNumber@mail}, \
     =home=%{ldap:rootPath@mail}/%d/%n

This will do a regular lookup first. Then does another lookup with DN taken
from mailDN's value. The ``@mail`` attributes are assigned from the second
lookup's results.

.. code-block:: none

   user_attrs = \
     =user=%{ldap:uid}, \
     =home=%{ldap_ptr:activePath}, \
     !primaryPath, !secondaryPath

The activePath's value can be either ``primaryPath`` or ``secondaryPath``.
The home's value will be the contents of that field. The !field tells Dovecot to
fetch the field's value but not to do anything with it otherwise.

Multiple queries via userdbs (v2.2+)
************************************

Example: Give the user a class attribute, which defines the default quota:

dovecot.conf:

.. code-block:: none

   userdb db1 {
     driver = ldap
     args = /etc/dovecot/dovecot-users-ldap.conf.ext
     result_success = continue-ok
   }
   userdb db2 {
     driver = ldap
     args = /etc/dovecot/dovecot-class-ldap.conf.ext
     skip = notfound
   }

/etc/dovecot/dovecot-users-ldap.conf.ext:

.. code-block:: none

   # If user has overridden quota, quota_rule is set below. Otherwise it's still unset.
   user_attrs = \
     =class=%{ldap:userClass}
     quotaBytes=quota_rule=*:bytes=%{ldap:quotaBytes}

/etc/dovecot/dovecot-class-ldap.conf.ext:

.. code-block:: none

   # Do the lookup using the user's class:
   user_filter = (&(objectClass=userClass)(class=%{userdb:class}))

   # With :protected suffix the quota_rule isn't overridden if it's already set.
   user_attrs = \
     classQuotaBytes=quota_rule:protected=*:bytes=%{ldap:classQuotaBytes}

Variables and domains
*********************

User names and domains may be distinguished using the Variables ``%n`` and ``%d``.
They split the previous username at the ``@`` character.
The previous username is:

- For LMTP, it will be ``user@hostname``, where hostname depends on
  e.g. the Postfix configuration.

- For IMAP, it will be whatever the password database has designated as the username.
  If the (LDAP) password database has ``user_attrs = =user=%n``,
  then the domain part of the login name will be stripped by the password database.

- The UserDB will not see any domain part, i.e. ``%n`` and ``%u`` are the same
  thing for the UserDB. The UserDB may set a new username, too, using
  ``user_attrs = =user=...``. This will be used for Logging ``%u`` and ``%d``
  variables in other parts of the configuration (e.g. quota file names).
