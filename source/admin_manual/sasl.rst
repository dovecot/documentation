.. _sasl:

====
SASL
====

SASL stands for "Simple Authentication and Security Layer". SASL itself is
nothing more than a list of requirements for
:ref:`authentication-authentication_mechanisms` and protocols to be
SASL-compatible as described in :rfc:`4422`. IMAP, POP3, SMTP, and
ManageSieve protocols all have support for SASL.

Many people confuse SASL with one specific SASL implementation: the Cyrus SASL
library. Dovecot has its own SASL implementation which could (one day) be
separated from Dovecot itself to "compete" against Cyrus SASL library as an
alternative implementation.

Dovecot can be used as the SASL server for several external SMTP/Submission
servers.  See :ref:`simple_virtual_install_smtp_auth`.

