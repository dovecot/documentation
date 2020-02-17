.. _sasl:

====
SASL
====

SASL stands for "Simple Authentication and Security Layer". SASL itself
is nothing more than a list of requirements for :ref:`authentication
mechanisms <authentication-authentication_mechanisms>`
and protocols to be SASL-compatible as described in `RFC
4422 <http://www.ietf.org/rfc/rfc4422.txt>`__. IMAP, POP3 and SMTP
protocols all have support for SASL.

Many people confuse SASL with one specific SASL implementation: the
Cyrus SASL library. Dovecot has its own SASL implementation which may at
some point be separated from Dovecot itself to "compete" against Cyrus
SASL library in server side.

Dovecot SASL can already be used with:

- Postfix **v2.3** and later. See
  :ref:`HowTo/PostfixAndDovecotSASL <howto-postfix_and_dovecot_sasl>` for details.
- Exim **v4.64** and later. See
   :ref:`HowTo/EximAndDovecotSASL <howto-exim_and_dovecot_sasl>` for details.
- `chasquid <https://blitiri.com.ar/p/chasquid>`__ **v0.04** and later.
  See :ref:`HowTo/ChasquidAndDovecotSASL <howto-exim_and_dovecot_sasl>` for
  details.
- Prosody (with mod_auth_dovecot)
- ejabberd (with check_dovecot.pl)

Hopefully more software will follow.
