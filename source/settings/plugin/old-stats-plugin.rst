.. _plugin-old-stats:

================
old-stats plugin
================

.. versionremoved:: 3.0.0

.. seealso:: :ref:`statistics`.

Settings
========

.. dovecot_plugin:setting:: old_stats_refresh
   :hdr_only: yes
   :plugin: old-stats

   This required parameter is used with the :ref:`plugin-imap-old-stats` so
   that the stats process can report IMAP-command-specific statistics for CPU
   use, disk usage, etc. It specifies how often to refresh session statistics.

   Example:

   .. code-block:: none

     plugin {
       old_stats_refresh = 30 secs
     }


.. dovecot_plugin:setting:: old_stats_track_cmds
   :hdr_only: yes
   :plugin: old-stats

   The :ref:`plugin-imap-old-stats` enables the stats process to report
   IMAP-command-specific statistics for CPU use, disk usage, etc. This
   setting, for tracking these per-command statistics, is optional:

   .. code-block:: none

     plugin {
       old_stats_track_cmds = yes
     }
