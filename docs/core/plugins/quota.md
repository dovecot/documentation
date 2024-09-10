---
layout: doc
title: quota
dovecotlinks:
  quota_admin:
    hash: quota-admin-commands
    text: Quota Admin
  quota_limits:
    hash: quota-limits
    text: Quota Limits
  quota_backends:
    hash: quota-backends
    text: Quota Backends
  quota_backend_count:
    hash: backend-count
    text: "Quota Backend: Count"
  quota_backend_fs:
    hash: backend-fs
    text: "Quota Backend: Filesystem"
  quota_backend_imapc:
    hash: backend-imapc
    text: "Quota Backend: Imapc"
  quota_backend_maildir:
    hash: backend-maildir
    text: "Quota Backend: Maildir"
  quota_mailbox_count:
    hash: maximum-mailbox-count
    text: "Quota: Maximum Mailbox Count"
  quota_mail_size:
    hash: maximum-saved-mail-size
    text: "Quota: Maximum Saved Mail Size"
  quota_overquota:
    hash: overquota-flag
    text: "Quota: Overquota Flag"
  quota_root:
    hash: quota-root
    text: Quota Root
  quota_warning_scripts:
    hash: quota-warning-scripts
    text: Quota Warning Scripts
  quota_status_service:
    hash: quota-status-service
    text: Quota Status Service
---

# Quota Plugin (`quota`)

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
mail_plugins {
  quota = yes
}

protocol imap {
  # Enable the IMAP QUOTA extension, allowing IMAP clients to ask for the
  # current quota usage.
  mail_plugins {
    imap_quota = yes
  }
}

