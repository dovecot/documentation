.. _imap_server:

=========================
Dovecot as an IMAP server
=========================

Dovecot was optimized since the beginning to work as an efficient IMAP server.
`Dovecot supports a lot of IMAP extensions <https://imapwiki.org/Specs>`_.

Some extensions are automatically enabled:

* COMPRESS

Some of the extensions need to be explicitly enabled:

* METADATA
* SEARCH=FUZZY
* SPECIAL-USE
* NOTIFY: Set :dovecot_core:ref:`mailbox_list_index` to ``yes``
* URLAUTH: Set :dovecot_core:ref:`imap_urlauth_host` and
  :dovecot_core:ref:`mail_attribute_dict`

.. seealso::

  * :ref:`imap_compress`
  * :ref:`imap_metadata`
  * :ref:`fts`
  * :ref:`namespaces`
  * :ref:`hibernation`

.. versionchanged:: v2.4.0;v3.0.0

  Before, the ``COMPRESS`` extension was available as the
  :ref:`plugin-imap-zlib` plugin, which needed to be explicitly enabled.
