Code Coverage Testing
=====================

Compile using ``--coverage`` flags:

``EXTRA_CFLAGS=--coverage EXTRA_LDFLAGS=--coverage ./configure``

Build and run unit tests:

``make check NOVALGRIND=1``

Get coverage as HTML:

.. code-block:: sh

   lcov -q --directory . --capture -o cov.info
   summary="`lcov --summary cov.info 2>&1 \| sed -e 's/$/<br>/'`"
   genhtml -q -k --legend -o cov cov.info

The HTML content is now in the "cov" directory. Note that the lcov
command can generate some warnings about missing \*.gcda files, like:

::

        geninfo: WARNING: gcov did not create any files for
        .../src/lib-otp/.libs/otp-parity.gcda!
        geninfo: WARNING: gcov did not create any files for
        .../src/lib/.libs/ioloop-notify-kqueue.gcda!
        geninfo: WARNING: gcov did not create any files for
        .../src/lib/.libs/ioloop-notify-none.gcda!

clang
-----

If using clang, create llvm-gcov.sh script:

.. code-block:: sh

   #!/bin/bash
   exec llvm-cov gcov "$@"

Then add ``--gcov-tool llvm-gcov.sh`` parameter:

``lcov -q --gcov-tool llvm-gcov.sh --directory . --capture -o cov.info``

Issues
------

Code coverage output isn't written if ``_exit()`` is used.
