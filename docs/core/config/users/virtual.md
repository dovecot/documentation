---
layout: doc
title: Virtual
dovecotlinks:
  virtual_users: virtual users
  home_directories_for_virtual_users:
    hash: home-directories
    text: home directories for virtual users
  virtual_users_system_users:
    hash: virtual-and-system-users
    text: virtual and system users
---

# Virtual Users

There are many ways to configure Dovecot to use virtual users.

Users are often categorized as being either system users (in
`/etc/passwd`) or virtual users (not in `/etc/passwd`). However from
Dovecot's point of view there isn't much of a difference between them.
If a [[link,auth_passwd]] lookup and a [[link,auth_sql]] lookup return the
same [[link,userdb]] information, Dovecot's behavior is identical.

## Password and User Databases

Dovecot supports many different [[link,passdb]] and [[link,userdb]]
With virtual users the most commonly used ones are
[[link,auth_ldap]], [[link,auth_sql]], and [[link,auth_passwd_file]].

The databases usually contain the following information:

- Username
- Password
- UNIX User ID (UID) and primary UNIX Group ID (GID)
- Home directory and/or mail location

## Usernames and Domains

Dovecot doesn't care much about domains in usernames. IMAP and POP3
protocols currently have no concept of "domain", so the username is just
something that shows up in your logs and maybe in some configuration,
but they have no direct functionality.

So although Dovecot makes it easier to handle "user@domain" style
usernames (eg. `%n` and `%d` [[variable]]), nothing breaks if you use,
for example, `domain%user` style usernames instead.

However some [[link,authentication_mechanisms]] do have an explicit support
for realms (pretty much the same as domains). If those mechanisms are used,
the username is changed to be `user@realm`.

And of course there's no need to have domains at all in the usernames.

## Passwords

The password can be in [[link,password_schemes,any format that Dovecot
supports]] but you need to tell the format to Dovecot because it won't try
to guess it.

The SQL and LDAP configuration files have the `default_pass_scheme` setting
for this. If you have passwords in multiple formats, or the passdb doesn't
have such a setting, you'll need to prefix each password with
`{<scheme>}`, for example `{PLAIN}plaintext-password` or
`{PLAIN-MD5}1a1dc91c907325c69271ddf0c944bc72`.

## UNIX UIDs

The most important thing you need to understand is that **Dovecot
doesn't access the users' mails as the dovecot user**! So **do not** put
*dovecot* into the *mail* group, and don't make mails owned by the
*dovecot* user. That will only make your Dovecot installation less
secure.

So, if not the *dovecot* user, what then? You can decide that yourself.
You can create, for example, one *vmail* user which owns all the mails,
or you can assign a separate UID for each user. See [[link,system_users]]
for more information about different ways to allocate UIDs for users.

## UNIX GIDs

Unless you're using [[link,shared_mailboxes]] and multiple UIDs, it
doesn't really matter what GIDs you use. You can, for example, use a
single GID for all users, or create a separate GID for each user.

See [[link,system_users]] for more information.

## Home Directories

Home directory is a per-user directory where **Dovecot can save
user-specific files**.

- Dovecot's home directories have nothing to do with system users' home
  directories.

- It's irrelevant if it's under `/home/` or `/var/mail/` or
  wherever.

- If you have trouble understanding this, mentally replace all
  occurrences of "home directory" with "mail user's private state
  directory".

And in particular:

- Never configure your userdb to return the same home directory for
  multiple users, this will break things.

- Home directory must be an absolute path, don't even try to use
  relative paths, these do not work.

Some uses for home directory are:

- By default [[link,sieve]] scripts are in a user's home directory.

- The Duplicate mail check database is in a user's home directory.
  Suppression of duplicate rejects/vacations won't work if home
  directory isn't specified.

- Debugging: If an imap or pop3 process crashes, the core file is
  written to the user's home directory.

### Home vs. Mail Directory

