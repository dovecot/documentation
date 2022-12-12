.. _running_imaptest:

=======================
Running IMAPtest
=======================

``imaptest`` is publicly available opensource IMAP/POP3/LMTP testing tool that has been developed by Dovecot. 

More information can be found from here `IMAP Server Tester <https://www.imapwiki.org/ImapTest>`_

Sample LMTP / POP3 configuration

.. code-block:: none

   lmtp_port = 24
   lmtp_max_parallel_count = 175
   total_user_count = 500
   rampup_time = 5
  
   user aggressive {
  username_format = testuser_%03n@example.com
  username_start_index = 501
  count = 100%
  
  mail_inbox_delivery_interval = 1s
  mail_spam_delivery_interval = 0
  mail_action_delay = 2s
  mail_action_repeat_delay = 1s }
  
 client pop3 {
  count = 95%
  connection_max_count = 1
  protocol = pop3
  pop3_keep_mails = no
  login_interval = 7s }
  
 client pop3 {
  count = 5%
  connection_max_count = 1
  protocol = pop3
  pop3_keep_mails = yes
  login_interval = 1min }

Key parameters:
^^^^^^^^^^^^^^^
``lmtp_max_parallel_count`` = how many lmtp processes are allowed to run (should be about half of wanted lmtp deliveries per second)
``total_user_count`` = how many users we are using

* Related parameters from the user { ... }
  * ``username_format =``testuser_%03n@example.com
  * We will have ``total_user_count`` users padded to 3 numbers so if it’s 500 then we will have users: ``testuser_001@example.com`` to ``testuser_500@example.com``
* ``username_start_index`` = the number of the first user
  * In example config we would be using ``testuser_501@example.com`` to ``testuser_1000@example.com``

``rampup_time =`` how many seconds to start generating the full load. This should be 5 to 10 seconds to distribute the load during the actual testing since it also affects the timing between connections for the users.

user aggressive { ... } the name of the user profile, aggressive is just an example and if we have multiple users we want to have in the same profile it makes sense to have some descriptive name.

``count =`` this is the percentage of users that should have this profile. If we only have one profile this should be set to 100 and if we have more they should add up to 100.

``mail_inbox_delivery_interval`` = this is how often an user gets email delivered into the ``INBOX``. In example configuration we have 500 users and just a single profile with this set to 1s so there should be approximately 500 deliveries happening per second.

``mail_spam_delivery_interval`` = How often ``username+Spam`` should get email.

``client pop3 { ... }`` we can specify multiple clients that are accessing the system.

``count =`` the percentage of users that should behave according to client configuration. Should add up to 100 in total.

``connection_max_count`` = how many connections should a single user have in parallel, for POP3 this should be 1

``protocol`` = for pop3 this needs to be specified

``pop3_keep_mails`` = yes/no, whether to keep mails in ``INBOX`` at the end of the session or delete everything

``login_interval`` = how often should the user log in. For example if this is set to 1s and you have ``count = 100%`` and ``total_user_count = 500`` you should have approximately 500 logins per second.


Sample advanced IMAP/LMTP Configuration

