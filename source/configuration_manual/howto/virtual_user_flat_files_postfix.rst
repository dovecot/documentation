===========================================
Virtual users with passwd files and Postfix
===========================================

.. warning::

   This document has been taken out of the old wiki and
   has not yet been updated.

Basic Configuration
===================

``/etc/dovecot/dovecot.conf``

::

   !include conf.d/*.conf
   protocols = imap lmtp

Mail Location and Namespaces
----------------------------

A private namespace configured for *maildir* or *multi-dbox* storage to
hold the mailboxes and a public namespace configured for *maildir*
storage with filesystem layout (/dir/subdir) and per user
index-information. The index will be stored in the ``public`` dir under
the home directories. This allows individual /SEEN information for the
public namespace.

``/etc/dovecot/conf.d/10-mail.conf``

::

   #mail_driver = mdbox
   mail_driver = maildir
   mail_plugins = acl quota
   namespace {
     type = private
     separator = /
     prefix =
     hidden = no
     inbox = yes
   }
   namespace {
     type = public
     separator = /
     prefix = Public/
     mail_path = /var/vmail/public
     mailbox_list_layout = fs
     mail_index_path = ~/public
     list = yes
     subscriptions = no
   }

User Home directory structure: ``/var/vmail/<domain>/<user>/``

::

   -rw------- 1 vmail vmail 1489 2010-03-03 19:30 .dovecot.sieve
   -rw------- 1 vmail vmail 2897 2010-03-14 12:22 .dovecot.svbin
   drwx--S--- 4 vmail vmail 4096 2010-03-17 20:15 maildir
   drwx--S--- 4 vmail vmail 4096 2010-03-14 13:31 public

Authentication Databases
------------------------

Per domain flat-files containing the virtual user's specific parameters,
stored in a single *passwd-like* file. User logins are expected to be in
full-qualified e-mail address format: user@domain.tld. Additional
parameters may be used to override defaults, such as individual quotas
or mailbox formats.

``/etc/dovecot/conf.d/10-auth.conf``

::

   auth_mechanisms = plain
   passdb db1 {
     driver = passwd-file
     passwd_file_path = /var/vmail/auth.d/%d/passwd
   }
   userdb db1 {
     driver = passwd-file
     passwd_file_path = /var/vmail/auth.d/%d/passwd
   }

``/var/vmail/auth.d/<domain>/passwd``

::

   <user>@<domain>:{SSHA}xxxx:5000:5000::/var/vmail/<domain>/<user>::userdb_quota_rule=\
   *:storage=5G userdb_acl_groups=PublicMailboxAdmins

Later on the *auth service* will be configured to run in the
``doveauth`` user context. Therefore the directory ``auth.d/`` and its
content will be owned by this user, while mails / ACLs / Sieve-Scripts,
will be accessed using the ``vmail`` context specified in the
*passwd-file*. To keep directory permissions simple these will be stored
seperately under the ``conf.d/`` tree.

Per-domain authentication and configuration structure ``/var/vmail``

::

   dr-x------ 3 doveauth dovecot  4096 2010-03-17 19:09 auth.d |--> domain.tld
   dr-x------ 3 vmail    vmail    4096 2010-03-03 19:32 conf.d |--> domain.tld

Master Configuration
--------------------

IMAP-Server bound to IP *1.2.3.4* on port 143 while the IMAPS Port (993)
is disabled since ``STARTTLS`` will be used to request encryption over
the standard IMAP port. The LMTP-Server is bound to a Unix socket
configured with relevant permissions allowing Postfix to inject mails
through it. Dovecot presents its Authentication Mechanism and User
Database as another socket to Postfix allowing SASL submission.

Dovecot's authentication services will run in the ``doveauth``
user-context.

``/etc/dovecot/conf.d/10-master.conf``

::

   service imap-login {
     inet_listener imap {
     address = 1.2.3.4
     port = 143
     }
     inet_listener imaps {
     port = 0
     }
   }
   service lmtp {
    unix_listener /var/spool/postfix/private/dovecot-lmtp {
      group = postfix
      mode = 0660
      user = postfix
     }
   }
   service imap {
   }
   service auth {
     unix_listener /var/spool/postfix/private/auth {
       group = postfix
       mode = 0660
       user = postfix
     }
     user = doveauth
   }
   service auth-worker {
    user = doveauth
   }
   verbose_proctitle = yes

Protocols
---------

``/etc/dovecot/conf.d/20-imapd.conf``

::

   protocol imap {
     mail_plugins = $mail_plugins imap_acl imap_quota mail_log notify
   }

``/etc/dovecot/conf.d/20-lmtp.conf``

::

   protocol lmtp {
     postmaster_address = postmaster@domainname   # required on my debian
     mail_plugins = $mail_plugins sieve
   }

Plugins
-------

``/etc/dovecot/conf.d/90-plugin.conf``

::

   plugin {
     #quota = dict:user::file:%h/mdbox/dovecot-quota
     quota = dict:user::file:%h/maildir/dovecot-quota
     quota_rule = *:storage=1GB
     quota_rule2 = Trash:storage=+10%%
     acl = vfile:/var/vmail/conf.d/%d/acls:cache_secs=300
   }

``/etc/dovecot/conf.d/90-sieve.conf``

::

   plugin {
     sieve = ~/.dovecot.sieve
     sieve_dir = ~/sieve
     sieve_global_dir = /var/vmail/conf.d/%d/sieve
   }

TLS
---

``/etc/dovecot/conf.d/10-ssl.conf``

::

   ssl_cert = </etc/ssl/certs/domain_tld_2009.crt
   ssl_key = </etc/ssl/private/domain_tld_2009.key

Logging
=======

Simple logging using the internal mechanism. See :ref:`Syslog
Logging <dovecot_logging_syslog>` for more complex configurations.

``/etc/dovecot/conf.d/10-logging.conf``

::

   log_path = /var/log/dovecot.log
   info_log_path = /var/log/dovecot-info.log

Syslog Logging
==============

``/etc/dovecot/conf.d/10-logging.conf``

::

   #log_path =
   #info_log_path =
   syslog_facility = local1

``/etc/rsyslog.conf``

::

   local1.*                          -/var/log/dovecot.log
   local1.info                       -/var/log/dovecot.info
   local1.warn                       -/var/log/dovecot.warn
   local1.err                        -/var/log/dovecot.err
   :msg,contains,"stored mail into mailbox"\
                                     -/var/log/dovecot.lmtp

``/etc/logrotate.d/dovecot``

::

   /var/log/dovecot.log
   /var/log/dovecot.info
   /var/log/dovecot.warn
   /var/log/dovecot.err
   /var/log/dovecot.lmtp
   {
           weekly
           rotate 52
           missingok
           notifempty
           compress
           delaycompress
           create 640 root adm
           sharedscripts
           postrotate
           /bin/kill -USR1 'cat /var/run/dovecot/master.pid 2>/dev/null' 2>/dev/null || true
           endscript
   }

Postfix Configuration
=====================

In this configuration Postfix will only accept SASL requests on its
submission port (``TCP:587``) and will not accept them on Port 25. As
Dovecot is used as authentication backend in this example, this will not
break inbound mail flow in case the authentication mechanism is down
e.g. due to upgrading to a new build. The configuration of the
submission port is handled in ``master.cf`` overriding possible
``main.cf`` settings. Several sanity checks are performed upon
submission like recipient domain validation and sender map checks. Final
delivery is performed through Dovecot's LMTP server via a socket.

``/etc/postfix/main.cf``

::

   smtpd_banner = $myhostname ESMTP
   biff = no
   append_dot_mydomain = no

   myhostname = mail.domain.tld
   inet_protocols = ipv4
   inet_interfaces = 1.2.3.4
   masquerade_domains =
   masquerade_exceptions = root
   masquerade_classes = envelope_sender, header_sender, header_recipient
   mydestination = $myhostname, localhost.$mydomain
   mynetworks_style = subnet

   virtual_mailbox_domains = domain.tld, domain1.tld
   virtual_mailbox_base = /var/vmail
   virtual_minimum_uid = 100
   virtual_uid_maps = static:5000
   virtual_gid_maps = static:5000
   virtual_alias_maps = hash:/etc/postfix/virtual
   virtual_transport = lmtp:unix:private/dovecot-lmtp

   strict_rfc821_envelopes = yes
   disable_vrfy_command = yes

   smtpd_client_restrictions =
    check_client_access hash:/etc/postfix/client_access,
    reject_unknown_client_hostname
   smtpd_helo_required = yes
   smtpd_helo_restrictions =
    check_helo_access hash:/etc/postfix/helo_access,
    reject_invalid_helo_hostname,
    reject_unknown_helo_hostname,
    reject_non_fqdn_helo_hostname
   smtpd_sender_restrictions =
    reject_unknown_sender_domain
   smtpd_recipient_restrictions =
    reject_unknown_recipient_domain,
    reject_non_fqdn_recipient,
    reject_unverified_recipient,
    permit_mynetworks,
    reject_unauth_destination,
    check_policy_service unix:private/policyd-spf,
    check_policy_service unix:public/postgrey

   policyd-spf_time_limit = 3600
   smtpd_milters = unix:public/dkim-filter
   non_smtpd_milters = unix:public/dkim-filter
   milter_protocol = 6

   unknown_address_reject_code  = 554
   unknown_hostname_reject_code = 554
   unknown_client_reject_code   = 554
   unknown_local_recipient_reject_code = 550

   smtpd_tls_cert_file=/etc/postfix/server.pem
   smtpd_tls_key_file=/etc/ssl/private/domain_tld.key
   smtpd_tls_security_level = may
   smtp_tls_security_level = may
   smtpd_tls_ask_ccert = yes
   smtpd_tls_loglevel = 1
   smtp_tls_loglevel = 1
   smtpd_tls_received_header = yes
   smtpd_tls_session_cache_database = btree:/var/lib/postfix/smtpd_scache
   smtp_tls_session_cache_database = btree:/var/lib/postfix/smtp_scache

   alias_maps = hash:/etc/aliases
   mailbox_size_limit = 0
   message_size_limit = 20480000

   queue_run_delay = 300s
   minimal_backoff_time = 300s
   master_service_disable =

Postfix Master Configuration
----------------------------

The submission port is configured to only accept TLS secured
transmissions. Login Map checks will verify the authenticated SASL user
is authorized to send using different MAIL FROM aliases.

``/etc/postfix/master.cf``

::

   #
   # Postfix master process configuration file.  For details on the format
   # of the file, see the master(5) manual page (command: "man 5 master").
   #
   # ==========================================================================
   # service type  private unpriv  chroot  wakeup  maxproc command + args
   #               (yes)   (yes)   (yes)   (never) (100)
   # ==========================================================================
   smtp      inet  n       -       -       -       -       smtpd
   submission inet n       -       -       -       -       smtpd
     -o smtpd_tls_security_level=encrypt
     -o smtpd_sasl_auth_enable=yes
     -o smtpd_sasl_type=dovecot
     -o smtpd_sasl_path=private/auth
     -o smtpd_sasl_security_options=noanonymous
     -o smtpd_sasl_local_domain=$myhostname
     -o smtpd_client_restrictions=permit_sasl_authenticated,reject
     -o smtpd_sender_login_maps=hash:/etc/postfix/virtual
     -o smtpd_sender_restrictions=reject_sender_login_mismatch
     -o smtpd_recipient_restrictions=reject_unknown_recipient_domain,reject_non_fqdn_recipient,\
        permit_sasl_authenticated,reject
   #smtps     inet  n       -       -       -       -       smtpd
   #  -o smtpd_tls_wrappermode=yes
   #  -o smtpd_sasl_auth_enable=yes
   #  -o smtpd_client_restrictions=permit_sasl_authenticated,reject
   #628      inet  n       -       -       -       -       qmqpd
   pickup    fifo  n       -       -       60      1       pickup
   cleanup   unix  n       -       -       -       0       cleanup
   qmgr      fifo  n       -       n       300     1       qmgr
   #qmgr     fifo  n       -       -       300     1       oqmgr
   tlsmgr    unix  -       -       -       1000?   1       tlsmgr
   rewrite   unix  -       -       -       -       -       trivial-rewrite
   bounce    unix  -       -       -       -       0       bounce
   defer     unix  -       -       -       -       0       bounce
   trace     unix  -       -       -       -       0       bounce
   verify    unix  -       -       -       -       1       verify
   flush     unix  n       -       -       1000?   0       flush
   proxymap  unix  -       -       n       -       -       proxymap
   smtp      unix  -       -       -       -       -       smtp
     -o smtp_header_checks=pcre:/etc/postfix/header_checks_outbound
   # When relaying mail as backup MX, disable fallback_relay to avoid MX loops
   relay     unix  -       -       -       -       -       smtp
           -o fallback_relay=
   #       -o smtp_helo_timeout=5 -o smtp_connect_timeout=5
   showq     unix  n       -       -       -       -       showq
   error     unix  -       -       -       -       -       error
   discard   unix  -       -       -       -       -       discard
   local     unix  -       n       n       -       -       local
   virtual   unix  -       n       n       -       -       virtual
   lmtp      unix  -       -       -       -       -       lmtp
   anvil     unix  -       -       -       -       1       anvil
   scache    unix  -       -       -       -       1       scache
   #
   # ====================================================================
   # Interfaces to non-Postfix software. Be sure to examine the manual
   # pages of the non-Postfix software to find out what options it wants.
   #
   # Many of the following services use the Postfix pipe(8) delivery
   # agent.  See the pipe(8) man page for information about ${recipient}
   # and other message envelope options.
   # ====================================================================
   #
   # maildrop. See the Postfix MAILDROP_README file for details.
   # Also specify in main.cf: maildrop_destination_recipient_limit=1
   #
   maildrop  unix  -       n       n       -       -       pipe
     flags=DRhu user=vmail argv=/usr/bin/maildrop -d ${recipient}
   #
   # See the Postfix UUCP_README file for configuration details.
   #
   uucp      unix  -       n       n       -       -       pipe
     flags=Fqhu user=uucp argv=uux -r -n -z -a$sender - $nexthop!rmail ($recipient)
   #
   # Other external delivery methods.
   #
   ifmail    unix  -       n       n       -       -       pipe
     flags=F user=ftn argv=/usr/lib/ifmail/ifmail -r $nexthop ($recipient)
   bsmtp     unix  -       n       n       -       -       pipe
     flags=Fq. user=bsmtp argv=/usr/lib/bsmtp/bsmtp -t$nexthop -f$sender $recipient
   scalemail-backend unix  -       n       n       -       2       pipe
     flags=R user=scalemail argv=/usr/lib/scalemail/bin/scalemail-store ${nexthop} ${user} ${extension}
   mailman   unix  -       n       n       -       -       pipe
     flags=FR user=list argv=/usr/lib/mailman/bin/postfix-to-mailman.py
     ${nexthop} ${user}
   # python-postfix-policyd-spf
   policyd-spf  unix  -       n       n       -       0       spawn
     user=nobody argv=/usr/bin/python /usr/bin/policyd-spf
   retry     unix  -       -       -       -       -       error

**Additional hints about this howto (30. July 2010)**

Postfix listens on all interfaces by default so it's not really needed
to set this:

::

    inet_interfaces = 1.2.3.4

These options are not needed:

::

    masquerade_domains =
    masquerade_exceptions = root
    masquerade_classes = envelope_sender, header_sender, header_recipient

These options are not needed if the Dovecot LDA or LMTP is used (these
options are only relevant for the Postfix LDA "virtual"):

::

    virtual_mailbox_base = /var/vmail
    virtual_minimum_uid = 100
    virtual_uid_maps = static:5000
    virtual_gid_maps = static:5000

These options are also not required - instead use only
smtpd_recipient_restrictions:

::

   smtpd_client_restrictions = ...
   smtpd_helo_restrictions = ...
   smtpd_sender_restrictions = ...

::

   smtpd_recipient_restrictions =
    reject_non_fqdn_recipient
    reject_non_fqdn_sender
    reject_unknown_recipient_domain
    reject_unknown_sender_domain
    permit_mynetworks
    reject_unauth_destination

In master.cf these options are not needed:

::

     -o smtpd_client_restrictions=permit_sasl_authenticated,reject
     -o smtpd_sender_login_maps=hash:/etc/postfix/virtual
     -o smtpd_sender_restrictions=reject_sender_login_mismatch

It's better to use smtpd_recipient_restrictions like this:

::

    -o smtpd_recipient_restrictions=reject_unknown_recipient_domain,reject_non_fqdn_recipient,\
       permit_sasl_authenticated,reject

Also you do not need to set

::

    -o smtpd_sasl_local_domain=$myhostname

When you do not want to you sender_login_maps it's not needed to set

::

    -o smtpd_sender_login_maps=hash:/etc/postfix/virtual

in master.cf. Don't use

::

    check_policy_service unix:private/policyd-spf,
    check_policy_service unix:public/postgrey

in any smtpd_*_restriction in main.cf if these policy servers are not
installed! Also don't use

::

    policyd-spf_time_limit = 3600
    smtpd_milters = unix:public/dkim-filter
    non_smtpd_milters = unix:public/dkim-filter
    milter_protocol = 6

if you don't have installed dkim-filter (dkim milter) or SPF policy
server. These options are not needed because these are default
values:

::

    queue_run_delay = 300s
    minimal_backoff_time = 300s
    master_service_disable =

Here's a more cleaner Postfix configuration (only with recommend
options):

::

   smtpd_banner = $myhostname ESMTP
   biff = no
   append_dot_mydomain = no

   myhostname = mail.domain.tld
   inet_protocols = ipv4
   mydestination = $myhostname, localhost.$mydomain
   virtual_mailbox_domains = domain.tld, domain1.tld
   virtual_alias_maps = hash:/etc/postfix/virtual
   virtual_transport = lmtp:unix:private/dovecot-lmtp

   strict_rfc821_envelopes = yes
   disable_vrfy_command = yes

   smtpd_helo_required = yes
   smtpd_recipient_restrictions =
    reject_unknown_recipient_domain,
    reject_non_fqdn_recipient,
    permit_mynetworks,
    reject_unauth_destination
    permit

   smtpd_tls_cert_file=/etc/postfix/server.pem
   smtpd_tls_key_file=/etc/ssl/private/domain_tld.key
   smtpd_tls_session_cache_database = btree:/var/lib/postfix/smtpd_scache

   alias_maps = hash:/etc/aliases
   mailbox_size_limit = 0
   message_size_limit = 20480000

master.cf

::

   #
   # Postfix master process configuration file.  For details on the format
   # of the file, see the master(5) manual page (command: "man 5 master").
   #
   # ==========================================================================
   # service type  private unpriv  chroot  wakeup  maxproc command + args
   #               (yes)   (yes)   (yes)   (never) (100)
   # ==========================================================================
   smtp      inet  n       -       -       -       -       smtpd
   submission inet n       -       -       -       -       smtpd
     -o smtpd_tls_security_level=encrypt
     -o smtpd_sasl_auth_enable=yes
     -o smtpd_sasl_type=dovecot
     -o smtpd_sasl_path=private/auth
     -o smtpd_recipient_restrictions=reject_unknown_recipient_domain,reject_non_fqdn_recipient,permit_sasl_authenticated,reject
   pickup    fifo  n       -       -       60      1       pickup
   cleanup   unix  n       -       -       -       0       cleanup
   qmgr      fifo  n       -       n       300     1       qmgr
   tlsmgr    unix  -       -       -       1000?   1       tlsmgr
   rewrite   unix  -       -       -       -       -       trivial-rewrite
   bounce    unix  -       -       -       -       0       bounce
   defer     unix  -       -       -       -       0       bounce
   trace     unix  -       -       -       -       0       bounce
   verify    unix  -       -       -       -       1       verify
   flush     unix  n       -       -       1000?   0       flush
   proxymap  unix  -       -       n       -       -       proxymap
   smtp      unix  -       -       -       -       -       smtp
   relay     unix  -       -       -       -       -       smtp
    -o fallback_relay=
   showq     unix  n       -       -       -       -       showq
   error     unix  -       -       -       -       -       error
   discard   unix  -       -       -       -       -       discard
   local     unix  -       n       n       -       -       local
   virtual   unix  -       n       n       -       -       virtual
   lmtp      unix  -       -       -       -       -       lmtp
   anvil     unix  -       -       -       -       1       anvil
   scache    unix  -       -       -       -       1       scache
   retry     unix  -       -       -       -       -       error
