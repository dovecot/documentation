---
layout: doc
title: IMAP
dovecotlinks:
  auth_imap: remote IMAP authentication database
---

# Authentication via Remote IMAP Server (`imap`)

## Driver Settings

### `host=<hostspec>`

IP address or hostname. Allows [[variable]] (e.g. `host=imap.%d`).

### `port=<port>`

Port number of the remote server.

### `username=<template>`

The default is `%u`.

### `ssl=<imaps|starttls>`

The SSL method to use.

### `ssl_ca_dir=<path>`

### `ssl_ca_file=<path>`

### `allow_invalid_cert=<yes|no>`

Whether to allow authentication even if the certificate isn't trusted.

### `rawlog_dir=<path>`

## Example

Authenticates users against remote IMAP server in IP address 192.168.1.123:

```
passdb {
  driver = imap
  args = host=192.168.1.123
}
```
