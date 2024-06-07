---
layout: doc
title: Modes
---

# Dovecot Operation Modes

## Dovecot Backend

Dovecot can be configured for use in "backend" mode on a single server.
In this mode, Dovecot is responsible for reading and writing mails to
storage and handling all of the email protocols.

## Dovecot Proxy

Dovecot can be configured for use in "proxy" mode on a single server.
In this mode, Dovecot is responsible for proxying incoming email protocols
to remote hosts.

See [[link,authentication_proxies]].
