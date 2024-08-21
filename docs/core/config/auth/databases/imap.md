---
layout: doc
title: IMAP
dovecotlinks:
  auth_imap: remote IMAP authentication database
---

# Authentication via Remote IMAP Server (`imap`)

## Driver Settings

[[removed,settings_ssl_imapc_removed]]: The `ssl_ca_file`, `ssl_ca_dir` and
`allow_invalid_cert` settings have been removed. The standard `ssl_*` settings
can be used instead (also inside `passdb { ... }` if wanted).

### `host=<hostspec>`

IP address or hostname. Allows [[variable]] (e.g. `host=imap.%d`).

### `port=<port>`

Port number of the remote server.

### `username=<template>`

The default is `%u`.

### `ssl=<imaps|starttls>`

The SSL method to use.

### `rawlog_dir=<path>`

## Example

Authenticates users against remote IMAP server in IP address 192.168.1.123:

```
passdb db1 {
  driver = imap
  args = host=192.168.1.123
}
```
