.. _plugin-lazy-expunge:

=====================
lazy-expunge plugin
=====================

``lazy-expunge-plugin``
^^^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-lazy-expunge-setting_lazy_expunge:

``lazy_expunge``
------------------

The lazy_expunge plug-in moves expunged messages and deleted mailboxes to the namespace indicated here, from which the user can
undelete them (via a Web-mail interface, for instance) without sysadmin intervention. 

Example Setting: 

.. code-block:: none

   lazy_expunge = .EXPUNGED

To prevent the messages from being included in users' quota-usage calculations, a setting such as ``quota_rule2 = .EXPUNGED:ignore``
should be used in combination with a corresponding entry in /etc/dovecot/dovecot.acl.


.. _plugin-lazy-expunge-setting_lazy_expunge_only_last_instance:

``lazy_expunge_only_last_instance``
---------------------------------------

.. versionadded:: 2.2

If mail has multiple copies (via IMAP COPY), each copy is normally moved to lazy expunge namespace when it's expunged. 
With v2.2+ you can set:

.. code-block:: none

   plugin
      { 
       lazy_expunge_only_last_instance = yes 
      }  

To copy only the last instance and immediately expunge the others. This may be useful if you want to provide a flat list of all expunged mails without duplicates in your webmail. With many clients this means that the last instance is always in the Trash mailbox.


