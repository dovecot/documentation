.. _plugin-listescape:

=====================
listescape plugin
=====================

``listescape-plugin``
^^^^^^^^^^^^^^^^^^^^^^^
.. _setting-plugin_listescape_char:

``listescape_char``
---------------------

Default: ``\``

The Listescape plug-in allows mailbox names to contain characters that would otherwise be rendered illegal by the underlying storage system.
 
The following restrictions otherwise are in effect:

.. code-block:: none

   Maildir++ layout disallows using the "." character (unless LAYOUT=fs is used)
   The "~" character cannot be used at the beginning of a mailbox name
   The "/" character is disallowed on POSIX systems

