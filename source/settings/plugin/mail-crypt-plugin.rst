.. _plugin-mail-crypt:

=================
mail-crypt plugin
=================

.. seealso:: See :ref:`mail_crypt_plugin` for an overview.

Settings
========

.. dovecot_plugin:setting:: crypt_acl_require_secure_key_sharing
   :default: no
   :plugin: mail-crypt-acl
   :values: @boolean

   If enabled, you cannot share a key to groups or someone without a public
   key.


.. dovecot_plugin:setting:: crypt_user_key_curve
   :plugin: mail-crypt
   :values: @string

   Defines the elliptic curve to use for key generation.

   Any valid curve supported by the underlying cryptographic library is allowed.

   Example:

   .. code-block:: none

     plugin {
       crypt_user_key_curve = secp521r1
     }

   This must be set if you wish to use folder keys rather than global keys.

   With global keys (either RSA or EC keys), all keying material is taken
   from the settings and no key generation is performed.

   In folder-keys mode, a key pair is generated for the user, and a
   folder-specific key pair is generated. The latter is encrypted by means of
   the user's key pair.

   For EdDSA, you need to use X448 or X25519, case sensitive.

.. dovecot_plugin:setting:: crypt_global_private_keys
   :plugin: mail-crypt
   :values: @named_list_filter

   List of private key(s) to decrypt files. Add 
   :dovecot_plugin:ref:`crypt_private_key_file` and optionally
   :dovecot_plugin:ref:`crypt_private_key_password` inside each filter.

.. dovecot_plugin:setting:: crypt_global_public_key_file
   :plugin: mail-crypt
   :values: @string

   Public key to encrypt files. Key must be in
   :ref:`PEM pkey format <pkey_format>`. The PEM key may additionally be
   base64-encoded into a single line, which can make it easier to store into
   userdb extra fields.


.. dovecot_plugin:setting:: crypt_global_private_key
   :plugin: mail-crypt
   :values: @named_list_filter

   List of global private key(s) to decrypt mails. Add
   :dovecot_plugin:ref:`crypt_private_key_file` and optionally
   :dovecot_plugin:ref:`crypt_private_key_password` inside each filter.


.. dovecot_plugin:setting:: crypt_user_key_encryption_key
   :plugin: mail-crypt
   :values: @named_list_filter

   List of private key(s) to decrypt user's master private key. Add
   :dovecot_plugin:ref:`crypt_private_key_file` and optionally
   :dovecot_plugin:ref:`crypt_private_key_password` inside each filter.


.. dovecot_plugin:setting:: crypt_user_key_password
   :plugin: mail-crypt
   :values: @string

   Password to decrypt user's master private key.


.. dovecot_plugin:setting:: crypt_user_key_require_encrypted
   :plugin: mail-crypt
   :values: @boolean

   If yes, require user's master private key to be encrypted with
   :dovecot_plugin:ref:`crypt_user_key_password` or
   :dovecot_plugin:ref:`crypt_user_key_encryption_key`. If they are unset, new
   user key generation will fail. This setting doesn't affect already existing
   non-encrypted keys.


.. dovecot_plugin:setting:: crypt_write_algorithm
   :plugin: mail-crypt
   :values: @string
   :default: aes-256-gcm-sha256

   Set the encryption algorithm. If empty, new mails are not encrypted, but
   existing mails can still be decrypted.


.. dovecot_plugin:setting:: crypt_private_key_name
   :plugin: mail-crypt
   :values: @string

   Name of the private key inside
   :dovecot_plugin:ref:`crypt_global_private_keys` or
   :dovecot_plugin:ref:`crypt_user_key_encryption_key`.


.. dovecot_plugin:setting:: crypt_private_key_file
   :plugin: mail-crypt
   :values: @string

   Private key in :ref:`PEM pkey format <pkey_format>`. The PEM key may
   additionally be base64-encoded into a single line, which can make it easier
   to store into userdb extra fields.

   Used inside :dovecot_plugin:ref:`crypt_global_private_keys` and
   :dovecot_plugin:ref:`crypt_user_key_encryption_key` lists.


.. dovecot_plugin:setting:: crypt_private_key_password
   :plugin: mail-crypt
   :values: @string

   Password to decrypt :dovecot_plugin:ref:`crypt_private_key_file`.


