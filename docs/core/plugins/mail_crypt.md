---
layout: doc
title: mail-crypt
dovecotlinks:
  fs_crypt:
    hash: fs-crypt-and-fs-mail-crypt
    text: fs-crypt
  supported_sym_algorithms:
    hash: supported-symmetric-algorithms
    text: Supported symmetric algorithms
---

# Mail Crypt (mail-crypt) Plugin

The mail crypt plugin is used to secure email messages stored in a Dovecot
system. Messages are encrypted before written to storage and decrypted after
reading. Both operations are transparent to the user.

In case of unauthorized access to the storage backend, the messages will,
without access to the decryption keys, be unreadable to the offending party.

There can be a single encryption key for the whole system or each user can have
a key of their own. The used cryptographical methods are widely used standards
and keys are stored in portable formats, when possible.

## Functional Overview

The use of mail crypt plugin depends on a user having a keypair, a private and
a public key, for asymmetric cryptography. These keys are provisioned in a
variable via the user database or directly from Dovecot configuration files.

The public half of the provisioned keypairs are used to generate and encrypt
keys for symmetric encryption. The symmetric keys are used to encrypt and
decrypt individual files. Symmetric encryption is faster and more suitable for
block mode storage encryption. The symmetric key used to encrypt a file is
stored, after being encrypted with the public asymmetric key, together with the
file.

## Encryption Technologies

The mail crypt plugin provides encryption at rest for emails.

Encryption of the messages is performed using the symmetric Advanced
Encryption Standard (AES) algorithm in Galois/Counter Mode (GCM) with 256 bit
keys. Integrity of the data is ensured using Authenticated Encryption with
Associated Data (AEAD) with SHA256 hashing.

The encryption keys for the symmetric encryption are randomly
generated. These keys in turn are encrypted using a key derived with from the
provisioned private key.

Provisioned private keys can be Elliptic Curve (EC) keys or RSA Encryption
is done using the Integrated Encryption Scheme (IES). This algorithm is
usable both with EC and RSA keys.

## Technical Requirements

Using per-folder keys is not considered production quality, but global keys
are fine.

::: warning Note
Improper configuration or use can make your emails unrecoverable! Treat
encryption with care and backup encryption keys!
:::

This page assumes you are using configuring mail encryption from scratch with
a recent version of Dovecot.  If you are upgrading from an older version,
see [[setting,mail_crypt_save_version]] for possible backwards
compatibility issues.

## Settings

<SettingsComponent plugin="mail-crypt" />

### Supported symmetric algorithms

While mail crypt plugin does not support setting encryption algorithm,
it is possible to specify one with FS crypt.

Dovecot supports all algorithms in OpenSSL that have an OID assigned,
and additionally few more (with official OIDs).

In particular, XTS, CCM and CTR modes are not supported, due to the way
they would need to be handled. Some operating systems limit the available
algorithms with policies.

It is recommended to use AES-GCM or ChaCha20-Poly1305 algorithm, with SHA256 or greater.

Algorithm setting format is &lt;algorithm name&gt;&dash;&lt;mode&gt;&dash;&lt;hash algorithm;&gt;.
E.g. `aes-256-gcm-sha256` or `chacha20-poly1305-sha256`.

Note that hash algorithm is used for various hashing purposes, not just data integrity, so it
is always required.

Files encrypted with one algorithm can be decrypted even if the configuration specifies different algorithm,
as the parameters are stored in the file.

List of known algorithms that Dovecot supports as of writing.

