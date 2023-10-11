.. _sieve_managesieve-troubleshooting:

ManageSieve Troubleshooting
===========================

Like Dovecot itself, **the ManageSieve service always logs a detailed
error message** if something goes wrong at the server (refer to :ref:`Dovecot
Logging <dovecot_logging>` for more details): the logs are the first place to look if you suspect
something is wrong. To get additional debug messages in your log file,
you should set :dovecot_core:ref:`log_debug=category=sieve <log_debug>` in dovecot.conf (inside
``protocol sieve {...}``\ if you want to enable this for ManageSieve
only).

If the client commits protocol violations or sends invalid scripts, an
error response is provided to the client which is not necessarily logged
on the server. A good ManageSieve client presents such error messages to
the user.

Keep in mind that the ManageSieve service only provides the Sieve
*protocol*, which may be somewhat confusing. This protocol can only be
used to *upload* Sieve scripts and *activate* them for execution.
Performing the steps below therefore only verifies that this
functionality is working and **not** whether Sieve scripts are correctly
being executed upon delivery. The execution of Sieve scripts is
performed by the Dovecot :ref:`Local Delivery Agent <lda>` or its :ref:`LMTP service <lmtp_server>`
using the :ref:`LDA Sieve plugin <sieve>`.
If you have problems with Sieve script execution upon delivery, you are
referred to the :ref:`Sieve Troubleshooting
page <sieve_troubleshooting>`.

Manual Login and Script Upload
------------------------------

If you fail to login or upload scripts to the server, it is not
necessarily caused by Dovecot or your configuration. It is often best to
test your ManageSieve server manually first. This also provides you with
the direct error messages from the server without intermission of your
client. If you do not use TLS, you can connect using a simple ``telnet``
or ``netcat`` connection to the configured port (typically 4190 or 2000
for older setups). Otherwise you must use a TLS-capable text protocol
client like ``gnutls-cli`` as described below. Upon connection, the
server presents the initial greeting with its capabilities:

::

   "IMPLEMENTATION" "dovecot"
   "SASL" "PLAIN"
   "SIEVE" "comparator-i;ascii-numeric fileinto reject vacation imapflags notify include envelope body relational regex subaddress copy"
   "STARTTLS"
   OK "Dovecot ready."

Note that the reported ``STARTTLS`` capability means that the server
accepts TLS, but, since you are using telnet/netcat, you cannot use this
(refer to Manual TLS Login below). The ``SASL`` capability lists the
available SASL authentication mechanisms. If this list is empty and
``STARTTLS`` is available, it probably means that the server forces you
to initiate TLS first (as dictated by :dovecot_core:ref:`auth_allow_cleartext=yes <auth_allow_cleartext>`
in dovecot.conf).

Now you need to log in. Although potentially multiple SASL mechanisms
are available, only ``PLAIN`` is described here. Authentication is
performed using the ManageSieve ``AUTHENTICATE`` command. This command
typically looks as follows when the ``PLAIN`` mechanism is used:

::

   AUTHENTICATE "PLAIN" "<base64-encoded credentials>"

The credentials are the base64-encoded version of the string
``"\0<username>\0<password"`` (in which ``\0`` represents the ASCII NUL
character). Generating this is cumbersome and a bit daunting for the
novice user, so for convenience a simple Perl script is provided to
generate the ``AUTHENTICATE`` command for you. It is available
`here <http://pigeonhole.dovecot.org/utilities/sieve-auth-command.pl>`__
and used as follows:

::

   sieve-auth-command.pl <username> <password>

The command is written to stdout and you can paste this to your protocol
session, e.g.:

::

   AUTHENTICATE "PLAIN" "<base64-encoded credentials>"
   OK "Logged in."

Now that you are logged in, you can upload a script. This is done using
the ``PUTSCRIPT`` command. Its first argument is the name for the script
and its second argument is a string literal. A string literal starts
with a length specification ``'{<bytes>+}'`` followed by a newline.
Thereafter the server expects ``<bytes>`` bytes of script data. The
following uploads a trivial 6 byte long sieve script that keeps every
message (6th byte is the newline character):

::

   PUTSCRIPT "example" {6+}
   keep;
   OK "Putscript completed."

Upon successful upload, you should find a file called
``example.sieve`` in your ``sieve_dir`` directory. The script should
also be listed by the server as follows when the ``LISTSCRIPTS`` command
is issued:

::

   LISTSCRIPTS
   "example"
   OK "Listscripts completed."

You can check whether your script is uploaded correctly by downloading
it using the ``GETSCRIPT`` command. This command accepts the name of the
downloaded script as its only parameter:

::

   GETSCRIPT "example"
   {6}
   keep;
   OK "Getscript completed."

To let the Sieve plugin use your newly uploaded script, you must
activate it using the ``SETACTIVE`` command (only one script can be
active at any time). The active script is indicated ``ACTIVE`` in the
``LISTSCRIPTS`` output, e.g.:

::

   SETACTIVE "example"
   OK "Setactive completed."
   LISTSCRIPTS
   "example" ACTIVE
   OK "Listscripts completed.

The symbolic link configured with the ``sieve`` setting should now point
to the activated script in the ``sieve_dir`` directory. If no script is
active, this symbolic link is absent.

Manual TLS Login
----------------

When TLS needs to be used during manual testing, ``gnutls-cli`` provides
the means to do so. This command-line utility is part of the GNUTLS
distribution and on most systems this should be easy to install. It is
used to connect to ManageSieve as follows:

::

   gnutls-cli --starttls -p <port> <host>

This starts the client in plain text mode first. As shown in the
previous section, the server presents a greeting with all capabilities
of the server. If ``STARTTLS`` is listed, you can issue the ``STARTTLS``
command as follows:

::

   STARTTLS
   OK "Begin TLS negotiation now."

If an OK response is given by the server you can press ``Ctrl-D`` to
make ``gnutls-cli`` start the TLS negotiation. Upon pressing ``Ctrl-D``,
``gnutls-cli`` will show information on the negotiated TLS session and
finally the first response of the server is shown:

::

   "IMPLEMENTATION" "dovecot"
   "SASL" "PLAIN"
   "SIEVE" "comparator-i;ascii-numeric fileinto reject vacation imapflags notify include envelope body relational regex subaddress copy"
   OK "TLS negotiation successful."

Hereafter, you can continue to authenticate and upload a script as
described in the previous section.

Client Problems
---------------

See :ref:`debugging_rawlog` for details how to log client-server traffic.

Refer to the :ref:`ManageSieve Clients page <sieve_managesieve-client_issues>`
for information on known client problems.

Known Server Issues and Protocol Deviations
-------------------------------------------

-  The ANONYMOUS authentication mechanism is currently not supported and
   explicitly denied.
