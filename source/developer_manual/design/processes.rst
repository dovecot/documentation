.. _dovecot_processes:

=================
Dovecot processes
=================

Dovecot is split into multiple processes where each process does only
one thing. This is partially because it makes the code cleaner, but also
because it allows setting up different privileges for each process. The
most important processes are:

-  Master process (dovecot)
-  Login processes (imap-login, pop3-login)
-  Authentication process (dovecot-auth)
-  Mail processes (imap, pop3)


Master process
--------------

This process keeps all the other processes running. If a child process
dies, another one is restarted automatically. It always runs as root,
unless you're specifically running everything under a single normal UID.

The master process reads the configuration file and exports the settings
to other processes via environment variables.

All logging also goes through master process. This avoids problems with
rotating log files, as there's only a single process to send a signal to
reopen the log file. Also writing to the same log file (if not using
syslog) isn't necessarily safe to do in multiple processes concurrently.

Making the logging go through master process also gives a couple of
advantages from security and reliability point of view: All log lines
can be prefixed with the process's name and the username of the user who
was logged in, without the possibility for the process itself to forge
them. Flooding logs can also be prevented. By default Dovecot allows
non-privileged processes to write 10 lines per second before it begins
to delay reading their input, which finally causes the badly behaving
process to start blocking on writing to stderr instead of eating all the
CPU and disk space.

In the Dovecot 2.0 design, the master process is split to three parts:
the Master process which does nothing more than keep the processes
running, the config process which handles reading the configuration file
(supporting also eg. SQL storages!) and the log process which handles
the logging.


Login processes
---------------

The login processes implement the required minimum of the IMAP and POP3
protocols before a user logs in successfully. There are separate
processes (and binaries) to handle IMAP and POP3 protocols.

These processes are run with least possible privileges. Unfortunately
the default UNIX security model still allows them to do much more than
they would have to: Accept new connections on a socket, connect to new
UNIX sockets and read and write to existing file descriptors. Still, the
login process is by default run under a user account that has no special
access to anything, and inside a non-writable chroot where only a couple
of files exist. Doing any damage inside there should be difficult.

When a new connection comes, one of the login processes accept()s it.
After that the client typically does nothing more than ask the server's
capability list and then log in. The client may also start TLS session
before logging in.

Authentication is done by talking to the authentication process. The
login process is completely untrusted by the authentication process, so
even if an attacker is able to execute arbitrary code inside a login
process, they won't be able to log in without a valid username and
password.

After receiving a successful authentication reply from the
authentication process, the login process sends the file descriptor to
the master process which creates a new mail process and transfers the fd
into it. Before doing that, the master process verifies from the
authentication process that the authentication really was successful.

By default each login process will handle only a single connection and
afterwards kill itself (but see SSL proxying below). This way attacker
can't see other people's connections. This can however be disabled
(``login_process_per_connection=no``), in which case the security of the
design suffers greatly.

The login processes handle SSL/TLS connections themselves completely.
They keep proxying the connection to mail processes for the entire
lifetime of the connection. This way if a security hole is found from
the SSL library, an authenticated user still can't execute code outside
the login process.

See :ref:`login_processes` for more information about different settings related to login
processes.

Authentication process
----------------------

The authentication process handles everything related to the actual
authentication: SASL authentication mechanisms, looking up and verifying
the passwords and looking up user information.

It listens for two different kinds of connections: untrusted
authentication client connections (from login processes) and master
connections (from master process, but also from Dovecot LDA). The client
connections are only allowed to try to authenticate. The master
connections are allowed to ask if an authentication request with a given
ID was successful, and also to look up user information based on a
username. This user lookup feature is used by Dovecot LDA.

Each client connection tells their process ID to the authentication
process in a handshake. If a connection with the same PID already
exists, an error is logged and the new connection is refused. Although
this makes DoS attacks possible, it won't go unnoticed for long and I
don't see this as a real issue for now.

Having the authentication process know the PID of the client connection
allows all authentication requests to be mapped to one specific client
connection. Since the master process knows the login process's real PID,
it's used when asking from authentication process if the request was
successful. This makes it impossible for a login process to try to fake
another login process's login requests. Faking PIDs will also be quite
pointless.

Once the master process has done the verification request for a
successful authentication request, the request is freed from memory. The
requests are also freed about 2 minutes after their creation, regardless
of the state they currently are in.

For blocking password and user database backends (eg. MySQL) separate
"worker processes" are used. Initially only one of them exists, but more
are created as needed.
:ref:`PAM <authentication-pam>`
can be configured to use worker processes instead of doing the forking
itself, but this isn't currently done by default and there may be
problems related to it. Also
:ref:`checkpassword <authentication-checkpassword>`
currently does the forking itself.

Mail processes
--------------

These processes handle the actual post-login mail handling using the
privileges of the logged in user. It's possible to chroot these
processes, but practically it's usually more trouble than worth.
