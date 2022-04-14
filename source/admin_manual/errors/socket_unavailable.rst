.. _errors_socket_unavailable:

============================================
UNIX Socket Resource Temporarily Unavailable
============================================

Commonly visible as:

.. code-block:: none

   imap-login: Error: net_connect_unix(imap) failed: Resource temporarily unavailable

This means that there are more imap-login processes trying to connect to
the "imap" UNIX socket than there are imap processes accepting the
connections. The kernel's connection listener queue got full and it
started rejecting further connections. So what can be done about it?

Wrong service settings
^^^^^^^^^^^^^^^^^^^^^^

This can happen if ``service imap { client_limit }`` is set to anything
else than 1. IMAP (and POP3 and other mail) processes do disk IO, lock
waiting and such, so if all the available imap processes are stuck
waiting on something, they can't accept new connections and they queue
up in the kernel. For mail processes only ``client_limit=1`` is recommended.

It can also happen if ``service imap { process_limit }`` is reached.
Dovecot logs a warning if process_limit or client_limit is reached.

Out of file descriptors
^^^^^^^^^^^^^^^^^^^^^^^

If the "ulimit -n" is too low, kernel stops notifying the process about
incoming connections. Make sure that the limit is at least as high as
the client_limit. Dovecot also internally checks this, and if it's too
low it writes a warning to stderr at startup (and to log in v2.2.33+).

Note that Dovecot is not using "dovecot" user's or PAM's limits in
general. Make sure the limits are correct with:
``cat /proc/`pidof dovecot`/limits``

Master process busy
^^^^^^^^^^^^^^^^^^^

Dovecot master process forks all of the new processes. If it's using
100% CPU, it doesn't have time to fork enough new processes. Even if
it's not constantly using 100% CPU there may be fork bursts where it
temporarily gets too busy. The solution is to make it do less work by
forking less processes:

-  Most importantly switch to :ref:`high-performance login process
   mode <login_processes>`. This alone might be enough.

-  You can also switch (most of the) other commonly forked processes to
   be reused. For example ``service imap { service_count = 100 }``
   reuses the imap process for 100 different IMAP connections before it
   dies. This is useful mainly for imap, pop3 and managesieve services.
   It's better to avoid using ``service_count=0`` (unlimited) in case
   there are memory leaks.

-  You can pre-fork some idling processes to handle bursts with
   ``service { process_min_avail }``. Before v2.3.15 the pre-forking was
   creating processes too slowly, often practically disabling the
   pre-forking during the times when they would have been most useful.

See :ref:`Services <service_configuration>` before changing any service
settings. Some services require specific values to work correctly.

Listener queue size
^^^^^^^^^^^^^^^^^^^

Dovecot uses ``service { client_limit } * service { process_limit }`` as the
listener queue size. Dovecot v2.2.25 and older also had a hardcoded
maximum of 511, while later versions have no upper limit. Most OSes use
an even lower limit, typically 128. In Linux you can increase this from
``/proc/sys/net/core/somaxconn``.
