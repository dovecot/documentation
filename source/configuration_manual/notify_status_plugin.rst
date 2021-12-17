.. _notify_status_plugin:

====================
notify-status plugin
====================

.. versionadded:: v2.2.33

This plugin updates a :ref:`dictionary <dict>` with mailbox status information
every time a mailbox changes.

Configuration
=============

Settings
--------

See :ref:`plugin-notify-status`.

This plugin requires that the :ref:`plugin-notify` be loaded.

The values to store are listed at
:ref:`plugin-notify-status-setting_notify_status_mailbox`.

Dictionary Configuration
------------------------

See :ref:`dict` for how to configure dictionaries.

This plugin updates the ``priv/status/<mailbox name>`` key.

Example
-------

.. code-block:: none

  mail_plugins = $mail_plugins notify notify_status

  plugin {
    notify_status_dict = proxy:dict-async:notify_status

    # By default all mailboxes are added to dict. This can be limited with:
    #notify_status_mailbox = INBOX
    #notify_status_mailbox2 = pattern2/*
    #...
  }

SQL dict Example
^^^^^^^^^^^^^^^^

If SQL dict is used, you can use this dictionary map:

.. code-block:: none

  map {
    pattern = priv/status/$box
    table = mailbox_status
    value_field = status
    username_field = username

    fields {
      mailbox = $box
    }
  }

The matching SQL schema is:

.. code-block:: none

  CREATE TABLE mailbox_status (
    username VARCHAR(255) NOT NULL,
    mailbox VARCHAR(255) NOT NULL,
    status VARCHAR(255),
    PRIMARY KEY (username, mailbox)
  );
