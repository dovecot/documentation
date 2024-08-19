---
layout: doc
title: Development Tips
order: 305
---

# Development Tips

## Clang Patching

Dovecot is developed with some extra warning features developed for
clang. Here's how to build such a patched clang.

### Prerequisites

To build llvm/clang, you'll need cmake version 3.4.3.

### Source Repos

There are github mirrors, but you can clone directly from
[llvm.org](https://llvm.org/).

```sh
git clone https://llvm.org/git/llvm
cd tools
git clone https://llvm.org/git/clang
```

Here are some hints on how to build/hack clang:

- If you want to debug clang with gdb, you need to have a debug build.
  This used to be the default, but apparently not nowadays. Note
  that Debug build takes ~15 GB of space vs non-debug build 5 GB.
  `cmake -DCMAKE_BUILD_TYPE=Debug`

- With debug build you still want it to be optimized or the resulting
  compiler will be horribly slow. `cmake -DLLVM_OPTIMIZED_TABLEGEN=ON`

- Even then it seems to be very slow. It's possibly enough to use
  `-DCMAKE_BUILD_TYPE=RelWithDebInfo`

```sh
mkdir build
cd build
cmake -DCMAKE_C_COMPILER=gcc -DCMAKE_CXX_COMPILER=g++ \
  -DLLVM_OPTIMIZED_TABLEGEN=ON -DCMAKE_BUILD_TYPE=Debug -G "Unix Makefiles" ../
```

If you want to debug clang, you need to debug "clang -cc1" because
otherwise it forks a new process and you can't do much with it. See
https://clang.llvm.org/docs/FAQ.html#id2

### Dovecot Patches

Dovecot has some clang patches in https://dovecot.org/patches/clang/.

These patches aid with sanity checking the dovecot build, e.g. static
code analysis:

- `clang-strict-bool.diff` - This is the most important one that
  implements `-Wstrict-bool`.

- `clang-default-nonnull.diff` - Add support for automatically marking
  pointer parameters as non-null. This was never fully implemented to
  work nicely.  

## Code Coverage Testing

Compile using `--coverage` flags:

```sh
EXTRA_CFLAGS=--coverage EXTRA_LDFLAGS=--coverage ./configure
```

Build and run unit tests:

```sh
make check NOVALGRIND=1
```

Get coverage as HTML:

```sh
lcov -q --directory . --capture -o cov.info
summary="`lcov --summary cov.info 2>&1 \| sed -e 's/$/<br>/'`"
genhtml -q -k --legend -o cov cov.info
```

The HTML content is now in the "cov" directory. Note that the lcov
command can generate some warnings about missing \*.gcda files, like:

```
geninfo: WARNING: gcov did not create any files for .../src/lib-otp/.libs/otp-parity.gcda!
geninfo: WARNING: gcov did not create any files for .../src/lib/.libs/ioloop-notify-kqueue.gcda!
geninfo: WARNING: gcov did not create any files for .../src/lib/.libs/ioloop-notify-none.gcda!
```

### clang

If using clang, create llvm-gcov.sh script:

```bash
#!/bin/bash
exec llvm-cov gcov "$@"
```

Then add `--gcov-tool llvm-gcov.sh` parameter:

```sh
lcov -q --gcov-tool llvm-gcov.sh --directory . --capture -o cov.info
```

### Issues

Code coverage output isn't written if `_exit()` is used.
