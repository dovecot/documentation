.. _authentication-authentication_mechanisms:

================================
Authentication (SASL) Mechanisms
================================

Cleartext authentication
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

Another cleartext mechanism is LOGIN. It's typically used only by SMTP servers
to let Outlook clients perform SMTP authentication. Note that LOGIN mechanism
is not the same as IMAP's LOGIN command. The LOGIN command is internally
handled using PLAIN mechanism.

Non-cleartext authentication
============================

Non-cleartext mechanisms have been designed to be safe to use even without
:ref:`ssl` encryption. Because of how they have
been designed, they require access to the cleartext password or their own
special hashed version of it. This means that it's impossible to use
non-cleartext mechanisms with password hashes.

If you want to use more than one non-cleartext mechanism, the passwords must be
stored as cleartext so that Dovecot is able to generate the required special
hashes for all the different mechanisms. If you want to use only one
non-cleartext mechanism, you can store the passwords using the mechanism's own
:ref:`authentication-password_schemes`.

With success/failure password databases (see in
:ref:`authentication-password_databases`) (e.g. PAM) it's not possible to use
non-cleartext mechanisms at all, because they only support verifying a known
cleartext password.

Dovecot supports the following non-cleartext mechanisms:
********************************************************

+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| Mechanism                                                                    | Summary                                                                  | Added in version            |
+==============================================================================+==========================================================================+=============================+
| CRAM-MD5                                                                     | Protects the password in transit against eavesdroppers.                  |                             |
|                                                                              | Somewhat good support in clients.                                        |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| `DIGEST-MD5 <authentication-digestmd5>`                                      | Somewhat stronger cryptographically than CRAM-MD5,                       |                             |
|                                                                              | but clients rarely support it.                                           |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| SCRAM-SHA-1                                                                  | Salted Challenge Response Authentication Mechanism                       |                             |
|                                                                              | (SCRAM) SAS and GSS-API Mechanisms.                                      |                             |
|                                                                              | Intended as DIGEST-MD5 replacement.                                      |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| SCRAM-SHA-256                                                                | Stronger replacement for SCRAM-SHA-1 :rfc:`7677`.                        | .. dovecotadded:: 2.3.10    |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| APOP                                                                         | This is a POP3-specific authentication. Similar to                       |                             |
|                                                                              | CRAM-MD5, but requires storing password in cleartext                     |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| NTLM                                                                         | Mechanism created by Microsoft and supported by their                    | .. versionremoved:: 2.3.13  |
|                                                                              | clients                                                                  |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| `GSS-SPNEGO <authentication-gssapi>`                                         | A wrapper mechanism defined by :rfc:`4178`.                              |                             |
|                                                                              | Can be accessed via GSSAPI.                                              |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| `GSSAPI <authentication-gssapi>`                                             | Kerberos v5 support.                                                     |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| RPA                                                                          | Compuserve RPA authentication mechanism.                                 | .. versionremoved:: 2.3.13  |
|                                                                              | Similar to DIGEST-MD5, but client support is rare.                       |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| ANONYMOUS                                                                    | Support for logging in anonymously. This may be useful if you're         |                             |
|                                                                              | intending to provide publicly accessible IMAP archive.                   |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| OTP                                                                          | One time password mechanisms.                                            |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| EXTERNAL                                                                     | EXTERNAL SASL mechanism.                                                 |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| `OAUTHBEARER <authentication-oauth2>`                                        | OAuth2 bearer authentication :rfc:`7628`.                                | .. dovecotadded:: 2.2.29    |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+
| `XOAUTH2 <authentication-xoauth2>`                                           | `Google flavor OAUTHBEARER                                               | .. dovecotadded:: 2.2.29    |
|                                                                              | <https://developers.google.com/gmail/imap/xoauth2-protocol>`_            |                             |
+------------------------------------------------------------------------------+--------------------------------------------------------------------------+-----------------------------+

Configuration
=============

By default only PLAIN mechanism is enabled. To use more, edit your
``/etc/dovecot/conf.d/10-auth.conf`` and set:

.. code-block:: none

  auth_mechanisms = plain login cram-md5
