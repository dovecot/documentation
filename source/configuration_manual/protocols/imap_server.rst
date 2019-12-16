.. _imap_server:

==========================
Dovecot as an IMAP server
==========================

Dovecot was optimized since the beginning to work as an efficient IMAP server.
`Dovecot supports a lot of IMAP extensions <https://imapwiki.org/Specs>`_.

Some of the extensions need to be explicitly enabled:

* METADATA
* COMPRESS
* SEARCH=FUZZY
* SPECIAL-USE
* NOTIFY: Set mailbox_list_index=yes
* URLAUTH: Set imap_urlauth_host and mail_attribute_dict

.. seealso::

  :ref:`imap_metadata`

  :ref:`plugin-compress`
  
  :ref:`fts`
  
  :ref:`namespaces`
  
  :ref:`hibernation`
