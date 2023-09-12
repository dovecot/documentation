.. _plugin-push-notification:

=================
push-notification
=================

.. seealso:: :ref:`push_notification`

Settings
========

.. dovecot_plugin:setting:: push_notification
   :plugin: push-notification
   :values: @string

   The configuration value is the name of the driver, see
   :ref:`push_notification` for the list of drivers and options supported.

   It is possible to specify multiple push notification drivers of the same
   type by differentiating them via unique names. This allows for sending a
   notification via the same driver to two different endpoints if possible.

   Example:

   .. code-block:: none

    push_notification driver1 {
      push_notification_driver = ox
      push_notification_ox_url = http://example.com/foo
    }

    push_notification driver2 {
      push_notification_driver = ox
      push_notification_ox_url = http://example.com/foo
    }
