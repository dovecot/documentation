.. _pigeonhole_plugin_extprograms:

====================================
Pigeonhole Sieve: Extprograms Plugin
====================================

The "sieve_extprograms" plugin provides an extension to the `Sieve
filtering language <http://www.sieve.info>`_ adding new action commands
for invoking a predefined set of external programs. Messages can be
piped to or filtered through those programs and string data can be input
to and retrieved from those programs. To mitigate the security concerns,
the external programs cannot be chosen arbitrarily; the available
programs are restricted through administrator configuration.

This plugin is only available for Pigeonhole
v0.3 and higher (available for Dovecot v2.1). For Pigeonhole
v0.4 this plugin is part of the release. This is an evolution of the pipe plugin
for Pigeonhole v0.2 and now provides the ``filter`` and ``execute`` commands
(and corresponding extensions) in addition to the ``pipe`` command that
was provided earlier by the Pipe plugin.

Configuration
-------------

The plugin is activated by adding it to the :pigeonhole:ref:`sieve_plugins`
setting:

.. code-block:: none

  sieve_plugins = sieve_extprograms

This plugin registers the ``vnd.dovecot.pipe``, ``vnd.dovecot.filter``
and ``vnd.dovecot.execute`` extensions with the Sieve interpreter.
However, these extensions are not enabled by default and thus need to be
enabled explicitly. It is recommended to restrict the use of these
extensions to global context by adding these to the
:pigeonhole:ref:`sieve_global_extensions` setting. If personal user scripts
also need to directly access external programs, the extensions need to be
added to the :pigeonhole:ref:`sieve_extensions` setting.

The commands introduced by the Sieve language extensions in this plugin
can directly pipe a message or string data to an external program
(typically a shell script) by forking a new process. Alternatively,
these can connect to a unix socket behind which a Dovecot script service
is listening to start the external program, e.g. to execute as a
different user or for added security.

The program name specified for the new Sieve ``pipe``, ``filter`` and
``execute`` commands is used to find the program or socket in a
configured directory. Separate directories are specified for the sockets
and the directly executed binaries. The socket directory is searched
first. Since the use of "/" in program names is prohibited, it is not
possible to build a hierarchical structure.

Directly forked programs are executed with a limited set of environment
variables: ``HOME``, ``USER``, ``SENDER``, ``RECIPIENT`` and
``ORIG_RECIPIENT``. Programs executed through the script-pipe socket
service currently have no environment set at all.

If a shell script is expected to read a message or string data, it must
fully read the provided input until the data ends with EOF, otherwise
the Sieve action invoking the program will fail. The action will also
fail when the shell script returns a nonzero exit code. Standard output
is available for returning a message (for the filter command) or string
data (for the execute command) to the Sieve interpreter. Standard error
is written to the LDA log file.

The three extensions introduced by this plugin - ``vnd.dovecot.pipe``,
``vnd.dovecot.filter`` and ``vnd.dovecot.execute`` - each have separate
but similar configuration. The following configuration settings are
used, for which "<extension>" in the setting name is replaced by either
``pipe``, ``filter`` or ``execute`` depending on which extension is
being configured:

``sieve_extension_socket_dir`` =
   Points to a directory relative to the Dovecot base_dir where the
   plugin looks for script service sockets.

``sieve_extension_bin_dir`` =
   Points to a directory where the plugin looks for programs (shell
   scripts) to execute directly and pipe messages to.

``sieve_extension_exec_timeout`` = 10s
   Configures the maximum execution time after which the program is
   forcibly terminated.

``sieve_extension_input_eol`` = crlf
   Determines the end-of-line character sequence used for the data piped
   to external programs. The default is currently "crlf", which
   represents a sequence of the carriage return (CR) and line feed (LF)
   characters. This matches the Internet Message Format (:rfc:`5322`) and
   what Sieve itself uses as a line ending. Set this setting to "lf" to
   use a single LF character instead.

Configuration Example 1: socket service for "pipe" and "execute"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

::

   plugin {
     sieve = ~/.dovecot.sieve

     sieve_plugins = sieve_extprograms
     sieve_global_extensions = +vnd.dovecot.pipe +vnd.dovecot.execute

     # pipe sockets in /var/run/dovecot/sieve-pipe
     sieve_pipe_socket_dir = sieve-pipe

     # execute sockets in /var/run/dovecot/sieve-execute
     sieve_execute_socket_dir = sieve-execute
   }

   service sieve-pipe-script {
     # This script is executed for each service connection
     executable = script /usr/lib/dovecot/sieve-extprograms/sieve-pipe-action.sh

     # use some unprivileged user for execution
     user = dovenull

     # socket name is program-name in Sieve (without sieve-pipe/ prefix)
     unix_listener sieve-pipe/sieve-pipe-script {
     }
   }

   service sieve-execute-action {
     # This script is executed for each service connection
     executable = script /usr/lib/dovecot/sieve-extprograms/sieve-execute-action.sh

     # use some unprivileged user for execution
     user = dovenull

     # socket name is program-name in Sieve (without sieve-execute/ prefix)
     unix_listener sieve-execute/sieve-execute-action {
     }
   }

