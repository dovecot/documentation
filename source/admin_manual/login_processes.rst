.. _login_processes:

===============
Login processes
===============

The main purpose of login processes is to handle the :ref:`IMAP <imap_server>`, :ref:`POP3 <pop3_server>`,
:ref:`Submission <submission_server>` (v2.3), and :ref:`ManageSieve <pigeonhole_managesieve_server>` connections before the user
has logged in. The login processes don't need to be able to do anything else
than let the user log in, so they can run in highly restricted environment. By
default they are run as a non-privileged ``dovenull`` user chrooted into a
non-writable directory containing only authentication UNIX sockets.

Login processes also handle proxying the SSL and TLS connections even after the
user has logged in. This way all the SSL code runs in the same restricted
environment, which means that a security hole in the SSL library gives the
attacker access only to the restricted chroot, rather than possibly all the
users' mails.

The default login settings should be good enough for small sites. There are two
ways to run the login processes: the high-security mode and the
high-performance mode. Both are discussed separately below.

For explanation on the various settings for services, see
:ref:`service_configuration`.

High-security mode
==================

You can enable high-security mode with:

.. code-block:: none

 service imap-login {
   service_count = 1
   #process_min_avail = 0
   #process_limit = $default_process_limit
   #vsz_limit = 64M
 }
 service pop3-login {
   service_count = 1
 }

This is the default. It works by using a new imap-login or pop3-login process
for each incoming connection. Since the processes run in a highly restricted
chroot, running each connection in a separate process means that in case there
is a security hole in Dovecot's pre-authentication code or in the SSL library,
the attacker can't see other users' connections and can't really do anything
destructive. The only way out of it is to find and exploit a kernel security
hole.

Since one login process can handle only one connection, the service's
``process_limit`` setting limits the number of users that can be logging in at
the same time (defaults to :ref:`default_process_limit=100 <setting-default_process_limit>`). SSL/TLS proxying
processes are also counted here, so if you're using SSL/TLS you'll need to make
sure this count is higher than the maximum number of users that can be logged
in simultaneously. With TLS/SSL connections, the login process will not
terminate, and remains to perform proxying between imap backend process and the
client.

* If the maximum login process count is reached, the oldest process in
  logging-in state (ie. non-proxying) is destroyed.
* To avoid startup latency for new client connections, set
  ``process_min_avail`` to higher than zero. That many idling processes are
  always kept around waiting for new connections.
* ``vsz_limit`` should be fine at its default 64MB value.

High-performance mode
=====================

You can enable high-performance mode with:

.. code-block:: none

  service imap-login {
    service_count = 0
    #client_limit = $default_client_limit
    process_min_avail = 4 # number of CPU cores
    vsz_limit = 1G
  }
  service pop3-login {
    service_count = 0
  }

It works by using a number of long running login processes, each handling a
number of connections. This loses much of the security benefits of the login
process design, because in case of a security hole (in Dovecot or SSL library)
the attacker is now able to see other users logging in and steal their
passwords, read their mails, etc.

* ``process_min_avail`` should be set to be at least the number of CPU cores in
  the system, so that all of them will be used.
* Otherwise new processes are created only once an existing one's connection
  count reaches client_limit
* Default ``client_limit * process_limit = 1000*100 = 100k`` connections
* ``vsz_limit`` should be increased to avoid out of memory errors, especially
  if you're using SSL/TLS.

Login access check sockets
==========================

Dovecot login processes can check via UNIX socket if the incoming connection
should be allowed to log in. This is most importantly implemented to enable TCP
wrappers support for Dovecot.

TCP wrappers support
^^^^^^^^^^^^^^^^^^^^

You must have built Dovecot with support for TCP wrappers. You can do this by
giving ``--with-libwrap`` parameter to ``configure``.

Add to ``dovecot.conf``:

.. code-block:: none

  login_access_sockets = tcpwrap

  service tcpwrap {
    unix_listener login/tcpwrap {
      group = $default_login_user
      mode = 0600
      user = $default_login_user
    }
  }

Remember to configure your rules! The format is described in ``hosts.allow(5)``
and ``hosts.deny(5)``. Files used are usually ``/etc/hosts.allow`` and
``/etc/hosts.deny``.
