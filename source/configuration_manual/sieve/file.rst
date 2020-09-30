.. _pigeonhole_file:

=================================================
Pigeonhole Sieve: File Location for Sieve Scripts
=================================================

The ``file`` :ref:`pigeonhole_configuration_script_locations`
is used to retrieve Sieve scripts from the file system. This is the
default type if the type specifier is omitted from the location
specification. The location can either point to a directory or to a
regular file. If the location points to a directory, a script called
``name`` is retrieved by reading a file from that directory with the
file name ``name.sieve``.

When this location type is involved in a :ref:`plugin-sieve-setting-sieve_before` or
:ref:`plugin-sieve-setting-sieve_after` script sequence and the location points to a directory,
all files in that directory with a ``.sieve`` extension are part of the
sequence. The sequence order of the scripts in that directory is
determined by the file names, using a normal 8bit per-character
comparison.

Unless overridden using the ``;bindir=<path>`` location option, compiled
binaries for scripts retrieved from the ``file`` location type are by
default stored in the same directory as where the script file was found
if possible.

Configuration
-------------

The script location syntax is specified as follows:

::

   location = file:<path>[;<option>[=<value>][;...]]

The following additional options are recognized:

active=<path>
   When :ref:`ManageSieve <pigeonhole_managesieve_server>` is used, one script in the storage can be active; i.e., evaluated at
   delivery. For the ``file`` location type, the active script in the
   storage directory is pointed to by a symbolic link. This option
   configures where this symbolic link is located. If the ``file``
   location path points to a regular file, this setting has no effect
   (and ManageSieve cannot be used).

Example
-------

::

   plugin {
           ...
     sieve = file:~/sieve;active=~/.dovecot.sieve
     sieve_default = file:/var/lib/dovecot/;name=default
   }
