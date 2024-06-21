---
layout: doc
title: quota
dovecotlinks:
  quota_admin:
    hash: quota-admin-commands
    text: quota admin
  quota_backend_count:
    hash: backend-count
    text: quota count backend
  quota_backend_fs:
    hash: backend-fs
    text: filesystem quota backend
  quota_backend_maildir:
    hash: backend-maildir
    text: Maildir quota backend
  quota_max_mail_size:
    hash: maximum-saved-mail-size
    text: quota maximum saved mail size
  quota_overquota:
    hash: overquota-flag
    text: quota overquota flag
  quota_root:
    hash: quota-root
    text: quota root
  quota_warning_scripts:
    hash: quota-warning-scripts
    text: quota warning scripts
---

# Quota (quota) Plugin

Quota tracking and enforcing plugin.

Three plugins are associated with quota:

| Name | Description |
| ---- | ----------- |
| [[plugin,imap-quota]] | Enables IMAP commands for requesting and administering current quota. |
| quota (this plugin) | Implements the actual quota handling and includes all quota backends. |
| [[plugin,quota-clone]] | Copy the current quota usage to a dict. |

## Settings

<SettingsComponent plugin="quota" />

## Configuration

### Enabling Quota Plugins

Enable in configuration files, e.g.:

```[dovecot.conf]
# Enable quota plugin for tracking and enforcing the quota.
mail_plugins = $mail_plugins quota

protocol imap {
  # Enable the IMAP QUOTA extension, allowing IMAP clients to ask for the
  # current quota usage.
  mail_plugins = $mail_plugins imap_quota
}

plugin {
  quota_grace = 10%%
  # 10% is the default
  quota_status_success = DUNNO
  quota_status_nouser = DUNNO
  quota_status_overquota = "552 5.2.2 Mailbox is full"
}
```

### Quota Root

See [[setting,quota]] for details on the syntax of the quota root setting.

Quota root is a concept from IMAP Quota specifications ([[rfc,2087]]). Normally
you'll have only one quota root, but in theory there could be, e.g., "user
quota" and "domain quota" roots. It's unspecified how the quota roots interact
with each other (if at all).

In some systems, for example, INBOX could have a completely different quota
root from the rest of the mailboxes (e.g. INBOX in `/var/mail/` partition and
others in `/home/` partition).

### Quota Rules

See [[setting,quota_rule]] for details on the syntax of the quota rule setting.

