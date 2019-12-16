.. _plugin-fts-squat:

=====================
fts-squat
=====================

Example config to use full-text search with Squat (obsolete since 2.1):

.. code-block:: none

  mail_plugins = $mail_plugins fts fts_squat

  plugin {
    fts = squat
    fts_squat = partial=4 full=4
  }

``fts_squat`` setting can be used to change Squat options:

- ``partial=n``: Length of the substring blocks to index. Default is ``4``
  characters and it's probably not a good idea to change it.
- ``full=n``: Index ``n`` first characters from the beginning of words. Default
  is ``4``, but it could be useful to increase this to e.g. ``10`` or so.
  However larger values take more disk space.

See: `Squat Full Text Search Indexing <https://wiki.dovecot.org/Plugins/FTS/Squat>`_
