.. _liblib_ostreams:

==============
Output Streams
==============

``lib/ostream.h`` describes Dovecot's output streams. Output streams can
be stacked on top of each others as many times as wanted.

Output streams actually writing data:

-  file: Write to given fd using ``pwrite()`` for files and ``write()``
   for non-files.

-  unix: Write to given UNIX socket. Similar to file, but supports
   sending file descriptors.

-  buffer: Write to :ref:`buffer <liblib_buffers>`.

Output stream filters:

-  hash: Calculate hash of the ostream while it's being written.

-  escaped: Write output escaped via callback. Built-in support for HEX
   and JSON escaping.

-  multiplex: Multiplex-iostreams support multiple iostream channels
   inside a single parent istream.

-  null: All the output is discarded.

-  failure-at: Insert a failure at the specified offset. This can be
   useful for testing.

-  lib-mail/ostream-dot: Write SMTP-style DATA input where the output
   ends with an empty "." line.

-  lib-dcrypt/encrypt: Write encrypted data.

-  ``lib-compression/*``: Write zlib/bzlib/lz4/lzma compressed data.

A typical life cycle for an ostream can look like:

-  ``o_stream_create()``

-  ``o_stream_cork()``

-  ``o_stream_nsend*()`` one or more times

-  ``o_stream_uncork()``

-  If necessary, check errors with ``o_stream_flush()``

-  ``o_stream_cork()``

-  ``o_stream_nsend*()`` one or more times

-  ``o_stream_uncork()``

-  finalize the ostream with ``o_stream_finish()``

-  optionally close the ostream with ``o_stream_close()``

-  unref or destroy

Once the ostream is finished, it can't be written to anymore. The
``o_stream_finish()`` call writes any potential trailer that the ostream
may have (e.g. ostream-gz, ostream-encrypt, ostream-dot) while still
allowing the caller to check if the trailer write failed. After
``o_stream_finish()`` is called, any further write will panic. The
ostreams that require a trailer will panic if ``o_stream_finish()``
hasn't been called before the stream is destroyed, but other ostreams
don't currently require this. Still, it's not always easy to know
whether there might be ostreams that require the trailer, so if there's
any doubt, it's preferred to call ``o_stream_finish()`` just before
destroying the ostream.

Usually calling ``o_stream_finish()`` will also finish its parent
ostream. This may or may not be wanted depending on the situation. For
example ostream-dot must be finished to write the last "." line, but
ostream-dot is always a sub-stream of something else that must not be
finished yet. This is why ostream-dot by default has called
``o_stream_set_finish_also_parent(FALSE)``, so finishing the ostream-dot
won't finish the parent stream. Similarly ``connection.c`` API sets
``o_stream_set_finish_via_child(FALSE)`` so none of the socket
connections created via it will be finished even though one of their
sub-streams is finished. These functions may need to be called
explicitly in other situations.

When doing a lot of writes, you can simplify the error handling by
delaying the error checking. Use the ``o_stream_nsend*()`` functions and
afterwards check the error with ``o_stream_flush()`` or
``o_stream_finish()``. If you forgot to do this check before the ostream
is destroyed, it will panic with:
``output stream %s is missing error handling`` regardless of whether
there is an error or not. If you don't care about errors for the ostream
(e.g. because it's a client socket and there's nothing you can do about
the write errors), you can use ``o_stream_set_no_error_handling()`` to
fully disable error checks. You can also use
``o_stream_ignore_last_errors()`` to ignore the errors so far, but not
for future writes.

Writes are non-buffered by default. To add buffering, use
``o_stream_cork()`` to start buffering and ``o_stream_uncork()`` to
stop/flush. When output buffer gets full, it's automatically flushed
even while the stream is corked. The term "cork" is used because with
TCP connections the call actually sets/removes TCP cork option. It's
quite easy to forget to enable the corking with files, making the
performance worse. The corking/uncorking is done automatically when
flush callbacks are called. Using ``o_stream_uncork()`` will trigger an
automatic ``o_stream_flush()`` but the error is ignored. This is why it
acts similarly to ``o_stream_nsend*()``, i.e. it requires another
explicit ``o_stream_flush()``, ``o_stream_finish()`` or error ignoring
before the ostream is destroyed.

If output buffer's size isn't unlimited, the writes can also fail or be
partial because there's no more space in the buffer and ``write()``
syscall is returning ``EAGAIN``. This of course doesn't happen with
blocking fds (e.g. files), but you need to handle this in some way with
non-blocking network sockets. A common way in Dovecot to handle this is
to just use unlimited buffer sizes and after each write check if the
buffer size becomes too large, and when it does it stops writing until
more space is available.
