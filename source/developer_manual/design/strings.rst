.. _liblib_strings:

===============
Dynamic Strings
===============

``lib/str.h`` describes Dovecot's dynamically growing strings. Strings
are actually only a simple wrapper on top of
:ref:`buffers <liblib_buffers>`.
Even the ``string_t`` type is only a typedef of ``buffer_t``, so it's
possible to use ``buffer_*()`` functions with strings (although it's
ugly so it should be avoided). The decision of whether to use a ``string_t``
or a ``buffer_t`` is mainly for human readability: If the buffer's contents
are (ASCII/UTF8) text use ``string_t``, otherwise for binary data use
``buffer_t``.

Once you've finished modifying a string with ``str_*()`` functions, you can
get it out as a NUL-terminated string with ``str_c()`` or
``str_c_modifiable()``. These pointers shouldn't be accessed after
modifying the string again, since they could have moved elsewhere in memory
and they're no longer guaranteed to be NUL-terminated.

Example:

::

   T_BEGIN {
     string_t *str = t_str_new(64);

     str_append(str, "hello world");
     str_printfa(str, "\nand %zu", str_len(str));

     printf("%s\n", str_c(str));
   } T_END;

String Handling Functions
=========================

``lib/strfuncs.h`` contains a lot of functions intended to make string
handling easier. They use C's NUL-terminated strings instead of
Dovecot's dynamic strings.

-  ``[ipt]_strdup_printf()`` and ``[ipt]_strconcat()`` are the most
   commonly used functions. ``*_strconcat`` is slightly faster than
   ``*_strdup_printf()``, so use it if you simply need to concatenate
   strings.

-  Various functions for doing a ``strdup()`` from wanted input.

-  ``i_snprintf()`` is a wrapper to ``snprintf()`` that makes it easier
   to check if result was truncated. It also adds a few other safety
   checks. This should be avoided in general, except in situations where
   you just don't want to use data stack and there's no way for the
   result to get truncated.

-  ``i_strocpy()`` is similar to ``strlcpy()``, but makes it easier to
   check if result was truncated. This has the same problems as
   ``i_snprintf()``.

-  Functions for uppercasing and lowercasing strings.

-  Functions you can pass to ``bsearch()`` and ``qsort()`` for handling
   string arrays.

-  ``[pt]_strsplit()`` is an easy way to split a string into an array of
   strings from given separator.

   -  ``t_strarray_join()`` reverses this.

   -  There are also some other functions to handle an array of strings,
      like getting its length or finding a given string.

-  ``dec2str()`` can be used to convert a number to a string allocated from
   data stack. This can be useful if you don't know the correct type and don't
   want to add casting (that could potentially truncate the string).
   For example: ``print("pid = %s\n", dec2str(getpid()));``

String Escaping
===============

``lib/strescape.h`` contains functions to escape and unescape ``"``, ``'``
and ``\`` characters in strings using the ``\`` character.

Dovecot's internal protocols are often line-based with TAB as the field
separator. This file also contains functions to escape and unescape such
data.
