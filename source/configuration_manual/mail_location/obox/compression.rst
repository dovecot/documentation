.. _compression:

=================
Compression
=================

.. code-block:: none

  plugin {
    obox_index_fs = compress:maybe-gz:6:<...>
  }

All of the object storage backends should be set up to compress index bundle
objects. This commonly shrinks the indexes down to ``20-30``% of the original
size with ``gzip -6`` compression. It's possible to use also other compression
algorithms.

The level parameter must be between 1..9. See
http://wiki.dovecot.org/Plugins/Zlib for the current list of supported
algorithms.

.. Note:: Compression auto-detection for index bundles became available (via
          ``maybe-gz``) as of v2.2.34+.

Email object (a/k/a message blob data) compression has generally been done with
the zlib plugin instead of via the ``compress`` fs wrapper.

Example:

.. code-block:: none

  # NOTE: Using this has some trade-offs with obox installations, see below.
  mail_plugins = $mail_plugins zlib
  plugin {
    zlib_save = gz
    zlib_save_level = 6
  }

However, the problem with this with obox is that the mail files are written
compressed to fscache. On one hand this increases the fscache's file, but on
the other hand it requres Dovecot to always uncompress the files before
accessing them.

This uncompression means that the file is temporarily written to
``mail_temp_dir``. By using the ``compress`` fs wrapper in ``obox_fs`` line the
mails are stored uncompressed in fscache, and reading the mails from there
doesn't require writing to ``mail_temp_dir``.

Compression status of email object data is auto-detected. Therefore,
``zlib_save`` may safely be added to a currently existing system; existing
non-compressed mail objects will be identified correctly.
