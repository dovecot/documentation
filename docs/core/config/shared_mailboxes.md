---
layout: doc
title: Shared Mailboxes
dovecotlinks:
  shared_mailboxes: shared mailboxes
  shared_mailboxes_listing:
    hash: shared-mailbox-listing
    text: shared mailbox listing
  shared_mailboxes_percent:
    hash: vs
    text: \% vs. \%\%
  shared_mailboxes_permissions:
    hash: filesystem-permissions
    text: shared mailboxes filesystem permissions
  shared_mailboxes_public:
    hash: public-shared-mailboxes
    text: public shared mailboxes
  shared_mailboxes_user:
    hash: user-shared-mailboxes
    text: user shared mailboxes
---

# Shared Mailboxes

Dovecot supports mailbox sharing in a single backend setup:

* [Public Shared](#public-shared-mailboxes): Shared mailboxes created by administrators.
* [User Shared](#user-shared-mailboxes): Users sharing their mailboxes to other users.
* [Symlinking](#mailbox-sharing-with-symlinks): Quick and dirty way of sharing a few mailboxes.

Sharing mailboxes when running multiple backends requires [[link,dovecot_pro]].

See [Filesystem Permissions](#filesystem-permissions) for common filesystem
related permission problems. Note that these permissions only make sense
when using a shared filesystem to enable sharing between users.

## Public Shared Mailboxes

Public mailboxes are typically mailboxes that are visible to all users
or to large user groups. They are created by defining a public
namespace, under which all the shared mailboxes are.

See [[link,namespaces]] for details of how namespaces are configured.

For example to create a public Maildir mailboxes, use:

```[dovecot.conf]
# User's private mail location
mail_location = maildir:~/Maildir

# When creating any namespaces, you must also have a private namespace:
namespace {
  type = private
  separator = /
  prefix =
  #location defaults to mail_location.
  inbox = yes
}

namespace {
  type = public
  separator = /
  prefix = Public/
  location = maildir:/var/mail/public
  subscriptions = no
}
```

In the above example, you would then create Maildir mailboxes under the
`/var/mail/public/` directory.

Note that with [[link,maildir]] format Dovecot uses Maildir++ layout by
default for folders, where the folder names must begin with a "." or
Dovecot will ignore them.

You can also optionally use the "fs" layout if you want the directory
structure to look like:

- `/var/mail/public/` (root dir)
- `/var/mail/public/info/` (maildir folder)
- `/var/mail/public/company/` (maildir folder)

### Per-user \\Seen Flag

The recommended way to enable private flags for shared
mailboxes is to create private indexes with `:INDEXPVT=<path>`. This
creates `dovecot.index.pvt[.log]` files, which contain only the message
UIDs and the private flags. Currently the list of private flags is
hardcoded only to the \\Seen flag.

```[dovecot.conf]
namespace {
  type = public
  separator = /
  prefix = Public/
  location = maildir:/var/mail/public:INDEXPVT=~/Maildir/public
  subscriptions = no
}
```

### Maildir: Keyword Sharing

Make sure you don't try to use per-user CONTROL directory. Otherwise
`dovecot-keywords` file doesn't get shared and keyword mapping breaks.

### Subscriptions

Typically you want each user to have control over their own
subscriptions for mailboxes in public namespaces. This is why you should
set `subscriptions=no` to the namespace. Dovecot will then use the
parent namespace's subscriptions file.

If you don't otherwise have a namespace with empty prefix, create one:

```[dovecot.conf]
namespace subscriptions {
  prefix =
  separator = /
  subscriptions = yes
  hidden = yes
  list = no
  alias_for = INBOX/ # the INBOX namespace's prefix
  location = <same as mail_location>:SUBSCRIPTIONS=subscriptions-shared
}
```

### Read-Only Mailboxes

#### mbox

If you have a read-only directory structure containing mbox files,
you'll need to store index files elsewhere:

```[dovecot.conf]
namespace {
  type = public
  prefix = Public/
  location = mbox:/var/mail/public/:INDEX=/var/indexes/public
  subscriptions = no
}
```

In the above example all the users would still be sharing the index
files, so you might have problems with filesystem permissions.
Alternatively you could place the index files under user's home
directory.

#### Maildir

If your Maildir is read-only, the control and index files still need to
be created somewhere. You can specify the path for these by appending
`:CONTROL=<path>:INDEX=<path>` to mail location. The path may point to
a directory that is shared among all users, or to a per-user path. Note
that if the Maildir has any keywords, the per-user control directory
breaks the keywords since there is no `dovecot-keywords` file.

When configuring multiple namespaces, the CONTROL/INDEX path must be
different for each namespace. Otherwise if namespaces have identically
named mailboxes their control/index directories will conflict and cause
all kinds of problems.

If you put the control files to a per-user directory, you must also put
the index files to a per-user directory, otherwise you'll get errors. It
is however possible to use shared control files but per-user index
files, assuming you've set up permissions properly.

```[dovecot.conf]
namespace {
  type = public
  separator = /
  prefix = Public/
  location = maildir:/var/mail/public:CONTROL=~/Maildir/public:INDEX=~/Maildir/public
  subscriptions = no
}

namespace {
  type = public
  separator = /
  prefix = Team/
  location = maildir:/var/mail/team:CONTROL=~/Maildir/team:INDEX=~/Maildir/team
  subscriptions = no
}
```

### Example: Public mailboxes with ACLs

See [[plugin,acl]] for more information about ACLs.

```[dovecot.conf]
namespace {
  type = public
  separator = .
  prefix = public.
  location = maildir:/var/mail/public
  subscriptions = no
  list = children
}

plugin {
  acl = vfile
}
```

It's important that the namespace type is "public" regardless of whether
you set the namespace prefix to "shared." or something else.

After this you have to place `dovecot-acl` files in every
mailbox/folder below `/var/mail/public` with rights for that folder
(e.g. `user=someone lr`).

[[setting,acl_shared_dict]] is not relevant for public mailboxes (only
for shared).

## User Shared Mailboxes

To enable mailbox sharing, you'll need to create a shared namespace. See
[[plugin,acl]] for more information about ACL-specific settings.

```[dovecot.conf]
# User's private mail location.
mail_location = maildir:~/Maildir

# When creating any namespaces, you must also have a private namespace:
namespace {
  type = private
  separator = /
  prefix =
  #location defaults to mail_location.
  inbox = yes
}

namespace {
  type = shared
  separator = /
  prefix = shared/%%u/
  # a) Per-user seen flags. Maildir indexes are shared. (INDEXPVT requires v2.2+)
  location = maildir:%%h/Maildir:INDEXPVT=~/Maildir/shared/%%u
  # b) Per-user seen flags. Maildir indexes are not shared. If users have direct filesystem level access to their mails, this is a safer option:
  #location = maildir:%%h/Maildir:INDEX=~/Maildir/shared/%%u:INDEXPVT=~/Maildir/shared/%%u
  subscriptions = no
  list = children
}

mail_plugins = acl
protocol imap {
  mail_plugins = $mail_plugins imap_acl
}
plugin {
  acl = vfile
}
```

This creates a shared/ namespace under which each user's mailboxes are.
If you have multiple domains and allow sharing between them, you might
want to set `prefix=shared/%%d/%%n/` instead (although %%u works just
fine too). If you don't, you might want to drop the domain part and
instead use `prefix=shared/%%n/`.

`list=children` specifies that if no one has shared mailboxes to the
user, the "shared" directory isn't listed by the LIST command. If you
wish it to be visible always, you can set `list=yes`.

The `location` setting specifies how to access other users' mailboxes.
If you use %%h, the user's home directory is asked from auth process via
auth-userdb socket. See [[link,lda]] for how to configure the socket.

If the users' mailboxes can be found using a
template, it's faster not to use the `%%h`. For example:

```[dovecot.conf]
location = maildir:/var/mail/%%d/%%n/Maildir:INDEXPVT=~/Maildir/shared/%%u
```

### % vs %%

`%var` expands to the logged in user's variable, while `%%var` expands to
the other users' variables. For example if your name is "myself" and
"someone1" and "someone2" have shared mailboxes to you, the variables
could be expanded like:

- `%u` expands to "myself"
- `%%u` expands to "someone1" or "someone2"
- `%h` might expand to "/home/myself"
- `%%h` might expand to "/home/someone1" or "/home/someone2"
- `~/` equals `%h/`

Note that in, e.g., [[setting,mail_location]] you might need both. For
example in:

```[dovecot.conf]
mail_location = maildir:%%h/Maildir:INDEXPVT=%h/Maildir/shared/%%u
```

What it means is:

- `%%h/Maildir` points to the other user's Maildir, e.g. "/home/someone1".

- `:INDEXPVT=%h/Maildir/shared/%%u` points to a per-user directory under
  your own Maildir, e.g. "/home/myself/Maildir/someone1" or
  "/home/myself/Maildir/someone2". This is necessary for storing
  per-user seen flags.

### dbox

With dbox, the index files are a very important part of the mailboxes.
You must not try to change `:INDEX=` to a user-specific location. This will
only result in mailbox corruption. (INDEXPVT can be used though.)

### Filesystem Permissions

Dovecot assumes that it can access the other users' mailboxes. If you
use multiple UNIX UIDs, you may have problems setting up the permissions
so that the mailbox sharing works. Dovecot never modifies existing
files' permissions. See [Filesystem Permissions](#filesystem-permissions)
for more information.

### Shared Mailbox Listing

With the above configuration it's possible to open shared mailboxes if
you know their name, but they won't be visible in the mailbox list. This
is because Dovecot has no way of knowing what users have shared
mailboxes to whom. Iterating through all users and looking inside their
mail directories would be horribly inefficient for more than a couple
users.

To overcome this problem Dovecot needs a dictionary, which contains the
list of users who have shared mailboxes and to whom they have shared. If
the users aren't properly listed in this dictionary, their shared
mailboxes won't be visible. Currently there's no way to automatically
rebuild this dictionary, so make sure it doesn't get lost. If it does,
each user having shared mailboxes must use the IMAP SETACL command (see
below) to get the dictionary updated for themselves.

See [[setting,acl_shared_dict]] for plugin setting information.

You could use any dictionary backend, including SQL or Cassandra, but a
simple flat file should work pretty well too:

```[dovecot.conf]
plugin {
  acl_shared_dict = file:/var/lib/dovecot/db/shared-mailboxes.db
}
```

The IMAP processes must be able to write to the `db/` directory. If
you're using system users, you probably want to make it mode 0770 and
group `sharedusers` and set `mail_access_groups=sharedusers` (or
something similar).

If you use multiple domains and don't wish users to share their
mailboxes to users in other domains, you can use separate dict files for
each domain:

```[dovecot.conf]
plugin {
  # assumes mailboxes are in /var/mail/%d/%n:
  acl_shared_dict = file:/var/mail/%d/shared-mailboxes.db
}
```

#### Using SQL dictionary

See [[link,dict]] for more information, especially about permission issues.

::: code-group
```[dovecot.conf]
plugin {
  acl_shared_dict = proxy::acl
}

dict {
  acl = pgsql:/etc/dovecot/dovecot-dict-sql.conf.ext
}
```

```sql[Database Tables]
CREATE TABLE user_shares (
  from_user varchar(100) not null,
  to_user varchar(100) not null,
  dummy char(1) DEFAULT '1',    -- always '1' currently
  primary key (from_user, to_user)
);
COMMENT ON TABLE user_shares IS 'User from_user shares folders to user to_user.';

CREATE INDEX to_user
  ON user_shares (to_user); -- because we always search for to_user

CREATE TABLE anyone_shares (
  from_user varchar(100) not null,
  dummy char(1) DEFAULT '1',    -- always '1' currently
  primary key (from_user)
);
COMMENT ON TABLE anyone_shares IS 'User from_user shares folders to anyone.';
```

```[/etc/dovecot/dovecot-dict-sql.conf.ext]
connect = host=localhost dbname=mails user=sqluser password=sqlpass
map {
  pattern = shared/shared-boxes/user/$to/$from
  table = user_shares
  value_field = dummy

  fields {
    from_user = $from
    to_user = $to
  }
}

map {
  pattern = shared/shared-boxes/anyone/$from
  table = anyone_shares
  value_field = dummy

  fields {
    from_user = $from
  }
}
```
:::

### Mailbox Sharing

You can use [[doveadm,acl]] to share mailboxes, or it can be done using
IMAP SETACL command. It is the only way to update the shared mailbox
list dictionary.

Below is a quick introduction to IMAP ACL commands. See [[rfc,4314]]
for more details.

#### `MYRIGHTS <mailbox>`

Returns the user's current rights to the mailbox.

#### `GETACL <mailbox>`

Returns the mailbox's all ACLs.

#### `SETACL <mailbox> <id> [+|-]<rights>`

Give `<id>` the specified rights to the mailbox.

#### `DELETEACL <mailbox> [-]<id>`

Delete `<id>`'s ACL from the mailbox.

| `<id>` | Description |
| ------ | ----------- |
| `anyone` | Matches all users, including anonymous users. |
| `authenticated` | Like "anyone", but doesn't match anonymous users. |
| `$group` | Matches all users belonging to the group ($ is not part of the group name). |
| `$!group` | See `group-override` in [[plugin,acl]] (Dovecot-specific feature). |
| `user` | Matches the given user. |

The `$group` syntax is not a standard, but it is mentioned in [[rfc,4314]]
examples and is also understood by at least Cyrus IMAP. Having '`-`'
before the identifier specifies negative rights.

See [[plugin,acl]] for list of `<rights>`.

### Sharing Mailboxes to Everyone

See [[setting,acl_anyone]].

Note that you can also do this only for some users by using the second
table "`anyone_shares`". Every user listed in this table shares his
folders with everyone. See also [[link,userdb_extra_fields]].

### IMAP ACL examples

Let's begin with some simple example that first gives "read" and
"lookup" rights, and later adds "write-seen" right:

```
1 SETACL Work user@domain rl
1 OK Setacl complete.

2 SETACL Work user@domain +s
2 OK Setacl complete.

3 GETACL Work
* ACL "Work" "user@domain" lrs "myself" lrwstipekxacd
3 OK Getacl completed.
```

Let's see how negative rights work by testing it on ourself. See how we
initially have "lookup" right, but later we don't:

```
1 MYRIGHTS Work
* MYRIGHTS "Work" lrwstipekxacd
1 OK Myrights completed.

2 SETACL Work -myself l
2 OK Setacl complete.

3 GETACL Work
* ACL "Work" "-myself" l "user@domain" lr "myself" lrwstipekxacd
3 OK Getacl completed.

4 myrights Work
* MYRIGHTS "Work" rwstipekxacd
4 OK Myrights completed.
```

### Troubleshooting

- Make sure the `%` and `%%` variables are specified correctly in the
  namespace location. [[setting,log_debug,category=mail]] will help you see
  if Dovecot is trying to access correct paths.

- [[doveadm,acl debug,-u user@domain shared/user/box]] can be helpful
  in figuring out why a mailbox can't be accessed.


## Mailbox Sharing with Symlinks

It's possible to share mailboxes simply by symlinking them among user's
private mailboxes.

See [Filesystem Permissions](#filesystem-permissions) for issues related
to filesystem permissions.

### Maildir

```console
$ ln -s /home/user2/Maildir/.Work /home/user1/Maildir/.shared.user2
$ ln -s /home/user3/Maildir/.Work /home/user1/Maildir/.shared.user3
```

Now user1 has a "shared" directory containing "user2" and "user3" child
mailboxes, which point to those users' "Work" mailbox.

With Maildir++ layout it's not possible to automatically share "mailbox
and its children". You'll need to symlink each mailbox separately. With
the "fs" layout this is possible though.

mbox
----

Doing the same as in the above Maildir example:

```console
$ mkdir /home/user1/mail/shared
$ ln -s /home/user2/mail/Work /home/user1/mail/shared/user2
$ ln -s /home/user3/mail/Work /home/user1/mail/shared/user3
```

One additional problem with mbox format is the creation of dotlock
files. The dotlocks would be created under user1's directory, which
makes them useless. Make sure the locking works properly with only fcntl
or flock locking (See [[link,mbox_locking]]) and just disable dotlocks.

Alternatively instead of symlinking an mbox file, put the shared mailboxes
inside a directory and symlink the entire directory.

## Filesystem Permissions

IMAP processes need filesystem level permissions to access shared/public
mailboxes. This means that:

- If you use more than one [[link,system_users_used_by_dovecot,UNIX UID]]
  for your mail users (e.g. you use system users), you'll need to make
  sure that all users can access the mailboxes on filesystem level.
  ([[plugin,acl]] won't help you with this.)

- You can remove write permissions on purpose from public namespace
  root directory to prevent users from creating new mailboxes under it.

Dovecot never modifies permissions for existing mail files or
directories. When users share mailboxes between each others, the system
must have been set up in a way that filesystem permissions don't get in
the way. The easiest way to do that is to use only a single UID. Another
possibility would be to use one or more groups for all the mail files
that may be shared to other users belonging to the same group. For
example if you host multiple domains, you might create a group for each
domain and allow mailbox sharing (only) between users in the same
domain.

### System User UNIX Groups

There's no requirement to use UNIX groups (i.e. typically defined in
`/etc/group`) for anything. If you don't care about them, you can
safely ignore this section.

If you use [[link,auth_passwd]], the IMAP process has access to all the
UNIX groups defined for that user. You may use these groups when
granting filesystem permissions.

If you wish to use UNIX groups defined in `/etc/group` but don't use
passwd userdb, you can still do this by returning `system_groups_user`
[[link,userdb_extra_fields]], which contains the UNIX user name whose
groups are read from the group file.

You can also set up extra UNIX groups by listing them in
[[setting,mail_access_groups]]. To have per-user UNIX groups, return
`mail_access_groups` as userdb extra field. The advantage of using
this method is that only Dovecot mail processes have access to the
group, but nothing else, such as user's SSH session.

For example, a simple way to set up shared mailbox access for all' system users is to make all mail dirs/files 0770/0660 mode and owned by group
"sharedmail" and then set [[setting,mail_access_groups,sharedmail]].
Using more fine-grained groups of course leaks less mail data in case
there's a security hole in Dovecot.

### Permissions For New Mailboxes

When creating a new mailbox, Dovecot copies the permissions from the
mailbox root directory. For example, with [[link,mbox]] if you have
directories:

```
drwx--xr-x 8 user group 4096 2009-02-21 18:31 /home/user/mail/
drwxrwxrwx 2 user group 4096 2009-02-21 18:32 /home/user/mail/foo/
```

When creating a new foo/bar/ directory, Dovecot gives it permissions:

```
drwx--xr-x 2 user group 4096 2009-02-21 18:33 /home/user/mail/foo/bar/
```

As you can see, the file mode was copied from mail/ directory, not
mail/foo/. The group is also preserved. If this causes problems (e.g.
different users having different groups create mailboxes, causing
permission denied errors when trying to preserve the group) you can set
the setgid bit for the root directory:

```console
$ chmod g+s /home/user/mail
```

This will cause the group to be automatically copied by the OS for all
created files/directories under it, even if the user doesn't belong to
the group.

### Permissions For New Files in Mailboxes

When creating new files inside a mailbox, Dovecot copies the read/write
permissions from the mailbox's directory. For example if you have:

```
drwx--xr-x 5 user group 4096 2009-02-21 18:53 /home/user/Maildir/.foo/
```

Dovecot creates files under it with modes:

```
drwx--xr-x 2 user group 4096 2009-02-21 18:54 cur/
drwx--xr-x 2 user group 4096 2009-02-21 18:54 new/
drwx--xr-x 2 user group 4096 2009-02-21 18:54 tmp/
-rw----r-- 1 user group  156 2009-02-21 18:54 dovecot.index.log
-rw----r-- 1 user group   17 2009-02-21 18:54 dovecot-uidlist
```

Note how the g+x gets copied to directories, but for files it's simply
ignored. The group is copied the same way as explained in the previous
section.

When mails are copied between Maildirs, it's usually done by hard
linking. If the source and destination directory permissions are
different, Dovecot create a new file and copies data the slow way so
that it can assign the wanted destination permissions. The source and
destination permission lookups are done only by looking at the mailbox
root directories' permissions, not individual mail files. This may
become a problem if the mail files' permissions aren't as Dovecot
expects.

### Permissions to New /domain/user Directories

If each user has different UIDs and you have `/var/mail/domain/user/`
style directories, you run into a bit of trouble. The problem is that
the first user who creates `/var/mail/domain/` will create it as 0700
mode, and other users can't create their own user/ directories under it
anymore. The solution is to use a common group for the users and set
`/var/mail/` directory's permissions properly (group-suid is
required):

```console
$ chgrp dovemail /var/mail
$ chmod 02770 /var/mail # or perhaps 03770 for extra security
```

and in `dovecot.conf`:

```[dovecot.conf]
mail_location = maildir:/var/vmail/%d/%n/Maildir
mail_access_groups = dovemail
```

The end result should look like this:

```
drwxrwsr-x 3 user dovemail 60 Oct 24 12:04 domain.example.com/
drwx--S--- 3 user user 60 Oct 24 12:04 domain.example.com/user/
```

Note that this requires that [[setting,mail_location]] is in its
explicit format with %variables. Using `maildir:~/Maildir` won't work,
because Dovecot can't really know how far down it should copy the
permissions from.

### Permissions to New User Home Directories

When `mail_location` begins with `%h` or `~/`, its permissions are
copied from the first existing parent directory if it has setgid-bit
set. This isn't done when the path contains any other %variables.

### Mail Delivery Agent Permissions

When using [[link,lda]], it uses all the same configuration files as
IMAP/POP3, so you don't need to worry about it.

When using an external [[link,mda]] to deliver to a shared mailbox, you need to
make sure that the resulting files have proper permissions. For example
with Procmail + Maildir, set `UMASK=007` in `.procmailrc` to make
the delivered mail files group-readable. To get the file to use the
proper group, set the group to the Maildir's `tmp/` directory and also
set its setgid bit (`chmod g+s`).

### Dictionary Files

Created dictionary files (e.g. `acl_shared_dict = file:...`) also base
their initial permissions on parent directory's permissions. After the
initial creation, the permissions are permanently preserved. So if you
want to use different permissions, just chown/chmod the file.
