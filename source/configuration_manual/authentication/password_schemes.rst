.. _authentication-password_schemes:

================
Password Schemes
================

Password scheme means the format in which the password is stored in
:ref:`authentication-password_databases`. The main reason for choosing a scheme other
than **PLAIN** is to prevent someone with access to the password database (such
as a hacker) from stealing users' passwords and using them to access other
services.

What scheme to use?
===================

You should choose the strongest crypt scheme that's supported by your system.
From strongest to weakest:

**ARGON2I/ARGON2ID**: `Argon2 <https://en.wikipedia.org/wiki/Argon2>`_ is the
winner of password hashing competition held at July 2015. The password will
start with $argon2i$ or $argon2id$. You can use -r to tune computational
complexity, minimum is 3. ARGON2ID is only available if your libsodium is
recent enough. ARGON2 can require quite a hefty amount of virtual memory, so we
recommend that you set service ``auth { vsz_limit = 2G }`` at least, or more.

**BLF-CRYPT**: This is the Blowfish crypt (bcrypt) scheme. It is generally
considered to be very secure. The encrypted password will start with $2y$
(other generators can generate passwords that have other letters after $2,
those should work too.)

.. Note:: v2.2: bcrypt is not available on most Linux distributions). Since
          v2.3.0 this is provided by dovecot. You can tune the computational
          cost using -r parameter for doveadm.

**SHA512-CRYPT**: A strong scheme. The encrypted password will start with
``$6$``

**SHA256-CRYPT**: A strong scheme. The encrypted password will start with
``$5$``

**MD5-CRYPT**: A weak but common scheme often used in /etc/shadow. The
encrypted password will start with ``$1$``

.. Note:: The above schemes are implemented by the libc's ``crypt()`` function.
          Using them is especially useful when sharing the same passwords with
          other software, because most of them support using ``crypt()`` to
          verify the password. However, not all libcs (especially older ones)
          implement all of the above schemes. See below for other password
          schemes that are implemented by Dovecot internally (instead of libc).

A few articles about why choosing a good password scheme is important:

* `How To Safely Store A Password
  <https://codahale.com/how-to-safely-store-a-password/>`_
* `Speed Hashing <https://blog.codinghorror.com/speed-hashing/>`_

It's not possible to easily switch from one password scheme to another. The
only practical way to do this is to wait until user logs in and change the
password during the login. `This HOWTO
<https://wiki.dovecot.org/HowTo/ConvertPasswordSchemes>`_ shows one way to do
this.

Generating encrypted passwords
==============================

You can generate passwords for a particular scheme easily with ``doveadm pw``
utility. For example:

.. code-block:: none

  doveadm pw

.. versionadded:: v2.3.0

The scheme defaults to CRYPT (with the ``$2y$`` bcrypt format),
but you can use ``-s`` to override it:

.. code-block:: none

  doveadm pw -s SHA512-CRYPT

To provide password, for scripting purposes, you can use either

.. code-block:: none

  doveadm pw -p password

or

.. code-block:: none

  printf 'password\npassword\n' | doveadm pw

Default password schemes
========================

Password databases have a default password scheme:

:ref:`SQL <authentication-sql>` : See ``default_pass_scheme``
setting in ``dovecot-sql.conf.ext``

:ref:`authentication-ldap`: See ``default_pass_scheme`` setting in ``dovecot-ldap.conf.ext``

:ref:`authentication-passwd_file` : CRYPT is used
by default, but can be changed with ``scheme`` parameter in passdb args.

:ref:`authentication-passwd`: CRYPT is used by default and can't be changed currently.

:ref:`authentication-pam`, :ref:`authentication-bsdauth`, :ref:`authentication-checkpassword`: Dovecot never even sees the
password with these databases, so Dovecot has nothing to do with what password
scheme is used.

The password scheme can be overridden for each password by prefixing it with
{SCHEME}, for example: ``{PLAIN}pass``.

