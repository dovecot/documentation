.. _howto-fail2ban:

===========================
Using Fail2ban with Dovecot
===========================

If you're using Dovecot v1.1 or older, you need to log via syslog.
Otherwise log files contain "dovecot: " prefix, which fail2ban doesn't
like. v1.2+ no longer have this prefix. You can use syslogging by
setting :dovecot_core:ref:`log_path` to empty value in ``dovecot.conf``.

Create the filter file /etc/fail2ban/filter.d/dovecot-pop3imap.conf:

::

   [Definition]
   failregex = (?: pop3-login|imap-login): .*(?:Authentication failure|Aborted login \(auth failed|Aborted login \(tried to use disabled|Disconnected \(auth failed|Aborted login \(\d+ authentication attempts).*rip=`<HOST>`

Add the following to /etc/fail2ban/jail.conf:

::

   [dovecot-pop3imap]
   enabled = true
   filter = dovecot-pop3imap
   action = iptables-multiport[name=dovecot-pop3imap, port="pop3,imap", protocol=tcp]
   logpath = /var/log/maillog
   maxretry = 20
   findtime = 1200
   bantime = 1200

(Set the ``logpath`` to wherever your syslog has been configured to log Dovecot's login messages.)

Note: The iptables-multiport action does not generally work with OpenVPS based VPS's due to a missing Kernel library.
