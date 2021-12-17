.. _plugin-old-stats:

================
old-stats plugin
================

.. warning:: This plugin has been deprecated. Use :ref:`statistics` instead.

Settings
========

.. _plugin-old-stats-setting_old_stats_refresh:

``old_stats_refresh``
---------------------

This required parameter is used with the :ref:`plugin-imap-old-stats` so that
the stats process can report IMAP-command-specific statistics for CPU use,
disk usage, etc. It specifies how often to refresh session statistics.

Example::

  plugin {
    old_stats_refresh = 30 secs
  }

.. _plugin-old-stats-setting_old_stats_track_cmds:

``old_stats_track_cmds``
------------------------

The :ref:`plugin-imap-old-stats` enables the stats process to report
IMAP-command-specific statistics for CPU use, disk usage, etc. This setting,
for tracking these per-command statistics, is optional::

  plugin {
    old_stats_track_cmds = yes
  }
