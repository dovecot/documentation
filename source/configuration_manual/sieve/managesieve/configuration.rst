.. _sieve_managesieve-configuration:

ManageSieve Configuration
=========================

**NOTE**: If you have used the Sieve plugin before and you have
``.dovecot.sieve`` files in user directories, you are advised to **make
a backup first**. Although the ManageSieve daemon takes care to move
these files to the Sieve storage before it is substituted with a
symbolic link, this is not a very well tested operation, meaning that
there is a possibility that existing Sieve scripts get lost.

The ManageSieve configuration consists of ManageSieve protocol settings
and :ref:`Sieve interpreter <pigeonhole_sieve_interpreter>`-related
settings. The Sieve interpreter settings are shared with settings of the
:ref:`Sieve plugin <sieve>`
for Dovecot's :ref:`Local Delivery Agent (LDA) <lda>` and :ref:`LMTP <lmtp_server>`.
First, the ManageSieve protocol settings are outlined and then the
relevant Sieve settings are described.

Protocol Configuration
----------------------

Along with all other binaries that Dovecot uses, the ``managesieve`` and
``managesieve-login`` binaries are installed during ``make install`` of the
:ref:`Pigeonhole <sieve_installation>` package.
The only thing you need to do to activate the ManageSieve
protocol support in Dovecot is to add ``sieve`` to the :dovecot_core:ref:`protocols= <protocols>`
setting. The managesieve daemon will listen on port 4190 by default.
As the implementation of the managesieve daemon is largely based on the
original IMAP implementation, it is very similar in terms of configuration.
In addition to most mail daemon config settings, the managesieve daemon
accepts a few more. The following settings can be configured in the
``protocol sieve`` section:

:pigeonhole:ref:`managesieve_max_line_length`
   The maximum ManageSieve command line length in bytes.

:pigeonhole:ref:`managesieve_logout_format`
   Specifies the string pattern used to compose the logout message of an
   authenticated session.

:pigeonhole:ref:`managesieve_implementation_string`
   Implementation name.

:pigeonhole:ref:`managesieve_max_compile_errors`
   Maximum compile errors.

:pigeonhole:ref:`managesieve_client_workarounds`
   List of client workarounds to enable.

:pigeonhole:ref:`managesieve_sieve_capability`

:pigeonhole:ref:`managesieve_notify_capability`
   Respectively the SIEVE and NOTIFY capabilities reported by the ManageSieve
   service before authentication.

Sieve Interpreter Configuration
-------------------------------

The part of the :ref:`Sieve interpreter <pigeonhole_sieve_interpreter>`
configuration that is relevant for ManageSieve mainly consists of the
settings that specify where the user's scripts are stored and where the
active script is located. The ManageSieve service primarily uses the
following Sieve interpreter setting in the ``plugin`` section of the
Dovecot configuration:

:pigeonhole:ref:`sieve` = ``file:~/sieve;active=~/.dovecot.sieve``
   This specifies the
   :ref:`location <pigeonhole_configuration_script_locations>`
   where the scripts that are uploaded through ManageSieve are stored.

Quota Support
-------------

By default, users can manage an unlimited number of Sieve scripts on the
server through ManageSieve. However, ManageSieve can be configured to
enforce limits on the number of personal Sieve scripts per user and/or
the amount of disk storage used by these scripts. The maximum size of
individual uploaded scripts is dictated by the configuration of the
:ref:`Sieve interpreter <pigeonhole_sieve_interpreter>`.
The limits are configured in the plugin section of the Dovecot
configuration as follows:

:pigeonhole:ref:`sieve_max_script_size`
   The maximum size of a Sieve script.

:pigeonhole:ref:`sieve_quota_max_scripts`
   The maximum number of personal Sieve scripts a single user can have.

:pigeonhole:ref:`sieve_quota_max_storage`
   The maximum amount of disk storage a single user's scripts may
   occupy.

Examples
--------

The following provides example configurations for ManageSieve in
dovecot.conf for the various versions. Only sections relevant to
ManageSieve and the Sieve plugin are shown. Refer to 20-managesieve.conf
in ``doc/dovecot/example-config/conf.d``, but don't forget to add ``sieve``
to the :dovecot_core:ref:`protocols` setting if you use it.

::

   ...
   service managesieve-login {
     #inet_listener sieve {
     #  port = 4190
     #}

     #inet_listener sieve_deprecated {
     #  port = 2000
     #}

     # Number of connections to handle before starting a new process. Typically
     # the only useful values are "unlimited" or 1. 1 is more secure, but
     # "unlimited" is faster.
     #restart_request_count = 1

     # Number of processes to always keep waiting for more connections.
     #process_min_avail = 0

     # If you set restart_request_count=unlimited, you probably need to grow this.
     #vsz_limit = 64M
   }

   service managesieve {
     # Max. number of ManageSieve processes (connections)
     #process_limit = 1024
   }

   # Service configuration

   protocol sieve {
     # Maximum ManageSieve command line length in bytes. ManageSieve usually does
     # not involve overly long command lines, so this setting will not normally need
     # adjustment
     #managesieve_max_line_length = 65536

     # Maximum number of ManageSieve connections allowed for a user from each IP address.
     # NOTE: The username is compared case-sensitively.
     #mail_max_userip_connections = 10

     # Space separated list of plugins to load (none known to be useful so far). Do NOT
     # try to load IMAP plugins here.
     #mail_plugins =

     # MANAGESIEVE logout format string:
     #  %i - total number of bytes read from client
     #  %o - total number of bytes sent to client
     #managesieve_logout_format = bytes=%i/%o

     # To fool ManageSieve clients that are focused on CMU's timesieved you can specify
     # the IMPLEMENTATION capability that the dovecot reports to clients.
     # For example: 'Cyrus timsieved v2.2.13'
     #managesieve_implementation_string = Dovecot Pigeonhole

     # Explicitly specify the SIEVE and NOTIFY capability reported by the server before
     # login. If left unassigned these will be reported dynamically according to what
     # the Sieve interpreter supports by default (after login this may differ depending
     # on the user).
     #managesieve_sieve_capability =
     #managesieve_notify_capability =

     # The maximum number of compile errors that are returned to the client upon script
     # upload or script verification.
     #managesieve_max_compile_errors = 5

     # Refer to 90-sieve.conf for script quota configuration and configuration of
     # Sieve execution limits.
   }


   plugin {
     # Used by both the Sieve plugin and the ManageSieve protocol
     sieve = file:~/sieve;active=~/.dovecot.sieve
   }

Proxy
-----

Like Dovecot's imapd, the ManageSieve login daemon supports proxying to
multiple backend servers. The :ref:`authentication-proxies` page
for POP3 and IMAP applies automatically to ManageSieve as well.
