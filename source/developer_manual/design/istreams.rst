.. _liblib_istreams:

=============
Input Streams
=============

``lib/istream.h`` describes Dovecot's input streams. Input streams can
be stacked on top of each others as many times as wanted.

Input streams actually reading data:

-  file: Read data from fd using ``pread()`` for files and ``read()``
   for non-files.

-  unix: Read data from UNIX socket. Similar to file, but supports
   receiving file descriptors.

-  data: Read data from memory.

Input stream filters:

-  concat: Concatenate multiple input streams together

-  chain: Chain multiple input streams together. Similar to
   istream-concat, but more istreams can be added after initialization
   and EOF needs to be explicitly added.

-  seekable: Make a number of (possibly non-seekable) input streams into
   a single seekable input stream. If all of the input streams are
   already seekable, a concat stream is created instead.

   -  Usually the only non-seekable input streams are non-file fds, such
      as pipes or sockets.

-  crlf: Change all newlines to either LFs or CRLFs, by adding or
   removing CRs as necessary.

-  limit: Limit input stream's length, so after reading a given number
   of bytes it returns EOF.

-  sized: Require istream's length to be exactly the given size, or the
   last read returns error.

-  timeout: Fail the read when given timeout is reached.

-  try: Read from the first input stream that doesn't fail with EINVAL.

-  tee: Fork an input stream to multiple streams that can be read
   independently.

-  multiplex: Multiplex-iostreams support multiple iostream channels
   inside a single parent istream.

-  callback: Build an input stream by calling callback functions that
   return the data.

-  base64-encoder, base64-decoder: Encode/decode base64.

-  failure-at: Insert a failure at the specified offset. This can be
   useful for testing.

-  hash: Calculate hash of the istream while it's being read.

-  ``lib-compression/*``: Read zlib/bzlib/lz4/zstd compressed data.

There are also various other less generic istreams. Especially lib-mail
has many mail-related istreams.

Reading
-------

``i_stream_read()`` tries to read more data into the stream's buffer. It
returns:

-  -2: Nothing was read, because the buffer is full.

-  -1: Either input reached EOF, or read failed and stream_errno was
   set.

-  0: Input stream is non-blocking, and no more input is available now.

-  >0: Number of new bytes read.

Reading from a stream doesn't actually go forward in the stream, that
needs to be done manually with ``i_stream_skip()``. This makes it easy
to read full data records into the stream directly instead of creating
separate buffers. For example when reading line-based input you can keep
reading input into the stream until you find LF and then just access the
string directly from the input buffer. There are actually helper
functions for this: ``i_stream_next_line()`` attempts to return the next
line if available, ``i_stream_read_next_line()`` does the same but does
a read to try to get the data.

Because more and more data can be read into the buffer, the buffer size
is typically limited, and once this limit is reached read returns -2.
The buffer size is given as parameter to the ``i_stream_create_*()``,
but filters often use their parent stream's buffer size.
The buffer size can be also changed with
``i_stream_set_max_buffer_size()``. Figuring out what the buffer size
should be depends on the situation. It should be large enough to contain
all valid input, but small enough that users can't cause a DoS by
sending a too large record and having Dovecot eat up all the memory.
If there's no specific buffer size requirement, ``IO_BLOCK_SIZE`` is
a good value to use.

Once read returns -1, the stream has reached EOF. ``stream->eof=TRUE``
is also set. In this situation it's important to remember that there may
still be data available in the buffer. If ``i_stream_have_bytes_left()``
returns FALSE, there really isn't anything left to read. Also at EOF it's
important to check ``stream->stream_errno`` to see if the read failed.

Whenever ``i_stream_read()`` returns >0, all the existing pointers are
potentially invalidated. v2.3+: When i_stream_read() returns <= 0, the
data previously returned by i_stream_get_data() are still valid,
preserved in "snapshots". (<v2.3 may or may not have invalidated them.)

Example:

.. code-block:: C

   /* Read line-based data from file_fd. The buffer size has no limits. */
   struct istream *input = i_stream_create_fd(file_fd, SIZE_MAX, FALSE);
   const char *line;

   /* Return the last line also even if it doesn't end with LF.
      This is generally a good idea when reading files (but not a good idea
      when reading commands from e.g. socket). */
   i_stream_set_return_partial_line(input, TRUE);
   while ((line = i_stream_read_next_line(input)) != NULL) {
     /* handle line */
   }
   i_stream_destroy(&input);

Internals
---------

``lib/istream-private.h`` describes the internal API that input streams
need to implement. The methods that need to be implemented are:

-  ``read()`` is the most important function. It can also be tricky to
   get it completely bug-free. See the existing unit tests for other
   istreams and try to test the edge cases as well (such as ability to
   read one byte at a time and also with max buffer size of 1). When it
   needs to read from parent streams, try to use
   ``i_stream_read_memarea(parent)`` if possible so a new snapshot isn't
   unnecessarily created (see the snapshot discussion below).

-  ``seek(v_offset, mark)`` seeks to given offset. The ``mark``
   parameter is necessary only when it's difficult to seek backwards in
   the stream, such as when reading compressed input.

