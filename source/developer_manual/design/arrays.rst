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

#. Directly::

       ARRAY(int) numbers;
       ARRAY(struct foo) foos;

#. Via predefined type::

       ARRAY_DEFINE_TYPE(foo, struct foo);
       ...
       ARRAY_TYPE(foo) foos;

The main reason to define a type for an array is to be able to pass the
array as a function parameter, like:

::

   void func(ARRAY_TYPE(foo) *foos) { .. }

Trying to do the same with ``ARRAY()`` will generate a compiler warning about
type mismatch. ``lib/array-decl.h`` defines several commonly used types.

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

   ARRAY(struct foo *) foo;

   i_array_init(&foo, 32); /* initialize array with 32 elements until it needs to be grown */

Arrays can be freed with ``array_free()``, but this isn't necessary if
the memory gets freed by other means (i.e. it was allocated from
alloconly-pool or data stack).

Writing
-------

 * ``array_push_back(array, data)`` - Append one element to the end of the array.
 * ``array_push_front(array, data)`` - Prepend one element to the begininng of the array.
 * ``array_append(array, data, count)`` - Append multiple elements to the end of the array.
 * ``array_append_zero(array)`` - Append a zero-filled element to the end of the array.
 * ``array_append_array(dest, src)`` - Append src array to the end of the dest array.
 * ``array_copy(dest, dest_idx, src, src_idx, count)`` - Copy (overwrite) a slice of the src array over the dest array.
 * ``array_insert(array, idx, data, count)`` - Insert element at the specified index (0 = first)
 * ``array_idx_set(array, idx, data)`` - Replace data at the specified index.
   If index points after the end of the array, the other newly added elements are zero-filled.
 * ``array_idx_clear(array, idx)`` - Zero-fill the data at the specified index.
   If index points after the end of the array, the other newly added elements are zero-filled.
 * ``array_delete(array, idx, count)`` - Delete the specified slice of the array.
 * ``array_pop_back(array)`` - Delete the last element of the array.
 * ``array_pop_front(array)`` - Delete the first element of the array.
 * ``array_clear(array)`` - Delete all elements in the array.

Reading
-------

Usually array is read by going through all of its elements. This can be
done by returning all the elements::

   unsigned int count;

   const struct foo *foo = array_get(&array, &count);
   struct foo *foo = array_get_modifiable(&array, &count);

or the array can also be iterated easily::

   const struct foo *foo;
   array_foreach(&foo_array, foo) {
     /* foo changes in each iteration */
   }

   struct foo *foo;
   array_foreach_modifiable(&foo_array, foo) {
     ...
   }

The ``_modifiable()`` versions return a non-const pointer.

Arrays that are pointers-to-pointers can be iterated like::

   ARRAY(struct foo *) foo_array;
   struct foo *const *foop;
   array_foreach(&foo_array, foop) {
     struct foo *foo = foop;
   }

Or more simply using ``array_foreach_elem()``::

   ARRAY(struct foo *) foo_array;
   struct foo *foo;
   array_foreach_elem(&foo_array, foo) {
     ...
   }

It's a bug to attempt to use the read functions before the array is
initialized. Use ``array_is_created()`` to check if it's initialized.

There are also other functions for reading:

 * ``array_idx(array, idx)`` - Return a const pointer to the specified index.
   Assert-crashes if the index doesn't already exist.
 * ``array_front(array)`` - Return a const pointer to the first element in the array.
   Assert-crashes if the array is empty.
 * ``array_back(array)`` - Return a const pointer to the last element in the array.
   Assert-crashes if the array is empty.
 * ``array_count(array)`` - Return the number of elements in an array.
 * ``array_is_empty(array)`` - Return TRUE if array has zero elements.
 * ``array_not_empty(array)`` - Return TRUE if array has more than zero elements.

There are also ``array_idx_elem()`` and ``array_foreach_elem()`` to access
arrays of pointers more easily. They work by making a copy of the dereferenced
pointer. For example:

::

  ARRAY(const char *) strings;

  // array_idx() requires dereferencing:
  const char *const *strp = array_idx(&strings, idx);
  printf("%s\n", *strp);
  // array_idx_elem() dereferences already:
  printf("%s\n", array_idx_elem(&strings, idx));

  // array_foreach() requires dereferencing:
  const char *const *strp;
  array_foreach(&strings, strp)
    printf("%s\n", *strp);
  // array_foreach_elem() dereferences already:
  const char *str;
  array_foreach_elem(&strings, str)
    printf("%s\n", str);

Unsafe Read/Write
-----------------

Functions below have similar problems to [[Design/Buffer|buffer]'s
``*_unsafe()`` functions. Memory returned by them must not be accessed
after calls to other ``array_*()`` modifying functions, because they may
reallocate the array elsewhere in memory.

 * ``array_append_space(array)`` - Append a new element into the array and return a writable pointer to it.
 * ``array_insert_space(array, idx)`` - Insert a new element into the array and return a writable pointer to it.
 * ``array_idx_get_space(array, idx)`` - Return a writable pointer to the specified index in the array.
   If index points after the end of the array, the newly added elements are zero-filled.
 * ``array_get_modifiable(array, &count)`` - Return a non-const pointer to all the elements in the array and the number of elements in the array.
 * ``array_idx_modifiable(array, idx)`` - Return a non-const pointer to the specified index.
   Assert-crashes if the index doesn't already exist.
   See also ``array_idx_get_space()``.
 * ``array_front_modifiabe(array)`` - Return a non-const pointer to the first element in the array.
   Assert-crashes if the array is empty.
 * ``array_back_modifiable(array)`` - Return a non-const pointer to the last element in the array.
   Assert-crashes if the array is empty.

Others
------

 * ``array_cmp(array1, array2)`` - Return TRUE if the arrays contain exactly the same content.
 * ``array_reverse(array)`` - Reverse all elements in the array.
 * ``array_sort(array, cmp_func)`` - Type-safe wrapper for ``qsort()``.
   The parameters in the ``cmp_func`` should be the same type as the array
   instead of ``const void *``.
 * ``array_bsearch(array, key, cmp_func)`` - Type-safe wrapper for
   ``bsearch()``, similar to ``array_sort()``.
 * ``array_equal_fn(array1, array2, cmp_func)`` - Return TRUE if arrays are equal.
   Each element in the array is compared with the ``cmp_func``.
 * ``array_equal_fn_ctx(array1, array2, cmp_func, context)`` -
   Like ``array_equal_fn()``, except ``cmp_func`` has a context parameter.
 * ``array_lsearch(array, key, cmp_func)`` - Returns a const pointer to the first element where ``cmp_func(key, element)==0``.
 * ``array_lsearch_modifiable(array, key, cmp_func)`` - Returns a non-const pointer to the first element where ``cmp_func(key, element)==0``.
