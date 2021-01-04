.. _liblib_arrays:

==============
Dynamic Arrays
==============

``lib/array.h`` and ``lib/array-decl.h`` describes Dovecot's type-safe
dynamic arrays. Trying to add wrong typed elements gives a compiler
warning.

Declaring
---------

Arrays can be declared in two ways:

1. Directly: ``ARRAY_DEFINE(array_name, array_type);``. For example:
   ``ARRAY_DEFINE(numbers, int);`` or
   ``ARRAY_DEFINE(foos, struct foo);``

2. Via predefined type:
   ``ARRAY_DEFINE_TYPE(foo, struct foo); ... ARRAY_TYPE(foo) foos;``

The main reason to define a type for an array is to be able to pass the
array as a function parameter, like:

::

   void func(ARRAY_TYPE(foo) *foos) { .. }

Trying to do the same with ``ARRAY_DEFINE()`` will generate a compiler
warning. ``lib/array-decl.h`` defines several commonly used types.

Initializing
------------

Arrays are typically initialized by calling ``i_array_init()``,
``p_array_init()`` or ``t_array_init()`` depending on where you want to
allocate the memory from. Arrays are internally handled as
:ref:`buffers <liblib_buffers>`, so
the initial size is just multiplied by element size and passed to
``buffer_create_dynamic()``.

Example:

::

   ARRAY_DEFINE(foo, struct foo *);

   i_array_init(&foo, 32); /* initialize array with 32 elements until it needs to be grown */

Arrays can be freed with ``array_free()``, but this isn't necessary if
the memory gets freed by other means (i.e. it was allocated from
alloconly-pool or data stack).

Writing
-------

-  ``array_append(array, data, count)`` is the most common way to add
   data to arrays

-  ``array_append_array(dest, src)``

-  ``array_insert(array, idx, data, count)``

-  ``array_delete(array, idx, count)``

-  ``array_idx_set(array, idx, data)`` replaces (or adds) data to given
   index

-  ``array_idx_clear(array, idx)`` clears given index by writing NULs to
   it

-  ``array_append_space(array, count)``

Reading
-------

``array_idx(array, idx)`` returns pointer to given index in array. The
index must already exist, otherwise the call assert-crashes. This call
adds extra overhead for accessing arrays though, so usually it's better
to just get list of all elements and access them directly:

::

   data = array_get(&array, &count);

You can also iterate through the whole array easily:

::

   const char *str;

   array_foreach(&string_array, str) {
     /* str changes in each iteration */
   }

There's also ``array_foreach_modifiable()`` to get the data without
const.

Unsafe Read/Write
-----------------

Functions below have similar problems to [[Design/Buffer|buffer]'s
``*_unsafe()`` functions. Memory returned by them must not be accessed
after calls to other ``array_*()`` modifying functions, because they may
reallocate the array elsewhere in memory.

-  ``array_append_space(array)``

-  ``array_insert_space(array, idx)``

-  ``array_get_modifiable(array, &count)``

-  ``array_idx_modifiable(array, idx)``

Others
------

-  ``array_cmp(array1, array2)`` compares two arrays

-  ``array_reverse(array)`` reverses all elements in an array

-  ``array_sort(array, cmp_func)`` is a wrapper for ``qsort()`` adding
   also type safety. The parameters in cmp_func should be the same type
   as the array, instead of ``const void *``.

-  ``array_bsearch(array, key, cmp_func)`` is a wrapper for
   ``bsearch()`` also adding type safety, just like ``array_sort()``.