For [Maildir++ quota](#backend-maildir++), if `maildirsize` file exists the
limits are taken from it but if it doesn't exist the `?` limits are used.

#### Example

```[dovecot.conf]
quota_rule = *:storage=1G
quota_rule2 = Trash:storage=+100M
quota_rule3 = SPAM:ignore
```

This means that the user has 1GB quota, but when saving messages to Trash
mailbox it's possible to use up to 1.1GB of quota. The quota isn't
specifically assigned to Trash, so if you had 1GB of mails in Trash you could
still save 100MB of mails to Trash, but nothing to other mailboxes. The idea
of this is mostly to allow the clients' move-to-Trash feature work while user
is deleting messages to get under quota.

Additionally, any messages in the SPAM folder are ignored per the `ignore`
directive and would not count against the quota.

The first quota rule muse be named `quota_rule` while the following
rules have an increasing digit in them. You can have as many quota rules as
you want.

### Per-User Quota

You can override quota rules in your [[link,userdb_extra_fields]]. Keep
global settings in configuration plugin section and override only those
settings you need to in your userdb.

If you're wondering why per-user quota isn't working:

* Check that [[link,lda]] is called with `-d` parameter.
* Check that you're not using [[link,auth_staticdb]].
* Check that [[setting,quota_rule]] setting is properly returned by userdb.
  Enable [[setting,log_debug,category=auth or category=mail]] to see this.

#### Override: LDAP

::: warning Note
Remember that `user_attrs` is used only if you use [[link,auth_ldap]].
:::

Quota limit is in `quotaBytes` field:

```
user_attrs = homeDirectory=home, quotaBytes=quota_rule=*:bytes=%$
```

#### Override: SQL

::: warning Note
`user_query` is used only if you use [[link,auth_sql]].
:::

Example (for MySQL):

```
user_query = SELECT uid, gid, home, \
  concat('*:bytes=', quota_limit_bytes) AS quota_rule \
  FROM users WHERE userid = '%u'

# MySQL with userdb prefetch: Remember to prefix quota_rule with userdb_
# (just like all other userdb extra fields):
password_query = SELECT userid AS user, password, \
  uid AS userdb_uid, gid AS userdb_gid, \
  concat('*:bytes=', quota_limit_bytes) AS userdb_quota_rule \
  FROM users WHERE userid = '%u'
```

Example (for PostgreSQL and SQLite):

```
user_query = SELECT uid, gid, home, \
  '*:bytes=' || quota_limit_bytes AS quota_rule \
  FROM users WHERE userid = '%u'
```

#### Override: passwd-file

Example [[link,auth_passwd_file]] entries:

```
user:{plain}pass:1000:1000::/home/user::userdb_quota_rule=*:bytes=100M
user2:{plain}pass2:1001:1001::/home/user2::userdb_quota_rule=*:bytes=200M
user3:{plain}pass3:1002:1002::/home/user3::userdb_mail=maildir:~/Maildir userdb_quota_rule=*:bytes=300M
```

#### Override: passwd

The [[link,auth_passwd]] userdb doesn't support extra fields. That's
why you can't directly set users' quota limits to passwd file. One
possibility would be to write a script that reads quota limits from another
file, merges them with passwd file and produces another passwd-file, which you
could then use with Dovecot's [[link,auth_passwd_file]].

### Quota for Public Namespaces

You can create a separate namespace-specific quota that's shared between all
users. This is done by adding `:ns=<namespace prefix>` parameter to quota
setting. For example:

```[dovecot.conf]
namespace {
  type = public
  prefix = Public/
  #location = ..
}

plugin {
  quota = maildir:User quota
  quota2 = maildir:Shared quota:ns=Public/
  #quota_rules and quota2_rules..
}
```

### Quota for Private Namespaces

You can create a separate namespace-specific quota for a folder hierarchy.
This is done by adding another namespace and the `:ns=<namespace prefix>`
parameter to quota setting. For example:

```[dovecot.conf]
namespace {
  type = private
  prefix = Archive/
  #location = ..
}

plugin {
  # Maildir quota
  quota = maildir:User quota:ns=
  quota2 = maildir:Archive quota:ns=Archive/

  # Count quota
  #quota = count:User quota:%u.default:ns=
  #quota2 = count:Archive quota:%u.archive:ns=Archive/
  #quota_rules and quota2_rules..
}
```

::: tip Note
If you're using dict quota, you need to make sure that the quota of the
`Archive` namespace is calculated for another "user" than the default
namespace. Either track different namespaces in different backends or make
sure the users differs.

`%u.archive` defines `<username>.archive` as key to track quota for the
`Archive` namespace; `%u.default` tracks the quota of other folders.

See [[variable]] for further help on variables.
:::

### Quota and Shared Namespaces

Quota plugin considers shared namespaces against owner's quota, not the
current user's.

There is a limitation that per-user quota configuration is ignored, and the
current user's configuration is used.

Public namespaces are ignored unless there is explicit quota specified for it.

### Custom Quota Exceeded Message

See [[setting,quota_exceeded_message]].

Example:

```[dovecot.conf]
plugin {
  quota_exceeded_message = Quota exceeded, please go to http://www.example.com/over_quota_help for instructions on how to fix this.
}
```
## Quota Backends

Quota backend specifies the method how Dovecot keeps track of the current quota
usage. They don't (usually) specify users' quota limits, that's done by
[returning extra fields from userdb](#per-user-quota).

We recommend using [`count`](#backend-count) for any new installations.

If you need usage data to an external database, consider using
[[plugin,quota-clone]] for exporting the information. (It's very slow to
query every user's quota from the index files directly.)

### Backend: Count

The `count` quota backend tracks the quota internally within Dovecot's index
files.

::: warning Recommended
This is the **RECOMMENDED** way of calculating quota on recent Dovecot
installations.
:::

Each mailbox's quota is tracked separately and when the current quota usage is
wanted to be known, the mailboxes' quotas are summed up together. To get the
best performance, mailbox list indexes should be enabled.

::: warning
If you're switching from some other quota backend to `count`, make
sure that all the mails have their virtual sizes already indexed. Otherwise
there may be a significant performance hit when Dovecot starts opening all
the mails to get their sizes. You can help to avoid this by accessing the
mailbox vsizes for all the users before doing the configuration change:
[[doveadm,mailbox status,-u user@domain vsize '\*']].
:::

#### Configuration

`count` backend doesn't have any additional parameters.

```[dovecot.conf]
mailbox_list_index = yes

# Avoid spending excessive time waiting for the quota calculation to finish
# when mails' vsizes aren't already cached. If this many mails are opened,
# finish the quota calculation on background in indexer-worker process. Mail
# deliveries will be assumed to succeed, and explicit quota lookups will
# return internal error.
protocol !indexer-worker {
  mail_vsize_bg_after_count = 100
}

plugin {
  # 10MB quota limit
  quota = count:User quota
  quota_rule = *:storage=10M
}
```

### Backend: fs

The `fs` (filesystem) quota backend supports both local filesystems and
rquota (NFS).

#### Configuration

By default only user quota is shown, or if it doesn't exist, group quota is
used as fallback.

Driver specific parameters:

| Name | Description |
| ---- | ----------- |
| `group` | Report only group quotas |
| `inode_per_mail` | Report inode quota as "number of message" quota. This can be useful with Maildir or single-dbox. |
| `mount=<path>` | Report quota from given path. Default is to use the path for the mail root directory. |
| `user` | Report only user quotas, don't fallback to showing group quotas. |

#### Systemd

If you are using systemd, please make sure you **turn off**
`PrivateDevices=yes`, otherwise the backend won't work properly. The best
way to do this is to use `systemctl edit dovecot` command or add file
`/etc/systemd/system/dovecot.service.d/override.conf` with:

```
[Service]
PrivateDevices=off
```

#### Index Files

It's a good idea to keep index files in a partition where there are no
filesystem quota limits. The index files exist to speed up mailbox
operations, so Dovecot runs more slowly if it can't keep them updated. You can
specify the index file location by appending `:INDEX=/somewhere` to
[[setting,mail_location]].

Dovecot can handle "out of disk space" errors in index file handling and
transparently move to in-memory indexes. It'll use the in-memory indexes until
the mailbox is re-opened.

#### mbox

It's a good idea to have [[setting,mbox_lazy_writes,yes]] (default), otherwise
Dovecot might give "Not enough disk space" errors when opening the mailbox,
making it impossible to expunge any mails.

If user has run out of quota and index files are also in memory (because
they're also over quota), it's possible that message flag changes are lost.
This should be pretty rare though because Dovecot keeps some extra space
allocated inside the mbox file for flag changes.

Example:

```
mail_location = mbox:~/mail:INBOX=/var/mail/%u:INDEX=/var/no-quotas/index/%u
```

#### Maildir

Maildir needs to be able to add UIDs of new messages to `dovecot-uidlist`
file. If it can't do this, it can give an error when opening the mailbox,
making it impossible to expunge any mails.

Currently the only way to avoid this is to use a separate partition for the
uidlist files where there are no filesystem quota limits. You can do this by
appending `:CONTROL=/somewhere` to [[setting,mail_location]].

Example:

```
mail_location = maildir:~/Maildir:INDEX=/var/no-quotas/index/%u:CONTROL=/var/no-quotas/control/%u
```

Note that if you change the location of the control files, Dovecot will look
in the new `CONTROL` directory (`/var/no-quotas/control/%u`) for the
subscriptions file.

#### Configuration Examples

```[dovecot.conf]
mail_plugins = $mail_plugins quota
protocol imap {
  mail_plugins = mail_plugins imap_quota
}

plugin {
  quota = fs:user
}
```

If you want to see both user and group quotas as separate quota roots, you can
use:

```[dovecot.conf]
plugin {
  quota = fs:User quota:user
  quota2 = fs:Group quota:group
}
```

If you have your mails in two filesystems, you can create two quota roots:

```[dovecot.conf]
plugin {
  # Assuming INBOX in /var/mail/ which is mounted to /
  quota = fs:INBOX:mount=/
  # Assuming other mailboxes are in /home mount
  quota2 = fs:Others:mount=/home
}
```

### Backend: imapc

See [[link,imapc]].

### Backend: maildir

Maildir++ is the most commonly used quota backend with Maildir format.

::: warning
Note that **Maildir++ quota works only with Maildir format**. With other
mailbox formats you should use [`count`](#backend-count).
:::

The `maildir` quota backend implements Maildir++ quota in Dovecot. Dovecot
implements the
[Maildir++ specification](https://www.courier-mta.org/imap/README.maildirquota.html)
so Dovecot remains compatible with [Courier](https://www.courier-mta.org/),
[maildrop](https://www.courier-mta.org/maildrop/),
[Exim](https://www.exim.org/), etc.

There are two ways to configure Maildir++ quota limits:

1. Configure the limits in Dovecot. You most likely want to do this.
2. Make Dovecot get the limits from existing `maildirsize` files.

Only Maildir++-specific settings are described below.

Maildir++ quota relies on `maildirsize` file having correct information, so
if your users can modify the file in some way (e.g. shell access), you're
relying on the goodwill of your users for the quota to work.

You can't rely on Dovecot noticing external changes to Maildir and updating
maildirsize accordingly. This happens eventually when quota is being
recalculated, but it may take a while. Quota recalculation also currently
doesn't trigger quota warning executions.

#### Maildirsize File

The `maildirsize` file in the Maildir root directory contains both the quota
limit information and the current quota status. It contains a header in
format:

```
<storage limit in bytes>S,<messages limit>C
```

If you don't configure any quota limits in Dovecot (`quota=maildir` with no
other settings), Dovecot takes the limits from the header. If the file does
not exist, quota isn't enforced.

If you configure quota limits in Dovecot, Dovecot makes sure that this header
is kept up to date. If the file does not exist, it's simply rebuilt.

Once the `maildirsize` reaches 5120 bytes, the quota is recalculated and
the file is recreated. This makes sure that if quota happens to be broken
(e.g. externally deleted files) it won't stay that way forever.

## Quota Service

The quota service allows postfix to check quota before delivery:

```[dovecot.conf]
service quota-status {
  executable = quota-status -p postfix
  inet_listener {
    # You can choose any port you want
    port = 12340
  }
  client_limit = 1
}
```

And then have postfix `check_policy_service` check that:

```
smtpd_recipient_restrictions =
  ...
  check_policy_service inet:mailstore.example.com:12340
```

For more about this service, see
https://blog.sys4.de/postfix-dovecot-mailbox-quota-en.html.

## Quota Warning Scripts

See [[setting,quota_warning]].

### Example Configuration

```[dovecot.conf]
plugin {
  quota_warning = storage=95%% quota-warning 95 %u
  quota_warning2 = storage=80%% quota-warning 80 %u
  quota_warning3 = -storage=100%% quota-warning below %u # user is no longer over quota
}

service quota-warning {
  executable = script /usr/local/bin/quota-warning.sh
  # use some unprivileged user for executing the quota warnings
  user = vmail
  unix_listener quota-warning {
  }
}
```

With the above example, when user's quota exceeds 80% `quota-warning.sh` is
executed with parameter `80`. The same goes for when quota exceeds 95%. If user
suddenly receives a huge mail and the quota jumps from 70% to 99%, only the 95
script is executed.

You have to create the `quota-warning.sh` script yourself. Here is an
example that sends a mail to the user:

::: details Example `quota-warning.sh`
```sh
#!/bin/sh
PERCENT=$1
USER=$2
cat << EOF | /usr/local/libexec/dovecot/dovecot-lda -d $USER -o "plugin/quota=maildir:User quota:noenforcing"
From: postmaster@domain.com
Subject: quota warning

Your mailbox is now $PERCENT% full.
EOF
```
:::

The quota enforcing is disabled to avoid looping. You'll of course need to
change the `plugin/quota` value to match the quota backend and other
configuration you use. Basically preserve your original `quota` setting and
just insert `:noenforcing` to proper location in it.

For example with dict quota, you can use something like:
`-o "plugin/quota=count:User quota::noenforcing"`.

### Overquota-flag

Quota warning scripts can be used to set an overquota-flag to userdb (e.g.
LDAP) when user goes over/under quota. This flag can be used by MTA to reject
mails to an user who is over quota already at SMTP RCPT TO stage.

A problem with this approach is there are race conditions that in some rare
situations cause the overquota-flag to be set even when user is already under
quota. This situation doesn't solve itself without manual admin intervention
or the new overquota-flag feature: This feature checks the flag's value every
time user logs in (or mail gets delivered or any other email access to user)
and compares it to the current actual quota usage. If the flag is wrong, a
script is executed that should fix up the situation.

The overquota-flag name in userdb must be `quota_over_flag`.

These settings are available:

* [[setting,quota_over_flag_lazy_check]]
* [[setting,quota_over_flag_value]]
* [[setting,quota_over_script]]

Example:

```[dovecot.conf]
plugin {
  # If quota_over_flag=TRUE, the overquota-flag is enabled. Otherwise not.
  quota_over_flag_value = TRUE

  # Any non-empty value for quota_over_flag means user is over quota.
  # Wildcards can be used in a generic way, e.g. "*yes" or "*TRUE*"
  #quota_over_flag_value = *

  quota_over_flag_lazy_check = yes
  quota_over_script = quota-warning mismatch %u
}
```

## Quota Grace

See [[setting,quota_grace]].

By default the last mail can bring user over quota. This is
useful to allow user to actually unambiguously become over quota instead of
fail some of the last larger mails and pass through some smaller mails. Of
course the last mail shouldn't be allowed to bring the user hugely over quota,
so by default this limit is 10% of the user's quota limit.

To change the quota grace, use:

```[dovecot.conf]
plugin {
  # allow user to become max 10% over quota
  quota_grace = 10%%
  # allow user to become max 50 MB over quota
  quota_grace = 50 M
}
```

## Maximum Saved Mail Size

See [[setting,quota_max_mail_size]].

Dovecot allows specifying the maximum message size that is allowed to be
saved (e.g. by LMTP, IMAP APPEND or doveadm save). The default is `0`, which is
unlimited.

Since outgoing mail sizes are also typically limited on the MTA
side, it can be beneficial to prevent user from saving too large mails, which
would later on fail on the MTA side anyway.

## Quota Virtual Sizes

Indicates that the quota plugin should use virtual sizes rather than physical
sizes when calculating message sizes. Required for the `count` driver.

This is automatically determined by the quota plugin.

## Quota Admin Commands

The [[plugin,imap-quota]] implements the `SETQUOTA` command, which allows
changing the logged in user's quota limit if the user is admin.

See [[plugin,imap-quota]] for further configuration information.

## Quota Recalculation

If your quotas are out of sync, you can use
[[doveadm,quota recalc,-u &lt;uid&gt;]] command to recalculate them.

## Quota and Trash Mailbox

Standard way to expunge messages with IMAP works by:

1. Marking message with `\Deleted` flag
2. Actually expunging the message using EXPUNGE command

Both of these commands can be successfully used while user's quota is full.
However many clients use a `move-to-Trash` feature, which works by:

1. COPY the message to Trash mailbox
2. Mark the message with \Deleted
3. Expunge the message from the original mailbox
4. (Maybe later expunge the message from Trash when `clean trash` feature is
   used)

If user is over quota (or just under it), the first COPY command will fail and
user may get an unintuitive message about not being able to delete messages
because user is over quota. The possible solutions for this are:

* Disable move-to-trash feature from client
* You can create a separate quota rule ignoring Trash mailbox's quota. Note
  that this would allow users to store messages infinitely to the mailbox.
* You can create a separate quota rule giving Trash mailbox somewhat higher
  quota limit (but not unlimited).

To make sure users don't start keeping messages permanently in Trash you can
use [[setting,namespace/mailbox/autoexpunge]] to expunge old messages
from Trash mailbox.

## Debugging Quota

User's current quota usage can be looked up with
[[doveadm,quota get,-u user@domain]].

User's current quota may sometimes be wrong for various reasons (typically only
after some other problems). The quota can be recalculated with
[[doveadm,quota recalc,-u user@domain]].

