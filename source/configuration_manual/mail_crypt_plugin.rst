.. _mail_crypt_plugin:

=================
mail-crypt-plugin
=================

Introduction
============

The Mail crypt plugin is used to secure email messages stored in a Dovecot
system. Messages are encrypted before written to storage and decrypted after
reading. Both operations are transparent to the user.

In case of unauthorized access to the storage backend, the messages will,
without access to the decryption keys, be unreadable to the offending party.

There can be a single encryption key for the whole system or each user can have
a key of their own. The used cryptographical methods are widely used standards
and keys are stored in portable formats, when possible.

Functional Overview
-------------------

The use of Mail crypt plugin depends on a user having a keypair, a private and
a public key, for asymmetric cryptography. These keys are provisioned in a
variable via the user database or directly from Dovecot configuration files.

The public half of the provisioned keypairs are used to generate and encrypt
keys for symmetric encryption. The symmetric keys are used to encrypt and
decrypt individual files. Symmetric encryption is faster and more suitable for
block mode storage encryption. The symmetric key used to encrypt a file is
stored, after being encrypted with the public asymmetric key, together with the
file.

Encryption Technologies
-----------------------

The Mail crypt plugin provides encryption at rest for emails. Encryption of the
messages is performed using the symmetric Advanced Encryption Standard (AES)
algorithm in Galois/Counter Mode (GCM) with 256 bit keys. Integrity of the data
is ensured using Authenticated Encryption with Associated Data (AEAD) with
SHA256 hashing. The encryption keys for the symmetric encryption are randomly
generated. These keys in turn are encrypted using a key derived with from the
provisioned private key. Provisioned private keys can be Elliptic Curve (EC)
keys or RSA Encryption is done using the Integrated Encryption Scheme (IES).
This algorithm is usable both with EC and RSA keys.

Technical Requirements
======================

.. dovecotadded:: 2.2.27

Using per-folder keys is not considered production quality, but global keys are
fine.

.. Note::

  Improper configuration or use can make your emails unrecoverable. Treat
  encryption with care and backups.

This page assumes you are using configuring mail encryption from scratch with
a recent version of Dovecot.


Settings
========

See :ref:`plugin-mail-crypt`.

Per-user settings may be returned by
:ref:`authentication-user_database_extra_fields`. To provide
:dovecot_plugin:ref:`crypt_global_private_key` or
:dovecot_plugin:ref:`crypt_global_public_key` as a single line userdb
attribute, you can base64 encode the original PEM key contents. For example,

.. code-block:: none

  cat ecprivkey.pem | base64 -w0

All configured keys must be in :ref:`PEM format <pkey_format>`.

Modes Of Operation
==================

Mail crypt plugin can operate using **either** global keys or folder keys.
Using both is not supported.

Folder Keys Mode
----------------

In this mode, the user is generated a key pair. Then each folder is generated a
key pair, which is encrypted using the user's key pair. A user can have more
than one key pair, but only one can be active.


:dovecot_plugin:ref:`crypt_user_key_curve` must be set.

:dovecot_core:ref:`mail_attribute` must be set, as is is used to store the
keys.

Unencrypted User Keys
^^^^^^^^^^^^^^^^^^^^^

In this version of the folder keys mode, the user's private key is stored
unencrypted on the server.

Example config for folder keys with Maildir:

.. code-block:: none

  mail_attribute {
    dict_driver = file
    dict_file_path = %h/Maildir/dovecot-attributes
  }
  mail_plugins = $mail_plugins mail_crypt

  crypt_user_key_curve = secp521r1

Encrypted User Keys
^^^^^^^^^^^^^^^^^^^

In this version of the folder keys mode, the users private key is stored
encrypted on the server.

Example config for mandatory encrypted folder keys with Maildir:

.. code-block:: none

  mail_attribute {
    dict_driver = file
    dict_file_path = %h/Maildir/dovecot-attributes
  }
  mail_plugins = $mail_plugins mail_crypt

  crypt_user_key_curve = secp521r1
  crypt_user_key_require_encrypted = yes

The password that is used to decrypt the users master/private key, must be
provided via password query:

.. code-block:: none

  # File: /etc/dovecot/dovecot-sql.conf.ext

  password_query = \
    SELECT \
      email as user, password, \
      '%Mw' AS userdb_crypt_user_key_password \
    FROM virtual_users \
    WHERE email='%u'

Choosing encryption password
----------------------------

DO NOT use password directly. It can contain ``%`` which is interpreted as
variable expansion and can cause errors. Also, it might be visible in
debug logging. Suggested approaches are base64 encoding, hex encoding
or hashing the password. With hashing, you get the extra benefit that
password won't be directly visible in logs.

