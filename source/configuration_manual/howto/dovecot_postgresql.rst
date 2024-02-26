=======================
HowTo/DovecotPostgresql
=======================

.. warning::

    This document has been taken out of the old wiki and
    has not yet been updated.

Introduction
============

Gluing together virtual user/domain support for:

-  Debian (These instructions are for Sid)

-  Postfix 2 with SMTP AUTH

-  SASL2 with libpam-pgsql for Postfix

-  PostgreSQL

-  Dovecot (dovecot-pop3d and or dovecot-imapd)

Note(s)
=======

On Debian, the package dovecot-pgsql do not yet include postgresql as a
dependency to pull it if not installed.

Software Installation
=====================

For Debian:

::

   apt-get install postfix-pgsql sasl2-bin libsasl2-modules postgresql libpam-pgsql dovecot-pgsql dovecot-imapd dovecot-pop3d

Configuring PostgreSQL
======================

Edit /etc/postgresql/pg_hba.conf to accept password authentication for
localhost:

::

   host    all         all         127.0.0.1         255.255.255.255   password

Then create the database:

::

   sudo su postgres
   createdb mails
   psql mails

Create tables:

::

   CREATE TABLE transport (
     domain VARCHAR(128) NOT NULL,
     transport VARCHAR(128) NOT NULL,
     PRIMARY KEY (domain)
   );
   CREATE TABLE users (
     userid VARCHAR(128) NOT NULL,
     password VARCHAR(128),
     realname VARCHAR(128),
     uid INTEGER NOT NULL,
     gid INTEGER NOT NULL,
     home VARCHAR(128),
     mail VARCHAR(255),
     PRIMARY KEY (userid)
   );
   CREATE TABLE virtual (
     address VARCHAR(255) NOT NULL,
     userid VARCHAR(255) NOT NULL,
     PRIMARY KEY (address)
   );
   create view postfix_mailboxes as
     select userid, home||'/' as mailbox from users
     union all
     select domain as userid, 'dummy' as mailbox from transport;
   create view postfix_virtual as
     select userid, userid as address from users
     union all
     select userid, address from virtual;

Create separate users for read and write accesses. Postfix and Dovecot
needs only read access. You may want to use the writer user for your own
purposes.

::

   CREATE USER mailreader PASSWORD 'secret';
   grant select on transport, users, virtual, postfix_mailboxes, postfix_virtual to mailreader;
   create user mailwriter password 'secret';
   grant select, insert, update, delete on transport, users, virtual, postfix_mailboxes, postfix_virtual to mailwriter;

Here's a few example values:

::

   insert into transport (domain, transport) values ('domain.org', 'virtual:');
   insert into transport (domain, transport) values ('foo.org', 'virtual:');
   insert into users (userid, uid, gid, home) values ('user@domain.org', 1001, 1001, 'domain.org/mails/user');
   insert into users (userid, uid, gid, home) values ('user2@domain.org', 1001, 1001, 'domain.org/mails/user2');
   insert into users (userid, uid, gid, home) values ('user@foo.org', 1002, 1002, 'foo.org/mails/user');
   insert into virtual (address, userid) values ('foo@foo.org', 'user@foo.org');

Above examples assume that you'd use separate system UID and GID for
each domain. I think that's good enough compromise between simplicity
and security. The UIDs and GIDs aren't required to be in /etc/passwd and
/etc/group, "ls -l" will just show them in numeric form in that case.

In this case, the virtual domain "domain.org" and "foo.org" will define
virtual: as the transport. Please note in this case, virtual service
from postfix will deliver the mail and ignore all virtual_transport
config settings.

If you prefer dovecot as the transport, make sure 'dovecot' or something
like ``lmtp:unix:private/dovecot-lmtp`` is returned from the transport_maps
query.

In order to make virtual_transport setting effective, leave
transport_maps as default.

Configuring Postfix
===================

PostgreSQL configuration in main.cf:

::

   transport_maps = pgsql:/etc/postfix/transport.cf
   virtual_uid_maps = pgsql:/etc/postfix/uids.cf
   virtual_gid_maps = pgsql:/etc/postfix/gids.cf
   virtual_mailbox_base = /home
   virtual_mailbox_maps = pgsql:/etc/postfix/mailboxes.cf
   virtual_maps = pgsql:/etc/postfix/virtual.cf
   mydestination = $mydomain, $myhostname