quota "User quota" {
  quota_storage_size = 1G
}
```

### Quota Root

Quota root is a concept from IMAP Quota specifications ([[rfc,2087]]). Normally
you'll have only one quota root, but in theory there could be, e.g., "user
quota" and "domain quota" roots. It's unspecified how the quota roots interact
with each other (if at all).

In some systems, for example, INBOX could have a completely different quota
root from the rest of the mailboxes (e.g. INBOX in `/var/mail/` partition and
others in `/home/` partition).

### Quota Limits

There are two types of quota limits:

 * Message count limits
 * Storage size limits

The message count limit is calculated as: [[setting,quota_message_count]] \*
[[setting,quota_message_percentage]]. Zero is assumed to be unlimited.

The storage size limit is calculated as: [[setting,quota_storage_size]] \*
[[setting,quota_storage_percentage]] + [[setting,quota_storage_extra]].
Zero is assumed to be unlimited.

The percentage and extra values are mainly useful to allow exceeding the
regular quota limit in some mailboxes, such as allowing clients that move
messages with IMAP COPY+EXPUNGE to Trash folder to temporarily exceed the
quota.

#### Example

```[dovecot.conf]
quota_storage_size = 1G
namespace inbox {
  mailbox Trash {
    quota_storage_extra = 100M
  }
  mailbox SPAM {
    quota_ignore = yes
  }
}
```

This means that the user has 1GB quota, but when saving messages to Trash
mailbox it's possible to use up to 1.1GB of quota. The quota isn't
specifically assigned to Trash, so if you had 1GB of mails in Trash you could
still save 100MB of mails to Trash, but nothing to other mailboxes.

Additionally, any messages in the SPAM folder are ignored and would not count
against the quota at all.

### Per-User Quota

You can override the quota settings in your [[link,userdb_extra_fields]]. Keep
global settings in configuration plugin section and override only those
settings you need to in your userdb.

Use [[doveadm,user]] command to verify that the userdb returns the expected
quota settings.

#### Override: LDAP

Example [[link,auth_ldap]] where the quota limit is in `quotaBytes` field:

::: code-group
```[dovecot.conf]
userdb ldap {
  ...
  fields {
    home = %{ldap:homeDirectory}
    quota_storage_size = {ldap:quotaBytes}B
  }
}
```
:::

#### Override: SQL

Example (for MySQL):

```[dovecot.conf]
userdb sql {
  query = SELECT uid, gid, home, CONCAT(quota_limit_bytes, 'B') AS quota_storage_size \
    FROM users \
    WHERE userid = '%u'

passdb sql {
  # SQL with userdb prefetch: Remember to prefix quota_quota_storage_size with userdb_
  # (just like all other userdb extra fields):
  query = SELECT userid AS user, password, uid AS userdb_uid, gid AS userdb_gid, \
      CONCAT(quota_limit_bytes, 'B') AS userdb_quota_storage_size \
    FROM users \
    WHERE userid = '%u'
}
```

Example (for PostgreSQL and SQLite):

```[dovecot.conf]
sql_driver = sqlite # alternatively: pgsql

userdb sql {
  query = SELECT uid, gid, home, quota_limit_bytes || 'B' AS quota_storage_size \
    FROM users \
    WHERE userid = '%u'
}
```

#### Override: passwd-file

Example [[link,auth_passwd_file]] entries:

```
user:{plain}pass:1000:1000::/home/user::userdb_quota_storage_size=100M
user2:{plain}pass2:1001:1001::/home/user2::userdb_quota_storage_size=200M
user3:{plain}pass3:1002:1002::/home/user3::userdb_mail_path=~/Maildir userdb_quota_storage_size=300M
```

#### Override: passwd

The [[link,auth_passwd]] userdb doesn't support extra fields. That's
why you can't directly set users' quota limits to passwd file. You can use
an additional userdb (e.g. [[link,auth_passwd_file]] where only the quota
limits are specified.

### Quota for Public Namespaces

You can create a separate namespace-specific quota that's shared between all
users. This is done by configuring the quota root inside the namespace filter.
For example:

```[dovecot.conf]
namespace public {
  type = public
  prefix = Public/
  #mail_path = ..

  quota "Shared quota" {
    #quota_storage_size = ...
  }
}

quota "User quota" {
  #quota_storage_size = ...
}
```

Note that globally configured quota roots are used only for private namespaces.

### Quota for Private Namespaces

You can create a separate namespace-specific quota for a folder hierarchy.
This is done by configuring the quota root inside the namespace filter.
For example:

```[dovecot.conf]
namespace inbox {
  quota "User quota" {
    #quota_storage_size = ...
  }
}

namespace archive {
  type = private
  prefix = Archive/
  #mail_path = ..

  quota "Archive quota" {
    #quota_storage_size = ...
  }
}
```

Note that both quotas must be configured inside the namespace filter.
Using a global quota configuration would apply to both namespaces.

### Quota and Shared Namespaces

Quota plugin considers shared namespaces against owner's quota, not the
current user's. The regular private quota configuration is used - there is
no need to explicitly configure quota for shared namespaces. The quota limits
are also taken from the userdb.

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
usage. They don't specify users' quota limits - that's done by
[returning extra fields from userdb](#per-user-quota).

We recommend using [`count`](#backend-count) for any new installations.

If you need usage data to an external database, consider using
[[plugin,quota-clone]] for exporting the information. (It's very slow to
query every user's quota from the index files directly.)

### Backend: Count

The `count` quota backend tracks the quota internally within Dovecot's index
files.

::: info
This is the **RECOMMENDED** way of calculating quota on recent Dovecot
installations.
:::

Each mailbox's quota is tracked separately and when the current quota usage is
wanted to be known, the mailboxes' quotas are summed up together. To get the
best performance, make sure [[setting,mailbox_list_index,yes]].

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

quota "User quota" {
  # 10MB quota limit
  quota_storage_size = 10M
}
```

### Backend: fs

The `fs` (filesystem) quota backend supports both local filesystems and
rquota (NFS).

#### Configuration

<SettingsComponent tag="quota-fs" level="4" />

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
specify the index file location with the [[setting,mail_index_path]] setting.

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

```[dovecot.conf]
mail_driver = mbox
mail_path = ~/mail
mail_inbox_path = /var/mail/%u
mail_index_path = /var/no-quotas/index/%u
```

#### Maildir

Maildir needs to be able to add UIDs of new messages to `dovecot-uidlist`
file. If it can't do this, it can give an error when opening the mailbox,
making it impossible to expunge any mails.

Currently the only way to avoid this is to use a separate partition for the
uidlist files where there are no filesystem quota limits. You can do this with
the [[setting,mail_control_path]] setting.

Example:

```[dovecot.conf]
mail_driver = maildir
mail_path = ~/Maildir
mail_index_path = /var/no-quotas/index/%u
mail_control_path = /var/no-quotas/control/%u
```

Note that if you change the location of the control files, Dovecot will look
in the new control path directory (`/var/no-quotas/control/%u`) for the
mailbox `subscriptions` file.

#### Configuration Examples

```[dovecot.conf]
mail_plugins {
  quota = yes
}
protocol imap {
  mail_plugins {
    imap_quota = yes
  }
}

quota user {
  driver = fs
}
```

If you want to see both user and group quotas as separate quota roots, you can
use:

```[dovecot.conf]
quota "User quota" {
  driver = fs
  fs_type = user
}
quota "Group quota" {
  driver = fs
  fs_type = group
}
```

If you have your mails in two filesystems, you can create two quota roots:

```[dovecot.conf]
quota INBOX {
  driver = fs
  # Assuming INBOX in /var/mail/ which is mounted to /
  fs_mount_path = /
}
quota Others {
  driver = fs
  # Assuming other mailboxes are in /home mount
  fs_mount_path = /home
}
```

### Backend: imapc

See [[link,imapc_quota]].

#### Configuration

<SettingsComponent tag="quota-imapc" level="4" />

### Backend: maildir

::: warning
Note that **Maildir++ quota works only with Maildir format**. However, even
with Maildir format the recommendation is to use [`count`](#backend-count).
:::

The `maildir` quota backend implements Maildir++ quota in Dovecot. Dovecot
implements the
[Maildir++ specification](https://www.courier-mta.org/imap/README.maildirquota.html)
so Dovecot remains compatible with [Courier](https://www.courier-mta.org/),
[maildrop](https://www.courier-mta.org/maildrop/),
[Exim](https://www.exim.org/), etc.

#### Maildirsize File

The `maildirsize` file in the Maildir root directory contains both the quota
limit information and the current quota status. It contains a header in
format:

```
<storage limit in bytes>S,<messages limit>C
```

[[removed,quota_maildir_backend_removed]] Maildir++ quota limit must now be
specified in Dovecot configuration. It will no longer be read from the
`maildirsize` file. The limits are still written to the file header, but they
are ignored by Dovecot.

Maildir++ quota relies on `maildirsize` file having correct information, so
if your users can modify the file in some way (e.g. shell access), you're
relying on the goodwill of your users for the quota to work.

You can't rely on Dovecot noticing external changes to Maildir and updating
`maildirsize` accordingly. This happens eventually when quota is being
recalculated, but it may take a while. Quota recalculation also won't
trigger quota warning executions.

Once the `maildirsize` reaches 5120 bytes, the quota is recalculated and
the file is recreated. This makes sure that if quota happens to be broken
(e.g. externally deleted files) it won't stay that way forever.

## Quota Service

The quota service allows Postfix to check quota before delivery. This service
does not support proxying, so it works only in non-clustered setups when there
is a single Dovecot server.

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
https://sys4.de/en/blog/postfix-dovecot-mailbox-quota/

## Quota Warning Scripts

You can configure Dovecot to run an external command when user's quota
exceeds a specified limit. Note that the warning is ONLY executed at the
exact time when the limit is being crossed, so when you're testing you have
to do it by crossing the limit by saving a new mail. If something else
besides Dovecot updates quota so that the limit is crossed, the warning is
never executed.

The quota warning limits are configured the same way as the actual
[[link,quota_limits]], but just placed inside the [[setting,quota_warning]]
filter.

Only the command for the first exceeded limit is executed, so configure the
highest limit first. The actual commands that are run need to be created as
services (create a named Dovecot service and use the service name
as the \`quota-warning socket name\` argument).

### Configuration

<SettingsComponent tag="quota-warning" level="3" />

### Example Configuration

```[dovecot.conf]
quota user {
  warning warn-95 {
    quota_storage_percentage = 95
    execute quota-warning {
      args = 95 %u
    }
  }
  warning warn-80 {
    quota_storage_percentage = 80
    execute quota-warning {
      args = 80 %u
    }
  }
  warning warn-under {
    quota_storage_percentage = 100
    # user is no longer over quota
    threshold = under
    execute quota-warning {
      args = below %u
    }
  }
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
cat << EOF | /usr/local/libexec/dovecot/dovecot-lda -d $USER -o quota_enforce=no
From: postmaster@domain.com
Subject: quota warning

Your mailbox is now $PERCENT% full.
EOF
```
:::

The quota enforcing is disabled to avoid looping.

### Overquota-flag

[[link,quota_warning_scripts,Quota warning scripts]] can be used to set an overquota-flag to userdb (e.g.
LDAP) when user goes over/under quota. This flag can be used by MTA to reject
mails to an user who is over quota already at SMTP RCPT TO stage.

A problem with this approach is there are race conditions that in some rare
situations cause the overquota-flag to be set even when user is already under
quota. This situation doesn't solve itself without manual admin intervention
or the overquota-flag feature: This feature checks the flag's value every
time user logs in (or when mail gets delivered or any other email access to user)
and compares it to the current actual quota usage. If the flag is wrong, a
script is executed that fixes up the situation.

The [[setting,execute]] setting inside [[setting,quota_over_status]] named
filter specifies the script that is executed. The current
[[setting,quota_over_status_current]] value is appended as the last parameter.

The overquota-flag name in userdb must be [[setting,quota_over_status_current]].

These settings are available:

* [[setting,quota_over_status_lazy_check]]
* [[setting,quota_over_status_mask]]

Example:

```[dovecot.conf]
quota_over_status {
  # If quota_over_status_current=TRUE, the overquota-flag is enabled.
  # Otherwise not.
  mask = TRUE

  # Any non-empty value for quota_over_status_current means user is over quota.
  # Wildcards can be used in a generic way, e.g. "*yes" or "*TRUE*"
  #mask = *

  lazy_check = yes
  execute quota-warning {
    args = mismatch %u
  }
}
```

## Quota Grace

See [[setting,quota_storage_grace]].

By default the last mail can bring user over quota. This is
useful to allow user to actually unambiguously become over quota instead of
fail some of the last larger mails and pass through some smaller mails. Of
course the last mail shouldn't be allowed to bring the user hugely over quota,
so by default this limit is 10% of the user's quota limit.

To change the quota grace, use:

```[dovecot.conf]
plugin {
  # allow user to become max 10% over quota
  quota_storage_grace = 10%%
  # allow user to become max 50 MB over quota
  quota_storage_grace = 50 M
}
```

## Maximum Mailbox Count

See [[setting,quota_mailbox_count]].

Maximum number of mailboxes that can be created. Each namespace is tracked
separately, so e.g. shared mailboxes aren't counted towards the user's own
limit. The default is `0`, which is unlimited.

## Maximum Messages Per Mailbox

See [[setting,quota_mailbox_message_count]].

Maximum number of messages that can be created in a single mailbox.

## Maximum Saved Mail Size

See [[setting,quota_mail_size]].

Dovecot allows specifying the maximum message size that is allowed to be
saved (e.g. by LMTP, IMAP APPEND or doveadm save). The default is `unlimited`.

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
use [[setting,mailbox_autoexpunge]] to expunge old messages from Trash mailbox.

## Debugging Quota

User's current quota usage can be looked up with
[[doveadm,quota get,-u user@domain]].

User's current quota may sometimes be wrong for various reasons (typically only
after some other problems). The quota can be recalculated with
[[doveadm,quota recalc,-u user@domain]].

## Quota Status Service

Dovecot supports quota-status service, which uses Postfix-compatible policy
server protocol. This allows Postfix to check the quota before mail delivery.

Example:

::: code-group
```[dovecot.conf]
service quota-status {
  executable = quota-status -p postfix
  unix_listener /var/spool/postfix/private/quota-status {
    user = postfix
  }
  # Or with TCP:
  inet_listener postfix {
    # You can choose any port you want
    port = 12340
  }
  client_limit = 1
}
```

```[/etc/postfix/main.cf]
smtpd_recipient_restrictions =
  ...
  check_policy_service unix:private/quota-status
  # Or with TCP:
  #check_policy_service inet:mailstore.example.com:12340
```
:::

### Configuration

<SettingsComponent tag="quota-status-service" level="3" />
