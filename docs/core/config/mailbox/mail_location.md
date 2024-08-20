---
layout: doc
title: mail_location Setting
dovecotlinks:
  mail_location:
    hash: mail-location-setting
    text: Mail Location Setting
  mail_location_index_files:
    hash: index-files
    text: "Mail Location: Index Files"
  mail_location_mailbox_root_autodetection:
    hash: mailbox-root-autodetection
    text: Mailbox Root Autodetection
---

# Mail Location Setting

## Settings

<SettingsComponent tag="mail-location" />

## Variables

You can use several variables in the mail location settings.

See [[variable]] for a full list, but the most commonly used ones are:

| Variable | Description |
| -------- | ----------- |
| `%u` | Full username. |
| `%n` | User part in `user@domain`; same as `%u` if there's no domain. |
| `%d` | Domain part in `user@domain`; empty if there's no domain. |

### Directory Hashing

You can use three different kinds of hashes in [[variable]].

* `%N` is MD5-based "new hash" which works similarly to `%H` except it
  gives more uniform results.

  * Example: `%2.256N` would return maximum 256 different hashes in range
    `00..ff`.

* `%M` returns a MD5 hash of the string as hex. This can be used for two
  level hashing by getting substrings of the MD5 hash.

  * Example: `%1Mu/%2.1Mu/%u` returns directories from `0/0/user` to
    `f/f/user`.

* `%H` returns a 32bit hash of the given string as hex.

  * This is the old, deprecated method. `%N` should be used instead.

## Index Files

Index files are by default stored under the same directory as mails.

You may want to change the index file location if you're using [[link,nfs]] or
if you're setting up [[link,shared_mailboxes]].

You can change the index file location with the [[setting,mail_index_path]]
setting. For example:

```[dovecot.conf]
mail_driver = maildir
mail_path = ~/Maildir
mail_index_path = /var/indexes/%u
```

The index directories are created automatically, but note that it requires
that Dovecot has actually access to create the directories. Either make sure
that the index root directory (`/var/indexes` in the above example) is
writable to the logged in user, or create the user's directory with proper
permissions before the user logs in.

Index files can be disabled completely with `mail_index_path=MEMORY`. This is
not recommended for production use, as the index files will need to be
generated on every access.

## Mailbox Root Autodetection

By default the [[setting,mail_driver]] and [[setting,mail_path]] settings are
empty, which means that Dovecot attempts to locate automatically where your
mails are. This is done by looking, in order, at:

* `~/mdbox/`
* `~/sdbox/`
* `~/Maildir/`
* `~/mail/.imap/`
* `~/mail/inbox`
* `~/mail/mbox`
* `~/Mail/.imap/`
* `~/Mail/inbox`
* `~/Mail/mbox`

::: tip
`.imap` is a directory, and `inbox` and `mbox` are files.
:::

For autodetection to work, one of the above locations has to be populated;
when autodetection is active, Dovecot will not attempt to create a mail folder.

It's usually a good idea to explicitly specify where the mails are, even if
the autodetection happens to work, in particular to benefit from auto-creation
of the folder for new users.

### Custom Autodetection

If you need something besides the default autodetection, you can use
[[link,post_login_scripting]].

::: details Example Script
```sh
#!/bin/sh

if [ -d $HOME/.maildir ]; then
  export MAIL_DRIVER=maildir
  export MAIL_PATH=$HOME/.maildir
else
  export MAIL_DRIVER=mbox
  export MAIL_PATH=$HOME/mail
  export MAIL_INBOX_PATH=/var/mail/$USER
fi
export USERDB_KEYS="$USERDB_KEYS mail_driver mail_path mail_inbox_path"

exec "$@"
```

## Mail Storage Autocreation

If [[setting,mail_path]] is set, the path is automatically created if any
directories are missing. You'll see something like this if you enable
[[setting,log_debug]].

Example for mbox:

```
Debug: Namespace : /home/user/Mail doesn't exist yet, using default permissions
Debug: Namespace : Using permissions from /home/user/Mail: mode=0700 gid=default
```

and a `Mail/.imap` directory will be present once that process has
concluded. This is the easiest way to ensure a freshly created user is
correctly set up for access via Dovecot.


