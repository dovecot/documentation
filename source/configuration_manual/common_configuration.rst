.. _common_configuration:

====================
Common configuration
====================

The settings are listed in the example ``conf.d/15-lda.conf`` file. The important settings are:

* ``postmaster_address`` is used as the From: header address in bounce mails

* ``hostname`` is used in generated Message-IDs and in Reporting-UA: header in bounce mails

* ``sendmail_path`` is used to send mails. Note that the default is /usr/sbin/sendmail, which doesn't necessarily work the same as ``/usr/lib/sendmail``.

   * Alternatively you can use submission_host to send mails via the specified SMTP server.

* ``auth_socket_path`` specifies the UNIX socket to auth-userdb where LDA can lookup userdb information when -d parameter is used. See below how to configure Dovecot to configure the socket.

.. Note:: The config files must be world readable to enable dovecot-lda process read them, while running with user privileges. You can put password related settings to a separate file, which you include with ``!include_try`` and dovecot-lda skips them.

