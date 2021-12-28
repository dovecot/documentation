.. _pigeonhole_ldap:

===============================================
Pigeonhole Sieve: LDAP Lookup for Sieve Scripts
===============================================

The ``ldap`` :ref:`location <pigeonhole_configuration_script_locations>`
is used to retrieve Sieve scripts from an LDAP database. To retrieve a
Sieve script from the LDAP database, at most two lookups are performed.
First, the LDAP entry containing the Sieve script is searched using the
specified LDAP search filter. If the LDAP entry changed since it was
last retrieved (or it was never retieved before), the attribute
containing the actual Sieve script is retrieved in a second lookup. In
the first lookup, a special attribute is read and checked for changes.
Usually, this is the ``modifyTimestamp`` attribute, but an alternative
can be configured.

Note that, by default, compiled binaries are not stored at all for Sieve
scripts retrieved from an LDAP database. The ``;bindir=<path>`` option
needs to be specified in the `location specification <<pigeonhole_configuration_script_locations>`

Depending on how Pigeonhole was configured and compiled (refer to
INSTALL file for more information), LDAP support may only be available
when a plugin called ``sieve_storage_ldap`` is loaded.

Configuration
-------------

If support for the ``ldap`` location type is compiled as a plugin, it
needs to be added to the sieve_plugins setting before it can be used,
e.g.:

::

   sieve_plugins = sieve_storage_ldap

The ``ldap`` script location syntax is specified as follows:

::

   location = ldap:<config-file>[;<option>[=<value>][;...]]

The ``<config-file>`` is a filesystem path that points to a
configuration file containing the actual configuration for this ``ldap``
script location.

The following additional location options are recognized:

user=<username>
   Overrides the user name used for the lookup. Normally, the name of
   the user running the Sieve interpreter is used.


If the name of the Script is left unspecified and not otherwise provided
by the Sieve interpreter, the name defaults to \`\ ``default``'.

The configuration file is based on the :ref:`LDAP Authentication
configuration <authentication-ldap_settings_common>`. The
following parameters are specific to the Sieve ldap configuration:


.. _pigeonhole_ldap-sieve_ldap_filter:

``sieve_ldap_filter``
---------------------

- Default: ``(&(objectClass=posixAccount)(uid=%u))``
- Values:  :ref:`string`

The LDAP search filter that is used to find the entry containing the
Sieve script.
Below variables can be used:

======== =============  ==================================================================
Variable Long name      Description
======== =============  ==================================================================
%u       %{user}        username
%n       %{username}    user part in user@domain, same as %u if there's no domain
%d       %{domain}      domain part in user@domain, empty if user there's no domain
N/A      %{home}        user's home directory
N/A      %{name}        name of the Sieve script
======== =============  ==================================================================

.. _pigeonhole_ldap-sieve_ldap_script_attr:

``sieve_ldap_script_attr``
--------------------------

- Default: ``mailSieveRuleSource``
- Values:  :ref:`string`

The name of the attribute containing the Sieve script.

.. _pigeonhole_ldap-sieve_ldap_mod_attr:

``sieve_ldap_mod_attr``
-----------------------

- Default: ``modifyTimestamp``
- Values:  :ref:`string`

The name of the attribute used to detect modifications to the LDAP
entry.



Example
-------

The dovecot configuration:

::

   plugin {
     sieve = ldap:/etc/dovecot/sieve-ldap.conf;bindir=~/.sieve-bin/
   }

The contents of sieve-ldap.conf:

::

   # This file needs to be accessible by the Sieve interpreter running in LDA/LMTP.
   # This requires access by the mail user. Don't use privileged LDAP credentials
   # here as these may likely leak. Only search and read access is required.

   # Space separated list of LDAP hosts to use. host:port is allowed too.
   hosts = localhost

   # Distinguished Name - the username used to login to the LDAP server.
   # Leave it commented out to bind anonymously.
   dn = cn=sieve,ou=Programs,dc=example,dc=org

   # Password for LDAP server, if dn is specified.
   dnpass = secret

   # Simple binding.
   sasl_bind = no

   # No TLS
   tls = no

   # LDAP library debug level as specified by LDAP_DEBUG_* in ldap_log.h.
   # -1 = everything. You may need to recompile OpenLDAP with debugging enabled
   # to get enough output.
   debug_level = 0

   # LDAP protocol version to use. Likely 2 or 3.
   ldap_version = 3

   # LDAP base
   base = dc=mail,dc=example,dc=org

   # Dereference: never, searching, finding, always
   deref = never

   # Search scope: base, onelevel, subtree
   scope = subtree

   # Filter for user lookup. Some variables can be used:
   #   %u      - username
   #   %n      - user part in user@domain, same as %u if there's no domain
   #   %d      - domain part in user@domain, empty if there's no domain
   #   %{name} - name of the Sieve script
   sieve_ldap_filter = (&(objectClass=posixAccount)(uid=%u))

   # Attribute containing the Sieve script
   sieve_ldap_script_attr = mailSieveRuleSource

   # Attribute used for modification tracking
   sieve_ldap_mod_attr = modifyTimestamp
