.. _notify_status_plugin:

====================
notify-status plugin
====================

.. dovecotadded:: 2.2.33

This plugin updates a :ref:`dictionary <dict>` with mailbox status information
every time a mailbox changes.

Configuration
=============

Settings
--------

See :ref:`plugin-notify-status`.

This plugin requires that the :ref:`plugin-notify` be loaded.

The values to store are listed at :dovecot_plugin:ref:`mailbox_notify_status`.

Dictionary Configuration
------------------------

See :ref:`dict` for how to configure dictionaries.

This plugin updates the ``priv/status/<mailbox name>`` key.

Example
-------

.. code-block:: none

  mail_plugins {
    notify = yes
    notify_status = yes
  }

  notify_status {
    dict proxy {
      name = notify_status
      socket_path = dict-async
    }
  }

  # By default no mailbox is added to dict. To enable all notify_status for
  # all mailboxes add:
  mailbox_notify_status = yes

  # If you keep the default mailbox_notify_status = no you can enable it per
  # mailbox like this:
  mailbox inbox {
    notify_status = yes
  }
  mailbox TestBox {
    notify_status = yes
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
