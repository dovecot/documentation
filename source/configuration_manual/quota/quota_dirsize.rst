.. _quota_backend_dirsize:

======================
Quota Backend: dirsize
======================

The ``dirsize`` quota backend calculates the quota by finding all files in
configured mail directories and summing up their sizes.

This works pretty fast with mboxes, but dirsize is a really bad idea with
Maildirs'''. It will end up eating all your CPU and disk I/O.

The ``dirsize`` quota backend supports ``storage`` quota limits, but not
``messages`` quota limits.

Example
^^^^^^^

.. code-block:: none

  plugin {
    # 10MB quota limit
    quota = dirsize:User quota
    quota_rule = *:storage=10M
  }
