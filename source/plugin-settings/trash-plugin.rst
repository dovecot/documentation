.. _plugin-trash:

==============
trash plugin
==============

``trash-plugin``
^^^^^^^^^^^^^^^^^
.. _plugin-trash-setting_trash:

``trash``
------------

Normally, a Quota exceeded error is returned if saving/copying a message would bring the user over quota.  With the trash plug-in, instead the oldest messages are expunged from the specified mailboxes
until the message can be saved (the error is returned only if all messages in those mailboxes together take up more space than the message being handled).
 
This parameter points to a text file that configures the plug-in's behavior.

Example Setting:

   .. code-block:: none

      trash = /etc/dovecot/dovecot-trash.conf.External

The file uses the following format: 

Example Setting:

.. code-block:: none

   <priority> <mailbox name>

Deletion begins with the mailbox that has the lowest priority number and proceeds from there.