## Home-less Users

Having a home directory for users is highly recommended. At a minimum,
[[link,sieve]] requires a home directory to work.

See [[link,home_directories_for_virtual_users]] for more reasons why it's a
good idea, and how to give Dovecot a home directory even if you don't have
a "real home directory".

If you really don't want to set any home directory, you can use something like:

```[dovecot.conf]
mail_driver = maildir
mail_path = /home/%u/Maildir
```

## Per-User Mail Locations

It's possible to override the default mail location for specific users by
making the [[link,userdb]] return the settings as extra field.

::: tip
Note that `%h` doesn't work in the userdb queries or templates. `~/` gets
expanded later, so use it instead.

If you have explicit settings inside [[link,namespaces,namespace { .. }]] they
need to be overridden in userdb with `namespace/<name>/` prefix. For example
`namespace/inbox/mail_path` instead of simply `mail_path`.
:::

### SQL

```[dovecot-sql.conf.ext]
user_query = SELECT home, uid, gid, mail_path FROM users WHERE user = '%u'
```

### LDAP

```[dovecot-ldap.conf.ext]
user_attrs = \
  =home=%{ldap:homeDirectory}, \
  =uid=%{ldap:uidNumber}, \
  =gid=%{ldap:gidNumber}, \
  =mail_path=%{ldap:mailLocation}
```

### Passwd-file

```
user:{PLAIN}password:1000:1000::/home/user::userdb_mail_driver=mbox userdb_mail_path=~/mail
```

## Mixing Multiple Mailbox Formats

It's possible to use different mailbox formats same user by configuring
multiple namespaces. See [[link,namespaces]].

Each mailbox format has to live in a different namespace. Mixing mailbox
formats within the same namespace is not supported.

## Custom Namespace Location

If you need to override namespace's mail location settings, first give it a
name (`inbox` in this example):

```[dovecot.conf]
namespace inbox {
  [...]
}
```

Then in the executable script use:

```sh
#!/bin/sh

# do the lookup here
mail_driver=mbox
mail_path=$HOME/mail

export USERDB_KEYS="$USERDB_KEYS namespace/inbox/mail_driver namespace/inbox/mail_path"
exec env "NAMESPACE/INBOX/MAIL_DRIVER=$mail_driver" "NAMESPACE/INBOX/MAIL_PATH=$mail_path" "$@"
```

## Finding Your Mail

Before configuring Dovecot, you'll need to know where your mails are
located. You should already have an SMTP server installed and configured
to deliver mails somewhere, so the easiest way to make Dovecot work is
to just use the same location. Otherwise you could create a `~/Maildir`
directory and configure your SMTP server to use the Maildir format.

First send a test mail to yourself (as your own non-root user):

```sh
echo "Hello me" | mail -s "Dovecot test" $USER
```

Now, find where the mail went. Here's a simple script which checks the
most common locations:

```sh
for mbox in /var/mail/$USER /var/spool/mail/$USER ~/mbox ~/mail/* ~/*; do
  grep -q "Dovecot test" "$mbox" && echo "mbox: $mbox"
done
grep -q "Dovecot test" ~/Maildir/new/* 2>/dev/null && echo "Maildir: ~/Maildir"
```

### mbox

In most installations your mail went to `/var/mail/username` file.
This file is called **INBOX** in IMAP world. Since IMAP supports
multiple mailboxes, you'll also have to have a directory for them as
well. Usually `~/mail` is a good choice for this.

For installation such as this, the mail location settings are specified with,
where `%u` is replaced with the username that logs in:
* [[setting,mail_driver,mbox]],
* [[setting,mail_path,~/mail]], and
* [[setting,mail_inbox_path,/var/mail/%u]].

Similarly if your INBOX is in `~/mbox`, use:
* [[setting,mail_inbox_path,~/mbox]].

### Maildir

Maildir exists almost always in `~/Maildir` directory.

The mail location is specified with:
* [[setting,mail_driver,maildir]], and
* [[setting,mail_path,~/Maildir]].

### Troubleshooting

If you can't find the mail, you should check your SMTP server logs and
configuration to see where it went or what went wrong.
