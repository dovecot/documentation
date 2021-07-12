.. _zlib_plugin:

===========
Zlib plugin
===========

Zlib plugin can be used to read compressed mbox, maildir or dbox files. It can
also be used to write (via IMAP, `LDA <lda>` and/or :ref:`lmtp_server`)
compressed messages to `dbox <dbox_mbox_format>` or
`Maildir <maildir_mbox_format>`_ mailboxes. Zlib plugin supports compression
and decompression using the following libraries:

* zlib/gzip
* bzlib/bzip2
* liblzma/xz (v2.2.9+ reading, v2.2.9-v2.3.13 writing)
* liblz4/lz4 (v2.2.11+)
* `Zstandard <https://facebook.github.io/zstd/>`_ (2.3.12+)

Configuration:

.. code-block:: none

  # Enable zlib plugin globally for reading/writing:
  mail_plugins = $mail_plugins zlib

  # Enable these only if you want compression while saving:
  plugin {
    zlib_save = gz
    zlib_save_level = 6
  }

The ``zlib_save`` setting selects the compression algorithm (currently
supported values are: gz, bz2, lz4, zstd) to use when saving a new mail.
The ``zlib_save_level`` setting sets the compression level used.

You can use per-algorithm compression levels, and defaults. Prior to v2.3.15,
the compression level must be an integer in the range 1 to 9 regardless of the
algorithm selected. The default level is 6. These values may not make sense
with compression algorithms other than gz and bz2. For example, zstd supports
levels from -1 to 22 in latest Zstandard version.

  .. versionchanged:: 2.3.15

mbox
====

Compressed mbox files can be accessed only as read-only. The compression is
detected based on the file name, so your compressed mboxes should end with .gz
or .bz2 extension. There is no support for compression during saving.

dbox
====

Mails can be stored as compressed. Existing uncompressed mails can't currently
be directly compressed (or vice versa). You could, however, use `dsync
<https://wiki.dovecot.org/Tools/Doveadm/Sync?action=show&redirect=Tools%2FDsync>`_
to copy all mails to another location (which saves them compressed) and then
replace the original location with the new compressed location. You can do this
by treating the operation the same as if you were migrating from one mailbox
format to another (see the dsync page examples).

Maildir
=======

When this plugin is loaded Dovecot can read both compressed and uncompressed
files from Maildir. The files within a Maildir can use any supported
compression algorithm (e.g., some can be compressed uzing gzip, while others
are compressed using zstd). The algorithm is detected by reading the first
few bytes from the file and figuring out if it's a valid gzip or bzip2 header.
The file name doesn't matter.

To avoid IMAP clients attempting to exploit security holes in the compression
algorithm libraries (e.g., bzlib) by writing specially crafted mails using
IMAP's APPEND command, Dovecot will not allow clients to save mails that are
detected as compressed.

All mails must have , ``S=<size>`` in their filename where <size> contains the
original uncompressed mail size, otherwise there will be problems with quota
calculation as well as other potential random failures. Note that if the
filename doesn't contain the , ``S=<size>`` before compression, adding it
afterwards changes the base filename and thus the message UID. The safest thing
to do is simply to not compress such files.

You should also preserve the file's mtime so INTERNALDATE doesn't change.

If you want to use dsync to convert to a compressed Maildir you may need ``-o``
``maildir_copy_with_hardlinks=no`` (this is set to yes by default and will
prevent compression).

Compression
===========

You'll probably want to use some cronjob to compress old mails. However note
that to avoid seeing duplicate mails in rare race conditions you'll have to use
the included maildirlock utility. The idea is to:

1. Find the mails you want to compress in a single maildir.

 * Skip files that don't have, ``S=<size>`` in the filename.

2. Compress the mails to ``tmp/``

 * Update the compressed files' mtimes to be the same as they were in the
   original files (e.g. touch command)

3. Run ``maildirlock`` ``<path>``  ``<timeout>``. It writes PID to stdout, save
   it.

 * <path> is path to the directory containing Maildir's dovecot-uidlist (the
   control directory, if it's separate)
 * <timeout> specifies how long to wait for the lock before failing.

4. If maildirlock grabbed the lock successfully (exit code 0) you can continue.
5. For each mail you compressed:

 1. Verify that it still exists where you last saw it.
 2. If it doesn't exist, delete the compressed file. Its flags may have been
     changed or it may have been expunged. This happens rarely, so just let the
     next run handle it.
 3. f the file does exist, ``rename()`` ``(mv)`` the compressed file over the
     original file.

Dovecot can now read the file, but to avoid compressing it again on the next
run, you'll probably want to rename it again to include e.g. a `Z` flag in the
file name to mark that it was compressed (e.g.
``1223212411.M907959P17184.host,S=3271:2,SZ``).

Remember that the `Maildir specifications
<http://cr.yp.to/proto/maildir.html>`_ require that the flags are sorted by
their ASCII value, although Dovecot itself doesn't care about that.

Unlock the maildir by sending a TERM signal to the maildirlock process (killing
the PID it wrote to stdout).
