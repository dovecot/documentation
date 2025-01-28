---
layout: doc
title: Overview
order: 1
---

# Configuration Overview

 * [[link,settings_syntax]]
 * [[link,summary_settings]]
 * [[link,quick_config]]
 * [[link,basic_config]]

# Dovecot Backend

Dovecot can be configured for use in "backend" mode on a single server.
In this mode, Dovecot is responsible for reading and writing mails to
storage and handling all of the email protocols.

# Dovecot Proxy

Dovecot can be configured for use in "proxy" mode on a single server.
In this mode, Dovecot is responsible for proxying incoming email protocols
to remote hosts.

See [[link,authentication_proxies]].
