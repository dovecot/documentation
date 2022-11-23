.. _authentication-authentication_mechanisms:

================================
Authentication (SASL) Mechanisms
================================

Plaintext authentication
========================

The simplest authentication mechanism is PLAIN. The client simply sends the
password unencrypted to Dovecot. All clients support the PLAIN mechanism, but
obviously there's the problem that anyone listening on the network can steal
the password. For that reason (and some others) other mechanisms were
implemented.

Today however many people use :ref:`ssl`, and
there's no problem with sending unencrypted password inside SSL secured
connections. So if you're using SSL, you probably don't need to bother worrying
about anything else than the PLAIN mechanism.

Another plaintext mechanism is LOGIN. It's typically used only by SMTP servers
to let Outlook clients perform SMTP authentication. Note that LOGIN mechanism
is not the same as IMAP's LOGIN command. The LOGIN command is internally
handled using PLAIN mechanism.

Non-plaintext authentication
============================

Non-plaintext mechanisms have been designed to be safe to use even without
:ref:`ssl` encryption. Because of how they have
been designed, they require access to the plaintext password or their own
special hashed version of it. This means that it's impossible to use
non-plaintext mechanisms with commonly used DES or MD5 password hashes.

If you want to use more than one non-plaintext mechanism, the passwords must be
stored as plaintext so that Dovecot is able to generate the required special
hashes for all the different mechanisms. If you want to use only one
non-plaintext mechanism, you can store the passwords using the mechanism's own
:ref:`authentication-password_schemes`.

With success/failure password databases (see in
:ref:`authentication-password_databases`) (e.g. PAM) it's not possible to use
non-plaintext mechanisms at all, because they only support verifying a known
plaintext password.

Dovecot supports the following non-plaintext mechanisms:
********************************************************

+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| Mechanism                                                                    | Summary                                                                  | Added in version         |
+==============================================================================+==========================================================================+==========================+
| CRAM-MD5                                                                     | Protects the password in transit against eavesdroppers.                  |                          |
|                                                                              | Somewhat good support in clients.                                        |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| `DIGEST-MD5 <https://wiki.dovecot.org/Authentication/Mechanisms/DigestMD5>`_ |  Somewhat stronger cryptographically than CRAM-MD5,                      |                          |
|                                                                              |  but clients rarely support it.                                          |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| SCRAM-SHA-1                                                                  | Salted Challenge Response Authentication Mechanism                       |                          |
|                                                                              | (SCRAM) SAS and GSS-API Mechanisms.                                      |                          |
|                                                                              | Intended as DIGEST-MD5 replacement.                                      |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| SCRAM-SHA-256                                                                | Stronger replacement for SCRAM-SHA-1. https://tools.ietf.org/html/rfc7677| .. versionadded:: 2.3.10 |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| APOP                                                                         | This is a POP3-specific authentication. Similar to                       |                          |
|                                                                              | CRAM-MD5, but requires storing password in plaintext                     |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| `NTLM <https://wiki.dovecot.org/Authentication/Mechanisms/NTLM>`_            | Mechanism created by Microsoft and supported by their                    |                          |
|                                                                              | clients                                                                  |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| GSS-SPNEGO                                                                   | A wrapper mechanism defined by                                           |                          |
|                                                                              | `RFC 4178 <https://tools.ietf.org/html/rfc4178>`_.                       |                          |
|                                                                              | Can be accessed via either GSSAPI or                                     |                          |
|                                                                              | :ref:`Winbind <authentication-winbind>`.                                 |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| `GSSAPI <https://wiki.dovecot.org/Authentication/Kerberos>`_                 | Kerberos v5 support.                                                     |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| RPA                                                                          | Compuserve RPA authentication mechanism.                                 |                          |
|                                                                              | Similar to DIGEST-MD5, but client support is rare.                       |                          | 
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| ANONYMOUS                                                                    | Support for logging in anonymously. This may be useful if you're         |                          |
|                                                                              | intending to provide publicly accessible IMAP archive.                   |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| OTP and SKEY                                                                 | One time password mechanisms.                                            |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| EXTERNAL                                                                     | EXTERNAL SASL mechanism.                                                 |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| OAUTHBEARER                                                                  | OAuth2 bearer authentication https://tools.ietf.org/html/rfc7628.        | .. versionadded:: 2.2.29 |
|                                                                              | See :ref:`authentication-oauth2`.                                        |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+
| XOAUTH2                                                                      | `Google flavor OAUTHBEARER                                               | .. versionadded:: 2.2.29 |
|                                                                              | <https://developers.google.com/gmail/imap/xoauth2-protocol>`_            |                          |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+--------------------------+

Configuration
=============

By default only PLAIN mechanism is enabled. To use more, edit your
``/etc/dovecot/conf.d/10-auth.conf`` and set:

.. code-block:: none

  auth_mechanisms = plain login cram-md5