Home directory shouldn't be the same as mail directory with mbox or
Maildir formats (but with dbox it's fine). It's possible to do
that, but you might run into trouble with it sooner or later. Some
problems with this are:

- Non-mailbox files may show up as mailboxes.

  - If you see this with Maildir, [[setting,maildir_stat_dirs,yes]]
    hides them.

- Or a user might not be able to create mailbox with some wanted name,
  because there already exists a conflicting file or directory.

  - e.g., with Maildir if you have `.dovecot.sieve` file, user can't
    create a mailbox called "dovecot.sieve" (i.e. "dovecot" mailbox
    that has a "sieve" child)

- And vice versa: If user creates "dovecot.sieve" mailbox, Dovecot will
  probably start logging all kinds of errors because the mailbox
  directory isn't a valid [[link,sieve]] script.

- If you ever intend to migrate to another mailbox format, it's much
  easier to do if you can have both old and new mail directories under
  the user's home directory.

### Ways to Setup Home Directory

The directory layouts for home and mail directories could look like one
of these (in the preferred order):

1. Mail directory under home, for example:

   - `home=/var/vmail/domain/user/`
   - `mail=/var/vmail/domain/user/mail/`

2. Completely distinct home and mail directories:

   - `home=/home/virtual/domain/user/`
   - `mail=/var/vmail/domain/user/`

3. Home directory under mail, for example:

   - Maildir:
     - `home=/var/vmail/domain/user/home/`
     - `mail=/var/vmail/domain/user/`

   - mbox: There's really no good and safe way to do it.

4. The home directory is the same as the mail directory.

If for example `home=/var/vmail/domain/user/` and
`mail=/var/vmail/domain/user/mail/`, set:

```[dovecot.conf]
mail_home = /var/vmail/%d/%n
mail_location = maildir:~/mail
```

### LDAP with Relative Directory Paths

If your LDAP database uses, e.g., `mailDirectory = domain/user/`, you
can use it as a base for home directory:

```
user_attrs = .., mailDirectory=home=/var/vmail/%$
```

Then just use [[setting,mail_location,maildir:~/Maildir]].

### Mail Location

If your users have varying locations for mail location, which cannot be
represented by templating, userdb can return the
[[link,userdb_extra_fields,mail field]] to override the default
[[setting,mail_location]] setting. Normally this is not
needed, and it is sufficient to have the setting in config file.

### Dynamic passwd-file Locations

In the following example users are expected to log in as `user@domain`.
Their mail is kept in their home directory at
`/home/<domain>/<username>/Maildir`.

The usernames in the passwd and shadow files are expected to contain
only the user part, no domain. This is because the path itself already
contained %d to specify the domain. If you want the files to contain
full `user@domain` names, you can change username_format to %u or
leave it out.

Note that the default [[setting,auth_username_format]] is `%Lu`.

```[dovecot.conf]
mail_location = maildir:/home/%d/%n/Maildir

passdb {
  driver = passwd-file
  args = username_format=%n /home/%d/etc/shadow
}

userdb {
  driver = passwd-file
  args = username_format=%n /home/%d/etc/passwd
}
```

#### Static userdb

Many people store only usernames and passwords in their database and
don't want to deal with UIDs or GIDs. In that case the easiest way to
get Dovecot running is to use the [[link,auth_staticdb,static userdb]].

```[dovecot.conf]
mail_location = maildir:~/Maildir

passdb {
  driver = pam
}

userdb {
  driver = static
  args = uid=vmail gid=vmail home=/var/mail/virtual/%d/%n
}
```

This makes Dovecot look up the mails from
`/var/mail/virtual/<domain>/<user>/Maildir/` directory, which should
be owned by vmail user and vmail group.

## Virtual and System Users

If you need to do PAM/passwd lookup for system users, and also have
domain users, you can configure authentication to drop the domain part
after doing virtual user lookup.

```[dovecot.conf]
## Your virtual passdb
passdb {
  driver = ldap
  args = /path/to/ldap/config
}

passdb {
  driver = static
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
```
