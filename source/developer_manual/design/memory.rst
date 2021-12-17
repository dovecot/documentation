.. _liblib_memory:

==================
Memory Allocations
==================

C language requires explicitly allocating and freeing memory. The main
two problems with this are:

#. A lot of allocations and frees cause memory fragmentation. The longer
   a process runs, the more it could have leaked memory because there
   are tiny unused free spots all around in heap.

#. Freeing memory is easy to forget, causing memory leaks. Sometimes it
   can be accidentally done multiple times, causing a potential security
   hole. A lot of ``free()`` calls all around in the code also makes the
   code more difficult to read and write.

The second problem could be solved with Boehm garbage collector, which
Dovecot used to support, but it wasn't very efficient.
It also doesn't help with the first problem.

To reduce the problems caused by these issues, Dovecot has several ways
to do memory management.

Common Design Decisions
-----------------------

All memory allocations (with some exceptions in data stack) return
memory filled with NULs. This is also true for new memory when growing
an allocated memory with realloc. The zeroing reduces accidental use of
uninitialized memory and makes the code simpler since there is no need
to explicitly set all fields in allocated structs to zero/NULL. Note the
C standard doesn't require that NULL is zero, but this is practically
true everywhere and appears to be a (future) requirement for POSIX as well.

In out-of-memory situations memory allocation functions die internally
by calling ``i_fatal_status(FATAL_OUTOFMEM, ..)``. There are several
reasons for this:

-  Trying to handle malloc() failures explicitly would add a lot of
   error handling code paths and make the code much more complex than
   necessary.

-  In most systems malloc() rarely actually fails because the system has
   run out of memory. Instead the kernel will just start killing
   processes.

-  Typically when malloc() does fail, it's because the process's address
   space limit is reached. Dovecot enforces these limits by default.
   Reaching it could mean that the process was leaking memory and it
   should be killed. It could also mean that the process is doing more
   work than anticipated and that the limit should probably be
   increased.

-  Even with perfect out-of-memory handling, the result isn't much
   better anyway than the process dying. User isn't any happier by
   seeing "out of memory" error than "server disconnected".

When freeing memory, most functions usually also change the pointer to
NULL. This is also the reason why most APIs' deinit functions take
pointer-to-pointer parameter, so that when they're done they can change
the original pointer to NULL.

malloc() Replacements
---------------------

``lib/imem.h`` has replacements for all the common memory allocation
functions:

-  ``malloc``, ``calloc`` -> ``i_malloc()``

-  ``realloc()`` -> ``i_realloc()``

-  ``strdup()`` -> ``i_strdup()``

-  ``free()`` -> ``i_free``

-  etc.

All memory allocation functions that begin with ``i_`` prefix require
that the memory is later freed with ``i_free()``. This is a macro that
is guaranteed to set the freed pointer to NULL afterwards.

Memory Pools
------------

``lib/mempool.h`` defines API for allocating memory through memory
pools. All memory allocations actually go through memory pools. Even the
``i_*()`` functions get called through ``default_pool``, which by
default is ``system_pool`` but can be changed to another pool if wanted.
All memory allocation functions that begin with ``p_`` prefix have a
memory pool parameter, which it uses to allocate the memory.

Dovecot has many APIs that require you to specify a memory pool. Usually
(but not always) they don't bother freeing any memory from the pool.
Instead, they assume that more memory can be just allocated from the pool
and the whole pool is freed later. These pools are usually
alloconly-pools, but can also be data stack pools. See below.

Alloc-only Pools
----------------

``pool_alloconly_create()`` creates an allocate-only memory pool with a
given initial size.

As the name says, alloconly-pools only support allocating more memory.
As a special case its last allocation can be freed. ``p_realloc()`` also
tries to grow the existing allocation only if it's the last allocation,
otherwise it'll just allocates new memory area and copies the data
there.

