---
layout: doc
title: Password Schemes
dovecotlinks:
  password_schemes: password schemes
---

# Password Schemes

Password scheme means the format in which the password is stored in
[[link,passdb]].

The main reason for choosing a scheme other than `PLAIN` is to prevent
someone with access to the password database from stealing users'
passwords and using them to access other services.

::: warning [[deprecated,weak_password_schemes]]
Some password schemes are disabled by default due to being considered weak.
This includes MD based (except DIGEST-MD5 and CRAM-MD5), LANMAN, NTLM and
a few others.

Please read the documentation carefully.

You can enable these with [[setting,auth_allow_weak_schemes,yes]].
:::

## What Scheme to Use?

You should choose the strongest crypt scheme that's supported by your system.

A few articles about why choosing a good password scheme is important:

* [How To Safely Store A Password](https://codahale.com/how-to-safely-store-a-password/)
* [Speed Hashing](https://blog.codinghorror.com/speed-hashing/)

It's not possible to easily switch from one password scheme to another. The
only practical way to do this is to wait until user logs in and change the
password during the login.

::: info
Dovecot's schemes are implemented by the libc's `crypt()` function.
Using them is especially useful when sharing the same passwords with
other software, because most of them support using `crypt()` to
verify the password. However, not all libcs (especially older ones)
implement all of the schemes. See below for other password
schemes that are implemented by Dovecot internally (instead of libc).
:::

From strongest to weakest:

### ARGON2I/ARGON2ID

[[added,argon_2i_schemes]]

[Argon2](https://en.wikipedia.org/wiki/Argon2) is the winner of a password
hashing competition held at July 2015.

The password will start with `$argon2i$` or `$argon2id$.` You can use
`-r` to tune computational complexity, minimum is 3.

ARGON2ID is only available if your libsodium is recent enough.

ARGON2 can require quite a hefty amount of virtual memory, so we recommend
that you set service `auth { vsz_limit = 2G }` at least, or more.

### ARGON2

[[added,argon2_password_scheme_added]]

This scheme is also accepted and processed according to the actual
algorithm as described in the hash, e.g, `{ARGON2}$argon2id$...` is
recognized and processed properly as ARGON2I/ARGON2ID (as long as
libsodium is recent enough to support it).

### BLF-CRYPT

This is the Blowfish crypt (bcrypt) scheme. It is generally considered to
be very secure.

The encrypted password will start with `$2y$` (other generators can
generate passwords that have other letters after $2, those should work too.)

bcrypt is bundled with Dovecot, so it does not require an external library.

You can tune the computational cost using -r parameter for doveadm.

### SHA512-CRYPT

A strong scheme. The encrypted password will start with `$6$`.

### SHA256-CRYPT

A strong scheme. The encrypted password will start with `$5$`.

### MD5-CRYPT: A weak but common scheme often used in `/etc/shadow`. The
encrypted password will start with `$1$`.

## Generating Encrypted Passwords

You can generate passwords for a particular scheme easily with [[doveadm,pw]]
utility. If you do not have Dovecot configured, you can use `doveadm -O pw`
to avoid complaints about config file.

The scheme defaults to `CRYPT` (with the `$2y$` bcrypt format), but you can
use `-s` to override it: [[doveadm,pw,-s SHA512-CRYPT]].

To provide password, for scripting purposes, you can use either
[[doveadm,pw,-p password]] or:

```sh
printf 'password\npassword\n' | doveadm pw
```

## Default password Schemes

Password databases have a default password scheme:

| Database | Default |
| -------- | ------- |
| [[link,auth_sql]] | See `default_pass_scheme` setting in `dovecot-sql.conf.ext`. |
| [[link,auth_ldap]] | See `default_pass_scheme` setting in `dovecot-ldap.conf.ext`. |
| [[link,auth_passwd_file]] | `CRYPT` is used by default, but can be changed
with `scheme` parameter in passdb args. |
| [[link,auth_passwd]] | `CRYPT` is used by default and can't be changed currently. |
| [[link,auth_pam]]<br/>[[link,auth_bsd]] | Dovecot never even sees the password with these databases, so Dovecot has nothing to do with what password scheme is used. |

The password scheme can be overridden for each password by prefixing it with
`{SCHEME}`, for example: `{PLAIN}pass`.

## Non-cleartext Authentication Mechanisms

See [[link,authentication_mechanisms]] for an explanation of auth mechanisms.

Most installations use only cleartext mechanisms, so you can skip this section
unless you know you want to use them.

The problem with non-cleartext auth mechanisms is that the password must be
stored either in cleartext, or using a mechanism-specific scheme that's
incompatible with all other non-cleartext mechanisms. In addition, the
mechanism-specific schemes often offer very little protection. This isn't a
limitation of Dovecot, it's a requirement for the algorithms to even work.

For example if you're going to use CRAM-MD5 authentication, the password needs
to be stored in either PLAIN or CRAM-MD5 scheme. If you want to allow both
CRAM-MD5 and DIGEST-MD5, the password must be stored in cleartext.

In future it's possible that Dovecot could support multiple passwords in
different schemes for a single user.

| Mechanism | Comment |
| --------- | ------- |
| CRAM-MD5 | Used with CRAM-MD5 mechanism. |
| [[link,auth_digest_md5]] | Used with DIGEST-MD5 mechanism. The username is included in the hash, so it's not possible to use the hash for different usernames. |
| SCRAM-SHA-1 | Used with SCRAM-SHA-1 mechanism.<br />[[added,auth_mechanism_scram_sha_added]] |
| SCRAM-SHA-256 | Stronger replacement for SCRAM-SHA-1.<br />[[added,auth_mechanism_scram_sha_added]] |

## Other Supported Password Schemes

Strong schemes and mechanism-specific schemes are listed above.

For some schemes (e.g. PLAIN-MD5, SHA) Dovecot is able to detect if the
password hash is base64 or hex encoded, so both can be used.

### PLAIN

Password is in cleartext.

### CRYPT

Traditional DES-crypted password in `/etc/passwd` (e.g.
"pass" = `vpvKh.SaNbR6s`.

* Dovecot uses libc's `crypt()` function, which means that CRYPT is usually
  able to recognize MD5-CRYPT and possibly also other password schemes. See
  all of the `*-CRYPT` schemes at the top of this page.

* The traditional DES-crypt scheme only uses the first 8 characters of the
  password, the rest are ignored. Other schemes may have other password length
  limitations (if they limit the password length at all).

#### BLF-CRYPT

Bcrypt based hash. (`$2y$`)

#### DES-CRYPT

Traditional DES based hash.

::: warning [[changed,crypt_des_md5_schemes]]
Disabled by default.
:::

#### MD5-CRYPT

MD5-based hash (`$1$`)

::: warning [[changed,crypt_des_md5_schemes]]
Disabled by default.
:::

#### SHA256-CRYPT

SHA-256 based hash (`$5$`)

#### SHA512-CRYPT

SHA-512 based hash (`$6$`)

#### OTP

[[rfc,2289]] based One-Time Password system.

### MD5 Based Schemes

::: warning [[changed,crypt_des_md5_schemes]]
Disabled by default.

#### PLAIN-MD4

MD4 sum of the password stored in hex.

#### MD5

Alias for MD5-CRYPT.

#### PLAIN-MD5

MD5 sum of the password stored in hex.

#### LDAP-MD5

MD5 sum of the password stored in base64.

#### SMD5

Salted MD5 sum of the password stored in base64.

#### HMAC-MD5

Alias CRAM-MD5.

### SHA Based Schemes

::: info
See below for libc's SHA\* support.
:::

#### SHA

Alias for SHA1.

#### SHA1

SHA1 sum of the password stored in base64.

#### SSHA

Salted SHA1 sum of the password stored in base64.

#### SHA256

SHA256 sum of the password stored in base64.

#### SSHA256

Salted SHA256 sum of the password stored in base64.

#### SHA512

SHA512 sum of the password stored in base64.

#### SSHA512
Salted SHA512 sum of the password stored in base64.

### Other Schemes

#### ARGON2I

ARGON2i password scheme, needs libsodium.

#### ARGON2ID

ARGON2id password scheme, needs libsodium.

#### PBKDF2

[[added,pbkdf2_hashing]]

PKCS5 Password hashing algorithm.

Note that there is no standard encoding for this format, so this scheme
may not be interoperable with other software.

Dovecot implements it as `$1$salt$rounds$hash`.

#### ARGON2

ARGON2 password scheme, needs libsodium

## Encoding

The base64 vs. hex encoding simply the default encoding that is used.

You can override it for any scheme by adding a ".hex", ".b64" or ".base64"
suffix. For example:

* `{SSHA.b64}986H5cS9JcDYQeJd6wKaITMho4M9CrXM` contains the password encoded
  to base64 (just like {SSHA})
* `{SSHA.HEX}3f5ca6203f8cdaa44d9160575c1ee1d77abcf59ca5f852d1` contains the
  password encoded to hex

This can be especially useful with cleartext passwords to encode characters
that would otherwise be illegal. For example, in [[link,auth_passwd_file]] you
couldn't use a ":" character in the password without encoding it to base64
or hex. For example: `{PLAIN}{\}:!"` is the same as `{PLAIN.b64}e1x9OiEiCg==`.

You can also specify the encoding with doveadm pw. For example:
[[doveadm,pw,-s plain.b64]].

## Salting

For the SHA512-CRYPT, SHA256-CRYPT, and MD5-CRYPT schemes, the salt is stored
before the hash, e.g.: `$6$salt$hash`. For the BLF-CRYPT scheme, bcrypt stores
the salt as part of the hash.

For most of the other salted password schemes (SMD5, SSHA*) the salt is stored
after the password hash and its length can vary. When hashing the password,
append the salt after the cleartext password, e.g.: SSHA256(pass, salt) =
SHA256(pass + salt) + salt.

For example with SSHA256 you know that the hash itself is 32 bytes (256 bits/8
bits per byte). Everything after that 32 bytes is the salt. For example if you
have a password:

```
{SSHA256}SoR/78T5q0UPFng8UCXWQxOUKhzrJZlwfNtllAupAeUT+kQv
```

After base64 decoding it you'll see that its length is 36 bytes, so the first
32 bytes are the hash and the following 4 bytes are the salt:

* length: `echo SoR/78T5q0UPFng8UCXWQxOUKhzrJZlwfNtllAupAeUT+kQv|base64 -d|wc
  -c`-> 36
* hash: `echo SoR/78T5q0UPFng8UCXWQxOUKhzrJZlwfNtllAupAeUT+kQv|base64 -d|dd
  bs=1 count=32|hexdump -C`-> 4a 84 7f ef c4 f9 ab 45 0f 16 78 3c 50 25 d6 43
  13 94 2a 1c eb 25 99 70 7c db 65 94 0b a9 01 e5
* salt: `echo SoR/78T5q0UPFng8UCXWQxOUKhzrJZlwfNtllAupAeUT+kQv|base64 -d|dd
  bs=1 skip=32|hexdump -C`-> 13 fa 44 2f

### Common Hash Sizes

* MD5: 16 bytes
* SHA: 20 bytes
* SHA256: 32 bytes
* SHA512: 64 bytes
