.. _installation_guide:

==================
Installation Guide
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

As part of improving maintainability and sustainability, Dovecot has defined a target platform specification and a minimum language standard beginning with version v2.4.0.

The target platform specification is `POSIX.1-2008 <https://pubs.opengroup.org/onlinepubs/9699919799.2008edition/>`_.

A C99/C11 compatible compiler is required, optimally with GNU extensions available.

Currently glibc 2.17 is assumed to be the lowest supported C Standard library version, although others (e.g. older versions or musl) might work as well, although not explicitly tested.

Dovecot CE is maintained and tested for Linux. Other distributions - especially BSD derivatives (e.g. FreeBSD, OpenBSD, macOS, etc.) - are maintained on a best-effort basis only.

Other distributions - especially BSD derivatives (e.g. FreeBSD, OpenBSD, macOS, etc.) - are maintained on a best-effort basis only.
