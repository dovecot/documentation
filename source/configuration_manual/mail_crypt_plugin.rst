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

.. versionadded:: v2.2.27

Using per-folder keys is not considered production quality, but global keys are
fine.

.. Note::

  Improper configuration or use can make your emails unrecoverable. Treat
  encryption with care and backups.

This page assumes you are using configuring mail encryption from scratch with
a recent version of Dovecot.  If you are upgrading from an older version,
see :ref:`setting-plugin_mail_crypt_save_version` for possible backwards
compatibility issues.


Settings
========

See :ref:`plugin-mail-crypt`.

Plugin settings may also be dynamically set via
:ref:`authentication-user_database_extra_fields`. To provide
:ref:`setting-plugin_mail_crypt_global_private_key` and
:ref:`setting-plugin_mail_crypt_global_public_key` as userdb attributes, you
can base64 encode the original contents, such as PEM file. For example,

.. code-block:: none

  cat ecprivkey.pem | base64 -w0

All external keys must be in PEM format, using pkey format.

Modes Of Operation
==================

Mail crypt plugin can operate using **either** global keys or folder keys.
Using both is not supported. To perform any encryption,
:ref:`setting-plugin_mail_crypt_save_version` must be specified and non-zero.

Folder Keys
-----------

In this mode, the user is generated a key pair, and each folder is generated a
key pair, which is encrypted using the user's key pair. A user can have more
than one key pair but only one can be active.

:ref:`setting-plugin_mail_crypt_save_version` must be ``2``.

:ref:`setting-plugin_mail_crypt_curve` must be set.

:ref:`setting-mail_attribute_dict` must be set, as is is used to store the
keys.

Unencrypted User Keys
^^^^^^^^^^^^^^^^^^^^^

In this version of the folder keys mode, the users private key is stored
unencrypted on the server.

Example config for folder keys with Maildir:

.. code-block:: none

  mail_attribute_dict = file:%h/Maildir/dovecot-attributes
  mail_plugins = $mail_plugins mail_crypt

  plugin {
    mail_crypt_curve = secp521r1
    mail_crypt_save_version = 2
  }

Encrypted User Keys
^^^^^^^^^^^^^^^^^^^

In this version of the folder keys mode, the users private key is stored
encrypted on the server.

Example config for mandatory encrypted folder keys with Maildir:

.. code-block:: none

  mail_attribute_dict = file:%h/Maildir/dovecot-attributes
  mail_plugins = $mail_plugins mail_crypt

  plugin {
    mail_crypt_curve = secp521r1
    mail_crypt_save_version = 2
    mail_crypt_require_encrypted_user_key = yes
  }

The password that is used to decrypt the users master/private key, must be
provided via password query:

.. code-block:: none

  # File: /etc/dovecot/dovecot-sql.conf.ext

  password_query = SELECT \
    email as user, password, \
    '%w' AS userdb_mail_crypt_private_password \
    FROM virtual_users  WHERE email='%u';

Global Keys
===========

In this mode, all keying material is taken from plugin environment. You can use
either Elliptic Curve (EC) keys (recommended) or RSA keys. No key generation
is automatically performed.

RSA key
-------

.. note:: Use of RSA keys is discouraged, please use
          :ref:`mail_crypt_plugin_elliptic_curve_key` instead.

You can generate an unencrypted RSA private key in the pkey format with the
command:

.. code-block:: none

  openssl genpkey -algorithm RSA -out rsaprivkey.pem

