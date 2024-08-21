---
layout: doc
title: Postfix
---

# Virtual Users with Postfix

::: warning
This document has been taken out of the old wiki and has not yet been updated.
:::

This document describes how to user virtual users with
[[link,auth_passwd_file]].

## Basic Configuration

::: code-group
```[dovecot.conf]
protocols = imap lmtp
```
:::

## Mail Location and Namespaces

A private namespace configured for [[link,maildir]] or [[link,mdbox]]
storage to hold the mailboxes and a public namespace configured for Maildir
storage with filesystem layout (/dir/subdir) and per user
index-information.

The index will be stored in the `public` dir under the home directories.
This allows individual /SEEN information for the public namespace.

```[dovecot.conf]
#mail_driver = mdbox
#mail_path = ~/mdbox
mail_driver = maildir
mail_path = ~/maildir
mail_plugins {
  acl = yes
  quota = yes
}

namespace {
  type = private
  separator = /
  prefix =
  hidden = no
  inbox = yes
}

namespace {
  type = public
  separator = /
  prefix = Public/
  mail_driver = maildir
  mail_path = /var/vmail/public
  mail_index_path = ~/public
  mailbox_list_layout = fs
  list = yes
  subscriptions = no
}
```

User Home directory structure: `/var/vmail/\<domain\>/\<user\>/`:

```
-rw------- 1 vmail vmail 1489 2010-03-03 19:30 .dovecot.sieve
-rw------- 1 vmail vmail 2897 2010-03-14 12:22 .dovecot.svbin
drwx--S--- 4 vmail vmail 4096 2010-03-17 20:15 maildir
drwx--S--- 4 vmail vmail 4096 2010-03-14 13:31 public
```

## Authentication Databases

Per domain flat-files containing the virtual user's specific parameters,
stored in a single passwd-like file.

User logins are expected to be in full-qualified e-mail address format:
`user@domain.tld`.

Additional parameters may be used to override defaults, such as individual
quotas or mailbox formats.

::: code-group
```[dovecot.conf]
auth_mechanisms = plain

passdb db1 {
  driver = passwd-file
  args = username_format=%u /var/vmail/auth.d/%d/passwd
}

userdb db1 {
  driver = passwd-file
  args = username_format=%u /var/vmail/auth.d/%d/passwd
}
```

```[/var/vmail/auth.d/&lt;domain&gt;/passwd]
<user>@<domain>:{SSHA}xxxx:5000:5000::/var/vmail/<domain>/<user>::userdb_quota_rule=\
    *:storage=5G userdb_acl_groups=PublicMailboxAdmins
```
:::

Later on the auth service will be configured to run in the `doveauth` user
context. Therefore the directory `auth.d/` and its content will be owned
by this user, while mails / ACLs / Sieve-Scripts, will be accessed using
the `vmail` context specified in the passwd-file.

To keep directory permissions simple these will be stored seperately under
the `conf.d/` tree.

Per-domain authentication and configuration structure `/var/vmail`:

```
dr-x------ 3 doveauth dovecot  4096 2010-03-17 19:09 auth.d |--> domain.tld
dr-x------ 3 vmail    vmail    4096 2010-03-03 19:32 conf.d |--> domain.tld
```

## Master Configuration

IMAP-Server bound to IP *1.2.3.4* on port 143 while the IMAPS Port (993)
is disabled since `STARTTLS` will be used to request encryption over
the standard IMAP port. The LMTP-Server is bound to a Unix socket
configured with relevant permissions allowing Postfix to inject mails
through it. Dovecot presents its Authentication Mechanism and User
Database as another socket to Postfix allowing SASL submission.

Dovecot's authentication services will run in the `doveauth` user-context.

::: code-group
```[dovecot.conf]
service imap-login {
  inet_listener imap {
    address = 1.2.3.4
    port = 143
  }

  inet_listener imaps {
    port = 0
  }
}

service lmtp {
  unix_listener /var/spool/postfix/private/dovecot-lmtp {
    group = postfix
    mode = 0660
    user = postfix
  }
}

service imap {
}

service auth {
  unix_listener /var/spool/postfix/private/auth {
    group = postfix
    mode = 0660
    user = postfix
  }
  user = doveauth
}

service auth-worker {
  user = doveauth
}

verbose_proctitle = yes
```
:::

## Protocols

::: code-group
```[dovecot.conf]
protocol imap {
  mail_plugins {
    imap_acl = yes
    imap_quota = yes
    mail_log = yes
    notify = yes
  }
}

protocol lmtp {
  postmaster_address = postmaster@domainname   # required on my debian
  mail_plugins {
    sieve = yes
  }
}
```
:::

## Plugins

::: code-group
```[dovecot.conf]
plugin {
  #quota = dict:user::file:%h/mdbox/dovecot-quota
  quota = dict:user::file:%h/maildir/dovecot-quota
  quota_rule = *:storage=1GB
  quota_rule2 = Trash:storage=+10%%

  acl = vfile:/var/vmail/conf.d/%d/acls:cache_secs=300

  sieve = ~/.dovecot.sieve
}
```
:::

## TLS

