.. _pigeonhole_extension_include:

===================================
Pigeonhole Sieve: Include Extension
===================================

The Sieve **include** extension (`RFC
6609 <http://tools.ietf.org/html/rfc6609>`__) permits users to include
one Sieve script into another. This can make managing large scripts or
multiple sets of scripts much easier, and allows a site and its users to
build up libraries of scripts. Users are able to include their own
personal scripts or site-wide scripts.

Included scripts can include more scripts of their own, yielding a tree
of included scripts with the main script (typically the user's personal
script) at its root.

Configuration
-------------

The **include** extension is available by default. The **include**
extension has its own specific settings. The following settings can be
configured for the **include** extension (default values are indicated):

:ref:`plugin-sieve-setting-sieve_include_max_includes` = 255
   The maximum number of scripts that may be included. This is the total
   number of scripts involved in the include tree.

:ref:`plugin-sieve-setting-sieve_include_max_nesting_depth` = 10
   The maximum nesting depth for the include tree.
