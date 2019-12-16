.. _plugin-old-stats:

=====================
old stats plugin
=====================


``old_plugin-stats``
^^^^^^^^^^^^^^^^^^^^^^
.. _plugin-stats-setting_old_stats_refresh:

``old_plugin-stats-stats_refresh``
---------------------------------------

This required parameter is used with the imap_stats plug-in so that the stats
process can report IMAP-command-specific statistics for CPU use, disk usage,
etc. It specifies how often to refresh session statistics.

Example Setting:

.. code-block:: none

  plugin {
    old_stats_refresh = 30 secs
  }

.. _plugin-stats-setting_old_stats_track_cmds:

``old_stats_track_cmds``
---------------------------------------

The imap_stats plug-in enables the stats process to report
IMAP-command-specific statistics for CPU use, disk usage, etc. This setting,
for tracking these per-command statistics, is optional:

.. code-block:: none

  plugin {
    old_stats_track_cmds = yes
  }