::: code-group
```[dovecot.conf]
ssl_cert = </etc/ssl/certs/domain_tld_2009.crt
ssl_key = </etc/ssl/private/domain_tld_2009.key
```
:::

## Logging

Simple logging using the internal mechanism. See [[link,logging]]
for more complex configurations.

::: code-group
```[dovecot.conf]
log_path = /var/log/dovecot.log
info_log_path = /var/log/dovecot-info.log
```
:::

### Syslog Logging

::: code-group
```[dovecot.conf]
#log_path =
#info_log_path =
syslog_facility = local1
```

```[/etc/rsyslog.conf]
local1.*                          -/var/log/dovecot.log
local1.info                       -/var/log/dovecot.info
local1.warn                       -/var/log/dovecot.warn
local1.err                        -/var/log/dovecot.err
:msg,contains,"stored mail into mailbox"\
                                  -/var/log/dovecot.lmtp
```

```[/etc/logrotate.d/dovecot]
/var/log/dovecot.log
/var/log/dovecot.info
/var/log/dovecot.warn
/var/log/dovecot.err
/var/log/dovecot.lmtp
{
    weekly
    rotate 52
    missingok
    notifempty
    compress
    delaycompress
    create 640 root adm
    sharedscripts
    postrotate
    /bin/kill -USR1 'cat /var/run/dovecot/master.pid 2>/dev/null' 2>/dev/null || true
    endscript
}
```
:::

## Postfix Configuration

In this configuration Postfix will only accept SASL requests on its
submission port (`TCP:587`) and will not accept them on Port 25.

As Dovecot is used as authentication backend in this example, this will not
break inbound mail flow in case the authentication mechanism is down
e.g. due to upgrading to a new build.

The configuration of the submission port is handled in `master.cf`
overriding possible `main.cf` settings. Several sanity checks are
performed upon submission like recipient domain validation and sender
map checks. Final delivery is performed through Dovecot's LMTP server
via a socket.

::: code-group
```[/etc/postfix/main.cf]
smtpd_banner = $myhostname ESMTP
biff = no
append_dot_mydomain = no

myhostname = mail.domain.tld
inet_protocols = ipv4
mydestination = $myhostname, localhost.$mydomain
virtual_mailbox_domains = domain.tld, domain1.tld
virtual_alias_maps = hash:/etc/postfix/virtual
virtual_transport = lmtp:unix:private/dovecot-lmtp

strict_rfc821_envelopes = yes
disable_vrfy_command = yes

smtpd_helo_required = yes
smtpd_recipient_restrictions =
  reject_unknown_recipient_domain,
  reject_non_fqdn_recipient,
  permit_mynetworks,
  reject_unauth_destination
  permit

smtpd_tls_cert_file=/etc/postfix/server.pem
smtpd_tls_key_file=/etc/ssl/private/domain_tld.key
smtpd_tls_session_cache_database = btree:/var/lib/postfix/smtpd_scache

alias_maps = hash:/etc/aliases
mailbox_size_limit = 0
message_size_limit = 20480000
```
:::

## Postfix Master Configuration

The submission port is configured to only accept TLS secured
transmissions. Login Map checks will verify the authenticated SASL user
is authorized to send using different MAIL FROM aliases.

::: code-group
```[/etc/postfix/master.cf]
#
# Postfix master process configuration file.  For details on the format
# of the file, see the master(5) manual page (command: "man 5 master").
#
# ==========================================================================
# service type  private unpriv  chroot  wakeup  maxproc command + args
#               (yes)   (yes)   (yes)   (never) (100)
# ==========================================================================
smtp      inet  n       -       -       -       -       smtpd
submission inet n       -       -       -       -       smtpd
  -o smtpd_tls_security_level=encrypt
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_sasl_type=dovecot
  -o smtpd_sasl_path=private/auth
  -o smtpd_recipient_restrictions=reject_unknown_recipient_domain,reject_non_fqdn_recipient,permit_sasl_authenticated,reject
pickup    fifo  n       -       -       60      1       pickup
cleanup   unix  n       -       -       -       0       cleanup
qmgr      fifo  n       -       n       300     1       qmgr
tlsmgr    unix  -       -       -       1000?   1       tlsmgr
rewrite   unix  -       -       -       -       -       trivial-rewrite
bounce    unix  -       -       -       -       0       bounce
defer     unix  -       -       -       -       0       bounce
trace     unix  -       -       -       -       0       bounce
verify    unix  -       -       -       -       1       verify
flush     unix  n       -       -       1000?   0       flush
proxymap  unix  -       -       n       -       -       proxymap
smtp      unix  -       -       -       -       -       smtp
relay     unix  -       -       -       -       -       smtp
  -o fallback_relay=
showq     unix  n       -       -       -       -       showq
error     unix  -       -       -       -       -       error
discard   unix  -       -       -       -       -       discard
local     unix  -       n       n       -       -       local
virtual   unix  -       n       n       -       -       virtual
lmtp      unix  -       -       -       -       -       lmtp
anvil     unix  -       -       -       -       1       anvil
scache    unix  -       -       -       -       1       scache
retry     unix  -       -       -       -       -       error
```
:::
