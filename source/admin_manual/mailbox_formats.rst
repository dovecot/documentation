.. _mailbox_formats:

###############
Mailbox Formats
###############

Mailbox formats supported by Dovecot:

+------------------------+-------------+---------------------------------------+
| Name                   | Tag         | Description                           |
+========================+=============+=======================================+
| :ref:`obox             | ``obox``    | OX Dovecot Pro object storage mailbox |
| <obox_settings>`       |             | format. (Pro only)                    |
+------------------------+-------------+---------------------------------------+
| :ref:`mbox             | ``mbox``    | Traditional UNIX mailbox format.      |
| <mbox_mbox_format>`    |             | Users' INBOX mailboxes are commonly   |
|                        |             | stored in ``/var/spool/mail`` or      |
|                        |             | ``/var/mail`` directory. Single file  |
|                        |             | contains multiple messages.           |
+------------------------+-------------+---------------------------------------+
| :ref:`Maildir          | ``maildir`` | One file contains one message. A      |
| <maildir_mbox_format>` |             | reliable choice since files are never |
|                        |             | modified and all operations are       |
|                        |             | atomic. The top-level Maildir         |
|                        |             | directory contains the                |
|                        |             | ``Maildir/cur``, ``Maildir/new``, and |
|                        |             | ``Maildir/tmp`` subdirectories.       |
+------------------------+-------------+------------------+--------------------+
| :ref:`dbox             | ``sdbox``   | **single-dbox**, | Dovecot's own high |
| <dbox_mbox_format>`    |             | one message per  | performance        |
|                        |             | file.            | mailbox format.    |
|                        +-------------+------------------+ Messages are       |
|                        | ``mdbox``   | **multi-dbox**,  | stored in one or   |
|                        |             | multiple         | more files, each   |
|                        |             | messages per     | containing one or  |
|                        |             | file.            | more messages.     |
+------------------------+-------------+------------------+--------------------+
| :ref:`imapc            | ``imapc``   | Use remote IMAP server as mail        |
| <imapc_mbox_format>`   |             | storage.                              |
+------------------------+-------------+---------------------------------------+
| pop3c                  | ``pop3c``   | Use remote POP3 server as mail        |
|                        |             | storage.                              |
+------------------------+-------------+---------------------------------------+

The Tag column indicates the tag which is used at the beginning of a
:ref:`mailbox location specification <mail_location_settings>`.

.. toctree::
   :maxdepth: 1
   :glob:

   mailbox_formats/*
