.. _plugin-fts-flatcurve:

====================
fts-flatcurve plugin
====================

.. seealso:: See :ref:`fts_backend_flatcurve` for further details.

Settings
========

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
