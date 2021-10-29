.. _debugging_rawlog:

======
Rawlog
======

Dovecot supports logging IMAP/POP3/LMTP/SMTP(submission) traffic (also TLS/SSL encrypted). There are several possibilities for this:

#. :ref:`setting-rawlog_dir` setting.

   .. versionadded:: v2.2.26

#. Pre-login \*-login process via ``-R`` parameter. See below.

   .. versionadded:: v2.3.2

#. For proxying (in \*-login processes), use :ref:`setting-login_proxy_rawlog_dir`.

   .. versionadded:: v2.3.17

#. For lmtp, you need to use :ref:`setting-lmtp_rawlog_dir` and :ref:`setting-lmtp_proxy_rawlog_dir` settings.

   .. versionadded:: v2.3.2

#. For submission, you need to use :ref:`setting-rawlog_dir` and :ref:`setting-submission_relay_rawlog_dir` settings.

#. Using rawlog binary, which is executed as post-login script.
   This is the legacy method, which shouldn't be necessary anymore. See below.

Pre-login rawlog
================

.. versionadded:: v2.3.2

The pre-login rawlog is used before IMAP, POP3, Submission or ManageSieve
client logs in to the post-login process. Note that LMTP and doveadm protocols
don't have a pre-login process.

.. note:: SSL/TLS sessions are currently not decrypted to rawlogs.

You can enable pre-login rawlog for all users by telling the login processes
to log to a rawlog directory.

Example:

.. code-block:: none

 service imap-login {
   executable = imap-login -R rawlogs
 }

This attempts to write the rawlogs under ``$base_dir/login/rawlogs`` directory.
You need to create it first with enough write permissions.

Example:

.. code-block:: none

   mkdir /var/run/dovecot/login/rawlogs
   chown dovenull /var/run/dovecot/login/rawlogs
   chmod 0700 /var/run/dovecot/login/rawlogs

rawlog binary
=============

This is the legacy method. :ref:`setting-rawlog_dir` setting is preferred nowadays.

This works by checking if ``dovecot.rawlog/`` directory exists in the logged in
user's home directory, and writing the traffic to ``yyyymmdd-HHMMSS-pid.in``
and ``.out`` files. Each connection gets their own in/out files. Rawlog will
simply skip users who don't have the ``dovecot.rawlog/`` directory and the
performance impact for those users is minimal.

Home directory
--------------

.. NOTE:: For rawlog binary to work, your userdb must have returned a home directory for the user.

.. IMPORTANT:: The home directory must be returned by userdb, mail_home setting won't work. Verify that doveadm user -u user@example.com (with -u parameter) returns the home directory, for example:

.. code-block:: none

   % doveadm user -u user@example.com
   userdb: user@example.com
      user      : user@example.com
      uid       : 1000
      gid       : 1000
      home      : /home/user@example.com

In above configuration rawlog would expect to find ``/home/user@example.com/dovecot.rawlog/`` directory writable by uid 1000.

If your userdb can't return a home directory directly, with v2.1+ you can add:

.. code-block:: none

   userdb {
      # ...
      default_fields = home=/home/%u
      # or temporarily even e.g. default_fields = home=/tmp/temp-home
 }

You can also set DEBUG environment to have rawlog log an info message why it's not doing anything:

.. code-block:: none

 import_environment=$import_environment DEBUG=1
 
Configuration
-------------

To enable rawlog binary, use post-login scripting:

.. code-block:: none

 service imap {
   executable = imap postlogin
 }
 service pop3 {
   executable = pop3 postlogin
 }

 service postlogin {
   executable = script-login -d rawlog
   unix_listener postlogin {
  }
 }

You can also give parameters to rawlog:

* -b: Write IP packet boundaries (or whatever read() sees anyway) to the log files. The packet is written between <<< and >>>.
* -t: Log a microsecond resolution timestamp at the beginning of each line.
* -I: Include IP address in the filename
* -f in: Log only to ``*.in`` files
* -f out: Log only to ``*.out`` files
