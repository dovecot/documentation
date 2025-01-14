---
layout: doc
title: lib-dcrypt
dovecotlinks:
  lib_dcrypt: lib-dcrypt
  lib_dcrypt_key_formats:
    hash: key-formats
    text: "lib-dcrypt: Key Formats"
  lib_dcrypt_flags:
    hash: flags
    text: "lib-dcrypt: Flags"
---

# lib-dcrypt

lib-dcrypt is component for abstracting asymmetric and symmetric
cryptographic operations. It can be used for public/private key handling
too. Currently we support OpenSSL backing, but it is possible to write
alternative backends for dcrypt.

## ECDH algorithm

ECDH (Elliptic curve Diffie-Hellman) is widely used in lib-dcrypt for
both key and data storage. This algorithm is also known as
[ECIES (Elliptic Curve Integrated Encryption Scheme)][ECIES].

When encrypting data, we perform following steps, this is the currently
used algorithm. There is also a legacy algorithm, but since that has not
been used publicly, we do not describe it here. You can deduce it from
the code if you want to.

### `ENCRYPT(RECIPIENT-KEY, DATA)`

1. Ensure recipient key is not point at infinity

1. Generate new keypair from same group

1. Choose ephemeral public key as `R`

1. Calculate $P = R * RECIPIENT-KEY$

1. From $P = (x,y)$ choose `x` as `S`

1. Generate random IV+key and HMAC seed or AAD as encryption key material

1. Use $PBKDF2(mac-algorithm, S, salt, rounds)$ to produce IV+key, and AAD if used by cipher algorithm for encrypting the encryption key

1. Encrypt encryption key material with the values generated in step 7

1. Encrypt data using encryption key material

1. OUTPUT R, salt and encrypted data.

In dcrypt-openssl.c, we use `EVP_PKEY_derive_*` for the actual
derivations. ephemeral public key is exported with EC_POINT_point2oct in
compressed form.

### `DECRYPT(PRIVATE-KEY, R, SALT, DATA)`

1. Ensure R is not point at infinity

1. Calculate $P = R * PRIVATE-KEY$

1. From $P = (x,y)$ choose x as S

1. Use $PBKDF2(mac-algorithm, S, salt, rounds)$ to produce IV+key, and HMAC seed or
   AAD for encryption key decryption

1. Decrypt encryption key (if you are using GCM, AAD and TAG need to provided for encryption key decryption)

1. Decrypt data using encryption key

1. OUTPUT decrypted data

## Key Formats

lib-dcrypt can consume keys in PEM format [[rfc,1421]] (with or without
password), and in Dovecot's special format intended for dict storage.

Dovecot's format consists from unencrypted and encrypted keys. You can
encrypt keys using password or another key. There are also two version,
version 1 (deprecated) and version 2 (current). Both versions support
either tab or : separated fields. ECC keys are stored always in
compressed form. Version 1 format is not described as it's deprecated
and should not be used.

### Version 2 Format

```
public key id: HEX(SHA256(public key in DER format))
key data:
  RSA: i2d_PrivateKey
  ECC: BN_bn2mpi using compressed form
  XD: Public key bits
public key: 2:HEX(public key in DER format):public key ID
private key (unencrypted)    : 2:key algo oid:0:key data:public key ID
private key (encrypted, key) : 2:key algo oid:1:symmetric algo:salt:digest algo (for pbkdf2):rounds:encrypted key data:ephemeral public key:digest of encryption key:public key ID
private key (encrypted, pwd) : 2:key algo oid:2:symmetric algo:salt:digest algo (for pbkd2f):rounds:encrypted key data:public key ID
```

## Flags

Currently supported flags are:

 - 0x01 - Use HMAC for data integrity
 - 0x02 - Use AEAD for key and data integrity
 - 0x04 - No data integrity verification
 - 0x08 - Encrypted using obsolete version 1 algorithm
 - 0x10 - Use same cipher algorithm for key and data [[added,dcrypt_same_cipher_algo_added]]

## File Format

This library can also generate encrypted files that are encrypted using
asymmetric key pair. File encryption can be done using whatever
algorithm(s) the underlying library supports. For integrity support,
either HMAC based or AEAD based system is used when requested.

File format 2 is described below

```
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
epk - +4  MSB length of encryption key
+4  - ek  encrypted key[+ TAG when AEAD used]
----- end of key block (this can then repeat) -----
eokb - +4  MSB length of encryption key hash
+4 - ekh  encryption key hash
ekh - (eof-maclen) payload data
```

## Decryption Script

There is a small script for decrypting these files, see
[`dcrypt-decrypt.py`][dcrypt-decrypt].

[ECIES]: https://en.wikipedia.org/wiki/ECIES
[dcrypt-decrypt]: https://github.com/dovecot/tools/blob/main/dcrypt-decrypt.py
