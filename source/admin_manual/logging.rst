.. _dovecot_logging:

======================
Dovecot Logging
======================

**Dovecot always logs a detailed error message** if something goes wrong. If it doesn't, it's considered a bug and will be fixed. However, almost always the problem is that **you're looking at the wrong log file**; error messages may be logged to a different file than informational messages.

By default Dovecot uses the syslog service with mail facility. Dovecot can
also be configured to log to files directly.

Log File Location
^^^^^^^^^^^^^^^^^

You can find the log file locations by running:

.. code-block:: none

   doveadm log find

Last Errors
^^^^^^^^^^^

You can easily print the last 1000 error messages of a running Dovecot:

.. code-block:: none

   doveadm log errors

Changing Log File Paths
^^^^^^^^^^^^^^^^^^^^^^^

If you don't want to use syslog, you can make Dovecot log to files directly:

.. code-block:: none

   log_path = /var/log/dovecot.log
   # If not set, use the value from log_path
   info_log_path = /var/log/dovecot-info.log
   # If not set, use the value from info_log_path
   debug_log_path = /var/log/dovecot-debug.log

The warning and error messages go to the file specified by
:dovecot_core:ref:`log_path`, while informative messages goes to
:dovecot_core:ref:`info_log_path` and debug messages goes to
:dovecot_core:ref:`debug_log_path`.

Syslog
^^^^^^

You can change Dovecot's syslog facility from :dovecot_core:ref:`syslog_facility` setting. The syslog configuration is often in ``/etc/syslog.conf`` or ``/etc/rsyslog*`` files.

When using syslog, Dovecot uses 5 different logging levels:

 * **debug**: Debug-level message.

 * **info**: Informational messages.

 * **warning**: Warnings that don't cause an actual error, but are useful to know about.

 * **err**: Non-fatal errors.

 * **crit**: Fatal errors that cause the process to die.

Where exactly these messages are logged depends entirely on your syslog configuration. Often everything is logged to ``/var/log/mail.log`` or ``/var/log/maillog``, and err and crit are logged to ``/var/log/mail.err``. This is not necessarily true for your configuration though.

In an ideal configuration the errors would be logged to a separate file than non-errors. For example you could set ``syslog_facility=local5`` and set:

.. code-block:: none

   local5.*        -/var/log/dovecot.log
   local5.warning;local5.error;local5.crit -/var/log/dovecot-errors.log

Here all the Dovecot messages get logged into ``dovecot.log``, while all the important error/warning messages get logged into ``dovecot-errors.log``.

Sometimes syslog is configured to log all info level logging to ``/var/log/messages``. You can disable such duplicates for mail by adding ";local5.none". For example:

.. code-block:: none

   *.info;local2.none;authpriv.none;cron.none;local5.none /var/log/messages

Syslog rate limiting
^^^^^^^^^^^^^^^^^^^^

rsyslog is configured with flood control enabled by default. Since Dovecot can log a lot in some situations, especially with debug logging enabled, this causes log messages to be lost.

The rate limiting should be disabled in ``/etc/rsyslog.conf``:

.. code-block:: none

   $SystemLogRateLimitInterval 0


Rotating Logs
^^^^^^^^^^^^^

You can use logrotate to maintain the Dovecot log files so they don't grow beyond a manageable size. Save the below scriptlet as ``/etc/logrotate.d/dovecot``:

.. code-block:: none

   /var/log/dovecot.log {
     weekly
     rotate 4
     missingok
     notifempty
     compress
     delaycompress
     sharedscripts
     postrotate
     doveadm log reopen
     endscript
   }

.. Note:: doveadm is not working properly with SELinux (e.g. doveadm cannot read config file when called from logrotate context). SELinux safe postrotate alternative scriptlet:

.. code-block:: none

   postrotate
   kill -s 0 `cat /var/run/dovecot/master.pid` || kill -s USR1 `cat /var/run/dovecot/master.pid`
   endscript

Internal Errors
^^^^^^^^^^^^^^^

If IMAP or POP3 processes encounter some error, they don't show the exact reason for clients. Instead they show:

.. code-block:: none

   Internal error occurred. Refer to server log for more information. [2006-01-07 22:35:11]

The point is that whenever anything unexpected happens, Dovecot doesn't leak any extra information about it to clients. They don't need it and they might try to exploit it in some ways, so the less they know the better.

The real error message is written to the error log file. The timestamp is meant for you to help you find it.

Logging verbosity
^^^^^^^^^^^^^^^^^

There are several settings that control logging verbosity. By default they're all disabled, but they may be useful for debugging.

* :dovecot_core:ref:`auth_verbose=yes <auth_verbose>` enables logging all failed authentication attempts.

* :dovecot_core:ref:`auth_debug=yes <auth_debug>` enables all authentication debug logging (also enables :dovecot_core:ref:`auth_verbose`). Passwords are logged as `<hidden>`.

* :dovecot_core:ref:`auth_debug_passwords=yes <auth_debug_passwords>` does everything that ``auth_debug=yes`` does, but it also removes password hiding (but only if you are not using PAM, since PAM errors aren't written to Dovecot's own logs).

* :dovecot_core:ref:`mail_debug=yes <mail_debug>` enables all kinds of mail related debug logging, such as showing where Dovecot is looking for mails.

* :dovecot_core:ref:`verbose_ssl=yes <verbose_ssl>` enables logging SSL errors and warnings. Even without this setting if connection is closed because of an SSL error, the error is logged as the disconnection reason.

* :dovecot_core:ref:`auth_verbose_passwords=no|plain|sha1 <auth_verbose_passwords>` If authentication fails, this setting logs the used password. If you don't really need to know what the password itself was, but are more interested in knowing if the user is simply trying to use the wrong password every single time or if it's a brute force attack, you can set this to ``sha1`` and only the SHA1 of the password is logged. That's enough to know if the password is same or different between login attempts.

* :dovecot_core:ref:`log_debug` Flexible debug logging configuration.
