.. _imap_metadata:

=============
IMAP METADATA
=============

Dovecot supports the IMAP METADATA extension (:rfc:`5464`),
which allows per-mailbox, per-user
data to be stored and accessed via IMAP commands.

To activate metadata storage, a :ref:`dictionary <dict>` needs to be
configured in the Dovecot configuration using the
:dovecot_core:ref:`mail_attribute` setting.

To activate the IMAP METADATA commands, the ``imap_metadata`` option needs to
be activated.

Example:

.. code-block:: none

  # Store METADATA information within user's Maildir directory
  mail_attribute {
    dict_driver = file
    dict_file_path = %h/Maildir/dovecot-attributes
  }

  protocol imap {
    imap_metadata = yes
  }
