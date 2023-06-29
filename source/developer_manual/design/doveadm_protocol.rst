.. _dovecot_doveadm_protocol:

================
Doveadm Protocol
================

See also :ref:`doveadm HTTP protocol <admin-doveadm-http-api>`.

doveadm-server can be accessed via UNIX sockets or TCP protocol (by
adding inet_listener to doveadm service). The doveadm server supports
the following protocol versions (major.minor):

 * ``1.0``: Supported since Dovecot v2.0.0.
 * ``1.1``: Supported since Dovecot v2.2.33. Using this minor number changes
   the protocol to use multiplex-stream for proxying logs.
 * ``1.2``: Supported since Dovecot v2.3.9. Indicates that the server supports
   the STARTTLS command.

For external doveadm clients it's easiest to just support the 1.0 version.

The protocol looks like:

Initial handshake from client to server:

.. code-block:: none

   C: VERSION      doveadm-server  1       0

Note that the spaces you see are TABs. All the fields are TAB-separated.
The server will send you back either:

-  "+" means you are preauthenticated and can start sending commands.
   This happens when connecting to the UNIX socket.

-  "-" means you need to authenticate first.

.. dovecotchanged:: 2.2.34
   Dovecot sends the "+" or "-" only after VERSION, while earlier versions
   sent it already before VERSION. This shouldn't change much practically,
   because the client was supposed to have sent the VERSION immediately anyway.

Authentication
--------------

The authentication is done with a regular SASL PLAIN authentication,
i.e. "PLAIN<tab>base64(\0username\0password)". Currently the username
must be "doveadm". For example for user=doveadm, password=secret use:

.. code-block:: none

   C: PLAIN        AGRvdmVhZG0Ac2VjcmV0
   S: +

Running Commands
----------------

The actual commands are in format: flags<tab>username<tab>command
name[<tab>parameter[<tab>parameter2...]], where the flags can be either
empty, "v" (verbose) or "D" (debug). Note that if the command name has
spaces, they are sent as spaces instead of as tabs (e.g. "quota get",
not "quota<tab>get"). So for example to get a quota for user tss:

.. code-block:: none

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

-  "-" = failed. The error was probably logged to Dovecot's error log.
   The "-" may be directly followed by an error code:

   - ``NOUSER`` - The user doesn't exist.
   - ``TEMPFAIL`` - Temporary failure.
   - ``NOPERM`` - Permission denied.
   - ``PROTOCOL`` - Protocol-related error.
   - ``DATAERR`` - Input data (e.g. command parameters) were wrong.
   - ``NOTFOUND`` - The command didn't find the requested object.

Available Commands
------------------

The command names and output are exactly the same as what regular
doveadm commands on command line do. Earlier Dovecot versions supported
running only "mail commands" (commands with -u username parameter), but
v2.3 should support all commands.

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

.. code-block:: none

   fa8cb722dfad9c52b62600007049b30b<tab>125159<tab>fa8cb722dfad9c52b62600007049b30b<tab>125160

Multiplex Stream
----------------

Multiplex streaming is enabled if client sends protocol minor version ``1``
or higher:

.. code-block:: none

   C: VERSION      doveadm-server  1       1

After authentication has successfully finished (server returned "+"), the
client must switch reading and writing to the "multiplex mode". This protocol
works by sending packets:

 * 1 byte: Channel ID
 * 4 bytes: Following data length in big-endian
 * Data

The channel ID is:

 * 0: doveadm protocol
 * 76 ('L'): Logs sent by doveadm-server

STARTTLS
--------

If doveadm-server returns minor version ``2`` or higher, it supports the
STARTTLS command. This command can be sent only if the server hasn't already
pre-authenticated the client, because it's running on a trusted UNIX socket.
So when the doveadm-server returns the "-" line indicating authentication is
needed, the doveadm-client can send ``STARTTLS`` line. After this both the
client and server switch to TLS. There is no response to this command.

Example Clients
---------------

-  Perl: `Net::Doveadm <https://metacpan.org/pod/Net::Doveadm>`_
