.. _sample_tests:

==================
Sample Tests
==================

Functional Testing
^^^^^^^^^^^^^^^^^^
Simple imaptest to cover the basics:

.. code-block:: none
   
   timeout 10s imaptest pass=supersecret host=127.0.0.1 mbox=testmbox.sm40k user=testuser1 Fetch2=100 store=100 delete=100 expunge=100 clients=1

Check the output for errors.

Verify that messages exist in INBOX:

.. code-block:: none
   
   doveadm mailbox status -u testuser1 all INBOX

Copy a message with doveadm:

.. code-block:: none
   
   doveadm copy -u testuser1 Trash mailbox INBOX 1

Copy messages with imaptest:

.. code-block:: none

   imaptest pass=supersecret host=127.0.0.1 mbox=testmbox.sm40k user=testuser1 copybox=Trash

Move a message:

.. code-block:: none
   
   doveadm move -u testuser1 Trash mailbox INBOX 1


Performance Testing:
^^^^^^^^^^^^^^^^^^^^
Test rapid delivery of lots of messages via IMAP APPEND (100k test users)

.. code-block:: none

   imaptest - user=testuser%d pass=testpass mbox=testmbox append=100,0 logout=0 users=100000 clients=500 msgs=100000 no_pipelining secs=10


Test rapid delivery of lots of messages via LMTP (Useful for Scality CDMI, where an LMTP request takes 2 PUTs and IMAP APPEND takes 3 PUTs)

.. code-block:: none
   
   imaptest profile=imaptest.profile mbox=testmbox secs=10


imaptest.profile:
------------------

.. code-block:: none

 lmtp_port = 24
 lmtp_max_parallel_count = 500 # Set to ~50-60% of total_user_count
 total_user_count = 800
 rampup_time = 0
 
 user lmtptest {
  username_format = testuser%n
  count = 100%
 
  mail_inbox_delivery_interval = 1s
  mail_spam_delivery_interval = 0
  mail_action_delay = 0
  mail_action_repeat_delay = 0
  mail_session_length = 0
 
  mail_send_interval = 0
  mail_write_duration = 0
 
  mail_inbox_reply_percentage = 0
  mail_inbox_delete_percentage = 0
  mail_inbox_move_percentage = 0
  mail_inbox_move_filter_percentage = 0 }
 
 client lmtponly {
  count = 100% }

Load Testing:
^^^^^^^^^^^^^
1h mixed test against proxy (10.41.1.135) with 2m users and 200 clients:

  .. code-block:: none

   timeout 1h imaptest pass=testpassword host=10.41.1.135 mbox=testmbox user=testuser%d users=1-2000000 Fetch2=100 store=100 delete=90 expunge=100 clients=200

8hr mixed test with 2m users; generally this would be run against multiple proxies (host=proxy ip) from multiple imaptest nodes.

  .. code-block:: none

   timeout 8h imaptest pass=testpassword host=127.0.0.1 mbox=testmbox user=testuser%d users=1-2000000 Fetch2=100 store=100 delete=90 expunge=100 clients=100

POP3 + LMTP test with profile
-----------------------------
  .. code-block:: none
   
   imaptest pass=testpassword mbox=testmbox.sm40k profile=pop3_2m_profile.conf no_tracking clients=10000

pop3_2m_profile.conf
--------------------
  .. code-block:: none
 
   lmtp_port = 24
   lmtp_max_parallel_count = 1800
   total_user_count = 2000000
   rampup_time = 600s
 
   user pop3 {
   username_format = testuser%7n
   username_start_index = 1
   count = 100%
 
   mail_inbox_delivery_interval = 1h
   mail_spam_delivery_interval = 0
   mail_action_delay = 30s
   mail_action_repeat_delay = 1s }
 
   client pop3 {
   count = 70%
   connection_max_count = 1
   protocol = pop3
   pop3_keep_mails = no
   login_interval = 1m }
   client pop3 {
   count = 30%
   connection_max_count = 1
   protocol = pop3
   pop3_keep_mails = yes
   login_interval = 5min }

IMAP + LMTP Test with profile
-----------------------------
  .. code-block:: none

   imaptest pass=testpassword mbox=testmbox profile=imap_4m_profile.conf clients=10000

imap_4m_profile.conf
--------------------
  .. code-block:: none

   lmtp_port = 24
   lmtp_max_parallel_count = 15000
   total_user_count = 4000000
   rampup_time = 60s
 
   ser imap_poweruser {
   username_format = testuser%7n
   username_start_index = 2000000
   count = 50%
 
   mail_inbox_delivery_interval = 10m
   mail_spam_delivery_interval = 0s
   mail_action_delay = 1s
   mail_action_repeat_delay = 0
   mail_session_length = 5s
 
   mail_send_interval = 2h
   mail_write_duration = 2m
 
   mail_inbox_reply_percentage = 50
   mail_inbox_delete_percentage = 50
   mail_inbox_move_percentage = 35
   mail_inbox_move_filter_percentage = 10 }
 
   user imap_normal {
   username_format = testuser%7n
   username_start_index = 1
   count = 50%
 
   mail_inbox_delivery_interval = 1h
   mail_spam_delivery_interval = 0
   mail_action_delay = 3 min
   mail_action_repeat_delay = 10s
   mail_session_length = 30s
 
   mail_send_interval = 3h
   mail_write_duration = 2 min
 
   mail_inbox_reply_percentage = 5
   mail_inbox_delete_percentage = 80
   mail_inbox_move_percentage = 5
   mail_inbox_move_filter_percentage = 10 }
 
   client Thunderbird {
   count = 60%
   connection_max_count = 1
   imap_idle = yes
   imap_fetch_immediate = UID RFC822.SIZE FLAGS BODY.PEEK[HEADER.FIELDS (From To Cc Bcc Subject Date Message-ID Priority X-Priority References Newsgroups In-Reply-To Content-Type)]
   imap_fetch_manual = RFC822.SIZE BODY[]
   imap_status_interval = 5 min }
 
   client AppleMail {
   count = 40%
   connection_max_count = 1
   imap_idle = yes
   imap_fetch_immediate = INTERNALDATE UID RFC822.SIZE FLAGS BODY.PEEK[HEADER.FIELDS (date subject from to cc message-id in-reply-to references x-priority x-uniform-type-identifier x-universally-unique-identifier)] MODSEQ
   imap_fetch_manual = BODYSTRUCTURE BODY.PEEK[]
   imap_status_interval = 5 min }

To generate read load (BODY FETCHs):
------------------------------------
 .. code-block:: none

   imaptest - user=terra.29.%d select=100 fetch2=100,0 logout=0 clients=10 msgs=100000 no_pipelining users=400 no_tracking

To avoid out-of-socket issues when connecting to local HAproxy instance, spread load between multiple local IP addresses to hit HAproxy, e.g.:

 .. code-block:: none

   obox_fs = scality:http://127.0.%4Hu.1:8080/?timeout_msecs=30000&addhdr=X-Dovecot-Hash:%2Mu/%2.3Mu&bulk_delete=1
