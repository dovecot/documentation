---
layout: doc
title: Mailbox Transactions
dovecotlinks:
  design_transaction: mailbox transaction
---

# Mailbox Transactions

Before you can read any mails or do any changes to mails, you need to
create a transaction with `mailbox_transaction_begin()`.

## Mailbox Transaction Flags

### `MAILBOX_TRANSACTION_FLAG_HIDE`

Mark the changes in a way that when later
[syncing](mailbox_syncing) the mailbox in this session,
`mailbox_sync_next()` won't return sync records for the changes done by
this transaction. This is primarily meant for flag and keyword changes;
you can't hide expunges. For example IMAP's `STORE FLAGS.SILENT` command
is implemented by setting this flag for the transaction.

### `MAILBOX_TRANSACTION_FLAG_EXTERNAL`

Changes done by this transaction should be marked as external changes.
Internal changes can be thought of as "change requests" that syncing
later finishes, while external changes are done immediately and syncing
ignores them.

Normally you would use this flag when you want to save or copy messages.

### `MAILBOX_TRANSACTION_FLAG_ASSIGN_UIDS`

Require assigning UIDs to saved/copied messages immediately. Normally this
is done only when it's easy (maildir: if dovecot-uidlist can be locked
without waiting, mbox: if mbox is already fully synced).

### `MAILBOX_TRANSACTION_FLAG_REFRESH`

Do a quick index refresh, so any recent flag/modseq changes done by
other Dovecot sessions will be visible. You shouldn't usually need this,
because usually you should have recently done a mailbox sync.

### `MAILBOX_TRANSACTION_FLAG_NO_CACHE_DEC`

Don't update caching decisions no matter what we do in this transaction
(useful for e.g. precaching).

### `MAILBOX_TRANSACTION_FLAG_SYNC`

Sync transaction describes changes to mailbox that already happened to
another mailbox with whom we're syncing with (dsync).

### `MAILBOX_TRANSACTION_FLAG_NO_NOTIFY`

Don't trigger any notifications for this transaction. This especially
means the notify plugin. This would normally be used only with
`MAILBOX_TRANSACTION_FLAG_SYNC`.

## Committing

Changes for a transaction are kept in memory until the transaction is
committed. If you want to cancel the changes, you can call
`mailbox_transaction_rollback()`. Transaction can be committed with
`mailbox_transaction_commit()`. If you want to know a bit more about
the results of the transaction, use
`mailbox_transaction_commit_get_changes()` instead. It returns a
change structure:

### `uid_validity`

UIDVALIDITY used by returned UIDs

### `saved_uids`

UIDs assigned to saved/copied mails. Typically they're in
an ascending order, unless you explicitly requested some specific
UIDs for mails while saving them (e.g. dsync does this).

### `ignored_modseq_changes`

Number of modseqs that couldn't be changed by `mail_update_modseq()`
calls, because they would have lowered the modseq.

### `changes_mask`

Bitmask of types of changes that occurred within this transaction.

### `no_read_perm`

User doesn't have read ACL for the mailbox, so don't show the
`uid_validity` / `saved_uids`.

## Deinitialization

Once you're done with reading the change structure, be sure to free the
memory used by it with `pool_unref(&changes->pool)`.

## Atomic Changes

`mailbox_transaction_set_max_modseq()` can be used to implement atomic
conditional flag changes. If message's modseq is higher than the given
max_modseq while transaction is being committed, the change isn't done
and the message's sequence number is added to the given array.
