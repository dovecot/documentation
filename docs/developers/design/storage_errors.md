---
layout: doc
title: lib-Storage Errors
---

# Lib-storage Error Handling

`src/lib-storage/mail-error.h` describes different types of errors and
has some other error-related functions and macros.

Only functions returning "int" can actually return a failure.

- Functions that return a pointer will never use NULL as a failure.
  Only "find" type of functions can return NULL, which means "not found".
- Iterators usually work by the init() returning iterator pointer and
  next() returning a boolean. If there were any errors in either init()
  or next(), deinit() finally returns a failure.

## Getting lib-storage Errors

There are two types of errors: Errors that can safely be sent to clients,
and internal errors which may contain sensitive information. Try to name
the client-safe error variables clearly, preferably `client_error`.

- `mailbox_list_*()` functions set their errors to the given
  mailbox_list structure. You can get these errors with
  `mailbox_list_get_last_error()` (client-safe error) or
  `mailbox_list_get_last_internal_error()`.
- All other functions that have some way of accessing mail_storage
  (mailbox, mail, transactions, etc.) set their errors to the storage.
  You can get these errors with `mail_storage_get_last_error()`
  (client-safe error) or `mail_storage_get_last_internal_error()`.
  There are also `mailbox_get_last_error()` and
  `mailbox_get_last_internal_error()`, which are simply convenience
  wrappers to the `mail_storage_get_last_*error()` functions.

  - Mail user and namespace functions have their own error handling,
    typically by returning error strings as parameters.

- Both `*_get_last_error()` functions should be called soon after the
  error is noticed, before other failing lib-storage calls overwrite
  the error.

- If there are multiple errors, it's best to always log at least the first
  one. It's usually the first error that is the most relevant while the
  other errors are caused by the first one.

## Setting lib-storage Errors

Errors can be set with two calls:

- `mailbox_list_set_error()` and `mail_storage_set_error()` should
  be used when the error is user's fault in some way. For example
  invalid mailbox name, out of quota, etc. The error string will be
  shown to user. It won't be written to a log file.

- `mailbox_list_set_critical()`, `mail_storage_set_critical()`,
  `mailbox_set_critical()` and `mail_set_critical()` should be used when
  the error is a problem in the system and sysadmin should be notified.
  Try to use the most specific object (mail, mailbox, storage) to get the
  most accurate event and log prefix. The critical errors could be for example
  out of disk space or just in general an unexpected syscall failure.
  The client-visible error string is "Internal error occurred" followed by
  a timestamp, which can be used to try to find the error from the log files.

  1. Only log errors that sysadmin can do something about.
  2. Never show user anything even potentially sensitive about the
     system, such as path names.

There are also a few other calls that aren't used as often, but can be
helpful:

- `mail_storage_set_internal_error()` and
  `mailbox_list_set_internal_error()` simply set the user-visible
  error message to "Internal error occurred". These can be used if the
  actual error was already logged.
- `mail_storage_set_error_from_errno()` and
  `mailbox_list_set_error_from_errno()` set the user-visible error
  message based on some common `errno` values. Currently:

  - `EACCESS`, `EPERM`, `EROFS`: Permission denied
  - `ENOSPC`, `EDQUOT`: Not enough disk space
  - `ENOENT`, `ENOTDIR`: Not found
  - `ELOOP`: Directory structure is broken

- `mail_storage_copy_list_error()` copies the error from `mailbox_list`
  into `mail_storage`.
- `mail_storage_copy_error()` copies the error from one storage to another.
- `mailbox_set_index_error()` and `mail_storage_set_index_error()` copies
  the internal error from `mail_index`.
