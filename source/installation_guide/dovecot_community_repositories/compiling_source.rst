.. _compiling_source:

==============================
Compiling Dovecot From Sources
==============================

.. versionchanged:: v2.4.0;v3.0.0 OpenSSL 1.0.2 or newer is required to build Dovecot.
.. versionchanged:: v2.4.0;v3.0.0 ``zlib`` library is required to build Dovecot.

For most people it is enough to do:

.. code-block:: none

   ./configure
   make
   sudo make install

That installs Dovecot under the ``/usr/local`` directory. The
configuration file is in ``/usr/local/etc/dovecot.conf``. Logging goes
to syslog's mail facility by default, which typically goes to
``/var/log/mail.log`` or something similar. If you are in a hurry, you
can then jump to :ref:`QuickConfiguration <quick_configuration>`.

If you have installed some libraries into locations which require
special include or library paths, you can pass them in the ``CPPFLAGS``
and ``LDFLAGS`` environment variables. For example:

.. code-block:: none

   CPPFLAGS="-I/opt/openssl/include" LDFLAGS="-L/opt/openssl/lib" ./configure

You'll need to create two users for Dovecot's internal use:

-  **dovenull**: Used by untrusted imap-login and pop3-login processes
   (default_login_user setting).

-  **dovecot**: Used by slightly more trusted Dovecot processes
   (default_internal_user setting).

Both of them should also have their own **dovenull** and **dovecot**
groups. See :ref:`UserIds <system_users_used_by_dovecot>` for more information.

Compiling Dovecot From Git
^^^^^^^^^^^^^^^^^^^^^^^^^^

If you got Dovecot from Git, for instance with

.. code-block:: none

   git clone https://github.com/dovecot/core.git dovecot

you will first need to run ``./autogen.sh`` to generate the
``configure`` script and some other files. This requires that you have
the following software/packages installed:

-  ``wget``

-  ``autoconf``

-  ``automake``

-  ``libtool``

-  ``pkg-config``

-  ``gettext``

-  GNU make.

It is advisable to add ``--enable-maintainer-mode`` to the ``configure``
script. Thus:

.. code-block:: none

   ./autogen.sh
   ./configure --enable-maintainer-mode
   make
   sudo make install

For later updates, you can use:

.. code-block:: none

   git pull
   make
   sudo make install

SSL/TLS Support
^^^^^^^^^^^^^^^

OpenSSL is used by default, and it should be automatically detected.
If it is not, you are missing some header files or libraries, or they
are just in a non-standard path. Make sure you have the ``openssl-dev``
or a similar package installed, and if it is not in the standard
location, set ``CPPFLAGS`` and ``LDFLAGS`` as shown in the first
section above:

.. code-block:: none

   CPPFLAGS="-I/opt/openssl/include" LDFLAGS="-L/opt/openssl/lib" ./configure

By default the SSL certificate is read from
``/etc/ssl/certs/dovecot.pem`` and the private key from
``/etc/ssl/private/dovecot.pem``. The ``/etc/ssl`` directory can be
changed using the ``--with-ssldir=DIR`` configure option. Both can of
course be overridden from the configuration file.

Optional Configure Options
^^^^^^^^^^^^^^^^^^^^^^^^^^

Dovecot is highly configurable when building from source. Optional packages can
be included by providing options in the form of ``--with-something`` or
``--enable-something``. Conversely ``--without-something`` or
``--disable-something`` excludes the selected options. For an up-to-date list
of available options - especially Optional Packages - run:

.. code-block:: none

   ./configure --help

There are many default options that come from autoconf, automake or libtool.
They are explained elsewhere.
