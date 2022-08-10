.. _compression:

=================
Compression
=================

.. code-block:: none

  plugin {
    obox_index_fs = compress:maybe-<algorithm>:<level>:<...>
  }

All of the object storage backends should be set up to compress index bundle
objects. This commonly shrinks the indexes down to 20-30% of the original
size with ``gzip -6`` compression. It's possible to use also other compression
algorithms.

See the :ref:`plugin-fs-compress` and :ref:`plugin-mail-compress` plugin
documentation for supported algorithms and the meaning of the level parameter.

.. Note:: Compression auto-detection for index bundles became available (via
          ``maybe-<algorithm>``) as of v2.2.34+.

Email object (a/k/a message blob data) compression has generally been done with
the :ref:`plugin-mail-compress` instead of via the ``compress`` fs wrapper.

Example:

.. code-block:: none

  # NOTE: Using this has some trade-offs with obox installations, see below.
  mail_plugins = $mail_plugins mail_compress
  plugin {
    mail_compress_save = <algorithm>
    mail_compress_save_level = <level>
  }

However, the problem with this with obox is that the mail files are written
compressed to fscache. On one hand this increases the fscache's file, but on
the other hand it requires Dovecot to always uncompress the files before
accessing them.

This decompression uses a temporary file that is written to
:dovecot_core:ref:`mail_temp_dir`. By using the ``compress`` fs wrapper after ``fscache`` in
:dovecot_plugin:ref:`obox_fs` line the mails are stored uncompressed in ``fscache``, and reading
the mails from there doesn't require writing to
:dovecot_core:ref:`mail_temp_dir`.

Compression status of email object data is auto-detected. Therefore,
:dovecot_plugin:ref:`mail_compress_save` may safely be added to a currently
existing system; existing non-compressed mail objects will be identified
correctly.
