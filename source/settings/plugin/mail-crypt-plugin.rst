.. _plugin-mail-crypt:

=====================
mail-crypt plugin
=====================

The Mail-crypt-plugin is used to secure email messages stored in a Dovecot system. Messages are encrypted before written to storage and decrypted after reading. Both operations are transparent to the user.

In case of unauthorized access to the storage backend, the messages will, without access to the decryption keys, be unreadable to the offending party.

There can be a single encryption key for the whole system or each user can have a key of their own. The used cryptographical methods are widely used standards and keys are stored in portable formats, when possible.

See: :ref:`mail_crypt_plugin`
