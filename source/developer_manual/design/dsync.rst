.. _doveadm_dsync:

============
Dsync Design
============

FIXME: This describes the design for v2.0/v2.1. The v2.2 design is
somewhat different.

Two-way synchronization
-----------------------

dsync attempts to preserve all changes done by both sides of the synced
mailboxes.

Mailbox list
------------

Mailboxes have 128 bit globally unique IDs, which are used for figuring
out when two mailboxes should actually be synchronized. This solves two
major problems:

-  If mailbox has been renamed in one side, dsync finds it because its
   GUID hasn't changed.

-  If mailbox has been deleted and recreated, dsync doesn't attempt to
   sync it because it's a different mailbox.

Then there's the problem of how to correctly sync mailbox renames and
deletions. How do you know which side of the sync has the most recent
name for the mailbox? How do you know if one side had deleted mailbox,
or if the other side had created it? To solve these problems, Dovecot
v2.0 created a "mailbox log", which adds a record with mailbox GUID and
timestamp whenever mailbox is renamed or deleted. So:

-  If mailbox has different names on two sides, its "last renamed"
   timestamp is looked up from the mailbox list index. The side with the
   most recent timestamp is assumed to contain the newer name and the
   other side's mailbox is renamed to it.

   -  If neither side has a "last renamed" timestamp, one side is
      picked. This shouldn't happen, except when mailbox log is deleted
      for some reason or if the renaming is done outside Dovecot.

-  If mailbox exists only on one side, the other side checks if mailbox
   log contains a delete record for its GUID. If there is one, the
   mailbox is deleted from the other side. If there's not, the mailbox
   is created and synced.

-  Subscriptions and unsubscriptions are synced in a similar way. But
   because it's possible to be subscribed to nonexistent mailboxes,
   mailbox log can't contain mailbox GUIDs for them. Instead the first
   128 bits of SHA1 of mailbox name are used. Collisions for mailbox
   names are highly unlikely, but even if one happens, the worst that
   can happen is that user gets unsubscribed from wrong mailbox.

dsync writes timestamps to changelog using the original timestamps, so
that dsync's changes won't override changes done by user during sync.

Mailbox
-------

When saving new mails, dsync preserves all of their immutable state:

-  GUID

-  Received date

-  Save date

-  Message contents

It also attempts preserve IMAP UID. This works as long as the other side
hasn't already used the UID for another mail. If it has, dsync doesn't
attempt to preserve the UID, because an IMAP client might have already
seen the UID and cached another mail's contents for it. IMAP requires
that message's contents must never change, so UIDs can't be reused. So
whenever an UID conflict happens, dsync gives messages in both sides a
new UID, because it can't know which message the client had seen, or
perhaps user used two clients and both saw a different message. (This
assumes a master/slave replication use case for dsync.)

The mutable metadata that dsync preserves is:

-  Message flags and keywords

-  Modification sequences (modseqs)

Flags and keywords are synced based on modseqs. Whichever side has a
higher modseq for the message, its flags and keywords are synced to the
other side. Currently there's no per-flag or per-keyword
synchronization, so that if one side had added \\Seen flag and other
side had added \\Answered flag, one of them would be dropped.

Finding what to sync
--------------------

dsync can run in full mode or fast mode. Full mode means it goes through
all messages in all mailboxes, making sure everything is fully
synchronized. In fast mode it relies on uidvalidity, uid-next and
highest-modseq values to find out changes. If any of the values changed,
the mailbox is included in sync.

FIXME: A superfast mode should still be implemented, where once a
mailbox is selected for syncing, it should sync only mails whose modseq
is higher than a given one. This would improve performance and network
traffic with large mailboxes.

Copy optimizations
------------------

Before dsync actually starts syncing anything, it first fetched a list
of all to-be-synced messages and adds them to a GUID -> message hash
table. Whenever dsync needs to sync a new message to the other side, it
first checks if the message's GUID already exists on the other side. If
it does, it starts a message copy operation instead of a full save. It's
possible that this copy operation fails if the message just gets
expunged from the other side, so there needs to be fallback handling for
this. If the message exists in multiple mailboxes, a copy from the next
mailbox is attempted. If all of them fail, dsync fallbacks to saving the
message.

FIXME: This optimization currently works only in full sync mode. If this
were to work in fast sync mode, the full mailbox list would have to be
looked up from local side. And this would slow it down..
