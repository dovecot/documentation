.. _plugin-push-notification:

=================
push-notification
=================

.. seealso:: :ref:`push_notification`

Settings
========

.. dovecot_plugin:setting:: push_notification_driver
   :plugin: push-notification
   :values: @string

   The configuration value is the name of the driver, optionally
   followed by an ``:`` and driver-specific options (see
   :ref:`push_notification` for the list of drivers and options supported).

   It is possible to specify multiple push notification drivers by adding a
   sequential number to the ``push_notification_driver`` label, starting with
   the number ``2``. There can be no numbering gaps for the labels; only the
   drivers that appear in sequential order will be processed.
