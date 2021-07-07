====================================
Pigeonhole Sieve: Extprograms Plugin
====================================

.. seealso:: :ref:`pigeonhole_plugin_extprograms`

.. versionadded:: v0.3

.. _plugin-sieve-setting-sieve_extension_socket_dir:

``sieve_<extension>_socket_dir``
--------------------------------

 - Default: <empty>
 - Value: :ref:`string`
 
Points to a directory relative to the Dovecot base_dir where the plugin looks for script service sockets.

.. _plugin-sieve-setting-sieve_extension_bin_dir:

``sieve_<extension>_bin_dir``
-----------------------------

 - Default: <empty>
 - Value: :ref:`string`
 
Points to a directory where the plugin looks for programs (shell scripts) to execute directly and pipe messages to. 

.. _plugin-sieve-setting-sieve_extension_exec_timeout:

``sieve_<extension>_exec_timeout``
----------------------------------

 - Default: ``10s``
 - Value: :ref:`time`

Configures the maximum execution time after which the program is forcibly terminated. 

.. _plugin-sieve-setting-sieve_extension_input_eol:

``sieve_<extension>_input_eol``
-------------------------------

 - Default: ``crlf``
 - Value: ``lf``, ``crlf``

Determines the end-of-line character sequence used for the data piped to external programs.
The default is currently ``crlf``, which represents a sequence of the carriage return (CR) and line feed (LF) characters.
This matches the `Internet Message Format (RFC5322) <https://tools.ietf.org/html/rfc5322>`_ and what Sieve itself uses as a line ending.
Set this setting to ``lf`` to use a single LF character instead. 
