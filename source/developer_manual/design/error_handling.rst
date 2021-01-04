.. _lib-storage_error_handling:

==========================
Lib-storage Error Handling
==========================

``src/lib-storage/mail-error.h`` describes different types of errors and
has some other error-related functions and macros.

Only errors returning "int" can actually return a failure.

-  Functions that return a pointer will never return failure with NULL.
   Only "find" type of functions can return NULL, which means "not
   found".
-  Iterators usually work by the init() returning iterator pointer and
   next() returning a boolean. If there were any errors in either init()
   or next(), deinit() finally returns a failure.

Getting lib-storage errors
--------------------------

-  ``mailbox_list_*()`` functions set their errors to the given
   mailbox_list structure. You can get these errors with
   ``mailbox_list_get_last_error()``.
-  All other functions that have some way of accessing mail_storage
   (mailbox, mail, transactions, etc.) set their errors to the storage.
   You can get these errors with ``mail_storage_get_last_error()``.

   - Mail user and namespace functions have their own error handling,
     typically by returning error strings as parameters.
-  Both ``*_get_last_error()`` functions should be called soon after the
   error is noticed, before other failing lib-storage calls overwrite
   the error.

   -  In deinit failures it usually doesn't matter if you get the first
      or the last error, so it's easier to just call all the different
      deinit functions and finally look up what the last failure was.

Setting lib-storage errors
--------------------------

Errors can be set with two calls:

-  ``mail_storage_set_error()`` and ``mailbox_list_set_error()`` should
   be used when the error is user's fault in some way. For example
   invalid mailbox name, out of quota, etc. The error string will be
   shown to user. It won't be written to a log file.
-  ``mail_storage_set_critical()`` and ``mailbox_list_set_critical()``
   should be used when the error is a problem in the system and sysadmin
   should be notified. For example out of disk space or just in general
   an unexpected syscall failure. The error string that will be shown to
   user is the "Internal error occurred", but it will be logged as an
   error.
-  The reason for the separation of these two is:

   1. Only log errors that sysadmin can do something about.
   2. Never show user anything even potentially sensitive about the
      system, such as path names.

There are also a few other calls that aren't used as often, but can be
helpful:

-  ``mail_storage_set_internal_error()`` and
   ``mailbox_list_set_internal_error()`` simply set the user-visible
   error message to "Internal error occurred". These can be used if the
   actual error was already logged.
-  ``mail_storage_set_error_from_errno()`` and
   ``mailbox_list_set_error_from_errno()`` set the user-visible error
   message based on some common ``errno`` values. Currently:

   - ``EACCESS``, ``EPERM``, ``EROFS``: Permission denied
   - ``ENOSPC``, ``EDQUOT``: Not enough disk space
   - ``ENOENT``, ``ENOTDIR``: Not found
   - ``ELOOP``: Directory structure is broken
