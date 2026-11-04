## Common Delivery Settings

* [[setting,postmaster_address]] is used as the From: header address in
  bounce mails

* [[setting,hostname]] is used in generated Message-IDs and in
  `Reporting-UA:` header in bounce mails

* [[setting,mail_submit]] configures how mails (bounces, Sieve redirects, etc.)
  are sent. By default the `/usr/sbin/sendmail` binary is executed, which
  doesn't necessarily work the same as `/usr/lib/sendmail`.

  * Alternatively you can set [[setting,smtp_client_host]] inside the
    [[setting,mail_submit]] filter to send mails via the specified SMTP
    server.

* [[setting,auth_socket_path]] specifies the UNIX socket to auth-userdb
  where LDA can lookup userdb information when `-d` parameter is used.
  See below how to configure Dovecot to configure the socket.

::: tip
The config files must be world readable to enable dovecot-lda process to read
them while running with user privileges.

You can put password related settings to a separate file, which you
include with \`!include_try\` and dovecot-lda skips them.
:::
