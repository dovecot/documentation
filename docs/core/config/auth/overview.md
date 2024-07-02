---
layout: doc
title: Authentication
dovecotlinks:
  authentication: authentication
  authentication_debug:
    hash: debugging
    text: debugging authentication
---

# Authentication

Dovecot authentication is split into four parts:

1. [[link,authentication_mechanisms,Authentication Mechanisms]]

2. [[link,password_schemes,Password Schemes]]

3. [[link,passdb,Password Databases (passdb)]]

   * [[link,passdb_extra_fields,passdb Extra Fields]]

4. [[link,userdb,User Databases (userdb)]]

   * [[link,userdb,User Databases (userdb)]]

For authentication policy topics, see also:

* [[link,auth_penalty]]
* [[link,auth_policy]]

## Cleartext Mechanisms

A cleartext mechanism is an authentication mechanism that contains users'
passwords or credentials in non-encrypted and non-hashed format.

For example, PLAIN, LOGIN or XOAUTH2 mechanisms contain credentials which an
attacker can use to authenticate if they are captured.

To protect against this, connection encryption with TLS (or some other
mechanism) is required by default.

See [[setting,auth_allow_cleartext]] for removing this requirement.

## Authentication Mechanisms vs. Password Schemes

Authentication mechanisms and password schemes are often confused,
because they have somewhat similar values. For example there is a PLAIN
auth mechanism and PLAIN password scheme. But they mean completely
different things.

- **Authentication mechanism is a client/server protocol**. It's about
  how the client and server talk to each others in order to perform the
  authentication. Most people use only PLAIN authentication, which
  basically means that the user and password are sent without any kind
  of encryption to the server. SSL/TLS can then be used to provide the
  encryption to make PLAIN authentication secure.

  **Password scheme is about how the password is hashed in your
  password database**. If you use a PLAIN scheme, your passwords are
  stored in cleartext without any hashing in the password database. A
  popular password scheme MD5-CRYPT (also commonly used in
  `/etc/shadow`) where passwords looks like
  `$1$oDMXOrCA$plmv4yuMdGhL9xekM.q.I/`.

- Cleartext authentication mechanisms work with ALL password schemes.

- Non-cleartext authentication mechanisms require either PLAIN password
  scheme or a mechanism-specific password scheme.

## Debugging

Set [[setting,log_debug,category=auth]] which makes Dovecot log a debug
line for just about anything related to authentication.

If you're having problems with passwords, you can also set
[[setting,auth_debug_passwords,yes]] which will log them in cleartext.

After that you'll see in the logs exactly what
dovecot-auth is doing, and that should help you to fix the problem.

For easily testing authentication, use
[[doveadm,auth test,user@domain password]].

For looking up userdb information for a user, use [[doveadm,user,user@domain]].

For simulating a full login with both passdb and userdb lookup, use
[[doveadm,auth login,user@domain password]].

### PLAIN SASL Mechanism

With IMAP and POP3, it's easy to log in manually using the IMAP's LOGIN
command or POP3's USER and PASS commands (see [[link,testing]] for details),
but with SMTP AUTH you'll need to use PLAIN authentication mechanism, which
requires you to build a base64-encoded string in the correct format.

The PLAIN authentication is also used internally by both IMAP and POP3 to
authenticate to dovecot-auth, so you see it in the debug logs.

The PLAIN mechanism's authentication format is:
`<authorization ID> NUL <authentication ID> NUL <password>`.

Authorization ID is the username who you want to log in as, and
authentication ID is the username whose password you're giving.

If you're not planning on doing a [[link,auth_master_users,master user login]],
you can either set both of these fields to the same username, or leave the
authorization ID empty.

#### Encoding with mmencode

printf(1) and mmencode(1) should be available on most Unix or GNU/Linux
systems. (If not, check with your distribution. GNU coreutils includes
printf(1), and metamail includes mmencode(1). In Debian, mmencode is called
mimencode(1).)

```console
$ printf 'username\0username\0password' | mmencode
dXNlcm5hbWUAdXNlcm5hbWUAcGFzc3dvcmQ=
```

This string is what a client would use to attempt PLAIN authentication as
user `username` with password `password`. With
[[setting,auth_debug_passwords,yes]], it would appear in your logs.

#### Decoding with mmencode

You can use `mmencode -u` to interpret the encoded string pasted into stdin:

```console
# mmencode -u
bXl1c2VybmFtZUBkb21haW4udGxkAG15dXNlcm5hbWVAZG9tYWluLnRsZABteXBhc3N3b3Jk<CR>
myusername@domain.tldmyusername@domain.tldmypassword<CTRL-D>
#
```

You should see the correct user address (twice) and password. The null
bytes won't display.

#### Encoding with Perl

Unfortunately, mmencode on FreeBSD chokes on `\0`.

As an alternate, if you have MIME::Base64 on your system, you can use a
perl statement to do the same thing:

```console
$ perl -MMIME::Base64 -e 'print encode_base64("myusername\@domain.tld\0myusername\@domain.tld\0mypassword");'
```

As `mmencode -u` doesn't encounter any `\0` you can still do:

```console
$ perl -MMIME::Base64 -e 'print encode_base64("myusername\@domain.tld\0myusername\@domain.tld\0mypassword");' | mmencode -u
```

to check that you have encoded correctly.

#### Encoding with Python

With python you can do:

```console
$ python -c "import base64; print(base64.encodestring('myusername@domain.tld\0myusername@domain.tld\0mypassword'));"
```
