.. _plugin-obox:

===========
obox plugin
===========

``obox-plugin``
^^^^^^^^^^^^^^^

.. _plugin-obox-setting_obox_track_copy_flags:

``obox_track_copy_flags``
-------------------------

- Default: ``no``
- Values: :ref:`boolean`

Enable only if Cassandra & lazy_expunge plugin are used: Try to avoid Cassandra SELECTs when expunging mails. 


.. _plugin-obox-setting_obox_refresh_index_once_after:

``obox_refresh_index_once_after``
---------------------------------

- Default: ``0``
- Values: :ref:`uint`

This forces the next mailbox open after the specified UNIX timestamp to refresh locally cached indexes to see if other backends have modified the user's indexes simultaneously.


.. _plugin-obox-setting_obox_rescan_mails_once_after:

``obox_rescan_mails_once_after``
--------------------------------

- Default: ``0``
- Values: :ref:`uint`

This forces the next mailbox open after the specified UNIX timestamp to rescan the mails to make sure there aren't any unindexed mails.


.. _plugin-obox-setting_obox_fs:

``obox_fs``
-----------

- Default: <empty>
- Values: :ref:`string`

This setting handles the basic Object Storage configuration, typically via the plugin block of 90-plugin.conf.


.. _plugin-obox-setting_obox_index_fs:

``obox_index_fs``
-----------------

- Default: Same as obox_fs
- Values: :ref:`string`

This setting handles the object storage configuration for index bundles.

.. WARNING:: obox_index_fs is currently not compatible with fs-posix driver.