Alterantively, you can generate a password encrypted private key with:

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

  plugin {
    mail_crypt_global_private_key = <rsaprivkey.pem
    mail_crypt_global_private_password = qwerty
    mail_crypt_global_public_key = <rsapubkey.pem
    mail_crypt_save_version = 2
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

  plugin {
    mail_crypt_global_private_key = <ecprivkey.pem
    mail_crypt_global_public_key = <ecpubkey.pem
    mail_crypt_save_version = 2
  }

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

Base64-encoded Keys
===================

Mail-crypt plugin can read keys that are base64 encoded. This is intended
mostly for providing PEM keys via userdb.

Hence, this is possible:

.. code-block:: none

  openssl ecparam -name secp256k1 -genkey | openssl pkey | base64 -w0 > ecprivkey.pem
  base64 -d ecprivkey.pem | openssl ec -pubout | base64 -w0 > ecpubkey.pem

.. code-block:: none

  passdb {
    driver = static
    args = password=pass mail_crypt_global_public_key=<content of ecpubkey.pem> mail_crypt_global_private_key=<content of ecprivkey.pem>
  }

  mail_plugins = $mail_plugins mail_crypt

  plugin {
    mail_crypt_save_version = 2
  }

Read-only Mode (``mail_crypt_save_version = 0``)
================================================

If you have encrypted mailboxes that you need to read, but no longer want to
encrypt new mail, use ``mail_crypt_save_version=0``:

.. code-block:: none

  plugin {
    mail_crypt_save_version = 0
    mail_crypt_global_private_key = <server.key
  }

mail-crypt-plugin and ACLs
==========================

If you are using global keys, mails can be shared within the key scope. The
global key can be provided with several different scopes:

* Global scope: key is configured in ``dovecot.conf`` file
* Per-user(group) scope: key is configured in userdb file

With folder keys, key sharing can be done to single user, or multiple users.
When key is shared to single user, and the user has public key available, the
folder key is encrypted to recipient's public key.

If you have :ref:`setting-plugin_mail_crypt_acl_require_secure_key_sharing`
enabled, you can't share the key to groups or someone with no public key.

Decrypting Files Encrypted with mail-crypt plugin
=================================================

You can use `decrypt.rb
<https://gist.github.com/cmouse/882f2e2a60c1e49b7d343f5a6a2721de>`_ to decrypt
encrypted files.

.. _fs_crypt:

fs-crypt and fs-mail-crypt
==========================

The fs-crypt is a lib-fs wrapper that can encrypt and decrypt files. It works
similarly to the fs-compress wrapper. It can be used to encrypt e.g.:

* FTS index objects (fts_dovecot_fs)
* External mail attachments (mail_attachment_fs)

fs-crypt comes in two flavors, ``mail-crypt`` and ``crypt``. (The differences
between the two are technical and related to internal code contexts.)

Note that fs-[mail-]crypt and the fs-compress wrapper can be also combined.
Please make sure that compression is always applied before encryption. See
:ref:`plugin-fs-compress` for an example and more details about compression.

Currently the fs-crypt plugin requires that all the files it reads are
encrypted. If it sees an unencrypted file it'll fail to read it. The plan is to
fix this later.

FS driver syntax::

  crypt:[algo=<s>:][set_prefix=<n>:][private_key_path=/path:][public_key_path=/path:][password=password:]<parent fs>``

where:

===================== ========================================================
Key                   Value
===================== ========================================================
``algo``              Encryption algorithm. Default is ``aes-256-gcm-sha256``.
``password``          Password for decrypting public key.
``private_key_path``  Path to private key.
``public_key_path``   Path to public key.
``set_prefix``        Read ``<set_prefix>_public_key`` and
                      ``<set_prefix>_private_key``. Default is
                      ``mail_crypt_global``.
===================== ========================================================

Example:

.. code-block:: none

  plugin {
    fts_index_fs = crypt:set_prefix=fscrypt_index:posix:prefix=/tmp/fts
    fscrypt_index_public_key = <server.pub
    fscrypt_index_private_key = <server.key
  }

To encrypt/decrypt files manually, you can use

.. code-block:: none

  doveadm fs get/put crypt private_key_path=foo:public_key_path=foo2:posix:prefix=/path/to/files/root path/to/file

doveadm plugin
==============

The following commands are made available via doveadm.

``doveadm mailbox cryptokey generate``
--------------------------------------

.. code-block:: none

  doveadm [-o plugin/mail_crypt_private_password=some_password] mailbox cryptokey generate [-u username | -A] [-Rf] [-U] mailbox-mask [mailbox-mask ...]

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

  doveadm [-o plugin/mail_crypt_private_password=some_password] mailbox cryptokey export [-u username | -A] [-U] mailbox-mask [mailbox-mask ...]

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
