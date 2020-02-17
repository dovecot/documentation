Clang patching
==============

Dovecot is developed with some extra warning features developed for
clang. Here's how to build such a patched clang.

Prerequisites
-------------

To build llvm/clang, you'll need cmake version 3.4.3.

Source Repos
------------

There are github mirrors, but you can clone directly from
`llvm.org <http://llvm.org>`__

.. code-block:: sh

   git clone http://llvm.org/git/llvm
   cd tools
   git clone http://llvm.org/git/clang

Here are some hints on how to build/hack clang:

-  If you want to debug clang with gdb, you need to have a debug build.
   This used to be the default, but apparently not nowadays. Note
   that Debug build takes ~15 GB of space vs non-debug build 5 GB.
   ``cmake -DCMAKE_BUILD_TYPE=Debug``

-  With debug build you still want it to be optimized or the resulting
   compiler will be horribly slow. ``cmake -DLLVM_OPTIMIZED_TABLEGEN=ON``

-  Even then it seems to be very slow. It's possibly enough to use
   ``-DCMAKE_BUILD_TYPE=RelWithDebInfo``

 .. code-block:: sh

    mkdir build
    cd build
    cmake -DCMAKE_C_COMPILER=gcc -DCMAKE_CXX_COMPILER=g++
    -DLLVM_OPTIMIZED_TABLEGEN=ON -DCMAKE_BUILD_TYPE=Debug -G "Unix
    Makefiles" ../

If you want to debug clang, you need to debug "clang -cc1" because
otherwise it forks a new process and you can't do much with it. See
http://clang.llvm.org/docs/FAQ.html#id2

Dovecot Patches
---------------

Dovecot has some clang patches in http://dovecot.org/patches/clang/

These patches aid with sanity checking the dovecot build, e.g. static
code analysis:

- ``clang-strict-bool.diff`` - This is the most important one that
  implements ``-Wstrict-bool``

-  ``clang-default-nonnull.diff`` - Add support for automatically marking
   pointer parameters as non-null. This was never fully implemented to 
   work nicely.  
