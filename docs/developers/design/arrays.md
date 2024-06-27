---
layout: doc
title: Dynamic Arrays
---

<style module>
.indent {
  padding-left: 30px;
}
</style>

# Dynamic Arrays

`lib/array.h` and `lib/array-decl.h` describes Dovecot's type-safe
dynamic arrays. Trying to add wrong typed elements gives a compiler
warning.

## Declaring

Arrays can be declared in two ways:

1. Directly:

   ```c
   ARRAY(int) numbers;
   ARRAY(struct foo) foos;
   ```

2. Via predefined type:

   ```c
   ARRAY_DEFINE_TYPE(foo, struct foo);
   ...
   ARRAY_TYPE(foo) foos;
   ```

The main reason to define a type for an array is to be able to pass the
array as a function parameter, like:

```c
void func(ARRAY_TYPE(foo) *foos) { .. }
```

Trying to do the same with `ARRAY()` will generate a compiler warning about
type mismatch. `lib/array-decl.h` defines several commonly used types.

## Initializing

Arrays are typically initialized by calling `i_array_init()`,
`p_array_init()` or `t_array_init()` depending on where you want to
allocate the memory from. Arrays are internally handled as
[buffers](buffers), sp the initial size is just
multiplied by element size and passed to `buffer_create_dynamic()`.

Example:

```c

ARRAY(struct foo *) foo;

i_array_init(&foo, 32); /* initialize array with 32 elements until it needs to be grown */
```

Arrays can be freed with `array_free()`, but this isn't necessary if
the memory gets freed by other means (i.e. it was allocated from
alloconly-pool or data stack).

## Writing

### `array_push_back(array, data)`

<div :class="$style.indent">

Append one element to the end of the array.

</div>

### `array_push_front(array, data)`

<div :class="$style.indent">

Prepend one element to the beginning of the array.

</div>

### `array_append(array, data, count)`

<div :class="$style.indent">

Append multiple elements to the end of the array.

</div>

### `array_append_zero(array)`

<div :class="$style.indent">

Append a zero-filled element to the end of the array.

</div>

### `array_append_array(dest, src)`

<div :class="$style.indent">

Append src array to the end of the dest array.

</div>

### `array_copy(dest, dest_idx, src, src_idx, count)`

<div :class="$style.indent">

Copy (overwrite) a slice of the src array over the dest array.

</div>

### `array_insert(array, idx, data, count)`

<div :class="$style.indent">

Insert element at the specified index (0 = first)

</div>

### `array_idx_set(array, idx, data)`

<div :class="$style.indent">

Replace data at the specified index.

If index points after the end of the array, the other newly added elements are zero-filled.

</div>

### `array_idx_clear(array, idx)`

<div :class="$style.indent">

Zero-fill the data at the specified index.

If index points after the end of the array, the other newly added elements are zero-filled.

</div>

### `array_delete(array, idx, count)`

<div :class="$style.indent">

Delete the specified slice of the array.

</div>

### `array_pop_back(array)`

<div :class="$style.indent">

Delete the last element of the array.

</div>

### `array_pop_front(array)`

<div :class="$style.indent">

Delete the first element of the array.

</div>

### `array_clear(array)`

<div :class="$style.indent">

Delete all elements in the array.

</div>

## Reading

Usually array is read by going through all of its elements. This can be
done by returning all the elements:

```c
unsigned int count;

const struct foo *foo = array_get(&array, &count);
struct foo *foo = array_get_modifiable(&array, &count);
```

or the array can also be iterated easily:

```c
const struct foo *foo;
array_foreach(&foo_array, foo) {
    /* foo changes in each iteration */
}

struct foo *foo;
array_foreach_modifiable(&foo_array, foo) {
    ...
}
```

The `_modifiable()` versions return a non-const pointer.

Arrays that are pointers-to-pointers can be iterated like:

```c
ARRAY(struct foo *) foo_array;
struct foo *const *foop;
array_foreach(&foo_array, foop) {
    struct foo *foo = foop;
}
```

Or more simply using `array_foreach_elem()`:

```c
ARRAY(struct foo *) foo_array;
struct foo *foo;
array_foreach_elem(&foo_array, foo) {
    ...
}
```

