.. _notify_status_plugin:

====================
notify_status plugin
====================

.. versionadded:: v2.2.33

This plugin updates a dict every time a mailbox changes. The status can contain
total message count and unseen count. It will update key ``priv/status/<mailbox
name>``. See :ref:`dict` for how to configure dictionaries.

Configuration
=============

.. code-block:: none

  mail_plugins = $mail_plugins notify notify_status

  plugin {
    notify_status_dict = <dict uri> # For example proxy:dict-async:notify_status

    # Value written to dict:
    #notify_status_value = {"messages":%%{messages},"unseen":%%{unseen}}

    # By default all mailboxes are added to dict. This can be limited with:
    #notify_status_mailbox = INBOX
    #notify_status_mailbox2 = pattern2/*
    #...
  }

If SQL dict is used, you can use this map:

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

Supported fields
================

These fields can be used as ``%%{variables}`` in ``notify_status_value``
setting:

* username - Username (user@domain)
* mailbox - name of mailbox
* messages - n. of messages
* unseen - n. unseen message
* recent - n. recent messages (not accurate)
* uidvalidity - current UID validity
* uidnext - predicted next UID value
* first_recent_uid - first recent UID
* highest_modseq - higest modification sequence number
* highest_pvt_modseq - highest private modification sequence number
