.. _virtual_plugin:

==============
Virtual Plugin
==============

Virtual mailboxes
=================

First, you'll have to load the plugin:

.. code-block:: none

  mail_plugins = $mail_plugins virtual

Namespace configuration
=======================

Then, you'll have to create a :ref:`namespaces` for the virtual mailboxes, for example:

.. code-block:: none

  namespace {
    prefix = virtual/
    separator = /
    location = virtual:~/Maildir/virtual
  }

After this you can create virtual mailboxes under ``~/Maildir/virtual``. By
default it uses the `fs` layout, so you can create directories such as:

* INBOX: ``~/Maildir/virtual/INBOX/``
* Sub/mailbox: ``~/Maildir/virtual/Sub/mailbox/``

If you prefer to use Maildir++ layout instead, you can simply append
``:LAYOUT=maildir++`` to the location.

Virtual mailbox configuration
=============================

For each virtual directory you need to create a ``dovecot-virtual`` file. Its
syntax is like:

.. code-block:: none

  <1+ mailbox patterns>
    <search program>
  [<more mailbox patterns>
    <search program for these mailboxes>
  [etc..]]

Mailbox patterns can contain `IMAP LIST-compatible
<https://tools.ietf.org/html/rfc3501#section-6.3.8>`_ ``*`` and ``%``
wildcards. They are currently evaluated only when the virtual mailbox is being
selected, so if more mailboxes are created during that they aren't noticed.

``*`` wildcard matches only one namespace at a time based on the namespace
prefix. For example if you have namespaces with an empty prefix and a prefix
``mail/``:

* ``*`` matches only mailboxes from the namespace with empty prefix
* ``mail*`` matches mailboxes beginning with name `mail` from the namespace
  with empty prefix
