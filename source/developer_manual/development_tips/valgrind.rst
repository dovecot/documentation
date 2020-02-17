========
Valgrind
========

The most useful Valgrind parameters:

- ``–-vgdb=no``: Needed on some systems to avoid problems.

- ``--keep-debuginfo=yes``: Prevent unhelpful ``??`` for already unloaded plugins.

-  ``--num-callers=n``: Display last n functions calls in the backtrace for each error.

-  ``--leak-check=full``: Show also unfreed memory as being leaked.

-  ``--trace-children=yes``: Sometimes you might want to trace also the forked child processes.

-  ``--suppressions=<path>``: Suppressions for things that can't be fixed. Usually in external libraries.

-  ``-q``: Quiet - don't log about initialization etc.

Standalone
==========

For example:

``valgrind --leak-check=full /usr/libexec/dovecot/imap -u user@example.com``

Service settings
================

.. code-block::

        service imap {
                executable = /usr/bin/valgrind --vgdb=no --num-callers=50
                        --leak-check=full -q /usr/local/libexec/dovecot/imap
        }

Debugging Valgrind errors in a live program using GDB
=====================================================

``valgrind --vgdb-error=0``

And follow the instructions given by valgrind. Also works within emacs.

Debugging over forks with Valgrind
==================================

If you're an emacs user, you're only allowed to debug one process at a
time (per emacs).

As above,

``valgrind --vgdb-error=0``

Method 1: Just start the first gdb in a different shell or emacs window
as normal, and then pretty much ignore it. After the fork, pick up the
process in your primary emacs gdb window as normal.

Method 2: Follow the gdb instructions, "cont" the program, ^C, and
"detach" the program. I'm not sure what happens to the parent after
that. When valgrind stops on the fork, follow the new set of gdb
instructions and continue as normal.

In neither method do you need to "set follow-fork-mode child" as gdb
isn't aware of the fork.

Valgrinding plugin memory leaks
===============================

Valgrind output at exit may contain very unhelpful ``"??"`` lines, which
point to already unloaded plugins. You can avoid this by
giving ``**--keep-debuginfo=yes **`` parameter.

Alternative way would be to set GDB=1 environment to disable all plugin
unloading. This will cause some extra warnings about leaking memory in
dl*() functions which can be ignored. You can also do this in
dovecot.conf:

``import_environment = $import_environment GDB=1``
