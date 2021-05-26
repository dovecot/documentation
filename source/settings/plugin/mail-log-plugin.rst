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

If enabled, everything except `save` event will log only the fields that can
be looked up from cache. This improves performance if some of the fields
aren't cached and it's not a strict requirement to log them.
