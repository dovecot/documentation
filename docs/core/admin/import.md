---
layout: doc
title: Importing Mailboxes
---

# Importing Mailboxes

For importing mails, dovecot has the [[doveadm,import]] command.

::: warning
Do not use this tool for migrating mails to another system.

See [[link,migrating_mailboxes]] instead.
:::

The import command imports mails as is, and most importantly does not
preserve UIDs or check if the mail is already there. Message flags are
preserved.

## Importing Mails from Other Users

To import mail from another user in the system, you can do

```sh
doveadm import -U sourceuser -u destuser 'maildir:~/Maildir' Imported ALL
```

This will import all mails and folder structure from sourceuser to destuser,
under folder `Imported`.

This will require that both sourceuser and destuser have same system UID.

You can also use imap client to do the import, which lets you import mail
from users with different system UID, or users that reside on a remote system.

```sh
doveadm import -U sourceuser -u destuser imapc: Imported ALL
```

This assumes you have configured imap client. See
[[link,migration_mailboxes_imapc]] for details.

## Importing Mails from Filesystem

You can also import mails from a filesystem location:

```sh
doveadm import -u destuser maildir:/opt/backup/destuser/Maildir "" ALL
```

This will restore all mails from backup into mailbox root, with folder
structure.

The main difference to the previous example is that the `-U` parameter is
not given. This causes the source location to be opened as `destuser`.

Note that `destuser` must have read and privileges to the source location.

If you have only read privileges, you can try using in-memory indexes:

```sh
doveadm import -u destuser -p mail_index_path=MEMORY maildir:/opt/backup/destuser/Maildir "" ALL
```

## Merging Storages

In some disaster recovery cases you may end up having mails for the same user
in two different locations, and need to merge them. For example the storage
goes down and fixing it takes a long time, so during the fixing you can let the
users access their emails as an empty account, which can receive new mails.
Later on you can use [[doveadm,import]] to merge the mailboxes.

Note that there is no way to make this solution perfect:

* IMAP clients that have cached mails locally will delete their local caches
  and have to re-download mails later on.
* POP3 clients that leave mails on server will notice all the mails are gone,
  and delete their local UIDL caches. When old mails come back, they're
  re-downloaded as new emails (duplicates).

Also, there are 3 alternative ways of how mails can be imported into mailboxes:

1. Old recovered mails are imported on top of the newly received mails. The
   downside here is that mails may now be sorted in a weird order. If the IMAP
   client shows the mails in the saved order, the new received emails show up
   as oldest emails. Although this may not be an issue, since many IMAP clients
   sort the mails by either Date: header or the received timestamp (IMAP
   INTERNALDATE).
2. New mails are imported on top of the old recovered mails. This avoids the
   sorting problems, so it's likely the preferred method. The downside here is
   that the IMAP/POP3 clients will have to re-download also the newly delivered
   emails, as well as the old ones. Another issue with this is that some IMAP
   clients might not show the old recovered mails without manually rebuilding
   local caches, because the mails become inserted to the beginning of the
   folders, which isn't allowed by the IMAP protocol.

   * Another thing to keep mind here is that IMAP clients shouldn't see
     IMAP UIDs pointing to different emails before/after the merge. Otherwise
     their local cache could point to a different email, which could even
     cause the user to delete wrong messages. This shouldn't be an issue as
     long as new mail deliveries and all user access is disabled during the
     merging. The old mails have the old UIDs, and newly delivered mails
     would all have higher UIDs (because the UIDNEXT value is not shrunk
     during index rebuild that clears out the mailbox).

3. New recovered mails are imported under a separate `Recovered/` folder,
   i.e. there will be `Recovered/INBOX`, `Recovered/Sent`, etc. The user
   will need to manually merge the folders. The upside here is that POP3
   clients won't re-download any mails as duplicates, but otherwise it's not
   much different from the 1st case.

### Example

For the 2nd case ("New mails are imported on top of the old recovered mails")
where mail storage broke down, but a separate index storage is ok, and
index storage supports snapshots:

* Snapshot the current index volume at the time of breakage.

* Make sure [[setting,mailbox_list_iter_from_index_dir]] setting is enabled, so
  folder listing is done using the index volume rather than the mail volume.

* Mount a new empty mail volume.

  * The first time IMAP/POP3 client attempts to access an existing mail,
    Dovecot rebuilds the indexes for the folder. This makes the folder look
    empty. The folder structure is preserved, as long as the
    [[setting,mailbox_list_iter_from_index_dir]] setting is used.

* Once the original mail volume is recovered, first disable all user access
  and all new mail deliveries.

* Create another snapshot of the index volume.

* Mount the old mail volume to the original mountpoint.

* Replace the index volume with the first created snapshot. Now the storage
  looks exactly like it was at the time of breakage.

* Mount the new mail volume to some temporary mountpoint.

* Mount the second index snapshot to some temporary mountpoint.

* Use [[doveadm,import]] to recover new mails:

  ```sh
  doveadm import -u user@example.com \
    -p mail_index_path=/mnt/temp-index-storage/user \
    -p mail_control_path=/mnt/temp-index-storage/user \
    -p mailbox_list_iter_from_index_dir \
    sdbox:/mnt/temp-mail-storage/user "" all
  ```

  If you have other [[link,mail_location,mail location settings]], you may also
  want to specify them using some temporary locations. For example using
  [[setting,mail_volatile_path]], [[setting,mailbox_list_index_prefix]]:

  ```sh
  doveadm import -u user@example.com \
    -p mail_volatile_path=/tmp/doveadm-import/user \
    -p mailbox_list_index_prefix=/tmp/doveadm-import/user/dovecot.list.index
    # other settings
  ```

  Delete the directories after finishing the import.