Note that we've set virtual_mailbox_base to /home, which means that it's
prefixed to all home directories in SQL database.

SASL2 authentication configuration in main.cf:

::

   smtpd_recipient_restrictions = permit_sasl_authenticated, permit_mynetworks, reject_unauth_destination
   smtpd_sasl_auth_enable = yes
   smtpd_sasl_security_options = noanonymous
   smtpd_sasl_local_domain = domain.org
   smtp_sasl_auth_enable = no

And /etc/postfix/sasl/smtpd.conf:

::

   pwcheck_method: saslauthd
   saslauthd_path: /etc/mux

/etc/postfix/transport.cf:

::

   user=mailreader
   password=secret
   dbname=mails
   table=transport
   select_field=transport
   where_field=domain
   hosts=localhost

/etc/postfix/uids.cf:

::

   user=mailreader
   password=secret
   dbname=mails
   table=users
   select_field=uid
   where_field=userid
   hosts=localhost

/etc/postfix/gids.cf:

::

   user=mailreader
   password=secret
   dbname=mails
   table=users
   select_field=gid
   where_field=userid
   hosts=localhost

/etc/postfix/mailboxes.cf:

::

   user=mailreader
   password=secret
   dbname=mails
   table=postfix_mailboxes
   select_field=mailbox
   where_field=userid
   hosts=localhost

/etc/postfix/virtual.cf:

::

   user=mailreader
   password=secret
   dbname=mails
   table=postfix_virtual
   select_field=userid
   where_field=address
   hosts=localhost

Configuring SASL2
=================

We want to use PAM authentication via saslauthd. SMTP process runs
chrooted into /var/spool/postfix and we have to be able to communicate
to saslauthd via UNIX socket, so create the socket inside the chroot.

In Debian you can configure it in /etc/default/saslauthd:

::

   START=yes
   MECHANISMS=pam
   PARAMS="-m /var/spool/postfix/etc"

As of version 2.1.19 of SASL you also need to add the -r parameter in
order to authenticate with an email address (containing a @) as user id:

::

   PARAMS="-r -m /var/spool/postfix/etc"

(This parameter will probably break saslauthd if used with previous
versions.)

Configure libpam-pgsql in /etc/pam_pgsql.conf:

::

   database = mails
   host = localhost
   user = mailreader
   password = secret
   table = users
   user_column = userid
   pwd_column = password
   #expired_column = acc_expired
   #newtok_column = acc_new_pwreq
   pw_type = crypt
   #debug

And create /etc/pam.d/smtp:

::

   auth        required    pam_pgsql.so
   account     required    pam_pgsql.so
   password    required    pam_pgsql.so

libsasl2-modules install a lot of plugins which you most likely don't
need and which don't even work with PAM. You mostly just need PLAIN and
possibly LOGIN authentication. I'm not sure if there's any pretty way to
select only them, but one evil way is to just delete others:

::

   cd /usr/lib/sasl2
   rm -f libcrammd5.* libdigestmd5.* libsasldb.* libotp.* libntlm.* libanonymous.*

The better way is to put in /etc/postfix/sasl/smtpd.conf the following
line:

::

   mech_list: login plain

Where mech_list is a list of all the mechanism names to enable.

Configuring Dovecot
===================

In dovecot.conf, set:

::

   mail_driver = maildir
   mail_path = ~/

   passdb sql {
      args = /usr/local/etc/dovecot-sql.conf 
   }

   userdb sql {
      args = /usr/local/etc/dovecot-sql.conf
   }
 
And create /usr/local/etc/dovecot-sql.conf:

::

   driver = pgsql
   connect = host=localhost dbname=mails user=mailreader password=secret
   default_pass_scheme = CRYPT
   password_query = SELECT userid as user, password FROM users WHERE userid = '%u'
   user_query = SELECT '/home/'||home AS home, uid, gid FROM users WHERE userid = '%u'

Restart
=======

Finally remember to restart everything before trying to figure out why
nothing is working:

::

   /etc/init.d/saslauthd restart
   /etc/init.d/postgresql restart
   /etc/init.d/postfix restart
   /etc/init.d/dovecot restart
