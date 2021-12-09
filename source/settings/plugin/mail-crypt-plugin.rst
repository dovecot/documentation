.. _plugin-mail-crypt:

=================
mail-crypt plugin
=================

.. seealso:: See :ref:`mail_crypt_plugin` for an overview.

Settings
========

.. _setting-plugin_mail_crypt_acl_require_secure_key_sharing:

``mail_crypt_acl_require_secure_key_sharing``
---------------------------------------------

- Default: ``0``
- Values:  :ref:`boolean`

If true (``1`` or ``y``), require secure key sharing.


.. _setting-plugin_mail_crypt_curve:

``mail_crypt_curve``
--------------------

- Default: <empty>
- Values:  :ref:`string`

Defines the elliptic curve to use for key generation.

Any valid curve supported by the underlying cryptographic library is allowed.

Example::

  plugin {
    mail_crypt_curve = secp521r1
  }

This must be set if you wish to use folder keys rather than global keys.

With global keys (either RSA or EC keys), all keying material is taken from the
plugin environment and no key generation is performed.

In folder-keys mode, a key pair is generated for the user, and a
folder-specific key pair is generated. The latter is encrypted by means of the
user's key pair.


.. _setting-plugin_mail_crypt_global_public_key:

``mail_crypt_global_public_key``
--------------------------------

- Default: <empty>
- Values:  :ref:`string`

Public key to encrypt files. Key must be in PEM format, using pkey format.


.. _setting-plugin_mail_crypt_global_private_key:

``mail_crypt_global_private_key``
---------------------------------

- Default: <empty>
- Values:  :ref:`string`

Private key(s) to decrypt files. Key(s) must be in PEM format, using pkey
format.

You can define multiple keys by appending an increasing number to the setting
label.


.. _setting-plugin_mail_crypt_private_key:

``mail_crypt_private_key``
--------------------------

- Default: <empty>
- Values:  :ref:`string`

Private key to decrypt user's master key. Key must be in PEM format, using
pkey format.


.. _setting-plugin_mail_crypt_private_password:

``mail_crypt_private_password``
-------------------------------

- Default: <empty>
- Values:  :ref:`string`

Password to decrypt user's master key or environment private key.


.. _setting-plugin_mail_crypt_require_encrypted_user_key:

``mail_crypt_require_encrypted_user_key``
-----------------------------------------

- Default: <empty>
- Values:  <existence> (if setting exists, it is evaluated as true)

If true (setting exists with any value), require user key encryption
with password.


.. _setting-plugin_mail_crypt_save_version:

``mail_crypt_save_version``
---------------------------

- Default: ``2``
- Values:  :ref:`uint`

Sets the version of the mail_crypt compatibility desired.

Options:

======== ================================================
Version  Description
======== ================================================
``0``    Decryption is active; no encryption occurs.
``1``    Do not use (implemented for legacy reasons only)
``2``    Encryption and decryption are active.
======== ================================================
