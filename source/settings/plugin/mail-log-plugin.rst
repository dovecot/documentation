.. _plugin-mail-log:

===============
mail-log plugin
===============

.. seealso:: See :ref:`mail_log_plugin` for configuration information.

Settings
========

.. dovecot_plugin:setting:: mail_log_cached_only
   :added: 2.2.28
   :default: no
   :plugin: mail-log
   :values: @boolean

   If enabled, everything except ``save`` event will log only the fields that
   can be looked up from cache. This improves performance if some of the
   fields aren't cached and it's not a strict requirement to log them.


.. dovecot_plugin:setting:: mail_log_events
   :plugin: mail-log
   :values: @string

   A space-separated list of events to log.

   Available events:

     * ``delete``
     * ``undelete``
     * ``expunge``
     * ``save``
     * ``copy``
     * ``mailbox_create``
     * ``mailbox_delete``
     * ``mailbox_rename``
     * ``flag_change``


.. dovecot_plugin:setting:: mail_log_fields
   :plugin: mail-log
   :values: @string

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
