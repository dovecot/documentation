---
layout: doc
title: Simple Virtual User Installation
dovecotlinks:
  howto_virtual_smtp_auth:
    hash: smtp-auth
    text: SASL auth for external SMTP servers
---

# Simple Virtual User Installation

- Virtual users configured in [[link,auth_passwd]].

- Assuming an unmodified Dovecot v2.x installation.

- Assuming you're not using NFS. See [[link,nfs]] for problems related to it.

## System Configuration

- Create `dovecot` and `dovenull` users and groups if they don't exist yet.
  These are unprivileged users for Dovecot's internal use. They don't need
  a home directory or a shell.

- Create `vmail` user and `vmail` group. This is the user/group that's used
  to access the mails.

- Create `/home/vmail` directory owned by `vmail:vmail`. The mails for
  all users are stored under this directory.

- Create `/var/log/dovecot.log` and `/var/log/dovecot-info.log` files owned
  by `vmail:vmail`, so that [[link,lda]] can write to them.

## `dovecot.conf`

Below is a fully working `dovecot.conf` file. You can use it directly,
but it might be better to instead use as a guide to alter your current
configuration.

If you want to configure SSL, see [[link,ssl]].

```[dovecot.conf]
protocols = imap pop3

# It's nice to have separate log files for Dovecot. You could do this
# by changing syslog configuration also, but this is easier.
log_path = /var/log/dovecot.log
info_log_path = /var/log/dovecot-info.log

# Disable SSL for now.
ssl = no
auth_allow_cleartext = yes

# We're using Maildir format
mail_driver = maildir
mail_path = ~/Maildir

# If you're using POP3, you'll need this:
pop3_uidl_format = %g

# Authentication configuration:
auth_verbose = yes
auth_mechanisms = plain

passdb db1 {
  driver = passwd-file
  passwd_file_path = /etc/dovecot/passwd
}

userdb db1 {
  driver = static
  args = uid=vmail gid=vmail home=/home/vmail/%u
}
```

## `/etc/dovecot/passwd`

See [[link,auth_passwd_file]] for the full file format.

Here we're interested only having usernames and passwords in it:

```
test:{PLAIN}pass::::::
bill:{PLAIN}secret::::::
timo@example.com:{PLAIN}hello123::::::
dave@example.com:{PLAIN}world234::::::
joe@elsewhere.org:{PLAIN}whee::::::
jane@elsewhere.org:{PLAIN}mypass::::::
```

As you can see, you can use multiple domains in the file, or no domains at
all. Dovecot doesn't care about domains.

The extra colons are needed for [[link,auth_passwd_file]] format, and can be
omitted if you are using the static user database in the example above.

Users can be added by editing this file. Dovecot automatically notices the
new users immediately after they're added. It also creates their home
directories when the user logs in.

### Passwords

The passwords in the example passwd file are listed using cleartext scheme.

It's possible to use other [[link,password_schemes]] as well. For example,
sha256-crypt would be a pretty strong scheme.

You can create them using [[doveadm,pw]] utility, for example:

```sh
doveadm pw -s sha256-crypt
```
```
Enter new password: foo
Retype new password: foo
{SHA256-CRYPT}$5$88T/Emz.AbSmbz5C$D3GLxhvDffdN1ldpKkulh2fHyUNzvojIjiVbTovPdyC
```

Note that you won't get the same output after `{SSHA256}` as above, because
Dovecot uses random salts when creating the SSHA256 hash. This means that
even if multiple users have the same password, you won't know that because
their hashes are different.

The passwd file entry would be:

```
{SHA256-CRYPT}$5$88T/Emz.AbSmbz5C$D3GLxhvDffdN1ldpKkulh2fHyUNzvojIjiVbTovPdyC
```

Joe would now have "foo" as his password.

## SMTP Server Configuration

### Delivering Mails

You can configure the SMTP server to deliver mails internally, or you can use
[[link,lda]]. Using dovecot-lda gives you better performance because it updates
Dovecot's index files while saving the mails.

See [[link,lda]] for configuration information.

Alternatively, you can also use [[link,lmtp]].

In config you should have:

```[dovecot.conf]
protocol lda {
  postmaster_address = postmaster@example.com
}
```

### SMTP AUTH

If you're using one of these MTAs, you can use Dovecot [[link,sasl]] to
authenticate SMTP.

- [[link,howto_postfix_and_dovecot_sasl,howto_postfix_and_dovecot_sasl]]
- [[link,howto_exim_and_dovecot_sasl,Exim (v4.64+) configuration]]
- [[link,howto_chasquid_and_dovecot_sasl,chasquid (v0.04+) configuration]]

## Quota

If you need to have [[plugin,quota,quota]], add this to `dovecot.conf`:

```[dovecot.conf]
mail_plugins {
  quota = yes
}

protocol imap {
  mail_plugins {
    imap_quota = yes
  }
}

plugin {
  quota = maildir
}
```

Then configure quota by adding `userdb_quota_rule`
[[link,userdb_extra_fields]] `/etc/dovecot/passwd`, for example:

```
joe:{PLAIN}pass::::::userdb_quota_rule=*:storage=100M
jane:{PLAIN}pass::::::userdb_quota_rule=*:storage=200M
```

Joe has now 100MB quota and Jane has 200MB quota.