Non-plaintext authentication mechanisms
=======================================

See :ref:`authentication-authentication_mechanisms` for explanation of auth mechanisms. Most
installations use only plaintext mechanisms, so you can skip this section
unless you know you want to use them.

The problem with non-plaintext auth mechanisms is that the password must be
stored either in plaintext, or using a mechanism-specific scheme that's
incompatible with all other non-plaintext mechanisms. In addition, the
mechanism-specific schemes often offer very little protection. This isn't a
limitation of Dovecot, it's a requirement for the algorithms to even work.

For example if you're going to use CRAM-MD5 authentication, the password needs
to be stored in either PLAIN or CRAM-MD5 scheme. If you want to allow both
CRAM-MD5 and DIGEST-MD5, the password must be stored in plaintext.

In future it's possible that Dovecot could support multiple passwords in
different schemes for a single user.

+---------------+------------------------------------------------------------------------+--------------------------+
| LANMAN	| DES-based encryption. Used sometimes with NTLM mechanism.              |                          |
+---------------+------------------------------------------------------------------------+--------------------------+
| NTLM          | MD4 sum of the password stored in hex. Used with NTLM mechanism.       |                          |
+---------------+------------------------------------------------------------------------+--------------------------+
| RPA           | Used with RPA mechanism.                                               |                          |
+---------------+------------------------------------------------------------------------+--------------------------+
| CRAM-MD5      | Used with CRAM-MD5 mechanism.                                          |                          |
+---------------+------------------------------------------------------------------------+--------------------------+
| DIGEST-MD5    | Used with DIGEST-MD5 mechanism. The username is included in            |                          |
|               | the hash, so it's not possible to use the hash for different usernames.|                          |
+---------------+------------------------------------------------------------------------+--------------------------+
| SCRAM-SHA-1   | Used with SCRAM-SHA-1 mechanism.                                       |                          |
+---------------+------------------------------------------------------------------------+--------------------------+
| SCRAM-SHA-256 | Stronger replacement for SCRAM-SHA-1                                   | .. versionadded:: 2.3.10 |
+---------------+------------------------------------------------------------------------+--------------------------+


Other supported password schemes
================================

Strong schemes and mechanism-specific schemes are listed above.

* **PLAIN**: Password is in plaintext.
* **CRYPT**: Traditional DES-crypted password in ``/etc/passwd (e.g. "pass" =
  vpvKh.SaNbR6s)``

.. versionchanged:: v2.4;v3.0 DES and MD5 based crypt are disabled by default.

 * Dovecot uses libc's ``crypt()`` function, which means that CRYPT is usually
   able to recognize MD5-CRYPT and possibly also other password schemes. See
   all of the ``*-CRYPT`` schemes at the top of this page.

 * The traditional DES-crypt scheme only uses the first 8 characters of the
   password, the rest are ignored. Other schemes may have other password length
   limitations (if they limit the password length at all).

MD5 based schemes:
******************

.. versionchanged:: v2.4;v3.0 Disabled by default.

* **PLAIN-MD5**: MD5 sum of the password stored in hex.
* **LDAP-MD5**: MD5 sum of the password stored in base64.
* **SMD5**: Salted MD5 sum of the password stored in base64.

