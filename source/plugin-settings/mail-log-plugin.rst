.. _plugin-mail-log:

=================
mail-log plugin
=================

``mail-log-plugin``
^^^^^^^^^^^^^^^^^^^^^
.. _plugin-mail-log-setting_mail_log_fields:

``mail_log_fields``
-----------------------

This setting specifies the fields for mail processes' event logging. The fields are given in a space-separated list. The following fields
are available: uid, box, msgid, from, subject, size, vsize, and flags. size and vsize are available only for expunge and copy events. 

Example Setting: 

.. code-block:: none

   mail_log_fields = uid box msgid size


.. _plugin-mail-log-setting_mail_log_events:

``mail_log_events``
-------------------------

This setting adjusts log verbosity, providing additional logging for
mail processes at plug-in level.  The setting takes a space-separated list of events to log.  In addition to the events shown in the example
below, flag_change and append are available. 

Example Setting: 

.. code-block:: none

   mail_log_events = delete undelete expunge copy mailbox_delete mailbox_rename


.. _plugin-mail-log-setting_mail_log_cached_only:

``mail_log_cached_only``
-------------------------------

Whether to use only cached fields for mail log


.. _setting-plugin_mail_crypt_curve:

``mail_crypt_curve``
---------------------

This parameter defines the elliptic curve to use for key generation with the mail_crypt plug-in.  Any valid curve supported by the
underlying cryptographic library is allowed.  
 
Example Setting:

.. code-block:: none
   
   mail_crypt_curve = secp521r1
 
This must be set if you wish to use folder keys rather than global keys.  With global keys (either RSA or, preferred, EC keys), all
keying material is taken from the plug-in environment, and no key generation is performed.  In folder-keys mode, a key pair is generated
for the user, and a folder-specific key pair is generated.  The latter is encrypted by means of the user's key pair.

