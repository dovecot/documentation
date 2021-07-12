.. _dovecot_doveadm_protocol:

================
Doveadm protocol
================

See also :ref:`doveadm HTTP protocol <admin-doveadm-http-api>`.

doveadm-server can be accessed via UNIX sockets or TCP protocol (by
adding inet_listener to doveadm service). The protocol looks like:

Initial handshake from client to server:

::

   C: VERSION      doveadm-server  1       0

Note that the spaces you see are TABs. All the fields are TAB-separated.
The server will send you back either:

-  "+" means you are preauthenticated and can start sending commands.
   This happens when connecting to the UNIX socket.

-  "-" means you need to authenticate first.

.. versionchanged:: v2.2.34
   Dovecot sends the "+" or "-" only after VERSION, while earlier versions
   sent it already before VERSION. This shouldn't change much practically,
   because the client was supposed to have sent the VERSION immediately anyway.

Authentication
--------------

The authentication is done with a regular SASL PLAIN authentication,
i.e. "PLAIN<tab>base64(\0username\0password)". Currently the username
must be "doveadm". For example for user=doveadm, password=secret use:

::

   C: PLAIN        AGRvdmVhZG0Ac2VjcmV0
   S: +

Running commands
----------------

The actual commands are in format: flags<tab>username<tab>command
name[<tab>parameter[<tab>parameter2...]], where the flags can be either
empty, "v" (verbose) or "D" (debug). Note that if the command name has
spaces, they are sent as spaces instead of as tabs (e.g. "quota get",
not "quota<tab>get"). So for example to get a quota for user tss:

::

   C:      tss     quota get
   S: user STORAGE 1814    -       0       user    MESSAGE 6       -       0
   S: +

The storage values are all given in kilobytes.

The server replies using the same fields TAB-separated as what a regular
doveadm command sends. The reply itself ends with LF. So if the reply is
large, it may return a very long line as a reply. After the reply
follows a status line:

-  "+" = success.

   -  In future the "+" may be followed by more text, for now you should
      just ignore those.

-  "-" = failed (the error was probably logged to Dovecot's error log)

   -  "-NOUSER" = the user doesn't exist

   -  Other "-SOMETHING" errors may be added in future.

Available commands
------------------

The command names and output are exactly the same as what regular
doveadm commands on command line do. Currently only "mail commands" are
available via doveadm protocol, but this will change in future.

You can use the doveadm itself to find out what the output format will
look like. For example:

.. code-block:: sh

   doveadm -f tab search mailbox inbox 1:2
   mailbox-guid    uid
   fa8cb722dfad9c52b62600007049b30b        125159
   fa8cb722dfad9c52b62600007049b30b        125160

There are two fields, "mailbox-guid" and "uid" in the output. The title
names won't be sent via doveadm protocol, but everything else will be
sent in one line. So in the above case the protocol output will be:

::

   fa8cb722dfad9c52b62600007049b30b<tab>125159<tab>fa8cb722dfad9c52b62600007049b30b<tab>125160

Example Clients
---------------

-  Perl: `Net::Doveadm <https://metacpan.org/pod/Net::Doveadm>`__
