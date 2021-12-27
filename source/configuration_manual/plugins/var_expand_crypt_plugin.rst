.. _var_expand_crypt_plugin:

=======================
var_expand_crypt Plugin
=======================

This plugin provides generic encrypt/decrypt facility for
:ref:`config_variables`.

It requires a functional :ref:`lib_dcrypt` backend.

For dovecot-auth process this plugin is automatically usable.

Settings
========

See :ref:`plugin-var-expand-crypt`.

Syntax
======

.. code-block:: none

  args=encrypted_value=%{encrypt;key=value,iv=value,noiv=yes,algo=algorithm,format=base64|hex:field}
  args=decrypted_value=%{decrypt;key=value,iv=value,noiv=yes,algo=algorithm,format=base64|hex:field}

=========== ============================================
Key         Value
=========== ============================================
``algo``    Algorithm name (defaults to ``aes-256-cbc``)
``format``  Return format
``iv``      hex-encoded value
``key``     hex-encoded value
``noiv``    Whether iv is included in return value
=========== ============================================

decrypt expects input in base64 or hex format.

.. note:: It is usually best to leave iv management to Dovecot, and not use
          ``iv`` and ``noiv`` options at all.

Return Formats
--------------

Without ``noiv``, encrypt returns ``iv$encrypted$``.

With ``noiv``, just encrypted data is returned. Field(s) are encoded using
format.

``key`` and ``iv`` must be the length required by the given ``algo``.

Example
-------

.. code-block:: none

  %{encrypt;key=f1f2f3f4f5f6f7f8f1f2f3f4f5f6f7f8f1f2f3f4f5f6f7f8f1f2f3f4f5f6f7f8:password} = 93736a0f910df27f89210e096e1d639a$966c2b4f3e7487f6acdb836f8d1dc3e0$
  %{decrypt;key=f1f2f3f4f5f6f7f8f1f2f3f4f5f6f7f8f1f2f3f4f5f6f7f8f1f2f3f4f5f6f7f8:encrypted} = pass
