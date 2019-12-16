.. _string:

=========
String
=========

String settings are typically used with variable expansion to configure how
something is logged. For example :ref:`setting-imap_logout_format`:

.. code-block:: none

   imap_logout_format = in=%i out=%o

The ``#`` character and everything after it are comments. Extra spaces and tabs
are ignored, so if you need to use these, put the value inside quotes. The
quote character inside a quoted string is escaped with ``\"``:

.. code-block:: none

   key = "# char, \"quote\", and trailing whitespace  "