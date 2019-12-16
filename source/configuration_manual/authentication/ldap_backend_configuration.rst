.. _authentication-ldap_backend_configuration:

================================
LDAP Backend Configuration
================================

The included dovecot-ldap-backend.conf.ext can be used as template for the ``/etc/dovecot/dovecot-ldap.conf.ext.`` Its most important settings are: 

.. code-block:: none

   hosts = ldap.example.com
   dn = cn=admin,dc=example,dc=com
   dnpass = secret
   base = dc=example,dc=com

Configure how the LDAP server is reached. 

.. code-block:: none
   
   auth_bind = yes

Use LDAP authentication binding for verifying users' passwords. 

.. code-block:: none

   blocking = yes

Use auth worker processes to perform LDAP lookups in order to use multiple concurrent LDAP connections. Otherwise only a single LDAP connection is used. 

.. code-block:: none

   pass_attrs = \
   =user=%{ldap:mailRoutingAddress}, \
   =password=%{ldap:userPassword}, \
   =userdb_quota_rule=*:storage=%{ldap:messageQuotaHard}k

Normalize the username to exactly the mailRoutingAddress field's value regardless of how the ``pass_filter`` found the user. The ``userdb_quota_rule`` is used by userdb prefetch to return the userdb values. If other userdb fields are wanted, they must be placed to both user_attrs (without ``userdb_`` prefix) and pass_attrs (with ``userdb_`` prefix).

.. code-block:: none

   user_attrs = \
   =user=%{ldap:mailRoutingAddress}, \
   =quota_rule=*:storage=%{ldap:messageQuotaHard}

Returns userdb fields when prefetch userdb wasn't used (LMTP & doveadm). The username is again normalized in case ``user_filter`` found it via some other means. 

.. code-block:: none

   pass_filter = (mailRoutingAddress=%u)
   user_filter = (mailRoutingAddress=%u)

How to find the user for passdb lookup. 

.. code-block:: none

   iterate_attrs = mailRoutingAddress=user
   iterate_filter = (objectClass=smiMessageRecipient)

How to iterate through all the valid usernames.

