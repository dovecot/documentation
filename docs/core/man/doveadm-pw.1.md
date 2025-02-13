---
layout: doc
title: doveadm-pw
dovecotComponent: core
---

# doveadm-pw(1) - Dovecot's password hash generator and validator

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **pw -l**

**doveadm** [*GLOBAL OPTIONS*] **pw**
  [**-p** *password*]
  [**-r** *rounds*]
  [**-s** *scheme*]
  [**-u** *user*]
  [**-V**]

**doveadm** [*GLOBAL OPTIONS*] **pw** **-t** *hash*
  [**-p** *password*]
  [**-u** *user*]

## DESCRIPTION

**doveadm pw** is used to generate password hashes for different
password *scheme* s and optionally verify the generated hash.

All generated password hashes have a {*scheme*} prefix, for example
{**SHA512-CRYPT.HEX**}. All passdbs have a default scheme for passwords
stored without the {*scheme*} prefix. The default scheme can be
overridden by storing the password with the scheme prefix.

If you want to use this feature to verify or generate passwords without
configuring Dovecot first, you can use `doveadm -O pw` to do so.

<!-- @include: include/global-options.inc -->

## OPTIONS

**-l**
:   List all supported password *scheme* s and exit successfully.

    There are up to three optional password *scheme*s: **BLF-CRYPT**
    (Blowfish crypt), **SHA256-CRYPT** and **SHA512-CRYPT**. Their
    availability depends on the system's currently used libc.

**-p** *password*
:   The plain text *password* for which the hash should be generated. If
    no *password* was given [[man,doveadm]] will prompt interactively
    for one. (Beware that using this option means the plain text password
    will be in your shell history!)

**-r** *rounds*
:   The password *scheme* s **BLF-CRYPT**, **SHA256-CRYPT** and
    **SHA512-CRYPT** supports a variable number of encryption *rounds*.
    The following table shows the minimum/maximum number of encryption
    *rounds* per scheme. When the **-r** option was omitted the default
    number of encryption rounds will be applied.

    | Scheme | Minimum | Maximum | Default |
    | ------ | ------- | ------- | ------- |
    | BLF-CRYPT | 4 | 31 | 5 |
    | SHA256-CRYPT | 1000 | 999999999 | 5000 |
    | SHA512-CRYPT | 1000 | 999999999 | 5000 |

**-s** *scheme*
:   The password *scheme* which should be used to generate the hashed
    password. By default the **CRYPT** *scheme* will be used (with the
    $2y$ bcrypt format). It is also possible to append an encoding
    suffix to the *scheme*. Supported encoding suffixes are: **.b64**,
    **.base64** and **.hex**.

    See also [[link,password_schemes]] for more details about password schemes.

**-t** *hash*
:   Test if the given password *hash* matches a given plain text
    password. You should enclose the password *hash* in single quotes, if
    it contains one or more dollar signs (**$**). The plain text password
    may be passed using the **-p** option. When no password was
    specified, [[man,doveadm]] will prompt interactively for one.

**-u** *user*
:   When the **DIGEST-MD5** *scheme* is used, the *user* name must also
    be given, because the user name is a part of the generated hash. For
    more information about Digest-MD5 please read also
    [[link,auth_digest_md5]]. For other schemes, this is not required.

**-V**
:   When this option is given, the hashed password will be internally
    verified. The result of the verification will be shown after the
    hashed password, enclosed in parenthesis.

## EXAMPLE

An ARGON2ID hash (best security at time of this writing, though can be
heavy on a busy server):

```sh
doveadm pw -s ARGON2ID
``ldas;l;als;las;lkas
```
Enter new password:
Retype new password:
{ARGON2ID}$argon2id$v=19$m=65536,t=3,p=1$AOrrkaFmGxCFtX+NCSHFkg$N3rlzYFqyNkCwrOingnDJ/qDQ09yGHgQa8PQfbu7rIE
```

Alternatively, a SHA512-CRYPT hash:

```sh
doveadm pw -s SHA512-CRYPT
```
```
Enter new password:
Retype new password:
{SHA512-CRYPT}$6$qAvxfQ2UbA1QTXSg$SB2aMEK76DBObt.KqTjF5.yDMceaD3dkG2UvrKQD0rZ9PKii/VAn.VS0nBsDqJX18kXieMi8AWJr0f7Ae9dAp/
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