-  ``sync()`` removes everything from internal buffers, so that if the
   underlying file has changed the changes get noticed immediately after
   sync.

-  ``get_size(exact)`` returns the size of the input stream, if it's
   known. If ``exact=TRUE``, the returned size must be the same how many
   bytes can be read from the input. If ``exact=FALSE``, the size is
   mainly used to compare against another stat to see if the underlying
   input had changed. For example with compressed input the size could
   be the compressed size.

-  ``stat(exact)`` stats the file, filling as much of the fields as
   makes sense. ``st_size`` field is filled the same way as with
   ``get_size()``, or set to -1 if it's unknown.

- ``switch_ioloop_to`` If there are any I/O loop items associated with
  the stream, move all of them to the provided/current ioloop.

-  ``snapshot(prev_snapshot)`` creates a snapshot of the data that is
   currently available via i_stream_get_data(), merges it with
   prev_snapshot (if any) and returns the merged snapshot (see below
   more more details).

There are some fields available. Below is a list of the most important ones.
For a complete overview please see `istream-private.h`.

-  ``fd`` file descriptor being read by the stream.

-  ``buffer`` contains pointer to the data.

- ``parent`` parent istream - for filter streams.

-  First ``skip`` bytes of the buffer are already skipped over (with
   ``i_stream_skip()`` or seeking).

-  Data up to ``pos`` bytes (beginning after ``skip``) in the buffer are
   available with ``i_stream_get_data()``. If pos=skip, it means there
   is no available data in the buffer.

If your input stream needs a write buffer, you can use some of the
common helper functions and variables:

-  ``w_buffer`` contain the pointer where you can write data. It should
   be kept in sync with ``buffer``.

-  ``buffer_size`` specifies the buffer's size, and ``max_buffer_size``
   the max. size the buffer can be grown to.

-  ``i_stream_try_alloc(wanted_size, size_r)`` can be used when you want
   to store ``wanted_bytes`` into ``w_buffer``. If the buffer isn't
   large enough for it, it's grown if possible. The buffer isn't grown
   above the stream's max buffer size. The returned ``size_r`` specifies
   how many bytes are actually available for writing at
   ``stream->w_buffer + stream->pos``.

-  ``i_stream_alloc(size) is like i_stream_try_alloc()``, except it always
   succeeds allocating ``size`` bytes, even if it has to grow the buffer
   larger then the stream's max buffer size.

-  Lower-level memory allocation functions:

   -  ``i_stream_grow_buffer(bytes)`` grows the ``w_buffer`` by the
      given number of bytes, if possible. It won't reach the stream's
      current max buffer size. The caller must verify from
      ``buffer_size`` how large the buffer became as a result of this
      call.

   -  ``i_stream_compress()`` attempts to compress the current
      ``w_buffer`` by removing already-skipped data with ``memmove()``.
      If ``skip`` is 0, it does nothing. Note that this function must
      not be called if ``memarea`` has refcount>1. Otherwise that could
      be modifying a snapshotted memarea.

The snapshots have made implementing istreams slightly more complicated than
earlier. There are a few different ways to implement istreams:

-  Always point ``buffer=w_buffer`` and use ``i_stream_try_alloc()``
   and/or ``i_stream_alloc()`` to allocate the ``w_buffer``. The generic
   code will handle all the snapshotting. Use
   ``i_stream_read_memarea()`` to read data from parent stream so
   multiple snapshots aren't unnecessarily created.

-  Guarantee that if ``read()`` returns <=0, the existing ``buffer``
   will stay valid. Use ``ISTREAM_CREATE_FLAG_NOOP_SNAPSHOT`` flag in
   ``i_stream_create()`` so your filter stream isn't unnecessarily
   snapshotted (or causing a panic due to missing ``snapshot()``
   implementation).

   -  One way of doing this with filter streams is to read from the
      parent stream via ``i_stream_read(parent)`` and always use
      ``buffer=i_stream_get_data(parent)``. The parent's snapshotting
      guarantees that the buffer will stay valid.

-  Implement the ``snapshot()`` yourself in the stream. You'll need to
   create a new memarea of the current data available via
   ``i_stream_get_data()`` and it must not change, i.e. most likely
   you'll need to duplicate the allocated memory. Create a new
   ``struct istream_snapshot`` and assign the allocated memarea to its
   ``old_memarea``. Fill ``prev_snapshot`` field and return your new
   snapshot. The snapshot will be freed by the generic istream code
   either when the next ``read()`` returns >0 or when the istream is
   destroyed.

     - See ``src/lib-mail/istream-header-filter.c`` or
       ``src/lib-dcrypt/istream-decrypt.c`` for examples of how to do this.

-  Filter streams that only pass through parent stream's contents
   without changes can just point to the parent stream. The default
   snapshotting causes the parent to be snapshotted, so the filter
   stream can simply use ``i_stream_read_memarea()`` and point to the
   parent's buffer.

When Dovecot is configured with ``--enable-devel-checks``,
``i_stream_read()`` will verify that the first and the last two bytes of
the buffer didn't unexpectedly change due to a ``read()``. While
developing istream changes you should use this to make sure the istream
is working properly. Running the istream unit test also via valgrind can
also be used to verify that the buffer wasn't freed.
