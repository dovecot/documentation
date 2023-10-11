.. _howto-dovecot_lda_postfix:

Dovecot LDA with Postfix
========================

This page contains only information specific to using LDA with Postfix,
see :ref:`LDA <lda>` for more information about using the LDA itself.

System users
------------

If you wish you use ``dovecot-lda`` for all system users on a single
domain mail host you can do it by editing ``mailbox_command`` parameter
in

``/etc/postfix/main.cf``
(`postconf(5) <http://www.postfix.org/postconf.5.html>`__):

::

   mailbox_command = /usr/local/libexec/dovecot/dovecot-lda -f "$SENDER" -a "$RECIPIENT"
   #  or
   mailbox_command = /usr/libexec/dovecot/dovecot-lda -f "$SENDER" -a "$RECIPIENT"
   #  or
   mailbox_command = /usr/lib/dovecot/dovecot-lda -f "$SENDER" -a "$RECIPIENT"
   #  or wherever it was installed in your system.

Then run ``postfix reload``.

-  This command doesn't do a
   :ref:`userdb <authentication-user_database>`
   lookup. If you want that (e.g. for per-user quota lookups) you need
   to add ``-d "$USER"`` parameter.

-  Postfix runs ``mailbox_command`` with both the uid and gid of the
   destination user. This may not allow ``dovecot-lda`` to write a lock
   file in ``/var/mail``. When this directory is writable by a
   privileged group (say ``main``, see the option
   :dovecot_core:ref:`mail_privileged_group`), we can use the setgid permission bit on
   the ``dovecot-lda`` executable:

   ::

         # chgrp mail /usr/lib/dovecot/dovecot-lda
         # chmod 2755 /usr/lib/dovecot/dovecot-lda

   Alas these permission will disappear if you update dovecot. A more
   robust way to do so is to compile a relay program
   ``/etc/postfix/dovecot-lda-relay`` that has the setgid permission and
   execs the real ``dovecot-lda``.

   ::

         # cd /etc/postfix
         # cat >dovecot-lda-relay.c <<EOF
           #include <unistd.h>
           char *pgm = "/usr/lib/dovecot/dovecot-lda";  /* wherever dovecot-lda is located */
           int main(int argc, char**argv) { argv[0]=pgm; execv(pgm,argv); return 10; }
         EOF
         # gcc -o dovecot-lda-relay dovecot-lda-relay.c
         # chown root:mail dovecot-lda-relay
         # chmod 2755 dovecot-lda-relay

   Then, simply invoke ``/etc/postfix/dovecot-lda-relay`` instead of
   ``dovecot-lda`` in ``mailbox_command``.

-  Postfix's ``mailbox_size_limit`` setting applies to all files that
   are written via dovecot-lda. The default is 50 MB, so dovecot-lda
   can't write **any** files larger than that, including mbox files or
   log files. This shows up only in Dovecot's logs:

   ::

      dovecot-lda(user): write() failed with mbox file /home/user/mail/foo: File too large (process was started with ulimit -f limit)

-  If you have trouble seeing anything in Dovecot's logs, see :ref:`LDA <lda>`.

Virtual users
-------------

Dovecot LDA is very easy to use on large scale installations with
Postfix virtual domains support, just add a ``dovecot`` service in
``/etc/postfix/master.cf``
(`master(5) <http://www.postfix.org/master.5.html>`__):

::

   dovecot   unix  -       n       n       -       -       pipe
     flags=DRhu user=vmail:vmail argv=/usr/local/libexec/dovecot/dovecot-lda -f ${sender} -d ${recipient}

