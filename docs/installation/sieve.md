---
layout: doc
title: Sieve Installation
order: 6
dovecotlinks:
  sieve_installation: Sieve installation
---

# Sieve (Pigeonhole) Installation

## Prebuilt Binaries

::: tip
This is the recommended way of installing Dovecot/Pigeonhole.
:::

Pigeonhole is the name of the project that adds support for the Sieve
language ([[rfc,5228]]) and the ManageSieve protocol ([[rfc,5804]]) to
Dovecot ([[man,dovecot]]).

You can get pigeonhole packages from https://repo.dovecot.org/.

### OS Distributions

Dovecot/Pigeonhole is packaged by many OS distributions.

Search your package manager for 'dovecot', 'pigeonhole', or 'sieve' to
discover the packages on your particular system.

## Getting the Sources

You can download the latest released sources from the
[Pigeonhole download page](https://pigeonhole.dovecot.org/download.html).

Alternatively, you can get the sources, including the most recent
unreleased changes, from the
[GitHub repository](https://github.com/dovecot/pigeonhole).

## Compiling

If you downloaded the Git sources, you will need to execute `./autogen.sh`
first to build the automake structure in your source tree. This process
requires autotools and libtool to be installed.

If you installed Dovecot from sources, Pigeonhole's configure script
should be able to find the installed `dovecot-config` automatically:

```sh
./configure
make
sudo make install
```

If this doesn't work, you can use `--with-dovecot=<path>` configure
option, where the path points to a directory containing
`dovecot-config` file. This can point to an installed file:

```sh
./configure --with-dovecot=/usr/local/lib/dovecot
make
sudo make install
```

or to Dovecot source directory that is already compiled:

```sh
./configure --with-dovecot=../dovecot-2.3.21/
make
sudo make install
```

::: warning
You need to recompile Pigeonhole when you upgrade Dovecot
to a new version, because otherwise the Sieve interpreter plugin will
fail to load with a version error.
:::
