.. _sieve_installation:

=======================
Pigeonhole Installation
=======================

Getting the sources
-------------------

You can download the latest released sources from the `Pigeonhole
download page <http://pigeonhole.dovecot.org/download.html>`_.

Alternatively, you can get the sources, including the most recent
unreleased changes, from the the `GitHub repository <https://github.com/dovecot/pigeonhole>`_ :

::

   git clone https://github.com/dovecot/pigeonhole

Compiling
---------

If you downloaded the sources using Mercurial, you will need to execute
``./autogen.sh`` first to build the automake structure in your source
tree. This process requires autotools and libtool to be installed.

If you installed Dovecot from sources, Pigeonhole's configure script
should be able to find the installed ``dovecot-config`` automatically:

::

   ./configure
   make
   sudo make install

If this doesn't work, you can use ``--with-dovecot=<path>`` configure
option, where the path points to a directory containing
``dovecot-config`` file. This can point to an installed file:

::

   ./configure --with-dovecot=/usr/local/lib/dovecot
   make
   sudo make install

or to Dovecot source directory that is already compiled:

::

   ./configure --with-dovecot=../dovecot-2.3.11/
   make
   sudo make install

**IMPORTANT**: You need to recompile Pigeonhole when you upgrade Dovecot
to a new version, because otherwise the Sieve interpreter plugin will
fail to load with a version error.

Prebuilt Binaries
-----------------

Dovecot
~~~~~~~

You can get pigeonhole packages from https://repo.dovecot.org.

Alpine Linux
~~~~~~~~~~~~

Pigeonhole can be installed from packages by running:

::

   apk add dovecot-pigeonhole-plugin

ArchLinux
~~~~~~~~~

Pidgeonhole is available in the community repositories, and can be
installed by running:

::

   pacman -S  pigeonhole

RHEL 6 + clones (CentOS, Scientific Linux, ...)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Pidgeonhole is available in the main repository, and can be installed by
running:

::

   yum install dovecot-pigeonhole

Debian
~~~~~~

Starting with Debian Wheezy, Pigeonhole binaries are distributed in
separate packages: ``dovecot-sieve`` for the :doc:`Sieve
interpreter <index>`
and ``dovecot-managesieved`` for the :ref:`ManageSieve
service <pigeonhole_managesieve_server>`.
You can install these by running:

::

   apt-get install dovecot-sieve dovecot-managesieved

Older Debian releases have Sieve and ManageSieve support included in the
main ``dovecot-common`` package, meaning that this is always available
for those releases once Dovecot is installed.

openSUSE
~~~~~~~~

It is part of the dovecot (dovecot21) rpm. There is no need to install
additional packages.

FreeBSD
~~~~~~~

Pigeonhole can be installed from ports by running:

::

   cd /usr/ports/mail/dovecot-pigeonhole
   make install clean

It can be also be installed from packages by running:

::

   pkg install dovecot-pigeonhole

OpenBSD
~~~~~~~

Pigeonhole can be installed from packages by running:

::

   pkg_add dovecot-pigeonhole
