.. _plugin-mail-crypt:

=================
mail-crypt plugin
=================

.. seealso:: See :ref:`mail_crypt_plugin` for an overview.

Settings
========

.. dovecot_plugin:setting:: mail_crypt_acl_require_secure_key_sharing
   :default: 0
   :plugin: mail-crypt
   :values: @boolean

   If true (``1`` or ``y``), require secure key sharing.


.. dovecot_plugin:setting:: mail_crypt_curve
   :plugin: mail-crypt
   :values: @string

   Defines the elliptic curve to use for key generation.

   Any valid curve supported by the underlying cryptographic library is allowed.

   Example:

   .. code-block:: none

     plugin {
       mail_crypt_curve = secp521r1
     }

   This must be set if you wish to use folder keys rather than global keys.

   With global keys (either RSA or EC keys), all keying material is taken
   from the plugin environment and no key generation is performed.

   In folder-keys mode, a key pair is generated for the user, and a
   folder-specific key pair is generated. The latter is encrypted by means of
   the user's key pair.


.. dovecot_plugin:setting:: mail_crypt_global_private_key
   :plugin: mail-crypt
   :values: @string

   Private key(s) to decrypt files. Key(s) must be in PEM format, using pkey
   format.

   You can define multiple keys by appending an increasing number to the
   setting label.


.. dovecot_plugin:setting:: mail_crypt_global_public_key
   :plugin: mail-crypt
   :values: @string

   Public key to encrypt files. Key must be in PEM format, using pkey format.


.. dovecot_plugin:setting:: mail_crypt_private_key
   :plugin: mail-crypt
   :values: @string

   Private key to decrypt user's master key. Key must be in PEM format, using
   pkey format.


.. dovecot_plugin:setting:: mail_crypt_private_password
   :plugin: mail-crypt
   :values: @string

   Password to decrypt user's master key or environment private key.


.. dovecot_plugin:setting:: mail_crypt_require_encrypted_user_key
   :plugin: mail-crypt
   :values: @boolean
   :changed: v2.4;v3.0  Changed the value type to be boolean. Earlier versions evaluated all values as true.

   If true (setting exists with any value), require user key encryption
   with password.


.. dovecot_plugin:setting:: mail_crypt_save_version
   :default: 2
   :plugin: mail-crypt
   :values: @uint

   Sets the version of the mail_crypt compatibility desired.

   Options:

   ======== ================================================
   Version  Description
   ======== ================================================
   ``0``    Decryption is active; no encryption occurs.
   ``1``    Do not use (implemented for legacy reasons only)
   ``2``    Encryption and decryption are active.
   ======== ================================================