Note that deleting an element while iterating will cause the iteration to
skip over the next element. So deleting a single element and breaking out
of the loop is fine, but continuing the loop is likely a bug. Use instead:

```c
array_foreach_reverse(&foo_array, foo) {
    if (want_delete(foo))
        array_delete(&foo_array, array_foreach_idx(&foo_array, foo), 1);
}
```

There's also an equivalent `array_foreach_reverse_modifiable()`.

It's a bug to attempt to use the read functions before the array is
initialized. Use `array_is_created()` to check if it's initialized.

There are also `array_idx_elem()` and `array_foreach_elem()` to access
arrays of pointers more easily. They work by making a copy of the dereferenced
pointer. For example:

```c
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
```

### `array_idx(array, idx)`

<div :class="$style.indent">

Return a const pointer to the specified index.

Assert-crashes if the index doesn't already exist.

</div>

### `array_front(array)`

<div :class="$style.indent">

Return a const pointer to the first element in the array.

Assert-crashes if the array is empty.

</div>

### `array_back(array)`

<div :class="$style.indent">

Return a const pointer to the last element in the array.

Assert-crashes if the array is empty.

</div>

### `array_count(array)`

<div :class="$style.indent">

Return the number of elements in an array.

</div>

### `array_is_empty(array)`

<div :class="$style.indent">

Return TRUE if array has zero elements.

</div>

### `array_not_empty(array)`

<div :class="$style.indent">

Return TRUE if array has more than zero elements.

</div>

## Unsafe Read/Write

Functions below have similar problems to [buffer's](buffers)
`*_unsafe()` functions. Memory returned by them must not be accessed
after calls to other `array_*()` modifying functions, because they may
reallocate the array elsewhere in memory.

### `array_append_space(array)`

<div :class="$style.indent">

Append a new element into the array and return a writable pointer to it.

</div>

### `array_insert_space(array, idx)`

<div :class="$style.indent">

Insert a new element into the array and return a writable pointer to it.

</div>

### `array_idx_get_space(array, idx)`

<div :class="$style.indent">

Return a writable pointer to the specified index in the array.

If index points after the end of the array, the newly added elements are zero-filled.

</div>

### `array_get_modifiable(array, &count)`

<div :class="$style.indent">

Return a non-const pointer to all the elements in the array and the number of elements in the array.

</div>

### `array_idx_modifiable(array, idx)`

<div :class="$style.indent">

Return a non-const pointer to the specified index.

Assert-crashes if the index doesn't already exist.

See also [`array_idx_get_space()`](#array-idx-get-space-array-idx).

</div>

### `array_front_modifiable(array)`

<div :class="$style.indent">

Return a non-const pointer to the first element in the array.

Assert-crashes if the array is empty.

</div>

### `array_back_modifiable(array)`

<div :class="$style.indent">

Return a non-const pointer to the last element in the array.

Assert-crashes if the array is empty.

</div>


## Others

### `array_cmp(array1, array2)`

<div :class="$style.indent">

Return TRUE if the arrays contain exactly the same content.

</div>

### `array_reverse(array)`

<div :class="$style.indent">

Reverse all elements in the array.

</div>

### `array_sort(array, cmp_func)`

<div :class="$style.indent">

Type-safe wrapper for `qsort()`.

The parameters in the `cmp_func` should be the same type as the array
instead of `const void *`.

</div>

### `array_bsearch(array, key, cmp_func)`

<div :class="$style.indent">

Type-safe wrapper for `bsearch()`, similar to `array_sort()`.

</div>

### `array_equal_fn(array1, array2, cmp_func)`

<div :class="$style.indent">

Return TRUE if arrays are equal.

Each element in the array is compared with the `cmp_func`.

</div>

### `array_equal_fn_ctx(array1, array2, cmp_func, context)`

<div :class="$style.indent">

Like `array_equal_fn()`, except `cmp_func` has a context parameter.

</div>

### `array_lsearch(array, key, cmp_func)`

<div :class="$style.indent">

Returns a const pointer to the first element where `cmp_func(key, element)==0`.

</div>

### `array_lsearch_modifiable(array, key, cmp_func)`

<div :class="$style.indent">

Returns a non-const pointer to the first element where `cmp_func(key, element)==0`.

</div>
