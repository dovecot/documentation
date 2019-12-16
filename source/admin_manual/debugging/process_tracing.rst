.. _process_tracing:

Process Tracing
===============

If a Dovecot's process hangs or is just really slow, the best way to debug it
is to see what it's really doing. Typically you'd be looking into imap or pop3
processes.

Linux
^^^^^

.. code-block:: none

  strace -tt -o log -p <process pid>

BSDs, OS X <= 10.4
^^^^^^^^^^^^^^^^^^

.. code-block:: none

  # enable process tracing
  ktrace -f log -p <process pid>
  # do whatever makes it break, then stop the process tracing:
  ktrace -C
  # and see what it's done:
  kdump -T -f log

OS X >= 10.5
^^^^^^^^^^^^

.. code-block:: none

  dtruss -p <process id>

Solaris
^^^^^^^

.. code-block:: none

  truss -d -r0 -w1 -o log -p <process pid>

``-r0`` and ``-w1`` cause all IMAP input/output to be logged. ``-d`` adds
timestamps to the log.
