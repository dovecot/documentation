.. _fts_backend_flatcurve:

Flatcurve FTS Engine
====================

.. dovecotadded:: 2.4.0

This is a Dovecot FTS plugin to enable message indexing using the
`Xapian <https://xapian.org/>`_ Open Source Search Engine Library.

.. important:: Xapain v1.4+ is required.

The plugin relies on Dovecot to do the necessary stemming. It is intended
to act as a simple interface to the Xapian storage/search query
functionality.

This driver supports match scoring and substring matches (on by default),
which means it is :rfc:`3501` (IMAP4rev1) compliant. This driver does not
support fuzzy searches.

The driver passes all of the `ImapTest <https://github.com/dovecot/imaptest/>`_ search tests.

Enabling flatcurve is designed to be as easy as adding this to configuration:

.. code-block:: none

  mail_plugins = $mail_plugins fts fts_flatcurve

  plugin {
    # REQUIRED: Define "flatcurve" as the FTS driver.
    fts = flatcurve

    # REQUIRED: These are not flatcurve settings, but required for Dovecot FTS.
    fts_languages = en es de
    fts_tokenizer_generic = algorithm=simple
    fts_tokenizers = generic email-address

    # OPTIONAL: Recommended default FTS core configuration
    fts_filters = normalizer-icu snowball stopwords
    fts_filters_en = lowercase snowball english-possessive stopwords
  }

Dovecot Plugin
--------------

See :ref:`plugin-fts-flatcurve` for setting information.

Data Storage
------------

Xapian search data is stored separately for each mailbox.

The data is stored under a 'fts-flatcurve' directory in the Dovecot index
file location for the mailbox.  The Xapian library is responsible for all
data stored in that directory - no Dovecot code directly writes to any file.

Logging/Events
--------------

This plugin emits with category `fts-flatcurve`, a child of the category `fts`
(see :ref:`event_design`).

Named Events
^^^^^^^^^^^^

The following named events are emitted:

fts_flatcurve_expunge
"""""""""""""""""""""

Emitted when a message is expunged from a mailbox.

=========== ========================================
Field       Description
=========== ========================================
`mailbox`   The mailbox name
`uid`       The UID that was expunged from FTS index
=========== ========================================

fts_flatcurve_index
"""""""""""""""""""

Emitted when a message is indexed.

=========== ========================================
Field       Description
=========== ========================================
`mailbox`   The mailbox name
`uid`       The UID that was added to the FTS index
=========== ========================================

fts_flatcurve_last_uid
""""""""""""""""""""""

Emitted when the system queries for the last UID indexed.

=========== ========================================
Field       Description
=========== ========================================
`mailbox`   The mailbox name
`uid`       The last UID contained in the FTS index
=========== ========================================

fts_flatcurve_optimize
""""""""""""""""""""""

Emitted when a mailbox is optimized.

=========== ========================================
Field       Description
=========== ========================================
`mailbox`   The mailbox name
=========== ========================================

fts_flatcurve_query
"""""""""""""""""""

Emitted when a query is completed.

=========== ========================================
Field       Description
=========== ========================================
`count`     The number of messages matched
`mailbox`   The mailbox name
`maybe`     Are the results uncertain? \[yes\|no\]
`query`     The query text sent to Xapian
`uids`      The list of UIDs returned by the query
=========== ========================================

fts_flatcurve_rescan
""""""""""""""""""""

Emitted when a rescan is completed.

=========== ========================================================
Field       Description
=========== ========================================================
`expunged`  The list of UIDs that were expunged during rescan
`mailbox`   The mailbox name
`status`    Status of rescan \[expunge_msgs\|missing_msgs\|ok\]
`uids`      The list of UIDs that triggered a non-ok status response
=========== ========================================================

fts_flatcurve_rotate
""""""""""""""""""""

Emitted when a mailbox has it's underlying Xapian DB rotated.

=========== ========================================
Field       Description
=========== ========================================
`mailbox`   The mailbox name
=========== ========================================