* ``mail/*`` matches only mailboxes from the mail/ namespace

Beware that ``*`` will not match any mailbox which already has a more
specialised match!

The mailbox names have special prefixes:

* ``-``: Don't include this mailbox.
* ``+``: Drop \Recent flags from the backend mailbox when opening it.
* ``!``: Save new mails to this mailbox (see below).

If you need to actually include a mailbox name that contains such prefix, you
can currently just kludge it by using ``+`` prefix (if you don't care about the
\Recent flags) and adding the mailbox name after that (e.g. ``+-box``).

Search program is compatible with `IMAP SEARCH command
<https://tools.ietf.org/html/rfc3501#section-6.4.4>`_. Besides the standard
SEARCH key you may want to use X-MAILBOX key which matches the message's
original mailbox.

.. Note:: The leading whitespace in front of search specifications.

Saving mails to virtual mailboxes
=================================

It's possible to configure virtual mailbox so that it's possible to save/copy
messages there. This is done by specifying a single physical mailbox where the
message is really saved by prefixing it with ``!``, e.g.:

.. code-block:: none

  !INBOX
  work/*
  unseen

.. Note::

  However that nothing guarantees that the saved mail will actually show up in
  the virtual mailbox. If a message was saved with \Seen flag to the above
  virtual mailbox, it wouldn't show up there. This also means it's problematic
  to support IMAP UIDPLUS extension for virtual mailboxes, and currently
  Dovecot doesn't even try (no [APPENDUID] or [COPYUID] is sent to client).

The ``!-prefixed`` virtual mailbox is also selected from; you don't need to
list it again without an ! or you'll get two copies of your messages in the
virtual mailbox.

Sieve filters with virtual mailboxes
====================================

Using the sieve plugin with virtual mailboxes will cause dovecot to output a
fatal exception error in it's logs and crash. This is because sieve can't tell
the difference between a virtual location and a maildir/mbox location due to
the way it detects actions in the mailboxes.

If you use virtual mailboxes that are configured in sieve, make sure that they
point to the namespace which has a maildir/mbox location and a unique prefix.
If you don't, sieve will crash trying to copy a message to a virtual mailbox.

Mailbox selection base on METADATA
==================================

.. versionadded:: v2.2.22

Instead of a mailbox name, you can specify a metadata filter:

.. code-block:: none

  [-]/<metadata-entry-name>:<value-wildcard>

There can be multiple metadata entries. All the entries must match.

For example:

.. code-block:: none

  *
  /private/vendor/vendor.dovecot/virtual:*
  -/private/vendor/vendor.dovecot/virtual:ignore
    all

This matches all mailboxes, which contain a virtual METADATA entry that has any
value except `ignore`.

Examples
========

* List all messages with \Deleted flag in all mailboxes:

.. code-block:: none

  # ~/Maildir/virtual/Trash/dovecot-virtual
  *
  deleted

* List all unseen INBOX and work/* messages:

.. code-block:: none

  # ~/Maildir/virtual/unseen/dovecot-virtual
  INBOX
  work/*
  unseen

* Create a GMail-style `conversation view` for INBOX which shows all threads
  that have messages in INBOX, but shows all messages in the thread regardless
  of in what mailbox they physically exist in:

.. code-block:: none

  # ~/Maildir/virtual/all/dovecot-virtual
  *
    all

.. code-block:: none

  # ~/Maildir/virtual/INBOX/dovecot-virtual
  virtual/all
    inthread refs x-mailbox INBOX

* Create a mailbox containing messages from all mailboxes except Trash and its
  children:

.. code-block:: none

  # ~/Maildir/virtual/all/dovecot-virtual
  *
  -Trash
  -Trash/*
    all

* Create a virtual Sentmail folder that includes Sent*:

.. code-block:: none

  # ~/Maildir/virtual/Sentmail/dovecot-virtual
  Sent*
    all

* List messages from past 48 hours (syntax is in seconds):

.. code-block:: none

  # ~/Maildir/virtual/recent/dovecot-virtual
  INBOX
  work/*
    all younger 172800

List unseen messages from foo and flagged messages from all mailboxes
(including foo):

.. code-block:: none

  # ~/Maildir/virtual/example/dovecot-virtual
  foo
    or unseen flagged
  *
    flagged

Virtual POP3 INBOX
==================

If you want POP3 INBOX to contain some or all mailboxes, you can do this in the
following way:

Namespace configuration:

.. code-block:: none

  # The default namespace that is visible to IMAP clients
  namespace inbox {
    prefix =
    separator = /
    list = yes
  }

  # Virtual namespace for the virtual INBOX. Use a global directory for dovecot-virtual files.
  namespace virtual {
    prefix = virtual/
    separator = /
    location = virtual:/etc/dovecot/virtual:INDEX=~/Maildir/virtual
    list = no
    hidden = yes
  }

  # Copy of the inbox namespace. We'll use this in dovecot-virtual file.
  namespace real {
    prefix = RealMails/
    separator = /
    list = no
    hidden = yes
  }

.. Note::

  none of the namespaces have inbox=yes. This is because for IMAP users you
  want the inbox namespace to have ``inbox=yes``, but for POP3 users you want
  the virtual namespace to have ``inbox=yes``. This requires setting the
  ``inbox=yes`` in userdb extra fields. For example with MySQL you can can do
  this like:

.. code-block:: none

  ser_query = SELECT ..., \
    CASE '%s' WHEN 'pop3' THEN NULL ELSE 'yes' END AS 'namespace/inbox/inbox', \
    CASE '%s' WHEN 'pop3' THEN 'yes' ELSE NULL END AS 'namespace/virtual/inbox' \
    WHERE ...

Finally specify what the virtual INBOX looks like for POP3 users:

``/etc/dovecot/virtual/INBOX/dovecot-virtual`` :

.. code-block:: none

  RealMails
  RealMails/*
  -RealMails/Trash
  -RealMails/Trash/*
  -RealMails/Spam
    all

You'll have to use the ``RealMails/`` prefix if you want to use ``*`` wildcard,
otherwise it would match INBOX, which in turn would again lead to the virtual
INBOX and that would create a loop.

Also to avoid accidental POP3 UIDL changes, you shouldn't base the UIDLs on
IMAP UIDs. Instead use for GUIDs (with maildir the same as base filename):

.. code-block:: none

  pop3_uidl_format = %g
