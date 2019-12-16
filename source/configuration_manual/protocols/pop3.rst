.. _pop3:

==========
POP3
==========

.. toctree::
  :maxdepth: 1

  pop3_server

* Improve performance by not updating the IMAP \Seen flag whenever downloading
  mails via POP3.

.. code-block:: none

  pop3_no_flag_updates = yes

* Enable some workarounds for Outlook clients so they won't hang on unexpected
  data.

.. code-block:: none

  pop3_client_workarounds = outlook-no-nulsoe-ns-eoh

* Use message GUID as POP3 UIDL. For old mails their UIDLs must be migrated
  using the migration scripts.

.. code-block:: none

  pop3_uidl_format = %g
