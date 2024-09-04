---
layout: doc
title: Submission
---

# Configuring Sieve & Submission

## `postmaster_address`

`postmaster_address = postmaster@%d`

Email address to use in the From: field for outgoing email rejections.

The `%d` variable expands to the recipient domain.

### Domain (`%d`) is Empty

IMAP or POP3 protocol doesn't have explicit support for domains. The
usernames are commonly in `user@domain` format, and that is also where
Dovecot gets the domain from. If the username doesn't have `@domain`, then
the domain is also usually empty (unless [[setting,auth_default_domain]]
is used).

If you login as `user@domain`, but the %d is still empty, the problem is
that your configuration lost the domain part by changing the username.
Dovecot doesn't keep track of the domain separately from username, so if
something changes username from `user@domain` to just plain `user`, the
domain is lost and %d returns nothing. If you have [[setting,auth_debug,yes]],
this shows up in logs like:
`Info: auth(user@domain.org): username changed user@domain.org -> user`.

Below are some of the most common reasons for this.

#### Settings

[[setting,auth_username_format,%Ln]] lowercases the username but also drops
the domain. Use [[setting,auth_username_format,%Lu]] instead.

[[setting,auth_username_format]] changes the username permanently, some
user databases support using [[variable]] or `username_format` (see
[[link,auth_passwd_file]]). See also [[link,virtual_users_system_users]].

#### SQL

`password_query` gets often misconfigured to drop the domain if
username and domain are stored separately. For example:

```
# BROKEN:
password_query = SELECT username AS user, password FROM users \
    WHERE username = '%n' AND domain = '%d'
```

The "username AS user" changes the username permanently and the domain
is dropped. You can instead use:

```
# MySQL:
password_query = SELECT concat(username, '@', domain) AS user, \
    password FROM users WHERE username = '%n' AND domain = '%d'
```

Or you can return username and domain fields separately and Dovecot will
merge them into a single user field:

```
password_query = SELECT username, domain, password FROM users \
    WHERE username = '%n' AND domain = '%d'
```

      args = user=%Ld noauthenticate
      skip = authenticated
   }

   passdb {
      driver = pam
      skip = authenticated
   }

   userdb {
      driver = ldap
      args = /path/to/ldap/config
   }

   userdb {
      driver = passwd
   }

## `submission_host`

`submission_host = smtp-out.example.com:25`

SMTP server which is used for sending email rejects, Sieve forwards,
vacations, etc.

Alternatively, `sendmail_path` setting can be used to send mails using the
sendmail binary.
