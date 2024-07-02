---
layout: doc
title: Overview
dovecotlinks:
  authentication_mechanisms: authentication mechanisms
---

# Authentication (SASL) Mechanisms

## Cleartext Authentication

The simplest authentication mechanism is PLAIN. The client simply sends the
password unencrypted to Dovecot. All clients support the PLAIN mechanism, but
obviously there's the problem that anyone listening on the network can steal
the password. For that reason (and some others) other mechanisms were
implemented.

Today however many people use [[link,ssl]], and there's no problem with
sending unencrypted password inside SSL secured connections. So if you're
using SSL, you probably don't need to bother worrying about anything else
than the PLAIN mechanism.

Another cleartext mechanism is LOGIN. It's typically used only by SMTP servers
to let Outlook clients perform SMTP authentication. Note that LOGIN mechanism
is not the same as IMAP's LOGIN command. The LOGIN command is internally
handled using PLAIN mechanism.

## Non-Cleartext Authentication

Non-cleartext mechanisms have been designed to be safe to use even without
[[link,ssl]] encryption. Because of how they have been designed, they
require access to the cleartext password or their own special hashed
version of it. This means that it's impossible to use non-cleartext
mechanisms with password hashes.

If you want to use more than one non-cleartext mechanism, the passwords must
be stored as cleartext so that Dovecot is able to generate the required
special hashes for all the different mechanisms. If you want to use only
one non-cleartext mechanism, you can store the passwords using the
mechanism's own [[link,password_schemes]].

With success/failure password databases (see [[link,passdb]], e.g.
[[link,auth_pam]]), it's not possible to use non-cleartext mechanisms at
all, because they only support verifying a known cleartext password.

### Dovecot Support

| Mechanism | Summary |
| --------- | ------- |
| CRAM-MD5 | Protects the password in transit against eavesdroppers. Somewhat good support in clients.|
| [[link,auth_digest_md5]] | Somewhat stronger cryptographically than CRAM-MD5, but clients rarely support it. |
| SCRAM-SHA-1 | Salted Challenge Response Authentication Mechanism (SCRAM) SAS and GSS-API Mechanisms. Intended as DIGEST-MD5 replacement. | 
| SCRAM-SHA-256 | Stronger replacement for SCRAM-SHA-1 [[rfc,7677]]. |
| APOP | This is a POP3-specific authentication. Similar to CRAM-MD5, but requires storing password in cleartext. |
| [[link,auth_gssapi,GSS-SPNEGO]] | A wrapper mechanism defined by [[rfc,4178]]. Can be accessed via GSSAPI. |
| [[link,auth_gssapi]] | Kerberos v5 support. |
| ANONYMOUS | Support for logging in anonymously. This may be useful if you're intending to provide publicly accessible IMAP archive. |
| OTP | One time password mechanisms. |
| EXTERNAL | EXTERNAL SASL mechanism. |
| [[link,auth_oauth2,OAUTHBEARER]] | OAuth2 bearer authentication [[rfc,7628]]. |
| XOAUTH2 | [Google flavor OAUTHBEARER](https://developers.google.com/gmail/imap/xoauth2-protocol) |

## Configuration

By default only PLAIN mechanism is enabled. To use more, see
[[setting,auth_mechanisms]].