.. code-block:: none

   lmtp_port = 24
   lmtp_max_parallel_count = 175
   total_user_count = 500
  rampup_time = 5s
  
 user aggressive {
  username_format = testuser_%03n@example.com
  username_start_index = 501
  count = 10%
  
  mail_inbox_delivery_interval = 5s
  mail_spam_delivery_interval = 0
  mail_action_delay = 2s
  mail_action_repeat_delay = 1s
  mail_session_length = 3 min
  
  mail_send_interval = 0
  mail_write_duration = 0
  
  mail_inbox_reply_percentage = 50
  mail_inbox_delete_percentage = 5
  mail_inbox_move_percentage = 5
  mail_inbox_move_filter_percentage = 10 }
  
 user normal {
  username_format = testuser_%03n@example.com
  username_start_index = 501
  count = 90%
  
  mail_inbox_delivery_interval = 120s
  mail_spam_delivery_interval = 0
  mail_action_delay = 3 min
  mail_action_repeat_delay = 10s
  mail_session_length = 20 min
  
  mail_send_interval = 0
  mail_write_duration = 0
  
  mail_inbox_reply_percentage = 0
  mail_inbox_delete_percentage = 80
  mail_inbox_move_percentage = 5
  mail_inbox_move_filter_percentage = 10 }
  
 client Thunderbird {
  count = 80%
  connection_max_count = 2
  imap_idle = yes
  imap_fetch_immediate = UID RFC822.SIZE FLAGS BODY.PEEK[HEADER.FIELDS (From To Cc Bcc Subject Date Message-ID Priority X-Priority References Newsgroups In-Reply-To Content-Type)]
  imap_fetch_manual = RFC822.SIZE BODY[]
  imap_status_interval = 5 min }
  
 client AppleMail {
  count = 20%
  connection_max_count = 2
  imap_idle = yes
  imap_fetch_immediate = INTERNALDATE UID RFC822.SIZE FLAGS BODY.PEEK[HEADER.FIELDS (date subject from to cc message-id in-reply-to references x-priority x-uniform-type-identifier x-universally-unique-identifier)] MODSEQ
  imap_fetch_manual = BODYSTRUCTURE BODY.PEEK[]
  imap_status_interval = 5 min }

Most of the settings should be quite self explanatory or explained in the POP3/LMTP configuration.

Running imaptest
^^^^^^^^^^^^^^^^^
First you need to make sure that you have high enough open file limit for the user running imaptest by doing something like: ulimit –n 65535 (this might also require editing nofile in /etc/security/limits.conf accordingly).

For very intense load testing it’s also possible to run out of TCP sockets so setting:sysctl –w net.ipv4.tcp_tw_reuse=1 helps.

imaptest pass=testpass host=127.0.0.1 mbox=testmbox profile=profile.conf clients=100 [no_pipelining]

* pass = all the users should have the same password

* host = host to connect to

* mbox = crlf terminated mbox format file to use for source emails (see generating mbox later in the document).

* profile = name of the appropriate profile.conf

* clients = how many concurrent clients

optional:
^^^^^^^^^
* no_pipelining = for IMAP testing this can be specified to only send a single IMAP command at a time and waiting for a response before sending the next one. This should be used to get accurate IMAP latencies.

* secs = number of seconds to run the test, if this is not specified you need to end the process manually either with ctlr+c (if there are stuck connections and you want to force it to end, use ctrl+c twice) or killing it.

Example output: 

Using the first POP3/LMTP configuration the output should be something like this:

.. code-block:: none

 $ ./imaptest-370400225981/src/imaptest pass=testpass host=127.0.0.1 mbox=testmbox profile=pop3-profile.conf clients=100 secs=20

 Logi List Stat Sele Fetc Fet2 Stor Dele Expu Appe Logo LMTP

  99    0    0   99    0  191    0    0  191    0   99   99   0/  0 [99%]

 Warning: LMTP: Reached 175 connections, throttling

 107    0    0  107    0  261    0    0  254    0  107  276   0/  0
 103    0    0  103    0  243    0    0  243    0  103  336   0/  0
 103    0    0  103    0   78    0    0   78    0  103  348   0/  0
 108    0    0  108    0    0    0    0    0    0  108  266   3/  3
 1      0    0   1     0    0    0    0    0    0    1  261   0/  0
 0      0    0   0     0    0    0    0    0    0    0  347   0/  0
 99     0    0   99    0  911    0    0  911    0   91  191   8/  8
 96     0    0   92    0  357    0    0  347    0   10  274  94/ 94
 135    0    0  138    0  616    0    0  613    0  132  387  97/ 97
 30     0    0   23    0   38    0    0    6    0   0  159 ms/cmd avg

 Logi List Stat Sele Fetc Fet2 Stor Dele Expu Appe Logo LMTP

  68    0    0   69    0  319    0    0  332    0  165  269   0/100
  100   0    0  100    0    1    0    0    1    0  100  350   0/  0
  1     0    0    1    0    0    0    0    0    0    1  350   0/  0
  91    0    0   86    0  662    0    0  662    0   68  185  91/ 91
  8     0    0   13    0  217    0    0  217    0   31  375   0/  0
  100   0    0   57    0    0    0    0    0    0    2  260 100/100
  16    0    0   59    0  578    0    0  578    0  114  265   0/100
  183   0    0  183    0  637    0    0  637    0  183  350   0/  0
  101   0    0  101    0   54    0    0   54    0  101  350   0/  0
  24    0    0   25    0   16    0    0    1    0    0  125 ms/cmd avg 

 Totals:

 Logi List Stat Sele Fetc Fet2 Stor Dele Expu Appe Logo LMTP
 1519    0    0 1519    0 5125    0    0 5118    0 1519 5714

