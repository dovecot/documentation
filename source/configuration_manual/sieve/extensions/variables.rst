.. _pigeonhole_extension_variables:

=====================================
Pigeonhole Sieve: Variables Extension
=====================================

The Sieve **variables** extension :rfc:`5229` adds the concept of
variables to the Sieve language.

Configuration
=============

The **variables** extension is available by default. The **variables**
extension has its own specific settings. The following settings can be
configured for the **variables** extension (default values are
indicated):

:pigeonhole:ref:`sieve_variables_max_scope_size` = 255 (v0.5.0+)
   The maximum number of variables that can be declared in a scope.
   There are currently two variable scopes: the normal script scope and
   the global scope created by the "include" extension. The minimum
   value for this setting is 128.

:pigeonhole:ref:`sieve_variables_max_variable_size` = 4k (v0.5.0+)
   The maximum allowed size for the value of a variable. If exceeded at
   runtime, the value is always truncated to the configured maximum. The
   minimum value for this setting is 4000 bytes. The value is in bytes,
   unless followed by a k(ilo).

