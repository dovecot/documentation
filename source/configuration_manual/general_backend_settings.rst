.. _general_backend_setting:

==========================
General Backend Settings
==========================

.. code-block:: none

  protocols = imap pop3 lmtp sieve

Protocols to enable.

.. code-block:: none

  verbose_proctitle = yes

Show state information in process titles (in ``ps`` output).

.. code-block:: none

  mail_log_prefix = "%s(%u)<%{session}>: "

Include the session string in all log messages to make it easier to match log
lines together.

.. code-block:: none

  shutdown_clients = yes

By default all active sessions will be shut down when dovecot is reloaded or
restarted. Setting this to ``no`` is dangerous on backend as existing sessions
are then not killed when dovecot is restarted or reloaded. This can have
serious consequences if for example storage-related settings are changed, as
user connection will be using both old and new configuration at the same time.

.. code-block:: none

  import_environment {
    MALLOC_MMAP_THRESHOLD_ = 131072
  }

Allocate all memory larger than 128 kB using mmap(). This allows the OS to free
the memory afterwards. This is important for backends because there can be a
lot of long-running imap and pop3 processes.