| Encryption algorithm | Supported size | Supported modes |
| -------------------- | -------------- | --------------- |
| [chacha20](https://en.wikipedia.org/wiki/ChaCha20) | - | [poly1305](https://en.wikipedia.org/wiki/ChaCha20-Poly1305)<sup>1,3</sup> |
| [aes](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) | 128, 192, 256 | [gcm](https://en.wikipedia.org/wiki/Galois/Counter_Mode)<sup>1</sup>, [cbc](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#CBC)<sup>2</sup> |
| [camellia](https://en.wikipedia.org/wiki/Camellia_&#40;cipher&#41;) | 128, 192, 256 | [cbc](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#CBC)<sup>2</sup> |
| [aria](https://en.wikipedia.org/wiki/ARIA_&#40;cipher&#41;) | 128, 192, 256 | [cbc](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#CBC)<sup>2</sup> |
| [seed](https://en.wikipedia.org/wiki/SEED) | - | [cbc](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#CBC)<sup>2</sup> |
| [sm4](https://en.wikipedia.org/wiki/SM4_&#40;cipher&#41;) | - | [cbc](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#CBC)<sup>2</sup> |
| [des-ede3](https://en.wikipedia.org/wiki/Triple_DES) | - | [cbc](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#CBC)<sup>2</sup> |

<sup>1</sup> Uses [AEAD](https://en.wikipedia.org/wiki/AEAD) integrity.

<sup>2</sup> Uses [HMAC](https://en.wikipedia.org/wiki/HMAC) integrity.

<sup>3</sup> Requires recent enough OpenSSL.

### Dynamic Settings

Plugin settings may be dynamically set via [[link,userdb_extra_fields]].
To provide [[setting,mail_crypt_global_private_key]] and
[[setting,mail_crypt_global_public_key]] as userdb attributes, you
can base64 encode the original contents, such as PEM file. For example,

```console
$ cat ecprivkey.pem | base64 -w0
```

All external keys must be in PEM format, using pkey format.

## Modes Of Operation

Mail crypt plugin can operate using **either** global keys or folder keys.
Using both is not supported. To perform any encryption,
[[setting,mail_crypt_save_version]] must be specified and non-zero.

### Folder Keys

In this mode, the user is generated a key pair, and each folder is generated a
key pair, which is encrypted using the user's key pair. A user can have more
than one key pair but only one can be active.

* [[setting,mail_crypt_save_version]] must be `2`.

* [[setting,mail_crypt_curve]] must be set.

* [[setting,mail_attribute_dict]] must be set, as is is used to store the keys.

#### Unencrypted User Keys

In this version of the folder keys mode, the users' private key is stored
unencrypted on the server.

Example config for folder keys with Maildir:

```
mail_attribute_dict = file:%h/Maildir/dovecot-attributes
mail_plugins = $mail_plugins mail_crypt

plugin {
  mail_crypt_curve = secp521r1
  mail_crypt_save_version = 2
}
```

#### Encrypted User Keys

In this version of the folder keys mode, the users private key is stored
encrypted on the server.

Example config for mandatory encrypted folder keys with Maildir:

```
mail_attribute_dict = file:%h/Maildir/dovecot-attributes
mail_plugins = $mail_plugins mail_crypt

plugin {
  mail_crypt_curve = secp521r1
  mail_crypt_save_version = 2
  mail_crypt_require_encrypted_user_key = yes
}
```

The password that is used to decrypt the users master/private key, must be
provided via password query:

```
# File: /etc/dovecot/dovecot-sql.conf.ext
password_query = SELECT \
    email as user, password, \
    '%w' AS userdb_mail_crypt_private_password \
    FROM virtual_users  WHERE email='%u';
```

#### Choosing Encryption Key

DO NOT use password directly. It can contain `%` which is interpreted as
variable expansion and can cause errors. Also, it might be visible in
debug logging. Suggested approaches are base64 encoding, hex encoding
or hashing the password. With hashing, you get the extra benefit that
password won't be directly visible in logs.

Another issue that you must consider when using user's password is that
when the password changes, **you must re-encrypt the user private key**.

### Global keys

In this mode, all keying material is taken from plugin environment. You can use
either Elliptic Curve (EC) keys (recommended) or RSA keys. No key generation
is automatically performed.

A good solution for environments where no user folder sharing is needed is to
generate per-user EC key pair and encrypt that with something derived from
user's password. The benefit is that it can be easier to do key management
when you can do the EC re-encryption steps in case of password change in your
user database instead of dovecot's database.

You should not configure [[setting,mail_crypt_curve]] when using global keys.

#### Elliptic Curve (EC) Key

In order to generate an EC key, you must first choose a curve from the output
of this command:

```console
$ openssl ecparam -list_curves
```

If you choose the curve `prime256v1`, generate an EC key with the command:

```console
$ openssl ecparam -name prime256v1 -genkey | openssl pkey -out ecprivkey.pem
```

Then generate a public key out of your private EC key

```console
$ openssl pkey -in ecprivkey.pem -pubout -out ecpubkey.pem
```

These keys can now be used with this configuration:

```[dovecot.conf]
mail_plugins = $mail_plugins mail_crypt

plugin {
  mail_crypt_global_private_key = <ecprivkey.pem
  mail_crypt_global_public_key = <ecpubkey.pem
  mail_crypt_save_version = 2
}
```

##### Converting EC key to PKEY

If you have an EC private key which begins with something like:

```
-----BEGIN EC PRIVATE KEY-----
```

With possibly parameters like this before that:

```
-----BEGIN EC PARAMETERS-----
BgUrgQQACg==
-----END EC PARAMETERS-----
```

You must convert it to pkey format with:

```console
$ openssl pkey -in oldkey.pem -out newkey.pem
```

Then `newkey.pem` can be used with mail-crypt plugin.

#### Using Edwards curve DSA (EdDSA)

[[added,mail_crypt_eddsa]]

You can use EdSDA keys by using algorithm `X25519` or `X448` (case sensitive).

To generate a suitable keypair, use

```console
$ openssl genpkey -algorithm X448 -out edprivkey.pem
$ openssl pkey -in private.pem -pubout -out edpubkey.pem
```

Note that ED25519 keys are not suitable for X25519.

#### RSA key

::: warning
Use of RSA keys is discouraged, please use [[setting,mail_crypt_curve]]
instead.
:::

You can generate an unencrypted RSA private key in the pkey format with the
command:

```console
$ openssl genpkey -algorithm RSA -out rsaprivkey.pem
```

Alternatively, you can generate a password encrypted private key with:

```console
$ openssl genpkey -algorithm RSA -out rsaprivkey.pem -aes-128-cbc -pass pass:qwerty
```

This does make the password show up in the process listing, so it can be
visible for everyone on the system.

Regardless of whether you generated an unencrypted or password encrypted
private key, you can generate a public key out of it with:

```console
$ openssl pkey -in rsaprivkey.pem -pubout -out rsapubkey.pem
```

These keys can then be used with this configuration:

```[dovecot.conf]
mail_plugins = $mail_plugins mail_crypt

plugin {
  mail_crypt_global_private_key = <rsaprivkey.pem
  mail_crypt_global_private_password = qwerty
  mail_crypt_global_public_key = <rsapubkey.pem
  mail_crypt_save_version = 2
}
```

## Base64-encoded Keys

Mail-crypt plugin can read keys that are base64 encoded. This is intended
mostly for providing PEM keys via userdb.

Hence, this is possible:

::: code-group

```console[Key Generation]
$ openssl ecparam -name secp256k1 -genkey | openssl pkey | base64 -w0 > ecprivkey.pem
$ base64 -d ecprivkey.pem | openssl ec -pubout | base64 -w0 > ecpubkey.pem
```

```[dovecot.conf]
passdb {
  driver = static
  args = password=pass mail_crypt_global_public_key=<content of ecpubkey.pem> mail_crypt_global_private_key=<content of ecprivkey.pem>
}

mail_plugins = $mail_plugins mail_crypt

plugin {
  mail_crypt_save_version = 2
}
```

:::

## Read-only Mode (`mail_crypt_save_version = 0`)

If you have encrypted mailboxes that you need to read, but no longer want to
encrypt new mail, use [[setting,mail_crypt_save_version,0]]:

```[dovecot.conf]
plugin {
  mail_crypt_save_version = 0
  mail_crypt_global_private_key = <server.key
}
```

## mail-crypt-plugin and ACLs

If you are using global keys, mails can be shared within the key scope. The
global key can be provided with several different scopes:

* Global scope: key is configured in `dovecot.conf` file
* Per-user(group) scope: key is configured in userdb file

With folder keys, key sharing can be done to single user, or to multiple users.
When a key is shared to a single user, and the user has a public key available, the folder key is encrypted using recipient's public key. This requires the
`mail_crypt_acl` plugin, which will enable accessing the encrypted shared
folders.

If you have [[setting,mail_crypt_acl_require_secure_key_sharing]]
enabled, you can't share the key to groups or someone with no public key.

## Decrypting Files Encrypted with mail-crypt Plugin

You can use [`decrypt.rb`](https://github.com/dovecot/tools/blob/main/dcrypt-decrypt.rb)
to decrypt encrypted files.

## fs-crypt and fs-mail-crypt

fs-crypt is a lib-fs wrapper that can encrypt and decrypt files. It works
similarly to the fs-compress wrapper. It can be used to encrypt, e.g.:

* External mail attachments (mail_attachment_fs)

fs-crypt comes in two flavors, `mail-crypt` and `crypt`. (The differences
between the two are technical and related to internal code contexts.)

Note that fs-[mail-]crypt and the fs-compress wrapper can be also combined.
Please make sure that compression is always applied before encryption. See
[[plugin,fs-compress]] for an example and more details about compression.

Currently the fs-crypt plugin requires that all the files it reads are
encrypted. If it sees an unencrypted file it'll fail to read it. The plan is
to fix this later.

::: warning
[[changed,fs_crypt_require_encryption_keys]] fs-crypt requires encryption keys
by default.
:::

FS driver syntax:

::: tip Note
All parameters to mail-crypt are optional.
:::

```
crypt:[maybe:][algo=<s>:][set_prefix=<n>:][private_key_path=/path:][public_key_path=/path:][password=password:]<parent fs>
```

Parameters:

| Key | Value |
| --- | ----- |
| `maybe` | Allow missing encryption keys. [[added,mail_crypt_fs_maybe]] |
| `algo` | Encryption algorithm. Default is `aes-256-gcm-sha256`. |
| `password` | Password for decrypting public key. |
| `private_key_path` | Path to private key. |
| `public_key_path` | Path to public key. |
| `set_prefix` | Read `<set_prefix>_public_key` and `<set_prefix>_private_key`. Default is `mail_crypt_global`.

Example:

```[dovecot.conf]
plugin {
  fts_index_fs = crypt:set_prefix=fscrypt_index:posix:prefix=/tmp/fts
  fscrypt_index_public_key = <server.pub
  fscrypt_index_private_key = <server.key
}
```

To encrypt/decrypt files manually, you can use:

```console
$ doveadm fs get/put crypt private_key_path=foo:public_key_path=foo2:posix:prefix=/path/to/files/root path/to/file
```

## Doveadm Commands

::: tip
For doveadm commands that are working with password protected keys, the global
`-o` option should be used to provide the password.  Example:

```console
$ doveadm -o plugin/mail_crypt_private_password=some_password <...doveadm command...>
```
:::

<DoveadmComponent plugin="mail-crypt" />
