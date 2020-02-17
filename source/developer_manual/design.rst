.. _dovecot_design:

====================
Dovecot Design
====================
- :ref:`Overview of Dovecot processes <dovecot_processes>`
- :ref:`Design of index files <dovecot_index_files>`
   -  :ref:`API for accessing the indexfiles <dovecot_mail_index_api>`
- :ref:`Design of authentication process <dovecot_auth_process>`
   -  :ref:`Authentication protocol <dovecot_auth_protocol>`
-  :ref:`Doveadm server protocol <dovecot_doveadm_protocol>`
   and :ref:`Doveadm HTTP server protocol <admin-doveadm-http-api>`
-  :ref:`Doveadm synchronization <doveadm_dsync>`
-  :ref:`Dovecot Lua support <lua>`

Protocol extensions
-------------------

-  :ref:`Forwarding parameters in IMAP/POP3/LMTP/SMTP proxying <parameter_forwarding>`

Code APIs
---------

- :ref:`Coding style <coding_style_guide>` - explanations how and why the
  Coding style is the way it is.

Look at the \*.h files for the actual API documentation. The
documentation below doesn't attempt to list full API documentation.

liblib:

-  :ref:`Memory allocations <liblib_memory>`
-  :ref:`Static/dynamic buffers <liblib_buffers>`
-  :ref:`Dynamic arrays <liblib_arrays>`
-  :ref:`String handling <liblib_strings>`
-  :ref:`Input streams <liblib_istreams>`
-  :ref:`Output streams <liblib_ostreams>`
-  :ref:`Events <event_design>`
-  :ref:`Plugins <liblib_plugins>`

lib-dcrypt:

-  :ref:`lib-dcrypt data formats <lib_dcrypt>`

lib-storage:

- :ref:`Mail user <lib-storage_mail_user>` contains everything related to
  a single user.
- :ref:`Mail namespace <lib-storage_mail_namespace>` A single user can
  contain multiple :ref:`namespaces <namespaces>`.
- :ref:`Mailbox list <lib-storage_mailbox_list>` is used to list/manage
  a list of mailboxes for a single namespace (1:1 relationship).
- :ref:`Mail storage <lib-storage_mail_storage>` is used to access mails
  in a specific location with a specific mailbox format. Multiple namespaces
  can point to the same storage. A single namespace may in future (but not
  currently) point to multiple storages (e.g. a mixed mbox and Maildir
  directory).
- :ref:`Mailbox <lib-storage_mailbox>` is used to access a specific mailbox
  in a storage.
- :ref:`Mail <lib-storage_mail>` is used to access a specific mail in a
  mailbox.
- :ref:`Error handling <lib-storage_error_handling>`.
- :ref:`Plugins <lib-storage_plugins>` - how to hook into lib-storage functions.

.. toctree::
   :maxdepth: 5
   :glob:
   :hidden:

   design/*
   design/indexes/*



