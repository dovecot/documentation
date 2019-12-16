.. _lazy_expunge:

===================
Lazy-expunge
===================

Lazy-expunging allows accessing already expunged mails by moving them to a hidden folder or namespace. This can be useful for recovering mails when users accidentally delete mails, e.g. by testing a POP3 client that deletes all mails afterwards. See http://wiki.dovecot.org/Plugins/Lazyexpunge

Lazy-expunge also allows to reduce Cassandra lookups with dictmap, by removing the lockdir setting and enabling the obox_track_copy_flags setting. So it's recommended to be used for performance reasons as well.

.. code-block:: none

   mail_plugins = $mail_plugins lazy_expunge
   plugin {
   lazy_expunge = EXPUNGED
   # If Cassandra w/obox is used:
   obox_track_copy_flags = yes
  }

Generally, it is desired that messages in lazy_expunge mailbox/namespace are NOT counted towards user quota, as the messages seen by the user will not match-up with the size of the quota otherwise.  To do this, create a quota rule that excludes the lazy_expunge mailbox/namespace from the quota.  Example:

.. code-block:: none

   plugin { 
   quota = count:User quota
   quota_rule = *:storage=1GB
   quota_rule2 = EXPUNGED:ignore
   }

Messages are not auto-deleted once they are moved into lazy_expunge mailbox/namespace.  To do this, you need to configure autoexpunge for the mailbox.


.. toctree::
   :maxdepth: 1

   dumpster_config