---
layout: doc
title: Installation
order: 2
---

# Installation Guide

## Target Platform

As part of improving maintainability and sustainability, Dovecot has defined a
target platform specification and a minimum language standard beginning with
version v2.4.0.

The target platform specification is
[POSIX.1-2008](https://pubs.opengroup.org/onlinepubs/9699919799.2008edition/).

A C99/C11 compatible compiler is required, optimally with GNU extensions
available.

Currently glibc 2.17 is assumed to be the lowest supported C Standard library
version, although others (e.g. older versions or musl) might work as well,
although not explicitly tested.

Dovecot CE is maintained and tested for Linux. Other distributions -
especially BSD derivatives (e.g. FreeBSD, OpenBSD, macOS, etc.) - are
maintained on a best-effort basis only.

## Dovecot CE Repositories

The Dovecot team provides packages of Dovecot components for various Linux
distributions.

Details can be found at: https://repo.dovecot.org/.

## Compiling Dovecot From Source

::: tip
Dovecot is provided by package managers on most popular operating systems,
and we also provide packages at https://repo.dovecot.org/. We encourage
you to use these instead of building sources yourself.
:::

For most people it is enough to do:

```sh
./configure
make
sudo make install
```

That installs Dovecot under the `/usr/local` directory. The
configuration file is in `/usr/local/etc/dovecot.conf`. Logging goes
to syslog's mail facility by default, which typically goes to
`/var/log/mail.log` or something similar. If you are in a hurry, you
can then jump to [[link,quick_config]].

If you have installed some libraries into locations which require
special include or library paths, you can pass them in the `CPPFLAGS`
and `LDFLAGS` environment variables. For example:

```sh
CPPFLAGS="-I/opt/openssl/include" LDFLAGS="-L/opt/openssl/lib" ./configure
```

You'll need to create two users for Dovecot's internal use:

- **dovenull**

  - Used by untrusted imap-login and pop3-login processes,
   [[setting,default_login_user]] setting.

- **dovecot**

  - Used by slightly more trusted Dovecot processes,
   [[setting,default_internal_user]] setting.

Both of them should also have their own **dovenull** and **dovecot**
groups. See [[link,system_users]] for more information.

### Compiling Dovecot From Git

If you got Dovecot from Git, for instance with

```sh
git clone https://github.com/dovecot/core.git dovecot
```

you will first need to run `./autogen.sh` to generate the
`configure` script and some other files. This requires that you have
the following software/packages installed:

-  wget
-  autoconf
-  automake
-  libtool
-  pkg-config
-  gettext
-  GNU make.

It is advisable to add `--enable-maintainer-mode` to the `configure`
script. Thus:

```sh
./autogen.sh
./configure --enable-maintainer-mode
make
sudo make install
```

For later updates, you can use:

```sh
git pull
make
sudo make install
```

### SSL/TLS Support

Dovecot uses OpenSSL for SSL/TLS support and it should be automatically
detected. If it is not, you are missing some header files or libraries, or they
are just in a non-standard path. Make sure you have the `openssl-dev`
or a similar package installed, and if it is not in the standard
location, set `CPPFLAGS` and `LDFLAGS` as shown in the first
section above.

By default the SSL certificate is read from
`/etc/ssl/certs/dovecot.pem` and the private key from
`/etc/ssl/private/dovecot.pem`. The `/etc/ssl` directory can be
changed using the `--with-ssldir=DIR` configure option. Both can of
course be overridden from the configuration file.

You can use [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/#server=dovecot&config=modern)
to help create a default SSL configuration.

### Optional Configure Options

Options are usually listed as `--with-something` or
`--enable-something`. If you want to disable them, do it as
`--without-something` or `--disable-something`. There are many
default options that come from autoconf, automake or libtool. They are
explained elsewhere.

#### Help Related Options

##### `--help`

Gives a full list of available options.

##### `--help=short`

List the dovecot specific options only and hide the generic configuration
options.

#### Dovecot specific Options

Here is a list of options that Dovecot adds. You should not usually have
to change these, these are usually not needed.

##### `--enable-devel-checks`

Enables some extra sanity checks. This is mainly useful for
developers. It does quite a lot of unnecessary work but should catch
some programming mistakes more quickly.

##### `--enable-asserts`

Enable assertion checks, enabled by default. Disabling them may
slightly save some CPU, but if there are bugs they can cause more
problems since they are not detected as early.

##### `--without-shared-libs`

Link Dovecot binaries with static libraries instead of dynamic
libraries.

##### `--disable-largefile`

Specifies if we use 32bit or 64bit file offsets in 32bit CPUs. 64bit
is the default if the system supports it (Linux and Solaris do).
Dropping this to 32bit may save some memory, but it prevents
accessing any file larger than 2 GB.

##### `--with-mem-align=BYTES`

Specifies memory alignment used for memory allocations. It is needed
with many non-x86 systems and it should speed up x86 systems too.
Default is 8, to make sure 64bit memory accessing works.

##### `--with-ioloop=IOLOOP`

Specifies what I/O loop method to use. Possibilities are `select`,
`poll`, `epoll` and `kqueue`. The default is to use the best
method available on your system.

##### `--with-notify=NOTIFY`

Specifies what file system notification method to use. Possibilities
are `dnotify`, `inotify` (both on Linux), `kqueue` (FreeBSD)
and `none`. The default is to use the best method available on your
system.

#### Generic Features

##### `--with-lua`

Enables Lua support for authentication and push notifications.

#### FTS Options

##### `--with-flatcurve`

Flatcurve full text search (requires Xapian libraries).

##### `--with-solr`

Build with Solr full text search support

#### Compression Libraries

##### `--with-zlib`

Build with zlib compression support (default if detected)

##### `--with-zstd`

Build with zStandard compression support (default if detected)

#### SQL Driver Options

SQL drivers are typically used for authentication, and they may be
used as a lib-dict backend too, which can be used by plugins for
different purposes.

##### `--with-cassandra`

Build with cassandra support (requires `cassandra-cpp-driver`)

##### `--with-pgsql`

Build with PostgreSQL support (requires `pgsql-devel`, `libpq-dev` or
similar package)

##### `--with-mysql`

Build with MySQL support (requires `mysql-devel`, `libmysqlclient-dev`
or similar package)

##### `--with-sqlite`

Build with SQLite3 driver support (requires `sqlite-devel`,
`libsqlite3-dev` or similar package)

#### Authentication Backend Options

The basic backends are built if the system is detected to support them:

##### `--with-pam`

Build with [[link,auth_pam]] support

##### `--with-nss`

Build with [[link,auth_nss]] support

##### `--with-bsdauth`

Build with [[link,auth_bsd]] support

#### Authentication Backend Options (Extra Libraries Needed)

Some backends require extra libraries and are not necessarily wanted, so
they are built only if specifically enabled:

##### `--with-sql(=plugin)`

Build with generic SQL support (drivers are enabled separately, see above).
You can also build this as a plugin.

##### `--with-ldap(=plugin)`

Build with LDAP support (requires `openldap-devel`, `libldap2-dev` or
similar package). You can also build this as a plugin.

##### `--with-gssapi(=plugin)`

Build with GSSAPI authentication support (requires `krb5-devel`,
`libkrb5-dev` or similar package)

### Dynamic IMAP and POP3 Modules

The [[setting,mail_plugins]] setting lists all plugins that Dovecot is supposed
to load from the [[setting,mail_plugin_dir]] directory at program start. These
plugins can do anything they want.

The plugin filename is prefixed with a number which specifies the order
in which the plugins are loaded. This is important if one plugin depends
on another.
