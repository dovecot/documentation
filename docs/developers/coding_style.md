---
layout: doc
title: Coding Style
order: 302
dovecotlinks:
  coding_style: Coding Style Guide
---

# Coding Style Guide

Dovecot coding style is similar to what Linux Kernel developers use.
Here is a short list of important things to note. Note that all of these
rules are not strict and common sense can be used. If unsure, ask your
colleagues. This document is subject to alterations and can be edited
when found wrong.

Simplicity provides security. The more you have to remember to maintain
security the easier it is to forget something.

## Design Principles

### Deinitialize Safely

Whenever you free a pointer, set it to NULL. That way if you
accidentally try to free it again, it's less likely to cause a security
hole. Dovecot does this automatically with most of its free() calls, but
you should also make it a habit of making all your \_destroy() functions
take a pointer-to-pointer parameter which you set to NULL.

### Don't Keep Secrets

We don't do anything special to protect ourself against read access
buffer overflows, so don't store anything sensitive in memory. We use
multiple processes to protect sensitive information between users. When
dealing with passwords and such, erase them from memory after you don't
need it anymore. Note that such memset() may be optimized away by
compiler, use safe_memset().

### Use GCC Extensions

GCC makes it easy to catch some potential errors:

Format string vulnerabilities can be prevented by marking all functions
using format strings with `__attr_format__()` and `__attr_format_arg__()`
macros and using `-Wformat=2` GCC option. `-W` option checks that you don't
compare signed and unsigned variables.

Hopefully GCC will later emit a warning whenever there's potential
integer truncation. `-Wconversion` kind of does that, but it's not really
meant for it and it gives too many other useless warnings.

### Use Multiple Layers of Security

Input validation is useful to prevent clients from taking too much
server resources. Add the restrictions only where it's useful. For
example a simple "maximum line length" will limit the length of pretty
much all possible client input.

Don't rely on input validation. Maybe you missed something. Maybe
someone calls your function somewhere else where you didn't originally
intend it. Maybe someone makes the input validation less restrictive for
some reason. Point is, it's not an excuse to cause a security hole just
because input wasn't what you expected it to be.

Don't trust memory. If code somewhere overflowed a buffer, don't make it
easier to exploit it. For example if you have code:

```c
static char staticbuf[100];

..

char stackbuf[100];

strcpy(stackbuf, staticbuf);
```

Just because `staticbuf` was declared as `[100]`, it doesn't mean it
couldn't contain more data. Overflowing static buffers can't be directly
exploited, but the `strcpy()` overflowing `stackbuf` makes it possible.
Always copy data with bounds checking.

## Commits

In Dovecot code, commits should only contain changes the commit message
refers to. A commit message title should be written in imperative form,
so instead of "lib-ssl-iostream: Added parameter", write
"lib-ssl-iostream: Add parameter".

The commit message itself should adequately describe the commit if it's
not obvious from commit title. Extra information can be provided there.
When fixing regressions, it is important to refer to the original commit
causing the regression.

There must be no unrelated changes in commits, including unrelated
whitespace changes. Those need to be done in separate commits.

A good rule of thumb: if your commit message says "Do this and that",
you probably should split it into two.

## Code Style

### Indentation, Line Length, and Wrapping

- Maximum line length is 80 characters. This is a soft limit, and can
  be sometimes shortly exceeded if it makes sense.

- Indentation is done with hard tabs. The last indentation can be
  filled with spaces, when necessary, such as if conditional
  continuations.

- If function definition grows too large, you can move the function
  from name forwards to next line, or you can wrap the variables.
  Whichever is easier.

- Line wrapping must be done to match the indentation of the previous line.
  Example:

  ```c
  for (i = 0, used = 0; i < *gid_count; i++) {
          if (gid_list[i] >= set->first_valid_gid &&
              (set->last_valid_gid == 0 ||
               gid_list[i] <= set->last_valid_gid)) {
                  if (gid_list[i] == 0)
                      *have_root_group = TRUE;
                  gid_list[used++] = gid_list[i];
          }
  }
  ```

### When to Use Spaces Before and After

- Space should be added before initial brace in for, while, if etc.
  (see above example).

- Spaces are wanted before and after conditionals.

- Spaces should be added when AND'ing (&&) and OR'ing (||) values.

- Spaces should be added when doing arithmetics.

### Bracing

- Braces are kept on same line, and not moved onto line on it's own.

- Unnecessary braces can be left out, but avoid removing them to create
  extra diff.

## Variables, Structures, and Members

### Naming

- Variables must be named in English.

- The name should reflect the content and purpose of the variable and
  be readable.

  - For local looping and counting, one-letter variables like
    i,j,k,l,m can be used.

  - For local purposes, it is ok to use str, ret, etc.

- Avoid using "tmp", "foo" etc. as variable name. They do not convey
  any information what that variable contains.

- Dovecot does not use CamelCasing in variable names.

- Excessively long variable names should be avoided because of the line
  length restriction.

### Types

