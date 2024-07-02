---
layout: doc
title: Fail2ban
---

# Using Fail2ban with Dovecot

You can use syslogging by setting [[setting,log_path]] to empty value.

::: code-group
```[/etc/fail2ban/filter.d/dovecot-pop3imap.conf]
[Definition]
failregex = (?: pop3-login|imap-login): .*(?:Authentication failure|Aborted login \(auth failed|Aborted login \(tried to use disabled|Disconnected \(auth failed|Aborted login \(\d+ authentication attempts).*rip=`<HOST>`
```

```[/etc/fail2ban/jail.conf]
[dovecot-pop3imap]
enabled = true
filter = dovecot-pop3imap
action = iptables-multiport[name=dovecot-pop3imap, port="pop3,imap", protocol=tcp]
logpath = /var/log/maillog
maxretry = 20
findtime = 1200
bantime = 1200
```
:::

(Set the `logpath` to wherever your syslog has been configured to log
Dovecot's login messages.)
