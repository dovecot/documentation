.. _plugin-notify-status:

=========================
notify-status plugin
=========================

.. versionadded:: v2.2.33

This plugin updates a dict every time a mailbox changes. The status can contain total message count and unseen count. It will update key priv/status/<mailbox name>. 

See: `Dictionary <https://wiki.dovecot.org/Dictionary>`_ for how to configure dict.

See: `notify_status plugin <https://wiki.dovecot.org/Plugins/NotifyStatus>`_
