---
layout: doc
title: doveadm-compress-connect
dovecotComponent: core
---

# doveadm compress-connect(1) - Establish a compress-aware imap connection

## SYNOPSIS

**doveadm compress-connect** *host* [*port*]

## DESCRIPTION

Connects to a compression-enabled IMAP service at given *host:port*.
**doveadm-compress-connect** takes care of the compression/decompression,
and to switch it on at the appropriate moment when the client sends the IMAP
command **COMPRESS DEFLATE**

## ARGUMENTS

* *host* - the hostname/ip address to connect to
* *port* - the port to connect to, 143 by default

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]], [[rfc,4978]]
