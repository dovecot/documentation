.. _dovecot_logging:

======================
Dovecot Logging
======================

**Dovecot always logs a detailed error message** if something goes wrong. If it doesn't, it's considered a bug and will be fixed. However, almost always the problem is that **you're looking at the wrong log file**; error messages may be logged to a different file than informational messages.

You can find the log file locations by running:

.. code-block:: none

   doveadm log find

Dovecot log configuration is found in the ``conf.d/10-logging.conf`` file in the dovecot configuration folder (usually ``/etc/dovecot`` but may also be ``/usr/local/etc/dovecot``).

By default Dovecot logs to syslog using mail facility. You can change the facility from ``syslog_facility`` setting. The syslog configuration is often in /etc/syslog.conf or /etc/rsyslog* files. You can also configure Dovecot to write to log files directly, see below.

When using syslog, Dovecot uses 5 different logging levels:

 * **debug**: Debug-level message.

 * **info**: Informational messages.

 * **warning**: Warnings that don't cause an actual error, but are useful to know about.

 * **err**: Non-fatal errors.

 * **crit**: Fatal errors that cause the process to die.

Where exactly these messages are logged depends entirely on your syslog configuration. Often everything is logged to /var/log/mail.log or /var/log/maillog, and err and crit are logged to ``/var/log/mail.err``. This is not necessarily true for your configuration though.

In an ideal configuration the errors would be logged to a separate file than non-errors. For example you could set ``syslog_facility=local5`` and set:

.. code-block:: none

   local5.*        -/var/log/dovecot.log
   local5.warning;local5.error;local5.crit -/var/log/dovecot-errors.log

Here all the Dovecot messages get logged into dovecot.log, while all the important error/warning messages get logged into dovecot-errors.log.

Internal Errors
^^^^^^^^^^^^^^^^

If IMAP or POP3 processes encounter some error, they don't show the exact reason for clients. Instead they show:

.. code-block:: none
   
   
   Internal error occurred. Refer to server log for more information. [2006-01-07 22:35:11]

The point is that whenever anything unexpected happens, Dovecot doesn't leak any extra information about it to clients. They don't need it and they might try to exploit it in some ways, so the less they know the better.

The real error message is written to the error log file. The timestamp is meant for you to help you find it.

Changing Log File Paths
^^^^^^^^^^^^^^^^^^^^^^^^

If you don't want to use syslog, or if you just can't find the Dovecot's error logs, you can make Dovecot log elsewhere as well:

.. code-block:: none

   log_path = /var/log/dovecot.log
   # If you want everything in one file, just don't specify info_log_path and debug_log_path
   info_log_path = /var/log/dovecot-info.log
   # Leave empty in order to send debug-level messages to info_log_path
   debug_log_path = /var/log/dovecot-debug.log

The warning and error messages will go to file specified by log_path, while informative messages goes to info_log_path and debug messages goes to debug_log_path. If you do this, make sure you're really looking at the log_path file for error messages, since the "Starting up" message is written to info_log_path file.

Syslog Example
^^^^^^^^^^^^^^^

Dovecot logging asynchronously via syslog_facility = local5 with basic rules:

.. code-block:: none

   local5.* -/var/log/dovecot.log
   local5.info -/var/log/dovecot.info
   local5.warn -/var/log/dovecot.warn
   local5.err -/var/log/dovecot.err
   :msg,contains,"stored mail into mailbox"\
                                  -/var/log/dovecot.lmtp

Rotating Logs
^^^^^^^^^^^^^^

If you change from syslog to an external log file, you can use logrotate (available on most recent linux distros) to maintain the Dovecot logfile so it doesn't grow beyond a manageable size. Save the below scriptlet as /etc/logrotate.d/dovecot:

.. code-block:: none

   /var/log/dovecot*.log {
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

.. Note:: doveadm is not working properly with SELinux (e.g. doveadm cannot read config file when called from logrotate context). SELinux safe postrotate alternative scriplet:

.. code-block:: none

   postrotate
   kill -s 0 `cat /var/run/dovecot/master.pid` || kill -s USR1 `cat /var/run/dovecot/master.pid`
   endscript

.. Note:: When syslog_facility = local5 is used for logging (example above), the line "/var/log/dovecot.log" should be added to the /etc/logrotate.d/syslog file to enable rotation (no /etc/logrotate.d/dovecot in this case!).

Logging verbosity
^^^^^^^^^^^^^^^^^^

There are several settings that control logging verbosity. By default they're all disabled, but they may be useful for debugging.

* ``auth_verbose=yes`` enables logging all failed authentication attempts.

* ``auth_debug=yes`` enables all authentication debug logging (also enables auth_verbose). Passwords are logged as <hidden>.

* ``auth_debug_passwords=yes`` does everything that auth_debug=yes does, but it also removes password hiding (but only if you are not using PAM, since PAM errors aren't written to Dovecot's own logs).

* ``mail_debug=yes`` enables all kinds of mail related debug logging, such as showing where Dovecot is looking for mails.

* ``verbose_ssl=yes`` enables logging SSL errors and warnings. Even without this setting if connection is closed because of an SSL error, the error is logged as the disconnection reason.

* ``auth_verbose_passwords=no|plain|sha1`` If authentication fails, this setting logs the used password. If you don't really need to know what the password itself was, but are more interested in knowing if the user is simply trying to use the wrong password every single time or if it's a brute force attack, you can set this to "sha1" and only the SHA1 of the password is logged. That's enough to know if the password is same or different between login attempts.