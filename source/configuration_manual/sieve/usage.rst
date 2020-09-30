.. _sieve_usage:

======================
Pigeonhole Sieve Usage
======================

Mailbox Names
-------------

Regarding separators, you need to specify mailbox names in Sieve scripts
the same way as IMAP clients see them. For example if you want to
deliver mail to the "Customers" mailbox which exists under "Work"
mailbox:

-  Namespace with :ref:`prefix="" <setting-namespace_prefix>`, :ref:`separator=. <setting-namespace_separator>` (Maildir default):

::

   require "fileinto";
   fileinto "Work.Customers";

-  Namespace with :ref:`prefix=INBOX. <setting-namespace_prefix>`, :ref:`separator=. <setting-namespace_separator>` (Courier
   migration):

::

   require "fileinto";
   fileinto "INBOX.Work.Customers";

-  Namespace with :ref:`prefix="" <setting-namespace_prefix>`, :ref:`separator=/ <setting-namespace_separator>` (mbox, dbox default):

::

   require "fileinto";
   fileinto "Work/Customers";

However, Sieve uses UTF8 encoding for mailbox names, while IMAP uses
modified UTF7. This means that non-ASCII characters contained in mailbox
names are represented differently between IMAP and Sieve scripts.

.. _sieve_usage-vacation_auto_reply:

Vacation auto-reply
-------------------

:ref:`Vacation <pigeonhole_extension_vacation>` uses envelope sender and envelope recipient. They're taken
from:

-  Envelope sender: -f parameter to dovecot-lda if given, otherwise
   Return-Path: header in the message.

-  Envelope recipient: -a parameter to dovecot-lda if given, otherwise
   -d parameter to dovecot-lda. If neither is given (delivering to
   system users), the ``$USER`` environment is used.

The vacation replies are sent to the envelope sender.

List of autoreplied senders is stored in ``.dovecot.lda-dupes`` file in
user's home directory. When you're testing the vacation feature, it's
easy to forget that the reply is sent only once in the number of
configured days. If you've problems getting the vacation reply, try
deleting this file. If that didn't help, make sure the problem isn't
related to sending mails in general by trying the "reject" Sieve
command.

The automatic replies aren't sent if any of the following is true:

-  The envelope sender is not available (equal to <>)

-  The envelope sender and envelope recipient are the same

-  The sender recently (within :days days; default 7) got a reply from
   the same vacation command

-  The message contains at least one of the mailing list headers
   "list-id", "list-owner", "list-subscribe", "list-post",
   "list-unsubscribe", "list-help", or "list-archive"

-  Auto-Submitted: header exists with any value except "no"

-  Precedence: header exists with value "junk", "bulk" or "list"

-  The envelope sender is considered a system address, which either:

   -  begins with "MAILER-DAEMON" (case-insensitive),

   -  begins with "LISTSERV" (case-insensitive),

   -  begins with "majordomo" (case-insensitive),

   -  contains the string "-request" anywhere within it
      (case-sensitive), or

   -  begins with "owner-" (case-sensitive)

-  The envelope recipient and alternative addresses specified with the
   vacation command's :addresses tag are not found in the message's To:,
   Cc:, Bcc:, Resent-To:, Resent-Cc: or Resent-Bcc: fields.

.. _sieve_usage-compiling_sieve_script:

Manually Compiling Sieve Scripts
--------------------------------

When the Sieve plugin executes a script for the first time (or after it
has been changed), it is compiled and stored in binary form (byte code)
to avoid compiling the script again for each subsequent mail delivery.
The Pigeonhole Sieve implementation uses the ``.svbin`` extension to
store compiled Sieve scripts (e.g. ``.dovecot.svbin``). To store the
binary, the plugin needs write access in the directory in which the
script is located.

A problem occurs when a global script is encountered by the plugin. For
security reasons, global script directories are not supposed to be
writable by the user. Therefore, the plugin cannot store the binary when
the script is first compiled. Note that this doesn't mean that the old
compiled version of the script is used when the binary cannot be
written: it compiles and uses the current script version. The only real
problem is that the plugin will not be able to update the binary on
disk, meaning that the global script needs to be recompiled each time it
needs to be executed, i.e. for every incoming message, which is
inefficient.

To mitigate this problem, the administrator must manually pre-compile
global scripts using the ``sievec`` command line tool. For example:

::

   sievec /var/lib/dovecot/sieve/global/

This is necessary for scripts listed in the :ref:`plugin-sieve-setting-sieve_global_path`,
:ref:`plugin-sieve-setting-sieve_before` and :ref:`plugin-sieve-setting-sieve_after` settings.
For global scripts that are only included in other scripts using the Sieve include extension,
this step is not necessary, since included scripts are incorporated into
the binary produced for the main script.

Compile and Runtime Logging
---------------------------

Log messages produced during script compilation or during script
execution are written to two locations by the LDA Sieve plugin:

-  A log file is written in the same directory as the user's main
   private script (as specified by the :ref:`plugin-sieve-setting-sieve` setting). This log file
   bears the name of that script file appended with ".log", e.g.
   ``.dovecot.sieve.log``. If there are errors or warnings in the
   script, the messages are appended to that log file until it
   eventually grows too large (>10 kB currently). When that happens, the
   old log file is moved to a ".log.0" file and an empty log file is
   started. Informational messages are not written to this log file and
   the log file is not created until messages are actually logged, i.e.
   when an error or warning is produced. The log file name can be overriden with
   the :ref:`plugin-sieve-setting-sieve_user_log` setting.

-  Messages that could be of interest to the system administrator are
   also written to the Dovecot logging facility (usually syslog). This
   includes informational messages that indicate what actions are
   executed on incoming messages. Compile errors encountered in the
   user's private script are not logged here.
