.. _plugin-fs-compress:

========================
fs-compress plugin
========================

``fs-compress`` has no settings in dovecot.conf

it is used like 

.. code-block:: none

   obox_fs = <some stuff>:compress:6:gz:<some stuff>

or alternatively

.. code-block:: none

   obox_fs = <some stuff>:maybe-compress:6:gz:<some stuff>