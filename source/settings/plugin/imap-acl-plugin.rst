.. _plugin-imap-acl:

===============
imap-acl plugin
===============

.. seealso:: See :ref:`acl-imap_acl` for information on the IMAP ACL plugin.

Settings
========

.. dovecot_plugin:setting:: acl_anyone
   :plugin: imap-acl
   :values: allow

   Users who have different set of keys cannot share mails when the mails are
   encrypted, but sharing is possible within the scope of a key.

   By default Dovecot doesn't allow using the IMAP "``anyone``" or
   "``authenticated``" identifier, because it would be an easy way to spam
   other users in the system. If you wish to allow it, set:

   .. code-block:: none

     plugin {
       acl_anyone = allow
     }