Configuration Example 2: direct execution for "pipe" and "filter"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

::

   plugin {
     sieve = ~/.dovecot.sieve

     sieve_plugins = sieve_extprograms
     sieve_global_extensions = +vnd.dovecot.pipe +vnd.dovecot.filter

     # This directory contains the scripts that are available for the pipe command.
     sieve_pipe_bin_dir = /usr/lib/dovecot/sieve-pipe

     # This directory contains the scripts that are available for the filter
     # command.
     sieve_filter_bin_dir = /usr/lib/dovecot/sieve-filter
   }

Usage
-----

Read the specification (`v0.3
plugin <http://hg.rename-it.nl/pigeonhole-0.3-sieve-extprograms/raw-file/tip/doc/rfc/spec-bosch-sieve-extprograms.txt>`_/`v0.4+ <https://github.com/dovecot/pigeonhole/blob/master/doc/rfc/spec-bosch-sieve-extprograms.txt>`_)
for detailed information on how to use the new language extensions.

Full Examples
-------------

Example 1
~~~~~~~~~

This simple example shows how to use the "vnd.dovecot.execute" extension
to perform some sort of test on the incoming message.

Relevant configuration:

::

   plugin {
    sieve_extensions = +vnd.dovecot.execute

    sieve_plugins = sieve_extprograms
    sieve_execute_bin_dir = /usr/lib/dovecot/sieve-execute
   }

The sieve script:

::

   require "vnd.dovecot.execute";

   if not execute :pipe "hasfrop.sh" {
           discard;
           stop;
   }

At the location ``/usr/lib/dovecot/sieve-execute``, create the
executable script ``hasfrop.sh``. In this example, the ``hasfrop.sh``
checks whether the message contains the literal text "FROP" anywhere in
the message. The Sieve script shown above discards the message if this
scripts ends with an exit code other than 0, which happens when "FROP"
was found.

::

   # Something that reads the whole message and inspects it for some
   # property. Not that the whole message needs to be read from input!
   N=`cat | grep -i "FROP"` # Check it for the undesirable text "FROP"
   if [ ! -z "$N" ]; then
           # Result: deny
           exit 1;
   fi

   # Result: accept
   exit 0

Example 2
~~~~~~~~~

This example shows how to use the ``vnd.dovecot.execute`` extension for
querying/updating a MySQL database. This is used to redirect messages
only once every 300s for a particular sender. Note that this particular
use case could also be implemented using the Sieve
":ref:`duplicate <pigeonhole_extension_duplicate>`"
extension

Relevant configuration:

::

   plugin {
    sieve_extensions = +vnd.dovecot.execute

    sieve_plugins = sieve_extprograms
    sieve_execute_bin_dir = /usr/lib/dovecot/sieve-execute
   }

The sieve script:

::

   require ["variables", "copy", "envelope", "vnd.dovecot.execute"];

   # put the envelope-from address in a variable
   if envelope :matches "from" "*" { set "from" "${1}"; }

   # execute the vacationcheck.sh program and redirect the message based on its exit code
   if execute :output "vacation_message" "vacationcheck.sh" ["${from}","300"]
   {
    redirect
         :copy "foo@bar.net";
   }

At the location ``/usr/lib/dovecot/sieve-execute``, create the
executable script ``vacationcheck.sh``. In this example, the
``vacationcheck.sh`` script needs two parameters: the sender address and
a time interval specified in seconds. The time interval is used to
specify the minimum amount of time that needs to have passed since the
sender was last seen. If the script returns exit code 0, then message is
redirected in the Sieve script shown above.

::

   USER=postfixadmin
   PASS=pass
   DATABASE=postfixadmin

   # DB STRUCTURE
   #CREATE TABLE `sieve_count` (
   #  `from_address` varchar(254) NOT NULL,
   #  `date` datetime NOT NULL
   #) ENGINE=InnoDB DEFAULT CHARSET=latin1;
   #
   #ALTER TABLE `sieve_count`
   #  ADD KEY `from_address` (`from_address`);

   MAILS=$(mysql -u$USER -p$PASS $DATABASE --batch --silent -e "SELECT count(*) as ile FROM sieve_count WHERE from_address='$1' AND DATE_SUB(now(),INTERVAL $2 SECOND) < date;")
   ADDRESULT=$(mysql -u$USER -p$PASS $DATABASE --batch --silent -e "INSERT INTO sieve_count (from_address, date) VALUES ('$1', NOW());")

   # uncomment below to debug
   # echo User $1 sent $MAILS in last $2 s >> /usr/lib/dovecot/sieve-pipe/output.txt
   # echo Add result : $ADDRESULT >> /usr/lib/dovecot/sieve-pipe/output.txt
   # echo $MAILS

   if [ "$MAILS" = "0" ]
   then
   exit 0
   fi

   exit 1
