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
----- header -----
000  - 008  CRYPTED\x03\x07 (MAGIC)
009  - 009  \x02 (VERSION FIELD, 2)
010  - 013  MSB flags
014  - 017  MSB total header length (starting from 000)
018  - cod  cipher oid in DER format
cod  - mod  MAC algorithm oid in DER format
mod  - +4   MSB PBKDF2 rounds
+5   - +8   MSB length of key data
+9   - +9   number of key blocks
----- key block -----
+10  - +10  key type (1 = RSA, 2 = EC)
+11  - +43  public key id (SHA256 of public key in DER format, point compressed)
+44  - +48  MSB length of ephemeral key
+49  - epk  ephemeral key
epk  - +4   MSB length of encryption key
+4   - ek   encrypted key[+ TAG when AEAD used]
ek   - +4   MSB length of checksum
+4   - chk  checksum of the payload
----- end of key block (this can then repeat) -----
eokb - +4   MSB length of encryption key hash
+4   - ekh  encryption key hash
ekh  - (eof-macl)  payload data
macl - eof  message integrity tag
```

## Decryption Script

There is a small script for decrypting these files, see
[`dcrypt-decrypt.py`][dcrypt-decrypt].

### Dependencies

First fetch the script by cloning the [dovecot-tools][dovecot-tools]
repository or fetching the single tool.

::: info
To clone the repository:

```sh
git clone https://github.com/dovecot/tools
```

To fetch only the script (e.g. by using `wget`):

```sh
wget https://raw.githubusercontent.com/dovecot/tools/refs/heads/main/dcrypt-decrypt.py
```
:::

Setup a local python environment (optional) and install the necessary
dependencies.

```sh
# Optional but recommended: Create a virtual environment for the necessary
# python dependencies to run this script.
python -m venv venv
source venv/bin/activate
# Install the dependencies.
pip install asn1 cryptography
```

### Operation

Probably the most common installation uses the [[plugin,mail-compress]] and
[[plugin,mail-crypt]] plugins for compression and encryption respectively. See
also [[link,fs_crypt]] for this setup.

To simulate this scenario consider storing an input file `$in_file` using:
- `$private_key_path` and `$public_key_path` - the private and public key files
  to allow encryption with,
- `$prefix` - the path prefix to use for storing the output file,
- `$out_file` - the file path to store the file as.

```sh
doveadm fs put compress \
    gz:6:crypt:private_key_path=$private_key_path:public_key_path=$public_key_path:posix:prefix=$prefix \
    $in_file $out_file
```

Using the `dcrypt-decrypt` script you can then retrieve the key and file
information using the following command. Make sure to supply the same
`$private_key_path`, `$prefix` and `$out_file` as above:

```sh
dcrypt-decrypt.py -i -k $private_key_path -f ${prefix}${out_file} | gunzip
```

::: info
The piped `gunzip` will ensure the contents are decompressed after decryption.
:::

### Output Description

Run `dcrypt-decrypt.py --help` to read the tool's help text, which gives hints
about its supported flags and its output.

Supplying the private key file via the `-k`/`--key` flag will decrypt the
encrypted file contents.

::: info
Fields that contain binary data are represented in hexadecimal form. Other
fields are converted or displayed in human readable form.
:::

#### File information

The `-i`/`--info` flag outputs a list of fields of the supplied file:

`Version`
:   What version of the dovecot [[link,lib_dcrypt_key_formats,Key Formats]] has
    been used to encrypt this file.

`Flags`
:   What [[link,lib_dcrypt_flags,Flags]] have been used when encrypting the
    file.

`Header length`
:   Number of bytes in the header.

`Cipher algo`
:   Name and Object Identifier (OID) of the cipher used for encrypting the
    data. If the same cipher algorithm [[link,lib_dcrypt_flags,flag]] is set
    this algorithm is used to encrypt the encryption key material as well.
    By default the encryption key material is encrypted with `AES256-CTR`.

`Digest algo`
:   Name and OID of the digest algorithm used for the key and data.

Key(s) used for encrypting the file

`Key type`
:   Either `EC` for Elliptic-Curve or `RSA` for Rivest-Shamir-Adleman key
    type.

`Key digest`
:   Hash of public key id in Distinguished Encoding Rules (DER) format.

`Peer key`
:   Ephemeral key used to derive shared secret used for key material
    encryption.

`Encrypted`
:   The encrypted encryption key material.

`Kd hash`
:   The checksum of the key data.

#### Key information

The following information are only available if the `-k`/`--key` flag was
supplied with the matching key.

`Provided key`
:   Checksum of the key that was provided.

##### Key derivation data

`Key derivation`
:   General information about key derivation for the
    [Key Encapsulation Mechanism][kem] to decrypt the encryption key.

With its attributes:

`Rounds`
:   Number of iterations that the digestion algorithm is repeated.

`Secret`
:   Decrypted secret from the peer key.

`Salt`
:   Salt used for hashing. `Peer key` is used here.

##### Encryption and Decryption data

`Encryption key decryption`
:   General information regarding the payload decryption. This uses the
    decapsulated random data to derive the key for decrypting the payload.

`Decryption`
:   General information regarding the key used to encrypt the data.

Both sections contain:

`Key`
:   In the Encryption section: Ephemeral key material. In the Decryption
    section: Decryption key material.

`IV`
:   The initialization vector from derived or deciphered key material.

Decryption additionally contains:

`AAD`
:   Additional data used to authenticate the data.

`TAG`
:   Tag used to verify the message integrity.


[ECIES]: https://en.wikipedia.org/wiki/ECIES
[dovecot-tools]: https://github.com/dovecot/tools/
[dcrypt-decrypt]: https://github.com/dovecot/tools/blob/main/dcrypt-decrypt.py
[kem]: https://en.wikipedia.org/wiki/Key_encapsulation_mechanism
