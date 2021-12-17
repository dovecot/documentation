.. _plugin-mail-log:

===============
mail-log plugin
===============

.. seealso:: See :ref:`mail_log_plugin` for configuration information.

Settings
========

.. _plugin-mail-log-setting_mail_log_cached_only:

``mail_log_cached_only``
------------------------

.. versionadded:: v2.2.28

- Default: ``no``
- Values:  :ref:`boolean`

If enabled, everything except `save` event will log only the fields that can
be looked up from cache. This improves performance if some of the fields
aren't cached and it's not a strict requirement to log them.


.. _plugin-mail-log-setting_mail_log_events:

``mail_log_events``
-------------------

- Default: ``no``
- Values:  :ref:`boolean`

A space-separated list of events to log.

* ``delete``
* ``undelete``
* ``expunge``
* ``save``
* ``copy``
* ``mailbox_create``
* ``mailbox_delete``
* ``mailbox_rename``
* ``flag_change``


.. _plugin-mail-log-setting_mail_log_fields:

``mail_log_fields``
-------------------

A space-separated list of fields to log.

============ ===================================================
Field        Restrictions
============ ===================================================
``uid``
``box``
``msgid``
``size``     Only available for ``expunge`` and ``copy`` events.
``vsize``    Only available for ``expunge`` and ``copy`` events.
``vsize``
``flags``
``from``
``subject``
============ ===================================================
