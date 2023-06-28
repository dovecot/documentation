.. _process_titles:

==============
Process Titles
==============

When :dovecot_core:ref:`verbose_proctitle` is yes, Dovecot adds various extra
information to its process titles. Besides the various self-descriptive command
states, there are the following:

Generic
-------

``[initializing]``
  The process is still starting up and isn't yet ready to accept connections.
  This can especially happen if the process is still attempting to connect to
  the stats socket.

  .. dovecotadded:: 2.4.0,3.0.0
``[idling]``
  The process is not doing anything except waiting for a client to be served.
``[blocking on log write]``
  The log process is busy and not reading this process's logs. Try to debug
  (strace) the log process to see why.

log process
-----------

``[service too fast: FD/LISTEN_FD/LOG_PREFIX]``
  One specific service is sending logs faster than we can write them. The
  LOG_PREFIX is usually enough to identify the service. If not, the FD and
  LISTEN_FD can in theory be used to calculate which service it is.
``[N services too fast, last: FD/LISTEN_FD/LOG_PREFIX]``
  Multiple services are sending logs faster than we can write them. The last
  service's information is shown.
``[N services too fast]``
  Multiple services are sending logs faster than we can write them, but there
  is no additional information about which ones specifically.

mail processes
--------------

.. dovecotadded:: 2.4.0,3.0.0

This means imap, pop3, submission and managesieve processes.

``[waiting on client]``
  Login process connected to the mail process, but it hasn't finished sending
  the request.
``[auth lookup]``
  Mail process is waiting on auth process to finish userdb lookups.
``[post-login script]``
  Mail process is waiting on post-login scripts to finish.

imap process
------------

.. dovecotadded:: 2.4.0,3.0.0

``[waiting on unhibernate client]``
  imap-hibernate process connected to the imap process, but it hasn't finished
  sending the request.
``[unhibernating]``
  The imap connection is still being unhibernated.
