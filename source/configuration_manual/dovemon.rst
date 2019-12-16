.. _dovemon:

=======
Dovemon
=======

Dovemon is a backend monitoring tool for director hosts. It monitors backend responses and disables/enables backends if they stop responding. (Requires Dovecot v2.2.19 or later. For older versions use poolmon.) 

Configuration file: /etc/dovecot/dovemon.config.yml: 

.. code-block:: none

   loglevel: 4
   syslog_facility: 'local5'
   director_admin_socket: /var/run/dovecot/director-admin
   lockfile: /var/lock/subsys/dovemon
   auth: plain
   poll_imap: yes
   poll_pop3: no
   poll_lmtp: no
   imap_ssl: no
   pop3_ssl: no
   lmtp_ssl: no
   interval: 10
   timeout: 3
   retry_count: 3

logelevel: 0-4

* syslog_facility: local5

   * Syslog facility to use when logging

* director_admin_socket: ``/var/run/dovecot/director-admin``

   * director-admin unix socket used for director admin communication. director-admin unix listener service needs to be configured in dovecot.conf

* lockfile: /var/lock/subsys/dovemon

   * Location of local dovemon lock file.

* auth: plain

   * Type of authentication to use to connect to backend. Either ``plain`` or ``sasl`` (needed for master authentication)

* poll_imap: yes/no

   * use imap connection to poll backend

* poll_pop3: yes/no

   * use pop3 connection to poll backend

* poll_lmtp: yes/no

   * use lmtp connection to poll backend

* poll_unknown_backends: yes/no

   * 2.2.32 stop polling backends that do not exist in ``dovemon.testusers.yml``

* imap_ssl: yes/no

   * use ssl connection for imap poll

* pop3_ssl: yes/no

   * use ssl connection for pop3 poll

* lmtp_ssl: yes/no

   * use ssl connection for lmtp poll

* interval: 0-n

   * poll interval in seconds

* timeout: 0-n

   * timeout in seconds for each poll

* retry_count: 0-n

   * number of failed polls before issuing ``HOST-DOWN`` for the backend

* rapid_rounds: 10

* rapid_fails_needed: 8

Test accounts file: ``/etc/dovecot/dovemon.testaccounts.yml``

.. code-block:: none
   
   10.2.2.75:
   username: user0001
   password: tosivaikeasalasana
   10.2.2.76:
   username: user0002
   password: tosivaikeasalasana

For master user authentication, the ``auth`` setting in ``dovemon.yml`` should be set to ``sasl``. Test accounts file:

.. code-block:: none
   
   10.2.2.75:
   username: user0001
   masteruser: masteruser
   password: masterpassword

This file allows configuring a separate test account for each backend. The backend must be specified using the same IP address as what ``doveadm director status`` shows for it. 
if connection to backends fail 3 times in a row per protocol (``retry_count`` in config) dovemon goes to rapid poll mode for the backend. In this rapid mode dovecot does quick round of 10 polls with the same protocol (``rapid_rounds`` in config) and if 8 of them still fail, then issue ``HOST-DOWN`` in the backend and ``FLUSH`` users form the backend to be redistributed to the remainining backends. 
Also dovemon issues ``HOST-UP`` on backend upon first successful poll if backend is already marked down.

For more information on dovemon workflow see dovemon documentation page

