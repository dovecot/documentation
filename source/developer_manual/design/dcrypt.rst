.. _lib_dcrypt:

==========
lib-dcrypt
==========

lib-dcrypt is component for abstracting asymmetric and symmetric
cryptographic operations. It can be used for public/private key handling
too. Currently we support OpenSSL backing, but it is possible to write
alternative backends for dcrypt.

ECDH algorithm
--------------

ECDH (Elliptic curve Diffie-Hellman) is widely used in lib-dcrypt for
both key and data storage. This algorithm is also known as
`ECIES <https://en.wikipedia.org/wiki/ECIES>`__ (Elliptic curve
Integrated Encryption Scheme).

When encrypting data, we perform following steps, this is the currently
used algorithm. There is also a legacy algorithm, but since that has not
been used publicly, we do not describe it here. You can deduce it from
the code if you want to.

``ENCRYPT(RECIPIENT-KEY, DATA)``:

1. Ensure recipient key is not point at infinity

2. Generate new keypair from same group

3. Choose ephemeral public key as ``R``

4. Calculate :math:`P = R * RECIPIENT-KEY`

5. From :math:`P = (x,y)` choose ``x`` as ``S``

6. Generate random salt

7. Use :math:`PBKDF2(SHA256, S, salt, 2000)` to produce iv+key, and hmac seed or
   aad

8. Encrypt data

9. OUTPUT R, salt and encrypted data.

In dcrypt-openssl.c, we use ``EVP_PKEY_derive_*`` for the actual
derivations. ephemeral public key is exported with EC_POINT_point2oct in
compressed form.

``DECRYPT(PRIVATE-KEY, R, SALT, DATA)``:

1. Ensure R is not point at infinity

2. Calculate :math:`P = R * PRIVATE-KEY`

3. From :math:`P = (x,y)` choose x as S

4. Use :math:`PBKDF2(SHA256, S, salt, 2000)` to produce iv+key, and hmac seed or
   aad

5. Decrypt data

6. OUTPUT decrypted data

Key formats
-----------

lib-dcrypt can consume keys in `PEM
format <https://tools.ietf.org/html/rfc1421>`__ (with or without
password), and in Dovecot's special format intended for dict storage.

Dovecot's format consists from unencrypted and encrypted keys. You can
encrypt keys using password or another key. There are also two version,
version 1 (deprecated) and version 2 (current). Both versions support
either tab or : separated fields. ECC keys are stored always in
compressed form. Version 1 format is not described as it's deprecated
and should not be used.

Version 2 format
~~~~~~~~~~~~~~~~

::

   public key id: HEX(SHA256(public key in DER format))
   key data:
     RSA: i2d_PrivateKey
     ECC: BN_bn2mpi using compressed form

   public key: 2:HEX(public key in DER format):public key ID
   private key (unencrypted)    : 2:key algo oid:0:key data:public key ID
   private key (encrypted, key) : 2:key algo oid:1:symmetric algo:salt:digest algo (for pbkdf2):rounds:encrypted key data:ephemeral public key:digest of encryption key:public key ID
   private key (encrypted, pwd) : 2:key algo oid:2:symmetric algo:salt:digest algo (for pbkd2f):rounds:encrypted key data:public key ID

File format
-----------

This library can also generate encrypted files that are encrypted using
asymmetric key pair. File encryption can be done using whatever
algorithm(s) the underlying library supports. For integrity support,
either HMAC based or AEAD based system is used when requested.

File format is described below

::

   000 - 008 CRYPTED\x03\x07 (MAGIC)
   009 - 009 \x02 (VERSION FIELD, 2)
   010 - 013 MSB flags
   014 - 017 MSB total header length (starting from 000)
   018 - cod cipher oid in DER format
   cod - mod MAC algorithm oid in DER format
   mod - +4  MSB PBKDF2 rounds
   +5  - +8  MSB length of key data
   +9  - +9  number of key blocks
   ----- key block -----
   +10 - +10  key type (1 = RSA, 2 = ECC)
   +11 - +43 public key id (SHA256 of public key in DER format, point compressed)
   +44 - +48 MSB length of ephemeral key
   +49 - epk ephemeral key
   epk - +4  MSB length of encrypted key
   +4  - ek  encrypted key
   ----- end of key block (this can then repeat) -----
   eokb - +4  MSB length of encryption key hash
   +4 - ekh  encryption key hash
   ekh - (eof-maclen) payload data

There is a small script for decrypting these files, see
`decrypt.rb <https://wiki.dovecot.org/Design/Dcrypt?action=AttachFile&do=get&target=decrypt.rb>`__.
