.. _dumpster_config:

===============
Dumpster Config
===============

.. note:: "Dumpster" is an Open-Xchange proprietary App Suite feature that
   will list messages stored in a single Dovecot :ref:`lazy_expunge_plugin`
   mailbox.

This config moves the last copy of a message, when deleted, to a hidden
``EXPUNGED`` mailbox.  Messages in the ``EXPUNGED`` mailbox will be
automatically expunged after 7 days.  Messages in ``EXPUNGED`` will not
count toward the quota limit.  The ``EXPUNGED`` mailbox will NOT be visible
to hosts connecting on any IP other than 127.0.0.2 (App Suite should connect
to Dovecot on this address so that ``EXPUNGED`` can be displayed by the
Dumpster view).

`/etc/dovecot/dovecot.conf`:

.. code-block:: none

   namespace inbox {
     mailbox EXPUNGED {
       autoexpunge = 7d
     }
   }

   mail_plugins {
     lazy_expunge = yes
   }
   lazy_expunge_mailbox = EXPUNGED
   lazy_expunge_only_last_instance = yes
   plugin {
     quota_rule = EXPUNGED:ignore
   }

   protocol imap {
     mail_plugins {
       acl = yes
     }
     plugin {
       # Hide EXPUNGED by default
       acl = vfile:/etc/dovecot/dovecot.acl
     }
   }

   local 127.0.0.2 {
     protocol imap {
       plugin {
         # Allow EXPUNGED to be accessed by App Suite
         # Note: App Suite does not need to be able to list, as the EXPUNGED
         # mailbox is not shown in mailbox listing; it is directly accessed
         # via the Dumpster module
         acl = vfile:/etc/dovecot/lazy_expunge.acl
       }
     }
   }

`/etc/dovecot/dovecot.acl`:

.. code-block:: none

   EXPUNGED owner ip

`/etc/dovecot/lazy_expunge.acl`:

.. code-block:: none

   EXPUNGED owner rwstipekxa
