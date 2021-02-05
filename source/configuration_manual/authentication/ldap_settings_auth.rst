.. _authentication-ldap_settings_auth:

=======================
LDAP Settings for auth
=======================

This page lists the settings specific to LDAP Authentication which
are to be configured together with the settings :ref:`authentication-ldap_settings_common`.


.. _ldap_settings_auth-auth_bind:

``auth_bind``
---------------

- Default: ``no``
- Values:  :ref:`boolean`

Set yes to use authentication binding for verifying password's validity.
This works by logging into LDAP server using the username and password given by client.
The :ref:`ldap_settings_auth-pass_filter` is used to find the DN for
the user. Note that the pass_attrs is still used, only the password field
is ignored in it. Before doing any search, the binding is switched back
to the default DN.
If you use this setting, it's a good idea to use a different
dovecot-ldap.conf.ext for userdb (it can even be a symlink, just as long as
the filename is different in userdb's args). That way one connection is used
only for LDAP binds and another connection is used for user lookups.
Otherwise the binding is changed to the default DN before each user lookup.

.. note::
  If you're not using authentication binding, you'll need to give
  dovecot-auth (the user which is specified with ``dn`` parameter) read access to
  userPassword field in the LDAP server.

  An example of this is;
  
  Assuming that the user assigned to ``dn`` is "cn=authuser,dc=test,dc=dovecot,dc=net".
  
  1. Create below text file and save it as authuser_modify.ldif.

  .. code-block:: none

     dn: olcDatabase={2}hdb,cn=config
     changetype: modify              
     replace: olcAccess
     olcAccess: {0}to attrs=userPassword
       by self write
       by dn="cn=authuser,dc=test,dc=dovecot,dc=net" read
       by * auth
     olcAccess: {1}to *
       by self read
       by dn="cn=authuser,dc=test,dc=dovecot,dc=net" read
       by * auth

  2. Run ldapmodify to apply the change.

  .. code-block:: none

     ldapmodify  -Q -Y EXTERNAL -H ldapi:/// -f doveauth_access.ldif

   
.. _ldap_settings_auth-auth_bind_userdn:

``auth_bind_userdn``
--------------------

- Default: <empty>
- Values:  :ref:`string`

If authentication binding is used, you can save one LDAP request per login
if users' DN can be specified with a common template. The template can use
the standard %variables (see :ref:`ldap_settings_auth-user_filter`).
Note that you can't use any pass_attrs if you use this setting.



Example:

.. code-block:: none

   auth_bind_userdn = cn=%u,ou=people,o=org


.. _ldap_settings_auth-blocking:

``blocking``
------------

- Default: ``no``
- Values:  :ref:`boolean`

By default all LDAP lookups are performed by the auth master process.
If blocking=yes, auth worker processes are used to perform the lookups.
Each auth worker process creates its own LDAP connection so this can
increase parallelism. With blocking=no the auth master process can
keep 8 requests pipelined for the LDAP connection, while with blocking=yes
each connection has a maximum of 1 request running. For small systems the
blocking=no is sufficient and uses less resources.


.. _ldap_settings_auth-default_pass_scheme:

``default_pass_scheme``
-----------------------

- Default: ``crypt``
- Values:  :ref:`string`

Default password scheme. ``{scheme}`` before password overrides this.

See :ref:`authentication-password_schemes` for a list of supported schemes.


.. _ldap_settings_auth-iterate_attrs:

``iterate_attrs``
-----------------

- Default: <empty>
- Values:  :ref:`string`

Attributes to get a list of all users
See also :ref:`authentication-ldap_backend_configuration`

Example:

.. code-block:: none

   iterate_attrs = mailRoutingAddress=user


.. _ldap_settings_auth-iterate_filter:

``iterate_filter``
------------------

- Default: <empty>
- Values:  :ref:`string`

Filter to get a list of all users
See also :ref:`authentication-ldap_backend_configuration`

Example:

.. code-block:: none

   iterate_filter = (objectClass=smiMessageRecipient)

  
.. _ldap_settings_auth-pass_attrs:

``pass_attrs``
--------------

- Default: <empty>
- Values:  :ref:`string`

Specify user attributes to be retrived from LDAP in passdb look up.
See also :ref:`authentication-ldap_backend_configuration`

Password checking attributes:
* user: Virtual user name (user@domain), if you wish to change the user-given username to something else
* password: Password, may optionally start with {type}, eg. {crypt}

Example:

.. code-block:: none

   pass_attrs = \
              =password=%{ldap:userPassword}, \
              =user=%{ldap:mailRoutingAddress}, \
              =home=%{ldap:homeDirectory}, \
              =uid=%{ldap:uidNumber}, \
              =gid=%{ldap:gidNumber}

There are also other special fields which can be returned.
See :ref:`authentication-password_database_extra_fields`

If you wish to avoid two LDAP lookups (passdb + userdb), you can use
userdb prefetch instead of userdb ldap in dovecot.conf. In that case you'll
also have to include user_attrs in pass_attrs field prefixed with ``userdb_``
string.


.. _ldap_settings_auth-pass_filter:

``pass_filter``
---------------

- Default: <empty>
- Values:  :ref:`string`

Filter for password lookups (passdb lookup)
See also :ref:`authentication-ldap_backend_configuration`

Example:

.. code-block:: none

   pass_filter = (&(objectClass=posixAccount)(uid=%u))


.. _ldap_settings_auth-user_attrs:

``user_attrs``
--------------

- Default: <empty>
- Values:  :ref:`string`

Specify user attributes to be retrived from LDAP (in userdb look up)
See also :ref:`authentication-ldap_backend_configuration`
User attributes are given in LDAP-name=dovecot-internal-name list.
The internal names are:

======== ========================
Name      Description
======== ========================
uid      System UID
gid      System GID
home     Home directory
mail     :ref:`Mail location <mail_location_settings>`
======== ========================

There are also other special fields which can be returned.

See :ref:`authentication-user_extra_field`

Example:

.. code-block:: none

   user_attrs = \
              =home=%{ldap:homeDirectory}, \
              =uid=%{ldap:uidNumber}, \
              =gid=%{ldap:gidNumber}


.. _ldap_settings_auth-user_filter:

``user_filter``
---------------

- Default: <empty>
- Values:  :ref:`string`

Filter for user lookup (userdb lookup).
See also :ref:`authentication-ldap_backend_configuration`

Below variables can be used.   

======== =============  ================================================================
Variable Long name      Description
======== =============  ================================================================
%u       %{user}        username
%n       %{username}    user part in user@domain, same as %u if there's no domain
%d       %{domain}      domain part in user@domain, empty if user there's no domain
======== =============  ================================================================

See :ref:`config_variables` for full list

Example:

.. code-block:: none

   user_filter = (&(objectClass=posixAccount)(uid=%u))

.. _ldap_settings_auth-userdb_warning_disable:

``userdb_warning_disable``
--------------------------

- Default: ``no``
- Values:  :ref:`boolean`

This setting is obsolete, and ignored regardless of the value being configured.


  

   