The warning can be ignored because we are intentionally throttling number of LMTP connections.

You will have a line of output every second that is showing the number of commands sent per command. Login, List, Status, Select, Fetch, Fetch2, Store, Delete, Expunge, Append, Logout and LMTP delivery (lines 3, 5-13)

Every 10 seconds you get the line that shows average duration per connection (line 14). This is the most important one to watch, if the ms/cmd starts increasing then this indicates an issue with the platform. If everything is operating normally it should remain approximately the same for all commands.

At the end (lines 27-29) it will output you the total number of operations performed.


Generating sample mbox
^^^^^^^^^^^^^^^^^^^^^^^

You can use the following script to create a test mbox with specific mail size distribution.

You might want to adjust your ``size_distribution`` dictionary according to your needs. The following will create an mbox with 5 mails of 10kB, 80kB, 150kB and 250kB each in a randomized order. Imaptest will go through the mbox sequentially so the randomness has to be in the mbox file.

.. code-block:: none

   #!/usr/bin/env python
 
  import mailbox, random, string, os
  from email.mime.text import MIMEText
  from email.utils import formatdate
 
  mbox_out = 'testmbox'
  mbox_tmp = '/tmp/testmbox'
 
   mbox = mailbox.mbox(mbox_tmp)
 
   mailfrom = 'sender@example.com'
   mailto = 'recipient@example.com'
   subject = 'Testmsg of %s kB'
 
  size_distribution = {}
  size_distribution[10] = 5
  size_distribution[80] = 5
  size_distribution[150] = 5
  size_distribution[250] = 5
  #size_distribution[15000] = 0
 
 def splitrow(string, linelen):
    step = linelen
    out = []
    for i in range(0, len(string), linelen):
    out.append(string[i:step])
    step += linelen
    return '\n'.join(out)
 
 date = formatdate()
 mails = []
 for key, val in size_distribution.items():

  for mail in range(0, val):
   mails.append(key)
 
 random.shuffle(mails)
 
 for val in mails:
    body = ''.join(random.choice(string.ascii_lowercase + string.ascii_uppercase + string.digits + " .-") for _ in range(0, val*1024))
    body = splitrow(body, 76)
    msg = MIMEText(body + '\n')
    msg.set_unixfrom('From %s %s' % (mailfrom, date))
    msg['Date'] = date
    msg['Subject'] = subject % val
    msg['To'] = mailto
    msg['From'] = mailfrom
    msg['Message-ID'] = '<' + ''.join(random.choice(string.ascii_lowercase + string.ascii_uppercase + string.digits) for _ in range(0, 24)) + '>'
    print 'Creating message of size {0} KB'.format(val)
    mbox.add(msg)
 
 with open(mbox_tmp, 'r') as tmpmbox:
    with open(mbox_out, 'w') as mbox:
     for line in tmpmbox.readlines():
      mbox.write(line.replace('\n', '\r\n'))
      tmpmbox.close();
      os.unlink(mbox_tmp);

 print 'Wrote mailbox to "{0}"'.format(mbox_out)