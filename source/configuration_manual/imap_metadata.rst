.. _imap_metadata:

=============
IMAP METADATA
=============

Dovecot supports the IMAP METADATA extension (:rfc:`5464`),
which allows per-mailbox, per-user
data to be stored and accessed via IMAP commands.

To activate metadata storage, a :ref:`dictionary <dict>` needs to be
configured in the Dovecot configuration using the ``mail_attribute_dict``
option.

To activate the IMAP METADATA commands, the ``imap_metadata`` option needs to
be activated.

Example:

.. code-block:: none

  # Store METADATA information within user's Maildir directory
  mail_attribute_dict = file:%h/Maildir/dovecot-attributes

  protocol imap {
    imap_metadata = yes
  }

Storing metadata in SQL dictionary
==================================

You can store metadata into a database too. This works best with dedicated table
for storing the entries. 

Database schema
---------------

.. code:: sql

  CREATE TABLE metadata (
    attr_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL DEFAULT '',
    attr_value VARCHAR(65535),
    PRIMARY KEY(attr_name, username)
  );

Configuration
-------------

Create dictionary config file with following map::

  ## driver specific config excluded

  map {
     pattern = $key
     table = attr_priv
     fields {
        attr_name = $key
     }
     username_field = username
     value_field = attr_value
  }

Then in dovecot add::

  dict {
    metadata = driver:/path/to/config
  }

  mail_attribute_dict = proxy::metadata

Storing metadata in redis
=========================

To use redis, you can use::

  mail_attribute_dict = redis:127.0.0.1  
