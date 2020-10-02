.. _plugin-mail-crypt:

=====================
mail-crypt plugin
=====================

The Mail-crypt-plugin is used to secure email messages stored in a Dovecot system. Messages are encrypted before written to storage and decrypted after reading. Both operations are transparent to the user.

In case of unauthorized access to the storage backend, the messages will, without access to the decryption keys, be unreadable to the offending party.

There can be a single encryption key for the whole system or each user can have a key of their own. The used cryptographical methods are widely used standards and keys are stored in portable formats, when possible.

.. _setting-plugin_mail_crypt_curve:

``mail_crypt_curve``
---------------------

This parameter defines the elliptic curve to use for key generation with the mail_crypt plug-in.  Any valid curve supported by the
underlying cryptographic library is allowed.  
 
Example Setting:

.. code-block:: none
   
   mail_crypt_curve = secp521r1
 
This must be set if you wish to use folder keys rather than global keys.  With global keys (either RSA or, preferred, EC keys), all
keying material is taken from the plug-in environment, and no key generation is performed.  In folder-keys mode, a key pair is generated
for the user, and a folder-specific key pair is generated.  The latter is encrypted by means of the user's key pair.

See: :ref:`mail_crypt_plugin`
