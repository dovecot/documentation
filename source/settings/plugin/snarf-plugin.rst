.. _plugin-snarf:

=============
snarf plugin
=============

.. versionremoved:: 2.3.14

``snarf-plugin``
^^^^^^^^^^^^^^^^^
.. _plugin-snarf-setting_mbox_snarf:

``mbox_snarf``
---------------------

UW-IMAP does snarfing from ``/var/mail/user`` to ~/mbox file, but only if ~/mbox exists. Normally Dovecot does the snarfing always if it's enabled. To enable it only optionally, set also:

.. code-block:: none

   plugin
      { 
       mbox_snarf = ~/mbox 
      }


.. _plugin-snarf-setting_snarf:

``snarf``
--------------

The snarf plug-in is used for moving messages from the snarf mailbox specified by this parameter to the user's INBOX - for
instance, from ``/var/mail/username`` to ``~username/mbox``.  A default and a snarf namespace must be set up. 

Example Setting: 

.. code-block:: none

   snarf = /snarf/INBOX

If optional snarfing is preferred, a value such as "~/mbox" causes snarfing to be performed only when the ~/mbox file exists.

