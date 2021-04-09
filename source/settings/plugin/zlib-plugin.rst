.. _plugin-zlib:

======================
zlib plugin
======================

``zlib-plugin``
^^^^^^^^^^^^^^^^
.. _plugin-zlib-setting_zlib_save:

``zlib_save``
---------------

All of the object storage back ends should be set up to compress
index-bundle objects. Typically, gzip -6 compression is used, though other
compression algorithms are possible.

The :ref:`zlib_plugin` configuration documentation gives a list of the
algorithms that are currently supported.

Example Setting:

.. code-block:: none

   zlib_save = gz


.. _plugin-zlib-setting_zlib_save_level:

``zlib_save_level``
-------------------

All of the object storage back ends should be set up to compress
index-bundle objects. Typically, gzip -6 compression is used.

The :ref:`zlib_plugin` configuration documentation describes the limits
imposed on the compression level parameter.

Example Setting:

.. code-block:: none
   
   zlib_save_level = 6

.. versionadded:: v2.3.15

You can use per-algorithm compression levels, and defaults. Prior to v2.3.15,
the compression level must be an integer in the range 1 to 9 regardless of the
algorithm selected. The default level is 6. These values may not be sensical
with compression algorithms other than gz and bz2.

For example, zstd supports levels from -1 to 22 in latest Zstandard version.