- Unsigned types are used whenever the value isn't allowed to be
  negative. This makes it easier to do "value too large" checks when
  you don't also have to check for negative values. Also in
  arithmetic it's better to have the value wrap (and hopefully
  checked later!) than cause undefined behavior with a signed
  integer overflow.

- Use char \* only for NUL-terminated strings. Use unsigned char \*  if
  it's not guaranteed to be NUL-terminated.

- size_t should generally be used when pointing to a (large) memory
  area, especially for mmap(). Since size_t can be slower to access
  than unsigned int (or at least use memory), it's fine to use
  unsigned int when it's "very unlikely" that the size ever goes
  beyond 4 GB (e.g. string_t).

- uoff_t is used for file offsets/sizes. This is usually 64bit, even
  with 32bit machines.

- uint32_t vs. unsigned int: Use uint32_t when the type really should
  be 32bit, but don't spend too much energy trying to avoid mixing
  it with unsigned int, since they are going to be the same types
  probably for the rest of Dovecot's life.

- uint8_t vs. unsigned char: I doubt Dovecot will ever be compiled
  anywhere where these differ from one another, but for readability
  use uint8_t for binary data and unsigned char for text data.

- Use const whenever you can.

  - For reference counters, use signed integers. This is to make sure
    that the reference count can become negative to catch bugs. This
    also means that when doing comparisons of reference counters, use
    > 0  or <= 0 . Avoid using == 0.

### Type Safety

- Try to avoid using void pointers.

  - Try to avoid casting types to other types, especially if the cast
    isn't necessary to avoid a compiler warning.

  - It's better if compiler can give a warning when something is
    accidentally used wrong.

  - Dovecot has some helper macros to make callbacks' context parameters
    type-safe. See `CALLBACK_TYPECHECK()` macro and for
    example `io_add()` for example usage.

  - Use `container_of()` macro to access nested structures.

  - Use `CONST_PTR_OFFSET`, `PTR_OFFSET` when applicable.

## Boolean Expressions

Try to use boolean expressions the way they work in Java. C doesn't
require this, but I think it makes the code easier to understand and
reduces bugs in some cases (e.g. if (!foo()) when thinking foo() returns
bool/FALSE, but actually returns int/-1 on error). We've a clang patch
to give warnings in these cases. As expected, it found quite a lot of
bugs (some real bugs and a lot of "it just accidentally worked").

- bool x and bool x:1 are the boolean types

- `TRUE` and `FALSE` are the only valid explicit boolean values (not 0 or
  1, and currently also not true/false although that could be
  changed)

- !=, ==, <, >, etc. comparisons create a boolean

- if, for, while, etc. require a boolean

### Structures and unions

- When adding members to structures, ordering and bit length should be
  used when possible to reduce memory footprint

- Since structures are usually padded when there are gaps, it is good
  idea to make sure they pack nicely. Especially when doing
  structures that are used heavily.

  - Put pointers next to each other when possible.

  - Same goes with integers

  - When using booleans, try to place them together and use bit lengths

    ```c
    struct foobar {
        const char *abc;
        struct foobar2 *ptr;
        unsigned int a;
        unsigned int b;
        char a;
        char b;
        bool whatnot:1;
        bool notwhat:1;
    };
	```

- Structure inheritance in Dovecot code is done by putting the parent
  structure as **first** member of the structure. This is important
  so that the containing structure can be accessed properly.

  - Use container_of() macro to access these

- When using pooled memory, create the pool first, then allocate the
  structure using p_new and put the pool as struct member.

### Use Unions Safely

Suppose there was code:

```c
union {
    unsigned int number;
    char *str;
} u;
```

If it was possible for user to set number arbitrarily, but access the
union as string it'd be possible to read or write arbitrary memory
locations.

There's two ways to handle this. First would be to avoid union entirely
and use a struct instead. You don't really need the extra few bytes of
memory that union saves.

Another way is to access the union only through macro that verifies that
you're accessing it correctly. See `IMAP_ARG_*()` macros in
lib-imap/imap-parser.h.

## Functions

### Naming

- Function names must be in English.

- The name should reflect the scope and purpose of the function and be
  readable.

- The name can contain \_real, \_continue, \_more, \_start, etc.
  suffixes to group functions performing related task split over
  multiple functions.

- Functions that are public should include scoping prefix. This means
  that instead of writing get_value , one should use mail_user_get_value .

- Private functions can omit scoping prefix.

### Function parameters

- Parameter naming follows variable naming, see Naming.

- When you have parameters that used only to return values from the
  function, they should have _r suffix. If the parameter is
  updated (read and written), then it does not need the suffix.

- In initialization functions, it is good idea to use struct
  foobar_settings to pass multiple values. This makes it easier to
  extend the initialization later on.

### Return Values

- When function cannot fail, it is OK to return the value directly.

- When function has error handling, the function should avoid returning
  NULL, false, 0 etc. Instead the function should return negative
  number on error, zero on success, or boolean, and use \_r suffixed
  function parameter for returning values.

  ```c
  bool doveadm_log_type_from_char(char c, enum log_type *type_r);
  ```

  - Here the type_r contains the type, and bool signals whether the
    conversion succeeded or not.

