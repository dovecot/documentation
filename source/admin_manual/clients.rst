=============
Client issues
=============

.. warning::

  This page is copied from old wiki and may contain old information.
  If you do find client(s) that need special configuration, or no longer
  need it, please let us know.

It seems to be quite difficult to implement a working IMAP client. `Best
Practices for Implementing an IMAP
Client <http://www.imapwiki.org/ClientImplementation>`__ tries to help
you with it.

-------------
Negative UIDs
-------------

::

   Invalid messageset: 1181461470:-1181461446.

IMAP uses unsigned 32bit integers for unique message identifiers.
Unfortunately a lot of IMAP clients use 32bit signed integers, which
means that if the UIDs go higher than 2147483647, they'll wrap to
negative integers. This causes errors such as above.

However normally the UIDs should never go that high, so it's possible to
avoid this problem.

Earlier Dovecot versions had bugs which could cause X-UID: headers in
incoming messages to grow the UIDs too high. Some spam messages
especially contained these intentionally broken X-UID: headers.

With newer Dovecot versions these broken X-UID: headers aren't
practically ever used. It happens only if the mail has a valid
X-IMAPbase: header, X-UID: header and the mail is written to an empty
mbox file. Note that this can happen only new mboxes, because expunging
all messages in a mailbox causes Dovecot to create a metadata message at
the beginning of the mbox file.

In any case it's still a good idea to filter out X-UID: and other
metadata headers in your MDA. :ref:`Dovecot's deliver <lda>` does
this internally. See :ref:`known_issues-mbox_problems` for a list
of headers to filter out.

Fixing
======

Fixing is done by letting Dovecot update UIDVALIDITY value and recreate
the UIDs beginning from one. This means that client's local cache will
be invalidated and the client will be required to download all the
messages again.

mbox
----

Delete Dovecot's index files (eg. ``.imap/INBOX/``) and X-IMAP: and
X-IMAPbase: headers from the mbox file.

Maildir
-------

This should really never be a problem with Maildir. If however you have
managed to cause it somehow (by receiving 2 billion mails?), you can
recreate the UIDs by deleting ``dovecot-uidlist`` file.

------------------
Some known clients
------------------

Appsuite webmail
================

Works fine.


Apple Mail.app
==============

On Mac OS X Leopard 10.5 Mail.app appears to support
subscribe/unsubscribe by right clicking on a mailbox, selecting 'Get
Account Info' and selecting 'Subscription List' from tabs. This however
doesn't really work with any IMAP server.

Apple Mail 3.6 (that comes with OS X 10.5 Leopard) supports
subscribing/unsubscribing to folders in the public namespace.

Outlook
=======

-  You should enable :dovecot_core:ref:`pop3_client_workarounds =
   outlook-no-nuls <pop3_client_workarounds>` workaround with POP3.

-  If some Outlook users don't see new or sent mails in the appropriate
   folders after a migration from UW IMAPd even if they are visible in
   other clients (e.g. Roundcube, Thunderbird, or on the disk itself),
   and you get the error message "BAD Error in IMAP command UID: Invalid
   UID messageset" in the log or rawlog: It helps to remove the
   problematic IMAP account completely from Outlook and recreating it
   again there. It speaks a different IMAP afterwards, so there are
   reasons to believe it caches the details of some server on the first
   connect and doesn't refresh them even if you change the server's
   hostname in the account settings.

Outlook Express 6
=================

-  Using "Headers only" synchronization is buggy and can cause "Message
   is no longer available on this server" error when opening a mail.
   This isn't Dovecot specific problem, and I'm not aware of any
   possible workarounds at the moment for this in server side.

-  You should enable :dovecot_core:ref:`imap_client_workarounds =
   delay-newmail <imap_client_workarounds>` workarounds for IMAP.

-  You should enable :dovecot_core:ref:`pop3_client_workarounds =
   outlook-no-nuls oe-ns-eoh <pop3_client_workarounds>` workarounds
   for POP3.

Netscape Mail
=============

I'm not actually sure what version exactly this refers to.

-  You should enable :dovecot_core:ref:`pop3_client_workarounds =
   oe-ns-eoh <pop3_client_workarounds>` workaround for POP3.

Evolution
=========

-  Some versions don't support creating subfolders with mbox format.
   Evolution in Ubuntu Gutsy, 2.12.0-0ubuntu5, does support creating
   subfolders, at least when the parent folder is empty.

Mulberry
========

Seems to be OK.

Claws-mail
==========

Everything works perfectly with Dovecot.

Thunderbird
===========

-  If you're using
   :ref:`mbox <mbox_mbox_format>`,
   :ref:`dbox <dbox_mbox_format>` or
   :ref:`Maildir <maildir_mbox_format>` with ``:LAYOUT=fs`` ,

   -  You should enable :dovecot_core:ref:`imap_client_workarounds =
      tb-extra-mailbox-sep <imap_client_workarounds>` workaround for IMAP.
      `Bug
      report <https://bugzilla.mozilla.org/show_bug.cgi?id=29926>`__.

-  If you're using :ref:`mbox <mbox_mbox_format>`

   -  If you are not using a technique to allow folders that contain
      both sub-folders and messages (e.g. see :ref:`mbox_child_folders`)
      then you will have to disable "Server supports folders that
      contain sub-folders and messages" setting from Thunderbird.
      `Enhancement
      request <https://bugzilla.mozilla.org/show_bug.cgi?id=284933>`__.

-  Versions of Thunderbird from at least 17 (possibly earlier) up to
   24.0 display incorrect new mail counts in the New Mail notification
   box. This is due to a bug in Thunderbird's handling of the CONDSTORE
   extension. See `Bug
   Report <https://bugzilla.mozilla.org/show_bug.cgi?id=885220>`__ for
   details and a client-side workaround.

Mutt
====

-  New mutt versions supporting IDLE command will hang with Dovecot
   versions earlier than v1.0beta3. Upgrade Dovecot or disable IDLE by
   setting imap_idle=no in .muttrc.

-  `Using mutt with IMAP <http://www.mutt.org/doc/manual/#imap>`__

Pine
====

Seems to be OK.

SquirrelMail
============

-  Configuration asks IMAP server name for some workarounds. There has
   been a Dovecot option since 1.4.6 and 1.5.1. For older SquirrelMail
   versions, select the "other" option and remove the default
   INBOX-prefix.

Horde IMP
=========

Dovecot namespace detection works automatically with any recent version
of IMP (4.1+).

Quota support is now integrated into the 'imap' driver (as of
horde-groupware V1.2), an example config of /imp/config/servers.php is:

::

   $servers['imap'] = array(
       'name' => 'IMAP Server',
       'server' => 'localhost',
       'hordeauth' => false,
       'protocol' => 'imap/notls',
       'port' => 143,
       'quota' => array('driver'=>'imap'),
   );

RoundCube Webmail
=================

Works fine.

@Mail Webmail
=============

Uses the namespace returned via Dovecot, full support via IMAP/POP3
using `@Mail <http://atmail.com/>`__. Can also read mailbox quota via
the getquotaroot IMAP command.

RainLoop Webmail
================

Works fine.
