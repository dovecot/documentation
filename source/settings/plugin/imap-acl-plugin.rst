.. _plugin-imap-acl:

===========================
imap-acl plugin
===========================

``imap-acl-plugin``
^^^^^^^^^^^^^^^^^^^^

.. _plugin-imap-acl-setting_acl_anyone:

``acl_anyone``
---------------

Users who have different set of keys cannot share mails when the mails are encrypted, but sharing is possible within the scope of a key.

By default Dovecot doesn't allow using the IMAP anyone or authenticated identifier, because it would be an easy way to spam other users in the system. If you wish to allow it, set:

.. code-block:: none

   plugin 
      {
       acl_anyone = allow
      }

