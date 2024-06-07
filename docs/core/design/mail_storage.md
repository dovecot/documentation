---
layout: doc
title: Mail Storage
---

# Mail Storage

`src/lib-storage/mail-storage.h` and `mail-storage-private.h`
describes mail storage. Mail storage is mainly about being a common
container for its mailboxes.

For example with [[link,mdbox]], each storage has one directory where all the
message bodies are written to, while the per-mailbox directories only
contain index files. With other mailbox formats the mail storage doesn't
do much else than allow allocating [[link,design_mailbox,mailboxes]].

## Public Functions

### `mail_storage_purge()`

Frees disk space used by expunged messages.
Currently the only mailbox format that uses this is multi-dbox.

### `mail_storage_get_settings()`

Returns mail storage settings.

### `mail_storage_set_callbacks()`

Can be used to specify "OK" and "NO" callbacks, which are called when a
long running operation wants to send a status update.

For example "OK Stale mailbox lock file detected, will override in n
seconds" or "NO Mailbox is locked, will abort in n seconds".

## Required Methods

Methods that mail storage backends need to implement are:

### `get_setting_parser_info()`

Returns storage-specific settings parser information.

### `alloc()`

Allocate memory for a storage and set its virtual functions.

### `create(ns)`

Initialize the storage based on given namespace settings. The same storage
can be used by other namespaces, but they don't call `create()` again.

This function typically shouldn't fail, except when storage can't handle
the wanted namespace settings.

### `destroy()`

Destroys the storage.

### `add_list(list)`

Called every time the storage is attached to a new namespace / mailbox list.

### `get_list_settings(ns, set)`

Used to get storage's default settings.

### `autodetect(ns, set)`

Returns TRUE if based on the given settings it looks like this storage
should we handling the namespace. This is done when [[setting,mail_location]]
doesn't explicitly specify the mailbox format.

### `mailbox_alloc()`

Allocate memory for [[link,design_mailbox]].

### `purge()`

If storage supports purging.
