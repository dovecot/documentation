.. _plugin-fts-user:

===========================
fts-user
===========================

``fts-user-plugin``
^^^^^^^^^^^^^^^^^^^^
.. _plugin-fts-user-setting_fts_languages:

``fts_languages``
-------------------

A space-separated list of languages that the system's full-text search should
be able to detect is provided with this setting, typically made in the plugin
block of 90-plugin.conf. The filters used for stemming and stopwords are
language-dependent.

Example Setting:

.. code-block:: none

  plugin {
    fts_languages = en de
  }

The language listed first is the default and is used when language recognition
fails.
