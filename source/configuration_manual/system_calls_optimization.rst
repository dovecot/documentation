.. _system_calls_optimization:

=========================
System Calls Optimization
=========================

The use of the TZ environment variable can dramatically reduce the number
of system calls and kernel context switches performed by the application.

The ``localtime()`` function in glibc checks whether the ``TZ`` environment
variable is set. If it is not set, then glibc will use the ``stat()`` system
call every time ``localtime()`` is called, even with vDSO in place.

Setting the ``TZ`` environment variable to ``:/etc/localtime`` (or some other
timezone file of your choice) for a process will save glibc from making those
extra unnecessary system calls (Notice the column ``:`` prefix before the file
path).

The variable can be set either from the shell:

::

  export TZ=:/etc/localtime

or directly from inside the dovecot configuration file:

::

  import_environment {
    TZ = :/etc/localtime
  }

Note that a reload is not sufficient for the change to take effect. A restart
is required.

.. seealso::

  `GNU man page for the TZ environment variable
  <https://www.gnu.org/software/libc/manual/html_node/TZ-Variable.html>`_

  `Article explaining in detail the issue
  <https://blog.packagecloud.io/set-environment-variable-save-thousands-of-system-calls/>`_