Another issue that you must consider when using user's password is that
when the password changes, *you must* re-encrypt the user private key.

Global keys
===========

In this mode, all keying material is taken from plugin environment. You can use
either Elliptic Curve (EC) keys (recommended) or RSA keys. No key generation
is automatically performed.

A good solution for environments where no user folder sharing is needed is to
generate per-user EC key pair and encrypt that with something derived from
user's password. The benefit is that it can be easier to do key management
when you can do the EC re-encryption steps in case of password change in your
user database instead of dovecot's database.

:dovecot_plugin:ref:`crypt_user_key_curve` must be empty when using global keys.

RSA key
-------

.. note:: Use of RSA keys is discouraged, please use
          :ref:`mail_crypt_plugin_elliptic_curve_key` instead.

You can generate an unencrypted RSA private key in the pkey format with the
command:

.. code-block:: none

  openssl genpkey -algorithm RSA -out rsaprivkey.pem

Alternatively, you can generate a password encrypted private key with:

.. code-block:: none

  openssl genpkey -algorithm RSA -out rsaprivkey.pem -aes-128-cbc -pass pass:qwerty

This does make the password show up in the process listing, so it can be
visible for everyone on the system.

Regardless of whether you generated an unencrypted or password encrypted
private key, you can generate a public key out of it with:

.. code-block:: none

  openssl pkey -in rsaprivkey.pem -pubout -out rsapubkey.pem

These keys can then be used with this configuration:

.. code-block:: none

  mail_plugins = $mail_plugins mail_crypt

  crypt_global_public_key = <rsapubkey.pem
  crypt_global_private_key main {
    crypt_private_key = <rsaprivkey.pem
    crypt_private_password = qwerty
  }

.. _mail_crypt_plugin_elliptic_curve_key:

Elliptic Curve (EC) Key
-----------------------

In order to generate an EC key, you must first choose a curve from the output
of this command:

.. code-block:: none

  openssl ecparam -list_curves

If you choose the curve prime256v1, generate an EC key with the command:

.. code-block:: none

  openssl ecparam -name prime256v1 -genkey | openssl pkey -out ecprivkey.pem

Then generate a public key out of your private EC key

.. code-block:: none

  openssl pkey -in ecprivkey.pem -pubout -out ecpubkey.pem

These keys can now be used with this configuration:

.. code-block:: none

  mail_plugins = $mail_plugins mail_crypt

  crypt_global_public_key = <ecpubkey.pem
  crypt_global_private_key main {
    crypt_private_key = <ecprivkey.pem
  }

.. _pkey_format:

Converting EC key to PKEY
^^^^^^^^^^^^^^^^^^^^^^^^^

If you have an EC private key which begins with something like:

.. code-block:: none

  -----BEGIN EC PRIVATE KEY-----

With possibly parameters like this before that:

.. code-block:: none

  -----BEGIN EC PARAMETERS-----
  BgUrgQQACg==
  -----END EC PARAMETERS-----

You must convert it to pkey format with:

.. code-block:: none

  openssl pkey -in oldkey.pem -out newkey.pem

Then newkey.pem can be used with mail-crypt-plugin.

Using Edwards curve DSA (EdDSA)
-------------------------------

.. dovecotadded:: 2.4.0,3.0.0

You can use EdSDA keys by using algorithm X25519 or X448 (case sensitive).

To generate a suitable keypair, use

.. code-block:: none

  openssl genpkey -algorithm X448 -out edprivkey.pem
  openssl pkey -in private.pem -pubout -out edpubkey.pem

Note that ED25519 keys are not suitable for X25519.

Base64-encoded Keys
===================

Mail-crypt plugin can read keys that are base64 encoded. This is intended
mostly for providing PEM keys via userdb.

Hence, this is possible:

.. code-block:: none

  openssl ecparam -name secp256k1 -genkey | openssl pkey | base64 -w0 > ecprivkey.pem
  base64 -d ecprivkey.pem | openssl ec -pubout | base64 -w0 > ecpubkey.pem

.. code-block:: none

  mail_plugins = $mail_plugins mail_crypt
  crypt_global_private_key main {
    # create the filter, but leave its settings empty
  }

  passdb {
    driver = static
    args = password=pass crypt_global_public_key=<content of ecpubkey.pem> crypt_global_private_key/main/private_key=<content of ecprivkey.pem>
  }

Read-only Mode
==============

If you have encrypted mailboxes that you need to read, but no longer want to
encrypt new mail, use empty :dovecot_plugin:ref:`crypt_write_algorithm` setting:

