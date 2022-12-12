========================
Postfix and Dovecot LMTP
========================

Starting with Dovecot 2.x a :ref:`LMTP-Server <lmtp_server>` has been added.

Basic Configuration
===================

The first step is to enable its stack via ``/etc/dovecot/dovecot.conf``

::

   !include conf.d/*.conf
   protocols = imap lmtp

Socket configuration
--------------------

The actual socket is configured in
``/etc/dovecot/conf.d/10-master.conf``. The LMTP service can be bound to
both INET or Unix sockets. In this example a Unix socket is placed
inside the Postfix spool with appropriate permissions set:

::

   service lmtp {
    unix_listener /var/spool/postfix/private/dovecot-lmtp {
      group = postfix
      mode = 0600
      user = postfix
     }
   }

Note that the socket needs to be placed there because Postfix access is
limited to this directory.

Plugin Support
--------------

Plugin support can be enabled at protocol level via
``/etc/dovecot/conf.d/20-lmtp.conf``, for
:ref:`Quota <quota>`
and
:ref:`Sieve <sieve>`
here:

::

   protocol lmtp {
     postmaster_address = postmaster@domainname   # required
     mail_plugins = quota sieve
   }

Postfix main.cf Configuration
-----------------------------

The final step is to tell Postfix to use this socket for final delivery,
in this case in a virtual user scenario:

::

   virtual_transport = lmtp:unix:private/dovecot-lmtp

For a non virtual user setup ( as when mail_location =
maildir:~/.maildir ) :

::

   mailbox_transport = lmtp:unix:private/dovecot-lmtp

Dynamic address verification with LMTP
--------------------------------------

With Dovecot 2.0 you can also use LMTP and the Postfix setting
"reject_unverified_recipient" for dynamic address verification. It's
really nice because Postfix doesn't need to query an external datasource
(MySQL, LDAP...). Postfix maintain a local database with existing/non
existing addresses (you can configure how long positive/negative results
should be cached). `Postfix
reject_unverified_recipient <https://www.postfix.org/ADDRESS_VERIFICATION_README.html>`_

To use LMTP and dynamic address verification you must first get Dovecot
working. Then you can configure Postfix to use LMTP and set
"reject_unverified_recipient" in the smtpd_recipient_restrictions.

On every incoming email Postfix will probe if the recipient address
exists. You will see similar entries in your logfile:

::

   Recipient address rejected: undeliverable address: host tux.example.com[private/dovecot-lmtp] said: 550 5.1.1 < tzknvtr@example.com > User doesn't exist: tzknvtr@example.com (in reply to RCPT TO command); from=< cnrilrgfclra@spammer.org > to=< tzknvtr@example.com >

If the recipient address exists (status=deliverable) Postfix accepts the
mail.

.. note::

   you can not use "reject_unverified_recipient" with "pipe" so this doesn't work with the Dovecot LDA "deliver".
