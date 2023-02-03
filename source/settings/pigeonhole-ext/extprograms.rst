====================================
Pigeonhole Sieve: Extprograms Plugin
====================================

.. seealso:: :ref:`pigeonhole_plugin_extprograms`

.. versionadded:: v0.3

Settings
--------

.. pigeonhole:setting:: sieve_<extension>_bin_dir
   :plugin: yes
   :values: @string

   Points to a directory where the plugin looks for programs (shell scripts)
   to execute directly and pipe messages to.


.. pigeonhole:setting:: sieve_<extension>_exec_timeout
   :default: 10s
   :plugin: yes
   :values: @time

   Configures the maximum execution time after which the program is forcibly
   terminated.

.. pigeonhole:setting:: sieve_<extension>_input_eol
   :default: crlf
   :plugin: yes
   :values: lf, crlf

   Determines the end-of-line character sequence used for the data piped to
   external programs.

   The default is currently ``crlf``, which represents a sequence of the
   carriage return (CR) and line feed (LF) characters.

   This matches the
   Internet Message Format (:rfc:`5322`)
   and what Sieve itself uses as a line ending.

   Set this setting to ``lf`` to use a single LF character instead.


.. pigeonhole:setting:: sieve_<extension>_socket_dir
   :plugin: yes
   :values: @string

   Points to a directory relative to the :dovecot_core:ref:`base_dir` where
   the plugin looks for script service sockets.
