.. _debugging:

==========
Debugging
==========

Each ``IMAP``, ``POP3`` and ``LMTP`` connection has its own unique session ID.
This ID is logged in all the lines and passed between Dovecot services, which
allows tracking it all the way through directors to backends and their various
processes.

The session IDs look like ``<ggPiljkBBAAAAAAAAAAAAAAAAAAAAAAB>``


.. toctree::
   :maxdepth: 1
   :glob:

   *
