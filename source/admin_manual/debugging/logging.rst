.. _logging:

========
Logging
========

If problems are happening, it's much easier to see what's going wrong if all the errors are logged into a separate log file, so you can quickly see all of them at once. With ``rsyslog`` you can configure this with: 

``mail. -/var/log/dovecot.log*``

``mail.warning;mail.error;mail.crit -/var/log/dovecot.err``

Another thing that often needs to be changed is to disable flood control in rsyslog. Dovecot may log a lot, especially with debug logging enabled, and rsyslog's default settings often lose log messages. 

Another way to look at recent Dovecot errors is to run doveadm log error, which shows up to the last 1000 errors logged by Dovecot since it was last started.