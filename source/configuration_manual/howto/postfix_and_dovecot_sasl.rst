.. _howto-postfix_and_dovecot_sasl:

########################
Postfix and Dovecot SASL
########################

Since version 2.3, Postfix supports SMTP AUTH through Dovecot :ref:`sasl` as introduced in the Dovecot 1.0 series.
If using Postfix obtained from a binary (such as a .rpm or .deb file), you can check if Postfix was compiled with support for Dovecot SASL by running the command:

::

   postconf -a

Once you have verified that your installation of Postfix supports Dovecot SASL, it's very simple to configure:

Example conf.d/10-master.conf excerpt
-------------------------------------

::

   service auth {
   ...
     unix_listener /var/spool/postfix/private/auth {
       mode = 0660
       # Assuming the default Postfix user and group
       user = postfix
       group = postfix        
     }
     ...
   }

   # Outlook and Windows Mail works only with LOGIN mechanism, not the standard PLAIN:
   auth_mechanisms = plain login

Example Postfix main.cf excerpt
-------------------------------

::

   smtpd_sasl_type = dovecot

   # Can be an absolute path, or relative to $queue_directory
   # Debian/Ubuntu users: Postfix is setup by default to run chrooted, so it is best to leave it as-is below
   smtpd_sasl_path = private/auth

   # On Debian Wheezy path must be relative and queue_directory defined
   #queue_directory = /var/spool/postfix

   # and the common settings to enable SASL:
   smtpd_sasl_auth_enable = yes
   # With Postfix version before 2.10, use smtpd_recipient_restrictions
   smtpd_relay_restrictions = permit_mynetworks, permit_sasl_authenticated, reject_unauth_destination

Using SASL with Postfix submission port
---------------------------------------

When Dovecot is used as the authentication backend for Postfix it is good practice to use a dedicated submission port for the MUAs (TCP 587).
Not only can you specify individual parameters in **master.cf** overriding the global ones but you will not run into internet mail rejection while the Dovecot Auth Mechanism is unavailable.
In this example Postfix is configured to accept TLS encrypted sessions only, along with several other sanity checks:

-  Verification of alias ownership via Login Maps

-  Domainname and recipient plausibility

``master.cf``

::

   submission inet n - n - - smtpd
     -o smtpd_tls_security_level=encrypt
     -o smtpd_sasl_auth_enable=yes
     -o smtpd_sasl_type=dovecot
     -o smtpd_sasl_path=private/auth
     -o smtpd_sasl_security_options=noanonymous
     -o smtpd_sasl_local_domain=$myhostname
     -o smtpd_client_restrictions=permit_sasl_authenticated,reject
     -o smtpd_sender_login_maps=hash:/etc/postfix/virtual
     -o smtpd_sender_restrictions=reject_sender_login_mismatch
     -o smtpd_recipient_restrictions=reject_non_fqdn_recipient,reject_unknown_recipient_domain,permit_sasl_authenticated,reject

Dovecot authentication via TCP
------------------------------

If Postfix and Dovecot are running on separate servers, you can also
authenticate via TCP. For Dovecot set up an inet_listener:

::

   service auth {
    inet_listener {
      port = 12345
    }
   }

And configure Postfix to use it:

::

   smtpd_sasl_path = inet:dovecot.example.com:12345
   smtpd_sasl_type = dovecot

See also:
---------

- http://www.postfix.org/SASL_README.html#server_dovecot
