.. _fts_backend_flatcurve:

Flatcurve FTS Engine
====================

.. dovecotadded:: 2.4.0

Requires Xapian 1.4+ `<https://xapian.org/download/>`_ to work properly.

This is a Dovecot FTS plugin to enable message indexing using the
[Xapian](https://xapian.org/) Open Source Search Engine Library.

The plugin relies on Dovecot to do the necessary stemming. It is intended
to act as a simple interface to the Xapian storage/search query
functionality.

This driver supports match scoring and substring matches (on by default),
which means it is :rfc:`3501` (IMAP4rev1) compliant. This driver does not
support fuzzy searches.

The driver passes all of the ImapTest search tests.
`<https://github.com/dovecot/imaptest/>`_

Enabling flatcurve is designed to be as easy as adding these lines:

.. code-block:: none

    mail_plugins = $mail_plugins fts fts_flatcurve
    plugin {
        fts = flatcurve
    }

Optional parameters
-------------------

.. note:: The default settings should be fine in most scenarios.

.. dovecot_plugin:setting:: fts_flatcurve_commit_limit
  :plugin: fts-flatcurve
  :default: 500
  :values: @uint, !set to 0 to use the Xapian default

  Commit database changes after this many documents are updated. Higher commit
  limits will result in faster indexing for large transactions (i.e. indexing
  a large mailbox) at the expense of high memory usage. The default value
  should be sufficient to allow indexing in a 256 MB maximum size process.

.. dovecot_plugin:setting:: fts_flatcurve_max_term_size
  :plugin: fts-flatcurve
  :default: 30
  :values: @uint, !max: 200

  The maximum number of characters in a term to index.

.. dovecot_plugin:setting:: fts_flatcurve_min_term_size
  :plugin: fts-flatcurve
  :default: 2
  :values: @uint

  The minimum number of characters in a term to index.

.. dovecot_plugin:setting:: fts_flatcurve_optimize_limit
  :plugin: fts-flatcurve
  :default: 10
  :values: @uint, !set to 0 to disable

  Once the database reaches this number of shards, automatically optimize the
  DB at shutdown.

.. dovecot_plugin:setting:: fts_flatcurve_rotate_count
  :plugin: fts-flatcurve
  :default: 5000
  :values: @uint, !set to 0 to disable rotation

  When the "current" fts database reaches this number of messages, it is
  rotated to a read-only database and replaced by a new write DB. Most people
  should not change this setting.

.. dovecot_plugin:setting:: fts_flatcurve_rotate_time
  :plugin: fts-flatcurve
  :default: 5000
  :values: @time_msecs, !set to 0 to disable rotation

  When the "current" fts database exceeds this length of time (in msecs) to
  commit changes, it is rotated to a read-only database and replaced by a new
  write DB. Most people should not change this setting.

.. dovecot_plugin:setting:: fts_flatcurve_substring_search
  :plugin: fts-flatcurve
  :default: no
  :values: @boolean

  If enabled, allows substring searches (:rfc:`3501` compliant). However, this
  requires significant additional storage space. Most users today expect
  "Google-like" behavior, which is prefix searching, so substring searching is
  arguably not the modern expected behavior anyway. Therefore, even though it
  is not strictly RFC compliant, prefix (non-substring) searching is enabled
  by default.

FTS-Flatcurve Plugin Settings Example
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

    mail_plugins = $mail_plugins fts fts_flatcurve
    plugin {
        fts = flatcurve
        # All of these are optional, and indicate the default values.
        # They are listed here for documentation purposes; most people should
        # not need to define/override in their config.
        fts_flatcurve_commit_limit = 500
        fts_flatcurve_max_term_size = 30
        fts_flatcurve_min_term_size = 2
        fts_flatcurve_optimize_limit = 10
        fts_flatcurve_rotate_count = 5000
        fts_flatcurve_rotate_time = 5000
        fts_flatcurve_substring_search = no
    }

Data Storage
------------

Xapian search data is stored separately for each mailbox.

The data is stored under a 'fts-flatcurve' directory in the Dovecot index
file location for the mailbox.  The Xapian library is responsible for all
data stored in that directory - no Dovecot code directly writes to any file.

Logging/Events
--------------

This plugin emits with category `fts-flatcurve`, a child of the category `fts`
(see :ref`event_design`).

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
