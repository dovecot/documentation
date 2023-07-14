.. _installation_guide:

==================
Installation guide
==================

.. toctree::
   :maxdepth: 1
   :glob:

   compiling_source
   dovecot_pro_releases/index
   dovecot_community_repositories/index
   upgrading/index
   startup_scripts/index

Target Platform
^^^^^^^^^^^^^^^

As part of improving maintainability and sustainability of the code this
project defines a target platform specification and a minimum language standard
beginning with version v2.4.0. As a platform specification the target is
`POSIX.1-2008
<https://pubs.opengroup.org/onlinepubs/9699919799.2008edition/>`. The code
requires a C99/C11 compatible compiler optimally with GNU extensions available.
Currently glibc 2.17 is assumed to be the lowest supported C Standard library
version, although others (e.g. older versions or musl) might work as well.

For the following OS/distributions :ref:`ox_dovecot_pro` packages are
automatically built:

* CentOS 7
* Debian 10 ("Buster")
* Debian 11 ("Bullseye")
* RHEL 8
* Ubuntu 20
* Amazon Linux 2

Others - especially BSD derivatives (e.g. FreeBSD, OpenBSD, macOS, etc.) - are
maintained on a best-effort base only.
