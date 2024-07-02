---
layout: doc
title: Overview
dovecotlinks:
  design_dovecot: Dovecot Design
---

# Overview

## Dovecot Design

- [Overview of Dovecot processes](processes)
- [Design of Index Files](indexes/index_format)
  - [API for Accessing the Index Files](indexes/mail_index_api)
- [Design of Authentication Process](auth_process)
  - [Authentication Protocol](auth_protocol)
- [Doveadm Server Protocol](doveadm_protocol) and
  [[link,doveadm_http_api]]
- [Doveadm Synchronization](dsync)
- [[link,lua,Dovecot Lua Support]]
- [Dovecot Dict Protocol](dict_protocol)

## Protocol Extensions

- [[link,forwarding_parameters,Forwarding Parameters in IMAP/POP3/LMTP/SMTP Proxying]]

## Code APIs

- [[link,coding_style]] - explanations how and why the coding style is the
  way it is.

Look at the \*.h files for the actual API documentation. The
documentation below doesn't attempt to list full API documentation.

liblib:

- [Memory Allocations](memory)
- [Static/Dynamic Buffers](buffers)
- [Dynamic Arrays](arrays)
- [String Handling](strings)
- [Input Streams](istreams)
- [Output Streams](ostreams)
- [Events](events)
- [Plugins](plugins)

lib-dcrypt:

- [lib-dcrypt Data Formats](dcrypt)

lib-storage:

- [Mail User](mail_user) contains everything related to
  a single user.
- [Mail Namespace](mail_namespace) A single user can
  contain multiple namespaces.
- [Mailbox List](mailbox_list) is used to list/manage
  a list of mailboxes for a single namespace (1:1 relationship).
- [Mail Storage](mail_storage) is used to access mails
  in a specific location with a specific mailbox format. Multiple namespaces
  can point to the same storage. A single namespace may in future (but not
  currently) point to multiple storages (e.g. a mixed mbox and Maildir
  directory).
- [Mailbox](mailbox) is used to access a specific mailbox
  in a storage.
- [Mail](mail) is used to access a specific mail in a
  mailbox.
- [Error Handling](storage_errors)
- [Plugins](mail_plugins) - how to hook into lib-storage functions.
