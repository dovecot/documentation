.. _howto-antispam_with_imapsieve:

========================================
Replacing antispam plugin with IMAPSieve
========================================

You will need at least pigeonhole v0.4.14 for this. If you have already
configured sieve, please adjust the following to match your setup.

Caveats and possible pitfalls
-----------------------------

-  INBOX name is case-sensitive

-  :ref:`IMAP Sieve <pigeonhole_plugin_imapsieve>`
   will **only** apply to IMAP. It **will not** apply to LDA or LMTP.
   Use
   :ref:`Sieve <sieve>`
   normally for LDA/LMTP.

-  With this configuration, moving mails will slow down due to learn
   being done per email. If you want to avoid this, you need to think of
   something else. Probably piping things into a FIFO or perhaps using a
   socket based worker might work better.

-  Please read :ref:`Sieve <sieve>` and :ref:`sieve configuration <sieve_configuration>`
   to understand sieve configuration better.

-  Please read
   :ref:`sieve_plugins`
   for more information about sieve extensions.

-  If you run Spamassassin trough Amavis and you use a virtual users
   setup, you should instead configure Spamassassin to use
   MySQL/PostgreSQL as a backend, unless you want a headache with file
   permissions and lock files. You can find instructions
   `here <http://www.iredmail.org/docs/store.spamassassin.bayes.in.sql.html>`_.
   In this case, the ``-u`` parameter passed to ``sa-learn`` (and the
   relevant sieve variables) is obsolete and can be safely removed.

-  Reloading dovecot doesn't activate changes in this configuration,
   you'll need to perform a full restart.

Changes:

-  2017/11/20 - Possibility of using spamc with SpamAssassin to mitigate
   multi-message delays

-  2017/05/05 - Recommendation about Virtual Users and using an SQL
   Backend. Added brief info about RoundCube.

-  2017/04/01 - Pass imap user to scripts.

-  2017/03/19 - Added rspamd scripts and mention about sieve plugins.

-  2017/02/13 - Improved documentation and added instructions for
   Spam->Trash. (Thanks for everyone who commented on mailing list)

-  2017/02/10 - Removed imap_stats (it's not needed).

-  2018/04/11 - Added notes about sa-learn/spamc and warning about sieve
   script location.
   
-  2021/09/01 - Tweak spamc scripts to not use mutually-exclusive parameters

Dovecot configuration
---------------------

::

   protocol imap {
     mail_plugins = $mail_plugins imap_sieve
   }

   plugin {
     sieve_plugins = sieve_imapsieve sieve_extprograms

     # From elsewhere to Spam folder
     imapsieve_mailbox1_name = Spam
     imapsieve_mailbox1_causes = COPY
     imapsieve_mailbox1_before = file:/usr/lib/dovecot/sieve/report-spam.sieve

     # From Spam folder to elsewhere
     imapsieve_mailbox2_name = *
     imapsieve_mailbox2_from = Spam
     imapsieve_mailbox2_causes = COPY
     imapsieve_mailbox2_before = file:/usr/lib/dovecot/sieve/report-ham.sieve

     sieve_pipe_bin_dir = /usr/lib/dovecot/sieve

     sieve_global_extensions = +vnd.dovecot.pipe +vnd.dovecot.environment
   }

Sieve scripts
-------------

.. caution::

   **You cannot run scripts anywhere you want**

   Sieve allows you to only run scripts under sieve_pipe_bin_dir. You
   can't use /usr/local/bin/my-sieve-filter.sh, you have to put the
   script under sieve_pipe_bin_dir and use my-sieve-filter.sh instead.

Create directory /usr/lib/dovecot/sieve and put following files to that:

report-spam.sieve

::

   require ["vnd.dovecot.pipe", "copy", "imapsieve", "environment", "variables"];

   if environment :matches "imap.user" "*" {
     set "username" "${1}";
   }

   pipe :copy "sa-learn-spam.sh" [ "${username}" ];

report-ham.sieve

::

   require ["vnd.dovecot.pipe", "copy", "imapsieve", "environment", "variables"];

   if environment :matches "imap.mailbox" "*" {
     set "mailbox" "${1}";
   }

   if string "${mailbox}" "Trash" {
     stop;
   }

   if environment :matches "imap.user" "*" {
     set "username" "${1}";
   }

   pipe :copy "sa-learn-ham.sh" [ "${username}" ];

Shell scripts
-------------

For spamassassin
~~~~~~~~~~~~~~~~

.. caution::

   **Untested**

   spamc interaction scripts are not tested yet.

sa-learn-spam.sh

.. code:: bash

   #!/bin/sh
   # you can also use tcp/ip here, consult spamc(1)
   exec /usr/bin/spamc -u ${1} -L spam

sa-learn-ham.sh

.. code:: bash

   #!/bin/sh
   # you can also use tcp/ip here, consult spamc(1)
   exec /usr/bin/spamc -u ${1} -L ham

You can also use sa-learn.

Note that using sa-learn often incurs significant start-up time for
every message. This can cause "lockout" of the user until all the
processes sequentially complete, potentially tens of seconds or minutes.
If spamd is being used and the administrator is willing to accept the
potential security issues of allowing unauthenticated learning of
spam/ham, spamd can be invoked with the --allow-tell option and spamc
with the --learntype= option. Please consult the man pages of spamd and
spamc for further details.

sa-learn-spam.sh

.. code:: bash

   #!/bin/sh
   exec /usr/bin/sa-learn -u ${1} --spam

sa-learn-ham.sh

.. code:: bash

   #!/bin/sh
   exec /usr/bin/sa-learn -u ${1} --ham

For dspam
~~~~~~~~~

sa-learn-spam.sh

.. code:: bash

   #!/bin/sh
   exec /usr/bin/dspam --client --user ${1} --class=spam --source=error

sa-learn-ham.sh

.. code:: bash

   #!/bin/sh
   exec /usr/bin/dspam --client --user ${1} --class=innocent --source=error

.. caution::

   **CRLF handling**

   dspam may fail to read the mail if it contains CRLF line endings, add
   the **Broken lineStripping** option in dspam.conf if needed.

For rspamd
~~~~~~~~~~

By default, rspamd does global learning. If you want per-user
classification, or something more complex, see
https://rspamd.com/doc/configuration/statistic.html

Alternative scripts can be found from
https://github.com/darix/dovecot-sieve-antispam-rspamd/

sa-learn-spam.sh

.. code:: bash

   #!/bin/sh
   exec /usr/bin/rspamc -h /run/rspamd/worker-controller.socket -P <secret> learn_spam

sa-learn-ham.sh

.. code:: bash

   #!/bin/sh
   exec /usr/bin/rspamc -h /run/rspamd/worker-controller.socket -P <secret> learn_ham

Before running following commands, make sure dovecot.conf has all the
sieve configuration you want. Then run following commands:

::

   sievec /usr/lib/dovecot/sieve/report-spam.sieve
   sievec /usr/lib/dovecot/sieve/report-ham.sieve
   chmod +x /usr/lib/dovecot/sieve/sa-learn-ham.sh /usr/lib/dovecot/sieve/sa-learn-spam.sh

Now your learn scripts should be invoked when you move mails between
folders.

Debugging
---------

To debug, you need to import "vnd.dovecot.debug" extension. Then you can
put, when required

::

   debug_log "something"

variables are supported in this.

RoundCube
---------

Recent versions of `RoundCube <https://roundcube.net/>`_ include a
`markasjunk2
plugin <https://plugins.roundcube.net/packages/johndoh/markasjunk2>`_
for allowing users to mark Spam/Ham in a convenient way. Please make
sure the Junk/Spam folder matches your configuration.
