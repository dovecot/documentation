.. _quick_configuration:

Quick Configuration
======================

If you just want to get Dovecot running with typical configuration in a typical
environment, here's what you'll have to do:

.. contents::
  :depth: 2
  :local:

TLDR; Just want it running
--------------------------

Here is a very simple basic configuration with single vmail user to be placed
in :file:`dovecot.conf`. Please note that some distros split configuration
under :file:`/etc/dovecot/conf.d/` which, while it can be useful, is not
required.

You need to create group vmail and user vmail.

.. code-block:: none

  mail_home=/srv/mail/%Lu
  mail_location=sdbox:~/Mail

  ## this is sometimes needed
  #first_valid_uid = uid-of-vmail-user

  # if you want to use system users
  passdb {
    driver = pam
  }

  userdb {
    driver = passwd
    args = blocking=no
    override_fields = uid=vmail gid=vmail
  }

  ssl=yes
  ssl_cert=</path/to/cert.pem
  ssl_key=</path/to/key.pem
  # if you are using v2.3.0-v2.3.2.1 (or want to support non-ECC DH algorithms)
  # since v2.3.3 this setting has been made optional.
  #ssl_dh=</path/to/dh.pem

  namespace {
    inbox = yes
    separator = /
  }

Configuration file
------------------

Prebuilt packages usually install the configuration files into
:file:`/etc/dovecot/`. You'll find the correct path by running:

.. code-block:: none

  doveconf -n | head -n 1

It's a good idea to read through all the config files and see what settings you
might want to change.

Installing from sources
~~~~~~~~~~~~~~~~~~~~~~~

If you compiled and installed Dovecot from sources, Dovecot has installed only
a :file:`/usr/local/etc/dovecot/README` file, which contains the path to the
installed example configuration files, usually
:file:`/usr/local/share/doc/dovecot/example-config`. Copy them to :file:`etc/`:

.. code-block:: none

  cp -r /usr/local/share/doc/dovecot/example-config/* /usr/local/etc/dovecot/

Split configuration files
~~~~~~~~~~~~~~~~~~~~~~~~~

The default configuration starts from :file:`dovecot.conf`, which contains an
:code:`!include conf.d/*.conf` statement to read the rest of the configuration.
The idea is that the settings are nicely grouped into different files to make
it easier for new admins to scan through related settings. It doesn't matter
which config file you add which setting.

In the production system it's often easier to just have a single
:file:`dovecot.conf` file, which you can create easily using:

.. code-block:: none

  doveconf -nP > dovecot.conf

Hints about writing configuration files
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* Usually it does not matter in which file you write the setting. You only need
  to be aware that later settings replace earlier ones. If you use the same
  section multiple times, the settings are merged together.
* Before v2.3, boolean settings in the plugin section interpreted any value as
  true, even :literal:`0`, :literal:`no` and :literal:`false`.
* To read the content of a file, for instance for the SSL certificate option,
  prefix the filename with a :literal:`<`, e.g.:

.. code-block:: none

  ssl_cert = </etc/ssl/certs/imap.pem

Authentication
--------------

You'll probably be using PAM authentication. See the page :ref:`authentication-pam` for how to
configure it. A typical configuration with Linux would be to create
``/etc/pam.d/dovecot`` which contains:

.. code-block:: none

  auth      required        pam_unix.so
  account   required        pam_unix.so

If you're using something else, see :ref:`authentication-password_databases` and
:ref:`authentication-user_database`.

Mail Location
-------------

You can let Dovecot do its automatic mail location detection but if that
doesn't work you can set the location manually in ``mail_location`` setting.
See :ref:`mail_location_settings` for more information.

Mbox
----

Make sure that all software accessing the mboxes are using the same locking
methods in the same order. The order is important to prevent deadlocking. From
Dovecot's side you can change these from ``mbox_read_locks`` and
``mbox_write_locks`` settings. See :ref:`mbox_locking` for more information.

If you're using :file:`/var/mail/` directory for INBOXes, you may need to set
``mail_privileged_group = mail`` so Dovecot can create dotlocks there.

For better performance you may want to set ``mbox_very_dirty_syncs = yes``
option.

Maildir
-------

For better performance you may want to set ``maildir_very_dirty_syncs = yes``
option.

Client Workarounds
------------------

Check ``imap_client_workarounds`` and ``pop3_client_workarounds`` and see if
you want to enable more of them than the defaults.

SSL and Plaintext Authentication
--------------------------------

If you intend to use SSL, set ``ssl_cert`` and ``ssl_key`` settings. Otherwise
set ``ssl = no``. Easiest way to get SSL certificates built is to use Dovecot's
:file:`doc/mkcert.sh` script. For more information see
:ref:`dovecot_ssl_configuration`.

By default :dovecot_core:ref:`auth_allow_cleartext = no <auth_allow_cleartext>`, which means that Dovecot will fail
the authentication if the client doesn't use SSL (or use non-cleartext
authentication mechanisms). This is recommended in most situations, since it prevents
leaking passwords. However, if you don't offer SSL for some reason, you'll
probably want to set :dovecot_core:ref:`auth_allow_cleartext = yes <auth_allow_cleartext>`.

Since v2.3.3 you only need :dovecot_core:ref:`ssl_key` and :dovecot_core:ref:`ssl_cert`, leaving :dovecot_core:ref:`ssl_dh`
unset (and removing :file:`ssl-parameters.dat` if left over from 2.2
configurations) will prevent using non-EC DH algorithms.

NFS
---

If you're using NFS or some other remote filesystem that's shared between
multiple computers, you should read :ref:`nfs`.

Running
-------

See :ref:`running_dovecot` and :ref:`dovecot_logging`.

Further reading:

*  :ref:`authentication-pam`

*  :ref:`authentication-password_databases`

*  :ref:`authentication-user_database`

*  :ref:`dovecot_logging`

*  :ref:`running_dovecot`