Initial memory pool sizes are often optimized in Dovecot to be set large
enough that in most situations the pool doesn't need to be grown. To
make this easier, when Dovecot is configured with ``--enable-devel-checks``,
it logs a warning each time a memory pool is grown. The initial pool
size shouldn't of course be made too large, so usually it's best to just pick
some small initial guessed size and if there are too many "growing memory
pool" warnings start growing the pool sizes. Sometimes there's just no
good way to set the initial pool size and avoid the warnings, in that
situation you can prefix the pool's name with ``MEMPOOL_GROWING`` which
prevents logging warnings about the pool.

Alloconly-pools are commonly used for an object that builds its state
from many memory allocations, but doesn't modify (much of) its state.
It's a lot easier when you can do a lot of small memory allocations and
in object destroy you simply free the memory pool.

.. _data_stack:

Data Stack
----------

``lib/data-stack.h`` describes the low-level data stack functions. Data
stack works a bit like C's control stack. ``alloca()`` is quite near to
what it does, but there's one major difference: In data stack the stack
frames are explicitly defined, so functions can return values allocated
from data stack. ``t_strdup_printf()`` call is an excellent example of
why this is useful. Rather than creating some arbitrary sized buffer and
using ``snprintf()``, which might truncate the value, you can just use
``t_strdup_printf()`` without worrying about buffer sizes being large
enough.

Try to keep the allocations from data stack small, since the data
stack's highest memory usage size is kept for the rest of the process's
lifetime. The initial data stack size is 32kB, which should be enough in
normal use. If Dovecot is configured with ``--enable-devel-checks``, it logs
a warning each time the data stack needs to be grown.

Stack frames are preferably created using a ``T_BEGIN``/``T_END`` block, for
example:

.. code-block:: C

   T_BEGIN {
     string_t *str1 = t_str_new(256);
     string_t *str2 = t_str_new(256);
     /* .. */
   } T_END;

In the above example the two strings are allocated from data stack. They get
freed once the code goes past ``T_END``. That's why the variables are
preferably declared inside the ``T_BEGIN``/``T_END`` block so they won't
accidentally be used after they're freed.

``T_BEGIN`` and ``T_END`` expand to ``t_push()`` and ``t_pop()`` calls and they
must be synchronized. Returning from the block without going past T_END
is going to cause Dovecot to panic in next ``T_END`` call with "Leaked
t_pop() call" error.

Data stack allocations have similar disadvantages to alloc-only memory
pools. Allocations can't be grown, so with the above example if str1
grows past 256 characters, it needs to be reallocated, which will cause
it to forget about the original 256 bytes and allocate 512 bytes more.
However, as with alloc-only pools, the last allocation can be grown.

Memory allocations from data stack often begin with ``t_`` prefix,
meaning "temporary". There are however many other functions that
allocate memory from data stack without mentioning it. Memory allocated
from data stack is usually returned as a const pointer, so that the
caller doesn't try to free it (which would cause a compiler warning).

When should ``T_BEGIN``/``T_END`` used and when not? This is kind of black
magic. In general they shouldn't be used unless it's really necessary,
because they make the code more complex. But if the code is going
through loops with many iterations, where each iteration is allocating
memory from data stack, running each iteration inside its own stack
frame would be a good idea to avoid excessive memory usage. It's also
difficult to guess how public APIs are being used, so it's often good
for such API functions use their own private stack frames. Dovecot's ioloop
code also wraps all I/O callbacks and timeout callbacks into their own
stack frames, so you don't need to worry about them. It's actually a good
idea for any callback to be called with its own data stack frame.

You can create memory pools from data stack too. Usually you
should be calling ``pool_datastack_create()`` to generate a new pool,
which also tries to track that it's not being used unsafely across
different stack frames. Some low-level functions can also use the slightly
more efficient ``unsafe_data_stack_pool`` as the pool, which doesn't do
such tracking.

Data stack's advantages over malloc():

-  FAST, most of the time allocating memory means only updating a couple
   of pointers and integers. Freeing memory all at once also is a fast
   operation.

-  No need to ``free()`` each allocation resulting in prettier code

-  No memory leaks

-  No memory fragmentation

It also has some disadvantages:

-  Allocating memory inside loops can accidentally allocate a lot of
   memory

-  Memory allocated from data stack can be accidentally stored into a
   permanent location and accessed after it's already been freed.

-  Debugging invalid memory usage may be difficult using existing tools
