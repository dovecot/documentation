.. _virtual_attachments_plugin:

==========================
Virtual Attachments Plugin
==========================

The virtual-attachments plugin is part of OX Dovecot Pro (Pro only).

Virtual attachments
===================

First, you'll have to load the plugin which also requires the :ref:`virtual_plugin`
to be loaded:

.. code-block:: none

  mail_plugins {
    virtual = yes
    virtual_attachments = yes
  }

Namespace configuration
=======================

Then, you'll have to create a :ref:`namespaces` for the virtual-attachments,
for example:

.. code-block:: none

  namespace virtual {
    prefix = virtual/
    separator = /
    mail_driver = virtual
    mail_path = /etc/dovecot/virtual
    mail_index_path = ~/virtual
  }

  namespace virtual-attachments {
    prefix = virtual-attachments/
    separator = /
    mail_driver = attachments
    mail_path = ~/virtual-attachments

    mailbox virtual/All {
      auto = create
    }
  }

For each folder that you want an attachments folder for, you need to create a
corresponding folder in the Virtual Attachments namespace. The mailbox names
need to match existing real or virtual mailboxes. Those mailboxes will be
mirrored below the virtual-attachments namespace. Each of the mirrored
mailboxes will contain one mail per attachment found in the referenced
mailbox. The virtual-attachments mailboxes can be auto created
(see :ref:`mailbox_settings`). For example:

 * Attachments in ``INBOX`` are in ``virtual-attachments/INBOX``
 * Attachments in ``virtual/All`` are in ``virtual-attachments/virtual/All``

.. _virtual_attachments_plugin_obox_secondary_indexes:

Storage location with obox
--------------------------

.. dovecotadded:: 2.3.17

When using the virtual-attachments plugin with obox, the virtual index files
must be in a directory named "virtual-attachments" in the user home directory.
This way the virtual-attachments indexes are added to the obox root index
bundles and will be preserved when user moves between backends or when
metacache is cleaned.

.. code-block:: none

        mail_driver = attachments
	mail_path = ~/virtual-attachments

The virtual-attachments indexes & cache will be stored in the user root bundle.

It is possible to disable storing virtual indexes in the user root bundle using
:dovecot_plugin:ref:`metacache_disable_secondary_indexes`.
