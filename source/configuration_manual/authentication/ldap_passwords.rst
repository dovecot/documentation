.. _authentication-ldap_passwords:

=================================
Passdb LDAP with password lookups
=================================

Advantages over :ref:`authentication binds <authentication-ldap_bind>`:

-  Faster, because Dovecot can keep sending multiple LDAP requests
   asynchronously to the server. With auth binds Dovecot must wait for
   each request to finish before sending the next one.

-  Supports non-plaintext :ref:`authentication
   mechanisms <authentication-authentication_mechanisms>`
   (if returning plaintext/:ref:`properly hashed
   passwords <authentication-password_schemes>`).

-  When using :ref:`LDA <lda>` or :ref:`LMTP <lmtp_server>`
   and static userdb, deliver can check if destination user exists. With
   auth binds this check isn't possible.

LDAP server permissions
-----------------------

Normally LDAP server doesn't give anyone access to users' passwords, so
you'll need to create an administrator account that has access to the
userPassword field. With OpenLDAP this can be done by modifying
``/etc/ldap/slapd.conf``:

::

   # there should already be something like this in the file:
   access to attribute=userPassword
           by dn="<dovecot's dn>" read  # just add this line
           by anonymous auth
           by self write
           by * none

Replace ``<dovecot's dn>`` with the DN you specified in
``dovecot-ldap.conf's`` ``dn`` setting.

Dovecot configuration
---------------------

The two important settings in password lookups are:

-  ``pass_filter`` specifies the LDAP filter how user is found from the
   LDAP. You can use all the normal
   :ref:`variables <config_variables>`
   like ``%u`` in the filter.

-  ``pass_attrs`` specifies a comma-separated list of attributes that
   are returned from the LDAP. If you set it to empty, all the
   attributes are returned.

Usually the LDAP attribute names aren't the same as :ref:`the field names
that Dovecot uses internally <authentication-password_databases>`
You must create a mapping between them to get the wanted results. This
is done by listing the fields as ``<ldap attribute>=<dovecot field>``.
For example:

::

   pass_attrs = uid=user, userPassword=password

This maps the LDAP "uid" attribute to Dovecot's "user" field and LDAP's
"userPassword" attribute to Dovecot's "password" field. These two fields
should always be returned, but it's also possible to return other
special :ref:`extra fields <authentication-user_database_extra_fields>`. 

Password
~~~~~~~~

Most importantly the ``pass_attrs`` must return a "password" field,
which contains the user's password. The next thing Dovecot needs to know
is what format the password is in. If all the passwords are in same
format, you can use ``default_pass_scheme`` setting in
``dovecot-ldap.conf`` to specify it. Otherwise each password needs to be
prefixed with ``{password-scheme}``, for example
``{plain}plaintext-password``. See :ref:`authentication-password_schemes`
for a list of supported password schemes.

Username
~~~~~~~~

LDAP lookups are case-insensitive. Unless you somehow normalize the
username, it's possible that a user logging in as "user", "User" and
"uSer" are treated differently. The easiest way to handle this is to
tell Dovecot to change the username to the same case as it's in the LDAP
database. You can do this by returning "user" field in the
``pass_attrs``, as shown in the above example.

If you can't normalize the username in LDAP, you can alternatively
lowercase the username in ``dovecot.conf``:

::

   auth_username_format = %Lu

Example
-------

A typical configuration would look like:

::

   auth_bind = no
   pass_attrs = uid=user, userPassword=password
   pass_filter = (&(objectClass=posixAccount)(uid=%u))
   default_pass_scheme = MD5
