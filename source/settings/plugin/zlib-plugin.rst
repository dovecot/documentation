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


