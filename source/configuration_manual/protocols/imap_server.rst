.. _imap_server:

=========================
Dovecot as an IMAP server
=========================

Dovecot was optimized since the beginning to work as an efficient IMAP server.
`Dovecot supports a lot of IMAP extensions <https://imapwiki.org/Specs>`_.

Some of the extensions need to be explicitly enabled:

* METADATA
* COMPRESS
* SEARCH=FUZZY
* SPECIAL-USE
* NOTIFY: Set :ref:`setting-mailbox_list_index` to ``yes``
* URLAUTH: Set :ref:`setting-imap_urlauth_host` and
  :ref:`setting-mail_attribute_dict`

.. seealso::

  * :ref:`imap_metadata`
  * :ref:`plugin-imap-compress`
  * :ref:`fts`
  * :ref:`namespaces`
  * :ref:`hibernation`