- Do not return error strings, use const char `**error_r`  for that.

- Use `ATTR_WARN_RESULT` when it is critical that the error is checked.

### Callback Functions

Callback functions make the code more difficult to follow, especially
when a callback calls another callback, or when using function pointers
to jump to different callbacks depending on state. Of course with
asynchronous C code it's pretty much impossible to avoid callbacks.
Still, try to avoid them where possible to keep the code readable.
lib-fs/fs-api.h is an example API which supports async operations but
with a single common "do more now" callback rather than every single
operation having its own callback parameter. This makes it similar to
async network IO with read()/write() `EAGAIN` handling.

Often callback functions can be avoided by creating iterator functions
instead. For example instead of

```c
parse(callback, context);
```

use:

```c
ctx = parse_init();

while (parse_next(ctx)) {
    ..
}

parse_deinit(&ctx);
```

## Memory

Memory is always allocated through one of Dovecot's wrappers, e.g.
i_malloc() or i_new(). All of Dovecot's memory allocations always
succeed or kill the process. There's no point in writing a lot of code
to check for memory allocation failures that happen just about never.
The only reason some memory allocations fail in Dovecot currently is
because a process VSZ limit is reached, which usually indicates either a
memory leak or trying to access a mailbox that is too large. In either
of these cases it's better to just completely restart the process than
try to limp along without getting anything useful done anymore.

Memory allocations can be assumed to be zero-initialized. All of the
memory allocation functions do it, except t_malloc() and t_buffer_get(),
which you should almost never use directly anyway. The code currently
also assumes that pointers in zero-initialized memory area are NULL,
which isn't guaranteed by ANSI-C, but practically Dovecot isn't going to
be run in systems where it's not true and you're not going to remember
to NULL-initialize all of your pointers anyway without compiler/runtime
failure.

When using a struct, always zero-initialize it with `i_zero()` instead of
setting each field separately to 0. It's too easy to cause bugs by
adding a new field to the struct and forgetting to initialize it.

Double-frees in C are bad. Better to crash with NULL pointer dereference
than possibly allow an attacker to exploit heap corruption and run
executable code. Most of the pointers are set to NULL when they are
freed:

- `i_free_and_null()` is a macro to free the memory and set the pointer
  to NULL.

- `i_free()` is exactly same as `i_free_and_null()`.

- Most `deinit()` functions take a pointer-to-pointer parameter and set
  the original one to NULL. There's no need to explicitly set the
  same pointer to NULL afterwards.

## Buffers

Use dynamically growing strings/buffers wherever necessary instead of a
static sized buffer, where on larger input the function fails or
truncates the data. It's of course not good to allow users to infinitely
grow memory usage, so there should be some limits added, but it
shouldn't fail even if the limit is set to infinite.

Avoid explicitly calculating memory usage for allocations. If you do,
mark it with `/* @UNSAFE */` comment unless it's the calculation is "so
obvious that you see it's correct at the first glance". If in doubt,
just mark it UNSAFE. The idea is that anyone can easily grep for these
and verify their correctness.

Avoid writing to buffers directly. Write everything through buffer API
(lib/buffer.h) which guarantees protection against buffer overflows.
There are various safe string APIs as well (lib/str.h, lib/strfuncs.h).
Dovecot also provides a type safe array API (lib/array.h).

If you do write to buffers directly, mark the code with /\* @UNSAFE \*/ 
unless it's *obviously* safe. Only obviously safe code is calling a
function with (buffer, sizeof(buffer)) parameters. If you do *any*
calculations with buffer size, mark it unsafe.

Use const with buffers whenever you can. It guarantees that you can't
accidentally modify it.

## Avoid free()

Accessing freed memory is the most difficult problem to solve with C
code. Only real solution is to use garbage collector, but it's not
possible to write a portable GC without radical changes in how you write
code. There are a few ways to avoid most free() calls however: data
stack and memory pools.

Data stack works in somewhat similar way to C's control stack. alloca()
is quite near to what it does, but there's one major difference: Stack
frames are explicitly defined, so functions can return values allocated
from data stack. t_strdup_printf() call is an excellent example of why
this is useful. Rather than creating some arbitrary sized buffer and
using snprintf() which may truncate the value, you can just use
t_strdup_printf() without worrying about buffer sizes being large
enough.

Try to keep the allocations from data stack small, since the data
stack's highest memory usage size is kept for the rest of the process's
lifetime. The initial data stack size is 32kB and it should be enough in
normal use. See lib/data-stack.h. Memory pools are useful when you have
to construct an object from multiple pieces and you can free it all at
once. Actually Dovecot's Memory Pool API is just an abstract class for
allocating memory. There's system_pool for allocating memory with
calloc(), realloc() and free() and you can create a pool to allocate
memory from data stack. If your function needs to allocate memory for
multiple objects, you may want to take struct pool as parameter to allow
caller to specify where the memory is allocated from. See lib/mempool.
