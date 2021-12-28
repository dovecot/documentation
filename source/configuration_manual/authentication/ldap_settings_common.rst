.. _authentication-ldap_settings_common:

=============================================
Common LDAP Settings for both auth and sieve
=============================================

This page lists the common settings for both LDAP Authentication and LDAP Lookup for Sieve Scripts.

See :ref:`authentication-ldap_settings_auth` for the settings specific to LDAP Authentication.

See :ref:`pigeonhole_ldap` for the settings specific to LDAP Lookup for Sieve Scripts.

.. Note:: The ldap configuration files are opened as root, so should be owned by root and mode 0600.


.. _ldap_settings_common-base:

``base``
--------

- Default: <empty>
- Values:  :ref:`string`

LDAP base. %variables (see :ref:`config_variables`) can be used here.


Example:

.. code-block:: none

   base = dc=mail, dc=example, dc=org

   
.. _ldap_settings_common-debug_level:

``debug_level``
---------------

- Default: ``0``
- Values:  :ref:`uint`

LDAP library debug level as specified by LDAP_DEBUG_* in ldap_log.h.
Value ``-1`` means everything. You may need to recompile OpenLDAP with debugging enabled
to get enough output.


.. _ldap_settings_common-deref:

``deref``
---------

- Default: ``never``
- Values:  ``never``, ``searching``, ``finding``, ``always``

Specify dereference which is set as an LDAP option.


.. _ldap_settings_common-dn:

``dn``
------

- Default: <empty>
- Values:  :ref:`string`

Specify the Distinguished Name (the username used to login to the LDAP server).
Leave it commented out to bind anonymously (useful with :ref:`ldap_settings_auth-auth_bind` = yes).

Example:

.. code-block:: none

   dn = uid=dov-read,dc=ocn,dc=ad,dc=jp,dc=.


.. _ldap_settings_common-dnpass:

``dnpass``
------------

- Default: <empty>
- Values:  :ref:`string`

Password for LDAP server, used if :ref:`ldap_settings_common-dn` is specified.


.. _ldap_settings_common-hosts:

``hosts``
---------

- Default: <empty>
- Values:  :ref:`string`

A space separated list of LDAP hosts to connect to.
Configure either this setting or :ref:`ldap_settings_common-uris` to specify
what LDAP server(s) to connect to.
You can also use host:port syntax to use different ports.

Example:

.. code-block:: none

   hosts = 10.10.10.10 10.10.10.11 10.10.10.12

See also :ref:`ldap_settings_common-uris`


.. _ldap_settings_common-ldap_version:

``ldap_version``
----------------

- Default: ``3``
- Values:  :ref:`uint`

LDAP protocol version to use. Likely 2 or 3.


.. _ldap_settings_common-ldaprc_path:

``ldaprc_path``
---------------

- Default: <empty>
- Values:  :ref:`string`


If a non-empty value is set, it will be set to the LDAPRC environment variable.


.. _ldap_settings_common-sasl_authz_id:

``sasl_authz_id``
-----------------

- Default: <empty>
- Values:  :ref:`string`

SASL authorization ID, ie. the dnpass is for this "master user", but the
dn is still the logged in user. Normally you want to keep this empty.


.. _ldap_settings_common-sasl_bind:

``sasl_bind``
-------------

- Default: ``no``
- Values:  :ref:`boolean`

Set yes to use SASL binding instead of the simple binding. Note that this changes
ldap_version automatically to be 3 if it's lower.


.. _ldap_settings_common-sasl_mech:

``sasl_mech``
-------------

- Default: <empty>
- Values:  :ref:`string`

SASL mechanism names (a space-separated list of candidate mechanisms) to use.

.. todo:: may need to list such mech names?


.. _ldap_settings_common-sasl_realm:

``sasl_realm``
--------------

- Default: <empty>
- Values:  :ref:`string`

SASL realm to use.


.. _ldap_settings_common-scope:

``scope``
---------

- Default: ``subtree``
- Values:  ``base``, ``onelevel``, ``subtree``

This specifies the search scope.


.. _ldap_settings_common-tls:

``tls``
-------

- Default: ``no``
- Values:  :ref:`boolean`

Set to yes to use TLS to connect to the LDAP server.


.. _ldap_settings_common-tls_ca_cert_dir:

``tls_ca_cert_dir``
-------------------

- Default: <empty>
- Values:  :ref:`string`

Specify a value for TLS ``tls_ca_cert_dir`` option.
Currently supported only with OpenLDAP.


.. _ldap_settings_common-tls_ca_cert_file:

``tls_ca_cert_file``
--------------------

- Default: <empty>
- Values:  :ref:`string`

Specify a value for TLS ``tls_ca_cert_file`` option.
Currently supported only with OpenLDAP.


.. _ldap_settings_common-tls_cert_file:

``tls_cert_file``
-----------------

- Default: <empty>
- Values:  :ref:`string`

Specify a value for TLS ``tls_cert_file`` option.
Currently supported only with OpenLDAP.


.. _ldap_settings_common-tls_cipher_suite:

``tls_cipher_suite``
--------------------

- Default: <empty>
- Values:  :ref:`string`

Specify a value for TLS ``tls_cipher_suite`` option.
Currently supported only with OpenLDAP.


.. _ldap_settings_common-tls_key_file:

``tls_key_file``
----------------

- Default: <empty>
- Values:  :ref:`string`

Specify a value for TLS ``tls_key_file`` option.
Currently supported only with OpenLDAP.


.. _ldap_settings_common-tls_require_cert:

``tls_require_cert``
--------------------

- Default: <empty>
- Values: ``never, hard, demand, allow, try``

Specify a value for TLS ``tls_require_cert`` option.
Currently supported only with OpenLDAP.


.. _ldap_settings_common-uris:

``uris``
--------

- Default: <empty>
- Values:  :ref:`string`

LDAP URIs to use.
Configure either this setting or :ref:`ldap_settings_common-hosts` to specify
what LDAP server(s) to connect to.
Note that this setting isn't supported by all LDAP libraries.
The URIs are in syntax ``protocol://host:port``.

Example:

.. code-block:: none

   uris = ldaps://secure.domain.org

See also :ref:`ldap_settings_common-hosts`

