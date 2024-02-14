.. _debugging_authentication:

========================
Debugging Authentication
========================

Most importantly set :dovecot_core:ref:`log_debug = category=auth <log_debug>`,
which makes Dovecot log a debug line for just about anything related to
authentication.

If you're having problems with passwords, you can also set
:dovecot_core:ref:`auth_debug_passwords=yes <auth_debug_passwords>` which
will log them in cleartext. After that you'll see in the logs exactly what
dovecot-auth is doing, and that should help you to fix the problem.

For easily testing authentication, use:

.. code-block:: none

   doveadm auth test user@domain password

For looking up userdb information for a user, use:

.. code-block:: none

   doveadm user user@domain

For simulating a full login with both passdb and userdb lookup, use:

.. code-block:: none

   doveadm auth login user@domain password

PLAIN SASL mechanism
====================

With IMAP and POP3 it's easy to log in manually using the IMAP's LOGIN command or POP3's USER and PASS commands (see :ref:`testing_installation` for details), but with SMTP AUTH you'll need to use PLAIN authentication mechanism, which requires you to build a base64-encoded string in the correct format. The PLAIN authentication is also used internally by both IMAP and POP3 to authenticate to dovecot-auth, so you see it in the debug logs.

The PLAIN mechanism's authentication format is: <authorization ID> NUL <authentication ID> NUL <password>. Authorization ID is the username who you want to log in as, and authentication ID is the username whose password you're giving. If you're not planning on doing a `master user login <authentication-master_users>`, you can either set both of these fields to the same username, or leave the authorization ID empty.

Encoding with mmencode
^^^^^^^^^^^^^^^^^^^^^^

printf(1) and mmencode(1) should be available on most Unix or GNU/Linux systems. (If not, check with your distribution. GNU coreutils includes printf(1), and metamail includes mmencode(1). In Debian, mmencode is called mimencode(1).)

.. code-block:: none

   $ printf 'username\0username\0password' | mmencode
   dXNlcm5hbWUAdXNlcm5hbWUAcGFzc3dvcmQ=

This string is what a client would use to attempt PLAIN authentication as user `username` with password `password`. With ``'auth_debug_passwords=yes``, it would appear in your logs.

Decoding with mmencode
^^^^^^^^^^^^^^^^^^^^^^

You can use mmencode ``-u`` to interpret the encoded string pasted into stdin as follows:

.. code-block:: none

   # mmencode -u
   bXl1c2VybmFtZUBkb21haW4udGxkAG15dXNlcm5hbWVAZG9tYWluLnRsZABteXBhc3N3b3Jk<CR>
   myusername@domain.tldmyusername@domain.tldmypassword<CTRL-D>
   #

You should see the correct user address (twice) and password. The null bytes won't display.

Encoding with Perl
^^^^^^^^^^^^^^^^^^

Unfortunately, mmencode on FreeBSD chokes on ``\0``. As an alternate, if you have MIME::Base64 on your system, you can use a perl statement to do the same thing:

.. code-block:: none

   perl -MMIME::Base64 -e 'print encode_base64("myusername\@domain.tld\0myusername\@domain.tld\0mypassword");'

As mmencode ``-u`` doesn't encounter any ``\0`` you can still do:

.. code-block:: none

   perl -MMIME::Base64 -e 'print encode_base64("myusername\@domain.tld\0myusername\@domain.tld\0mypassword");' | mmencode -u

to check that you have encoded correctly.

Encoding with Python
^^^^^^^^^^^^^^^^^^^^

With python you can do:

.. code-block:: none

   python -c "import base64; print(base64.encodestring('myusername@domain.tld\0myusername@domain.tld\0mypassword'));"