.. code-block:: none

  crypt_write_algorithm =
  crypt_global_private_key main {
    crypt_private_key = <server.key
  }

.. _mail_crypt_acl_plugin:

mail-crypt-plugin and ACLs
==========================

If you are using global keys, mails can be shared within the key scope. The
global key can be provided with several different scopes:

* Global scope: key is configured in ``dovecot.conf`` file
* Per-user(group) scope: key is configured in userdb file

With folder keys, key sharing can be done to single user, or to multiple users.
When a key is shared to a single user, and the user has a public key available, the
folder key is encrypted using recipient's public key. This requires the
``mail_crypt_acl`` plugin, which will enable accessing the encrypted shared folders.

If you have :dovecot_plugin:ref:`crypt_acl_require_secure_key_sharing`
enabled, you can't share the key to groups or someone with no public key.

Decrypting Files Encrypted with mail-crypt plugin
=================================================

You can use `decrypt.rb
<https://github.com/dovecot/tools/dcrypt-decrypt.rb>`__ to decrypt
encrypted files.

.. _fs-crypt:

fs-crypt
========

The fs-crypt is a :ref:`lib-fs wrapper <fs>` that can encrypt and decrypt files.
It works similarly to the :ref:`fs-compress wrapper <fs-compress>`.
It can be used to encrypt e.g.:

* FTS index objects (:dovecot_plugin:ref:`fts_dovecot`)
* External mail attachments (:dovecot_core:ref:`mail_ext_attachment`)

Note that fs-crypt and the fs-compress wrapper can be also combined.
Please make sure that compression is always applied before encryption. See
:ref:`plugin-fs-compress` for an example and more details about compression.

fs-crypt settings
-----------------

See :ref:`plugin-mail-crypt` for generic mail-crypt settings.

.. dovecot_plugin:setting:: fs_crypt_read_plain_fallback
   :plugin: mail-crypt
   :values: @boolean
   :default: no

   If enabled, files that are not encrypted are returned as-is. By default
   it results in a read error.

To encrypt/decrypt files manually, you can use

.. code-block:: none

  doveadm \
    -o fs_driver=crypt \
    -o fs_parent/fs_driver=posix \
    -o crypt_private_key="$(cat pubkey.pem)" \
    -o crypt_global_private_key=main \
    -o crypt_global_private_key/main/crypt_private_key="$(cat privkey.pem)" \
    fs get/put '' path/to/input-file [/path/to/output-file]

doveadm plugin
==============

The following commands are made available via doveadm.

``doveadm mailbox cryptokey generate``
--------------------------------------

.. code-block:: none

  doveadm [-o crypt_user_key_password=some_password] mailbox cryptokey generate [-u username | -A] [-Rf] [-U] mailbox-mask [mailbox-mask ...]

Generate new keypair for user or folder.

* -o - Dovecot option, needed if you use password protected keys
* -u - Username or mask to operate on
* -A - All users
* -R - Re-encrypt all folder keys with current active user key
* -f - Force keypair creation, normally keypair is only created if none found
* -U - Operate on user keypair only

To generate new active user key and re-encrypt all your keys with it can be
done with

.. code-block:: none

  doveadm mailbox cryptokey generate -u username -UR

This can be used to generate new user keypair and re-encrypt and create folder
keys.

.. Note::

  You must provide password if you want to generate password-protected keypair
  right away. You can also use doveadm mailbox cryptokey password to secure it.

``doveadm mailbox cryptokey list``
----------------------------------

.. code-block:: none

  doveadm mailbox cryptokey list [-u username | -A] [-U] mailbox-mask [mailbox-mask ...]

* -u - Username or mask to operate on
* -A - All users
* -U - Operate on user keypair only

Will list all keys for user or mailbox.

``doveadm mailbox cryptokey export``
------------------------------------

.. code-block:: none

  doveadm [-o crypt_user_key_password=some_password] mailbox cryptokey export [-u username | -A] [-U] mailbox-mask [mailbox-mask ...]

* -u - Username or mask to operate on
* -A - All users
* -U - Operate on user keypair only

Exports user or folder private keys.

``doveadm mailbox cryptokey password``
--------------------------------------

.. code-block:: none

  doveadm mailbox cryptokey password [-u username | -A] [-N | -n password] [-O | -o password] [-C]

* -u - Username or mask to operate on
* -A - All users
* -N - Ask new password
* -n - New password
* -O - Ask old password
* -o - Old password
* -C - Clear password

Sets, changes or clears password for user's private key.
