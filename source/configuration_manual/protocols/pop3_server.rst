.. _pop3_server:

========================
Dovecot as a POP3 server
========================

Dovecot was primarily designed to be an IMAP server, so although it works fine
as a POP3 server, it's not really optimized for that.

Maildir Performance
===================

The main problem with Dovecot's POP3 implementation with Maildir is how to get
messages' size fast enough. The POP3 specification requires that the sizes are
reported exactly, not just approximately. This means that linefeeds must be
counted as ``CR+LF`` characters. Normally with Maildir the linefeeds are stored
as plain LF characters, which means that simply getting the file size would
produce the wrong POP3 message size. Some Maildir POP3 servers do this anyway
and violate the POP3 specification.

Dovecot returns correct message sizes by reading the entire message and
counting the linefeeds correctly. After this is done, the `virtual size` is
stored into dovecot-uidlist file and future calculations can be avoided by
simply looking up the cached value.

You can also avoid the initial message size calculation by storing the size
directly into the filename. You can do this by appending ,``W=<size>`` at the
end of the base filename.

For example ``1199932653.M583975P6568.host``,``W=2211:2``, is a file whose
virtual size is 2211 bytes (and real size somewhat smaller). Note that this
must not be done for existing files, only to newly delivered mails.

If Dovecot's LDA is used, dovecot-uidlist and the index files are updated upon
message arrival, therefore there will be no message-size performance issues.

``pop3_fast_size_lookups=yes`` setting uses the virtual message sizes when
they're already available, but fallbacks to using the physical message sizes
(violating POP3 specifications, but then again a lot of POP3 servers do that).

mbox Performance
================

Index files are quite useless if your users don't keep mails in the server.
They get first updated when the POP3 session starts to include all the
messages, and after the user has deleted all the mails, they again get updated
to contain zero mails. With this kind of a session the index reads and writes
could have been avoided if the index files had just been completely disabled.

You may want to try how performance changes if you disable indexes for POP3
users. You can also try preserving indexes but try different values for
``mbox_min_index_size`` setting.

Do not disable indexing if there are users that do not delete messages after
downloading them. Also, if you use Dovecot LDA, indexes may be helpful to have
fast access to the message sizes.

Session locking
===============

By default Dovecot allows multiple POP3 connections to the same mailbox. This
is (was?) especially useful for dialup connections which die in the middle of
the download, because the half-dead connections won't keep the mailbox locked.

Setting ``pop3_lock_session=yes`` makes Dovecot lock the mailbox for the whole
session. This is also what the POP3 :rfc:`1939`
specifies that should be done. If
another connection comes while the mailbox is locked, Dovecot waits until the
locking times out (2 minutes with Maildir, ``mbox_lock_timeout`` with mbox). In
future there will be a separate ``pop3_lock_timeout`` setting which allows
timing out sooner.

Flag changes
============

By default when a message is RETRed, \Seen flag is added to it. POP3 itself
doesn't support flags, but if the mailbox is opened with IMAP (eg. from
webmail) it's shown as seen. You can disable this (to get better performance)
with ``pop3_no_flag_updates=yes``.

POP3 client workarounds
=======================

pop3_client_workarounds setting allows you to set some workarounds to avoid
POP3 clients breaking with some broken mails.

Following are supported

* outlook-no-nuls - Converts 0x0 in data to 0x80
* oe-ns-eoh - Add missing end of header line

.. _pop3_server_uidl_format:

UIDL format
===========

UIDLs are used by POP3 clients to keep track of what messages they've
downloaded, typically only if you've enabled keep messages in server option. If
the UIDL changes, the existing messages are re-downloaded as new messages,
which the users don't really appreciate.

Dovecot supports multiple different ways to set the UIDL format, mostly to make
migrations from other POP3 servers transparent by preserving the old UIDL
values. See :ref:`migrating_mailboxes` for how to set
the UIDLs to be compatible with your previous POP3 server.

For new POP3 servers, the easiest way to set up UIDLs is to use IMAP's
UIDVALIDITY and UID values. The default in Dovecot v1.1+ is:

.. code-block:: none

  pop3_uidl_format = %08Xu%08Xv

Another good default is to use the message's global UID:

.. code-block:: none

  pop3_uidl_format = %g

However, note that GUIDs may not be unique, as the GUID does not change when a
message is copied. (While copying is not possible using only POP3, it can be
done using IMAP, Sieve, or doveadm.)

Some formats, such as the previous default ``%v.%u``, seem to have problems
with Outlook 2003.

MD5 UIDL format (mbox-only)
^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

  pop3_uidl_format = %m

This works by getting the MD5 sum of a couple of message headers that uniquely
identify the message. The one good thing about MD5 format is that it doesn't
rely on the IMAP UID or UIDVALIDITY value. This allows you to modify the mbox
files in ways that Dovecot doesn't like, without causing the UIDLs to change.
For example:

* Inserting messages in the middle of mbox files (eg. restoring mbox files from
  backups can cause ``Expunged message reappeared`` errors)
* Reordering messages inside mbox
* :ref:`Other random problems <known_issues-mbox_problems>` causing UID
  renumbering (although you should figure out why they're happening)

The MD5 summing method however doesn't work well if you receive two identical
messages. Usually the MD5 sum is taken from these headers:

* The first Received: header
* Delivered-To: header

Normally there won't be a problem, because the MTA adds a unique identifier to
the first Received: header. If the same message is sent to multiple users in
one delivery, the Delivered-To: header is still different, making the MD5 sum
different.

Except the MTA can be configured to support aliases, so for example sending the
mail to both root@ and webmail@ aliases causes the message to be delivered to
the same user, with identical Received: and Delivered-To: headers. The messages
really are identical, so their MD5 sums are also identical, and that can cause
some POP3 clients to keep downloading the messages over and over again, never
deleting them.

To avoid this, there's also a 3rd header that is included in the MD5 sum
calculation:

* X-Delivery-ID: header

If you use :ref:`lda` or IMAP APPEND
and ``pop3_uidl_format = %m`` it always appends the X-Delivery-ID: header to
saved mailbox. Any existing X-Delivery-ID: headers in the saved mails are
dropped.