An example using address extensions (ie user+extension@domain.com (don't
forget to define the proper recipient_delimiter in Postfix's main.cf))
to deliver to the folder 'extension' in your maildir (If you wish to
preserve the case of ``${extension}``, remove the ``hu``
`flags <http://www.postfix.org/pipe.8.html>`__, and be sure to utilize
:ref:`config_variables` in your
dovecot.conf for mail locations and other configuration parameters that
are expecting lower case):

::

   dovecot unix    -       n       n       -       -      pipe
     flags=DRhu user=vmail:vmail argv=/usr/local/libexec/dovecot/dovecot-lda -f ${sender} -d ${user}@${nexthop} -m ${extension}

   # or if you have a INBOX/ namespace prefix:
   dovecot unix    -       n       n       -       -      pipe
     flags=DRhu user=vmail:vmail argv=/usr/local/libexec/dovecot/dovecot-lda -f ${sender} -d ${user}@${nexthop} -m INBOX/${extension}

This example ignores address extensions (ie user+extension@domain.com
delivers just like user@domain.com ), but still shows the original
address for Sieve:

::

   dovecot   unix  -       n       n       -       -       pipe
     flags=DRhu user=vmail:vmail argv=/usr/lib/dovecot/dovecot-lda -f ${sender} -a ${original_recipient} -d ${user}@${nexthop}

Replace ``vmail`` above with your virtual mail user account.

Then set ``virtual_transport`` to ``dovecot`` in
``/etc/postfix/main.cf``:

::

   dovecot_destination_recipient_limit = 1
   virtual_mailbox_domains = your.domain.here
   virtual_transport = dovecot

And remember to run

::

   postfix reload

Virtual users with multiple uids/gids
-------------------------------------

If you need multiple uids/gids you'll need to set dovecot-lda setuid
root or invoke it through sudo. See :ref:`LDA` for how to do this securely.

Postfix with a NFS mail store
-----------------------------

If you are experiencing problems with dovecot-lda processes hanging when
delivering to an NFS mail store, it's likely that the dovecot-lda
process is hanging while waiting for free locks. The occurrence of this
can be greatly reduced, if not eradicated, by forcing Postfix to only
deliver to the same recipient one at a time.

::

   dovecot_destination_concurrency_limit = 1

Prevent backscatter
-------------------

To prevent backscatter you should configure Postfix to reject mail for
nonexistent recipients.

This is the default behaviour (``smtpd_reject_unlisted_recipient = yes``) so
there's no need to set "reject_unlisted_recipient" in any of your
restriction. But: Postfix must know if a recipient exists. Depending on
how you've configured Dovecot and Postfix this can be done several ways.

System users
~~~~~~~~~~~~

If you only use local system users this is no problem - all valid
recipients can be found in the local password or alias database.

Virtual users (static)
~~~~~~~~~~~~~~~~~~~~~~

When you use virtual users and domains you should maintain a list of
valid recipients. The relevant settings are:

**virtual_alias_maps, virtual_mailbox_maps**

For static verification you can maintain the content of the files
yourself. For every recipient or alias you need one entry. Example:

**virtual_alias_maps**

::

   name_recipient@example.com  external@example.net

**virtual_mailbox_maps**

::

   name@example.com  OK
   recipient@example.com  available

Don't forget to run "postmap" afterwards.

.. note::

   If you use the Dovecot LDA or LMTP it doesn't matter what you
   use behind the recipient address. Use "OK", the full name of the user or
   else.

Virtual users (dynamic)
~~~~~~~~~~~~~~~~~~~~~~~

Do you already use a database (MySQL, PostgreSQL) for Dovecot? Use the
same source for Postfix. You only have to to define a valid sql query
for Postfix. Example:

::

   virtual_mailbox_maps = proxy:mysql:/etc/postfix/virtual_mailbox_maps.cf

**virtual_mailbox_maps.cf**

::

   user = mysql-user
   password = mysql-password
   hosts = unix:/var/run/mysql/mysqld.sock
   dbname = mailserver
   query = SELECT name FROM mailbox WHERE email='%s'

This query will return the value of the filed "name" from table
"mailbox" if the email address of the recipient matches the email from
the field "email". This is enough for Postfix because Postfix must only
know if the recipient exists. The value doesn't matter. When you use a
database (or LDAP) there's no need to manually maintain a file with
valid recipients.

.. note::

   If you use "relay_domains" instead of
   "virtual_mailbox_domains" you have to use "relay_recipient_maps" instead
   of "virtual_mailbox_maps".

Dynamic address verification with LMTP
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

With Dovecot 2.0 you can also use LMTP and the Postfix setting
"reject_unverified_recipient" for dynamic address verification. It's
really nice because Postfix doesn't need to query an external datasource
(MySQL, LDAP...). Postfix maintain a local database with existing/non
existing addresses (you can configure how long positive/negative results
should be cached).

To use LMTP and dynamic address verification you must first get Dovecot
working. Then you can configure Postfix to use LMTP and set
"reject_unverified_recipient" in the smtpd_recipient_restrictions.

On every incoming email Postfix will probe if the recipient address
exists. You will see similar entries in your logfile:

::

   Recipient address rejected: undeliverable address: host tux.example.com[private/dovecot-lmtp] said: 550 5.1.1 < tzknvtr@example.com > User doesn't exist: tzknvtr@example.com (in reply to RCPT TO command); from=< cnrilrgfclra@spammer.org > to=< tzknvtr@example.com >

If the recipient address exists (status=deliverable) Postfix accepts the
mail.

.. note::

   You cannot use "reject_unverified_recipient" with "pipe" so
   this doesn't work with the Dovecot LDA "deliver".
