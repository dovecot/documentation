.. _liblib_buffers:

=======
Buffers
=======

``lib/buffer.h`` describes Dovecot's buffer API. Unless your code
happens to be VERY performance critical, you shouldn't handle writing to
buffers/arrays manually, but instead use the buffer API's safe functions
to guarantee that your code can't write past the buffer and cause a
security hole.

Dovecot's buffers are the basic building block for :ref:`arrays <liblib_arrays>`
and :ref:`strings <liblib_strings>`. Use them instead if they make more sense
than buffers.

There are a two different ways to create buffers: statically and
dynamically allocated.

Static buffers
--------------

You can create statically allocated buffers with
``buffer_create_data()``. Trying to write past the given buffer size
will panic. Static buffers don't need to be freed.

The code to initialize static buffers looks like::

   unsigned char buf_data[1024];
   buffer_t buf;

   buffer_create_from_data(&buf, buf_data, sizeof(buf_data));

Trying to write more than 1024 bytes to the buffer will cause an
assert-crash, so these buffers shouldn't be used unless you know exactly
what the maximum buffer size is.

To avoid accidental buffer overflows, don't use complex
calculations in the size parameter of ``buffer_create_from_data()``. It
should always be ``sizeof(data_buffer)``.

You can also create non-writable buffers with
``buffer_create_from_const_data()``.

Dynamic buffers
---------------

Dynamically growing buffers can be created with
``buffer_create_dynamic(pool, init_size)``. Memory for the buffer is
allocated from the given pool. When memory needs to be grown, it's grown
exponentially (2^n), with some exceptions to avoid growing the given
memory pool unless necessary. The initial buffer size is always a guess
- try to make it large enough that buffer wouldn't be grown most of the
time, but not so large that it wastes memory.

You should be careful with memory returned by
``buffer_get_space_unsafe()`` and ``buffer_append_space_unsafe()``. This
returned memory should be accessed immediately afterwards and it must
not be accessed anymore after other ``buffer_*()`` calls, because they
may reallocate the buffer and move it elsewhere in memory.

Buffers always look like they're filled with NUL bytes. If you write
past the end of buffer, all the inserted bytes are filled with NULs. If
you shrink the buffer with ``buffer_set_used_size()`` and again write
past the end of used size, all the old data is again gone and filled
with NULs. If you for some reason want to just temporarily shrink the
buffer size and then change it back, you can use
``buffer_set_used_size()`` to grow it back to its original size (but no
larger).
