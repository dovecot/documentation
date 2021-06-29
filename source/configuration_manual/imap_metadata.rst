.. _imap_metadata:

=============
IMAP METADATA
=============

Dovecot supports the `IMAP METADATA extension (RFC 5464)
<https://tools.ietf.org/html/rfc5464>`_, which allows per-mailbox, per-user
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
