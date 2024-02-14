.. _testing_installation:

====================
Testing installation
====================

Check that it's running
=======================

First check with ``ps`` that the ``dovecot`` process is actually running. If
it's not, you had an error in ``dovecot.conf`` and the error message was
written to log. Go back to :ref:`running_dovecot` and :ref:`dovecot_logging`
if you can't find it.

Check that it's listening
=========================

Next check that Dovecot is listening for connections:

::

   # telnet localhost 143
   Trying 127.0.0.1...
   Connected to localhost.
   Escape character is '^]'.
   * OK [CAPABILITY IMAP4rev1 LITERAL+ SASL-IR LOGIN-REFERRALS ID ENABLE STARTTLS AUTH=PLAIN] Dovecot ready.

If you got "connection refused", make sure that Dovecot is configured to
serve the imap protocol and listening on the expected
interfaces/addresses. The simplest way to do that would be using
:man:`doveconf(1)`:

::

   # doveconf protocols listen
   protocols = imap pop3 lmtp sieve
   listen = *, ::

If the protocols setting doesn't contain ``imap`` then add it. Also make
sure, that relevant ``!include`` or ``!include_try`` configuration lines
are not commented.

If the telnet fails and dovecot emits a log "*auth: Fatal: Support not
compiled in for passdb driver 'pam'*", then rebuild dovecot with the pam development headers
package installed. In that case you have to re-run the configure
script, possibly including option **--with-pam** to the configure
command line.

Next check that it also works from remote host:

::

   # telnet imap.example.com 143
   Trying 1.2.3.4...
   Connected to imap.example.com.
   Escape character is '^]'.
   * OK [CAPABILITY IMAP4rev1 LITERAL+ SASL-IR LOGIN-REFERRALS ID ENABLE STARTTLS AUTH=PLAIN] Dovecot ready.

If that didn't work, check all possible firewalls in between, and check
that ``listen`` setting is ``*`` in ``dovecot.conf``.

If you have only imaps enabled, see :ref:`remote login <remote_login>` section below for how
to test using openssl s_client.

Check that it's allowing logins
===============================

::

   # telnet localhost 143
   a login "username" "password"

Replace the username and password with the ones you added to
``passwd.dovecot`` in :ref:`basic_configuration`.
Note that all IMAP commands begin with a tag, which is basically any
string you want, but it must be there. So don't leave out the "a" in the
above example. If the password contains ``"`` character, escape it with
``\\`` (e.g. ``"foo\"bar"``).

You should get an "a OK Logged in." reply. If you get "Authentication
failed" error, set :dovecot_core:ref:`auth_verbose = yes <auth_verbose>`
and :dovecot_core:ref:`log_debug = category=auth <log_debug>` in
``dovecot.conf``, restart Dovecot and try again. The log file should now
show enough information to help you fix the problem.

.. _remote_login:

Check that it's allowing remote logins
======================================

You'll need to try this from another computer, since all local IPs are
treated as secure:

::

   # telnet imap.example.com 143
   a login "username" "password"

If the connection is hanging instead of giving ``* Dovecot ready``, you
have a firewall that's preventing the connections.

Otherwise, the only difference here compared to step above is that you
might get:

::

   * BAD [ALERT] Plaintext authentication is disabled, but your client sent password in plaintext anyway. If anyone was listening, the password was exposed.
   a NO Plaintext authentication disabled.

If this is the case, you didn't set :dovecot_core:ref:`auth_allow_cleartext = yes <auth_allow_cleartext>`. You
could alternatively use OpenSSL to test that the server works with SSL:

-  Test using imaps port (assuming you haven't disabled imaps port):

   ::

      # openssl s_client -connect imap.example.com:993
      * OK Dovecot ready.

-  Test using imap port and STARTTLS command (works also with imap
   port):

   ::

      # openssl s_client -connect imap.example.com:143 -starttls imap
      * OK Dovecot ready.

Check that it finds INBOX
=========================

After logging in, check that the INBOX is found:

::

   b select inbox
   * FLAGS (\Answered \Flagged \Deleted \Seen \Draft)
   * OK [PERMANENTFLAGS (\Answered \Flagged \Deleted \Seen \Draft \*)] Flags permitted.
   * 1 EXISTS
   * 1 RECENT
   * OK [UIDVALIDITY 1106186941] UIDs valid
   * OK [UIDNEXT 2] Predicted next UID
   b OK [READ-WRITE] Select completed.

It should contain the mail that you sent to yourself in
:ref:`find_mail_location` step.

If anything goes wrong, set :dovecot_core:ref:`log_debug = category=mail <log_debug>` and try again. The log
file should now contain debugging information of where Dovecot is trying
to find the mails. Fix :dovecot_core:ref:`mail_location` setting and try again.

Check that it finds other mailboxes
===================================

If you already have other mailboxes created, you can check that Dovecot
finds them:

::

   c list "" *
   * LIST (\NoInferiors) "/" "test"
   * LIST (\NoInferiors) "/" "INBOX"
   c OK List completed.

If they weren't found, set :dovecot_core:ref:`log_debug = category=mail <log_debug>` and look at the
debugging information. Fix :dovecot_core:ref:`mail_location` setting and try again.

Check out some other IMAP commands
==================================

If you already have some emails, you can try reading them:

::

   1 SELECT INBOX
   2 FETCH 1:* (FLAGS INTERNALDATE BODY.PEEK[HEADER.FIELDS (SUBJECT)])
   3 FETCH 1 BODY[TEXT]

``1:*`` means all messages

You can also try moving a mail to Trash:

::

   4 CREATE Trash
   5 COPY 1 Trash
   6 STORE 1 +FLAGS \Deleted
   7 EXPUNGE

Check that real mail clients work
=================================

Since mail clients can be configured in various ways, please check first
if the problem is with Dovecot configuration or with the client's
configuration. You can rule out it being Dovecot's problem with the
"telnet" methods described above.

If you can't log in,

-  Make sure SSL/TLS settings are correct.

-  Make sure the client uses plaintext authentication method, unless
   you've specifically configured Dovecot to accept others.

If you can see only INBOX,

-  Clear out any "IMAP namespace prefix" or similar settings from
   clients.

-  Check if client is configured to show only "subscribed mailboxes". If
   so, you'll have to subscribe to the mailboxes you wish to see. You
   can see a list of subscribed mailboxes with:

   ::

      d lsub "" *
      * LSUB () "/" "INBOX"
      d OK Lsub completed.

Most IMAP clients have been tested with Dovecot and they work.

Make a graceful exit
====================

To close the connection to Dovecot issue a logout:

::

   e logout
   * BYE Logging out
   e OK Logout completed.

.. seealso:: :ref:`debugging`