SHA based schemes (also see below for libc's SHA* support):
***********************************************************

* **SHA**: SHA1 sum of the password stored in base64.
* **SSHA**: Salted SHA1 sum of the password stored in base64.
* **SHA256**: SHA256 sum of the password stored in base64. (v1.1 and later).
* **SSHA256**: Salted SHA256 sum of the password stored in base64. (v1.2 and
  later).
* **SHA512**: SHA512 sum of the password stored in base64. (v2.0 and later).
* **SSHA512**: Salted SHA512 sum of the password stored in base64. (v2.0 and
  later).

Other schemes
*************

.. versionadded:: v2.3.0

* **ARGON2I**: ARGON2i password scheme, needs libsodium
* **ARGON2ID**: ARGON2id password scheme, needs libsodium
* **PBKDF2**: PKCS5 Password hashing algorithm.
  Note that there is no standard encoding for this format, so this scheme may not be interoperable with other software.
  Dovecot implements it as "$1$salt$rounds$hash".

For some schemes (e.g. PLAIN-MD5, SHA) Dovecot is able to detect if the
password hash is base64 or hex encoded, so both can be used. doveadm pw anyway
generates the passwords using the encoding mentioned above.

3rd party password schemes
==========================

These plugins are provided by community members, we do not provide support or
help with them, please contact the developer(s) directly. Use at your own
discretion. Since v2.3.0 ARGON2 is provided by dovecot itself.

* **SCRYPT** and **ARGON2**: See
  https://github.com/LuckyFellow/dovecot-libsodium-plugin/

Encoding
========

The base64 vs. hex encoding that is mentioned above is simply the default
encoding that is used. You can override it for any scheme by adding a ".hex",
".b64" or ".base64" suffix. For example:

* ``{SSHA.b64}986H5cS9JcDYQeJd6wKaITMho4M9CrXM`` contains the password encoded
  to base64 (just like {SSHA})
* ``{SSHA.HEX}3f5ca6203f8cdaa44d9160575c1ee1d77abcf59ca5f852d1`` contains the
  password encoded to hex

This can be especially useful with plaintext passwords to encode characters
that would otherwise be illegal. For example in passwd-file you couldn't use a
":" character in the password without encoding it to base64 or hex. For
example: {PLAIN}{\}:!" is the same as ``{PLAIN.b64}e1x9OiEiCg==``.

You can also specify the encoding with doveadm pw. For example: ``doveadm pw -s
plain.b64``

Salting
=======

For the SHA512-CRYPT, SHA256-CRYPT and MD5-CRYPT schemes, the salt is stored
before the hash, e.g.: $6$salt$hash. For the BLF-CRYPT scheme, bcrypt stores
the salt as part of the hash.

For most of the other salted password schemes (SMD5, SSHA*) the salt is stored
after the password hash and its length can vary. When hashing the password,
append the salt after the plaintext password, e.g.: SSHA256(pass, salt) =
SHA256(pass + salt) + salt.

For example with SSHA256 you know that the hash itself is 32 bytes (256 bits/8
bits per byte). Everything after that 32 bytes is the salt. For example if you
have a password:

.. code-block:: none

  {SSHA256}SoR/78T5q0UPFng8UCXWQxOUKhzrJZlwfNtllAupAeUT+kQv

After base64 decoding it you'll see that its length is 36 bytes, so the first
32 bytes are the hash and the following 4 bytes are the salt:

* length: ``echo SoR/78T5q0UPFng8UCXWQxOUKhzrJZlwfNtllAupAeUT+kQv|base64 -d|wc
  -c``-> 36
* hash: ``echo SoR/78T5q0UPFng8UCXWQxOUKhzrJZlwfNtllAupAeUT+kQv|base64 -d|dd
  bs=1 count=32|hexdump -C``-> 4a 84 7f ef c4 f9 ab 45 0f 16 78 3c 50 25 d6 43
  13 94 2a 1c eb 25 99 70 7c db 65 94 0b a9 01 e5
* salt: ``echo SoR/78T5q0UPFng8UCXWQxOUKhzrJZlwfNtllAupAeUT+kQv|base64 -d|dd
  bs=1 skip=32|hexdump -C``-> 13 fa 44 2f

Other common hash sizes are:
****************************

* MD5: 16 bytes
* SHA: 20 bytes
* SHA256: 32 bytes
* SHA512: 64 bytes

The web management gui `VBoxAdm <http://developer.gauner.org/vboxadm/>`_ has
some code dealing with creation and verification of salted hashes in Perl.
However not all password schemes provided by dovecotpw are supported. Have a
look at the module ``VBoxAdm::DovecotPW`` for more details.
