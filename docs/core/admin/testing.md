---
layout: doc
title: Testing
dovecotlinks:
  testing: testing Dovecot installation
---

# Testing

## Check Local Installation

### Check Dovecot is Running

First check with `ps` that the `dovecot` process is actually running. If
it's not, you had an error in `dovecot.conf` and the error message was
written to log. Go back to [[link,running_dovecot]] and [[link,logging]]
if you can't find it.

### Check Dovecot is Listening

Next check that Dovecot is listening for connections:

```sh
nc localhost 143
```
```
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
* OK [CAPABILITY IMAP4rev1 LITERAL+ SASL-IR LOGIN-REFERRALS ID ENABLE STARTTLS AUTH=PLAIN] Dovecot ready.
```

If you got "connection refused", make sure that Dovecot is configured to
serve the imap protocol and listening on the expected
interfaces/addresses. The simplest way to do that would be using
[[man,doveconf]]:

```sh
doveconf protocols listen
```
```
protocols = imap pop3 lmtp sieve
listen = *, ::
```

If the protocols setting doesn't contain `imap` then add it. Also make
sure, that relevant `!include` or `!include_try` configuration lines
are not commented.

If the connection fails and dovecot emits a log "*auth: Fatal: Support not
compiled in for passdb driver 'pam'*", then rebuild dovecot with the pam
development headers package installed. In that case you have to re-run
the configure script, possibly including option **--with-pam** to the
configure
command line.

Next check that it also works from remote host:

```sh
nc imap.example.com 143
```
```
Trying 1.2.3.4...
Connected to imap.example.com.
Escape character is '^]'.
* OK [CAPABILITY IMAP4rev1 LITERAL+ SASL-IR LOGIN-REFERRALS ID ENABLE STARTTLS AUTH=PLAIN] Dovecot ready.
```

If that didn't work, check all possible firewalls in between, and check
that `listen` setting is `*` in `dovecot.conf`.

If you have only imaps enabled, see
[remote login](#check-dovecot-is-allowing-remote-logins) for how
to test using `openssl s_client`.

### Check Dovecot is Allowing Logins

```sh
nc localhost 143
```
```
a login "username" "password"
```

Replace the username and password with your local authentication credentials.

Note that all IMAP commands begin with a tag, which is basically any
string you want, but it must be there. So don't leave out the "a" in the
above example.

If the password contains `"` character, escape it with `\\` (e.g.
`"foo\"bar"`).

You should get an "a OK Logged in." reply. If you get "Authentication
failed" error, set [[setting,auth_verbose,yes]] and
[[setting,log_debug,category=auth]] in `dovecot.conf`, restart Dovecot and
try again. The log file should now show enough information to help you fix
the problem.

### Check Dovecot is Allowing Remote Logins

You'll need to try this from another computer, since all local IPs are
treated as secure:

```sh
nc imap.example.com 143
```
```
a login "username" "password"
```

If the connection is hanging instead of giving "\* Dovecot ready", you
have a firewall that's preventing the connections.

Otherwise, the only difference here compared to step above is that you
might get:

```
* BAD [ALERT] Plaintext authentication is disabled, but your client sent password in plaintext anyway. If anyone was listening, the password was exposed.
a NO Plaintext authentication disabled.
```

If this is the case, you didn't set [[setting,auth_allow_cleartext,yes]].
You could alternatively use OpenSSL to test that the server works with SSL:

- Test using imaps port (assuming you haven't disabled imaps port):

  ```sh
  openssl s_client -connect imap.example.com:993
  ```
  ```
  * OK Dovecot ready.
  ```

- Test using imap port and STARTTLS command (works also with imap port):

  ```sh
  openssl s_client -connect imap.example.com:143 -starttls imap
  ```
  ```
  * OK Dovecot ready.
  ```

Check Dovecot Finds INBOX

After logging in, check that the INBOX is found:

```
b select inbox
* FLAGS (\Answered \Flagged \Deleted \Seen \Draft)
* OK [PERMANENTFLAGS (\Answered \Flagged \Deleted \Seen \Draft \*)] Flags permitted.
* 1 EXISTS
* 1 RECENT
* OK [UIDVALIDITY 1106186941] UIDs valid
* OK [UIDNEXT 2] Predicted next UID
b OK [READ-WRITE] Select completed.
```

If anything goes wrong, set [[setting,log_debug,category=mail]] and try
again. The log file should now contain debugging information of where
Dovecot is trying to find the mails. Fix the [[link,mail_location]] and try
again.

### Check Dovecot Finds Other Mailboxes

If you already have other mailboxes created, you can check that Dovecot
finds them:

```
c list "" *
* LIST (\NoInferiors) "/" "test"
* LIST (\NoInferiors) "/" "INBOX"
c OK List completed.
```

If they weren't found, set [[setting,log_debug,category=mail]] and look at the
debugging information. Fix the [[link,mail_location]] and try again.

### Check Other IMAP Commands

If you already have some emails, you can try reading them:

```
1 SELECT INBOX
2 FETCH 1:* (FLAGS INTERNALDATE BODY.PEEK[HEADER.FIELDS (SUBJECT)])
3 FETCH 1 BODY[TEXT]
```

`1:*` means all messages

You can also try moving a mail to Trash:

```
4 CREATE Trash
5 COPY 1 Trash
6 STORE 1 +FLAGS \Deleted
7 EXPUNGE
```

### Check Mail Clients Work

Since mail clients can be configured in various ways, please check first
if the problem is with Dovecot configuration or with the client's
configuration. You can rule out it being Dovecot's problem with the
"telnet" methods described above.

If you can't log in,

- Make sure SSL/TLS settings are correct.

- Make sure the client uses plaintext authentication method, unless
  you've specifically configured Dovecot to accept others.

If you can see only INBOX,

- Clear out any "IMAP namespace prefix" or similar settings from clients.

- Check if client is configured to show only "subscribed mailboxes". If
  so, you'll have to subscribe to the mailboxes you wish to see. You
  can see a list of subscribed mailboxes with:

  ```
  d lsub "" *
  * LSUB () "/" "INBOX"
  d OK Lsub completed.
  ```

Most IMAP clients have been tested with Dovecot and they work.

### Gracefully Exit Session

To close the connection to Dovecot issue a logout:

```
e logout
* BYE Logging out
e OK Logout completed.
```

## Functional & Performance Testing

Easiest way to test Dovecot is to use
[ImapTest](https://dovecot.github.io/imaptest/).

It can be used to flood a server with random commands and it can also
attempt to mimic a large number of real-world clients.

### Test Preparation

System configuration

* Make sure your firewall is configured to allow incoming connections for
  the following tcp ports: 24, 110, 143, 993, 995, 4190.

* Ensure ulimit is high enough to accept all the connections and open files.

### Dovecot Configuration

Enable LMTP delivery times in the configuration:

```[dovecot.conf]
deliver_log_format = msgid=%m from=<%f> size=%p vsize=%w session=%{session_time}ms delivery=%{delivery_time}ms: %$
```

You can then see log entries like:

```
Oct 06 12:40:13 lmtp(testuser_717@example.com)<iQBSCwulE1ZXMwAA0J78UA>: Info: iQBSCwulE1ZXMwAA0J78UA: msgid=unspecified from=<sender@example.com> size=155980 vsize=157963 session=161ms delivery=134ms: saved mail to INBOX
```
Increase the maximum user connections per IP
[[setting,mail_max_userip_connections,1000]].

### Troubleshooting

You might run into problems where you have too few services running and you
need to increase the number of services and/or modify client limit for the
following:

* auth
* imap
* pop3
* lmtp

### Sample Tests

#### Functional Testing

Simple imaptest to cover the basics:

```sh
timeout 10s imaptest pass=supersecret host=127.0.0.1 mbox=testmbox.sm40k \
  user=testuser1 Fetch2=100 store=100 delete=100 expunge=100 clients=1
```

Check the output for errors.

Verify that messages exist in INBOX:
[[doveadm,mailbox status,-u testuser1 all INBOX]].

Copy a message with doveadm:
[[doveadm,copy,-u testuser1 Trash mailbox INBOX 1]].

Copy messages with imaptest:

```sh
imaptest pass=supersecret host=127.0.0.1 mbox=testmbox.sm40k user=testuser1 \
  copybox=Trash
```

Move a message: [[doveadm,move,-u testuser1 Trash mailbox INBOX 1]].

#### Performance Testing:

Test rapid delivery of lots of messages via IMAP APPEND (100k test users)

```sh
imaptest - user=testuser%d pass=testpass mbox=testmbox append=100,0 logout=0 \
  users=100000 clients=500 msgs=100000 no_pipelining secs=10
```

Test rapid delivery of lots of messages via LMTP:

::: code-group
```sh[Command]
imaptest profile=imaptest.profile mbox=testmbox secs=10
```

```[imaptest.profile]
lmtp_port = 24
lmtp_max_parallel_count = 500 # Set to ~50-60% of total_user_count
total_user_count = 800
rampup_time = 0s

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
  mail_inbox_move_filter_percentage = 0
}

client lmtponly {
  count = 100%
}
```
:::

#### Load Testing:

1h mixed test against proxy (10.41.1.135) with 2m users and 200 clients:

```sh
timeout 1h imaptest pass=testpassword host=10.41.1.135 mbox=testmbox \
  user=testuser%d users=1-2000000 Fetch2=100 store=100 delete=90 expunge=100 \
  clients=200
```

8hr mixed test with 2m users; generally this would be run against multiple
proxies (host=proxy ip) from multiple imaptest nodes.

```sh
timeout 8h imaptest pass=testpassword host=127.0.0.1 mbox=testmbox \
  user=testuser%d users=1-2000000 Fetch2=100 store=100 delete=90 expunge=100 \
  clients=100
```

##### POP3 + LMTP Testing

::: code-group
```sh[Command]
imaptest pass=testpassword mbox=testmbox.sm40k profile=pop3_2m_profile.conf \
  no_tracking clients=10000
```

```[pop3_2m_profile.conf]
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
  mail_action_repeat_delay = 1s
}

client pop3 {
  count = 70%
  connection_max_count = 1
  protocol = pop3
  pop3_keep_mails = no
  login_interval = 1m
}

client pop3 {
  count = 30%
  connection_max_count = 1
  protocol = pop3
  pop3_keep_mails = yes
  login_interval = 5min
}
```
:::

##### IMAP + LMTP Testing

::: code-group
```sh[Command]
imaptest pass=testpassword mbox=testmbox profile=imap_4m_profile.conf \
  clients=10000
```

```[imap_4m_profile.conf]
lmtp_port = 24
lmtp_max_parallel_count = 15000
total_user_count = 4000000
rampup_time = 60s

user imap_poweruser {
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
  mail_inbox_move_filter_percentage = 10
}

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
  mail_inbox_move_filter_percentage = 10
}

client Thunderbird {
  count = 60%
  connection_max_count = 1
  imap_idle = yes
  imap_fetch_immediate = UID RFC822.SIZE FLAGS BODY.PEEK[HEADER.FIELDS (From To Cc Bcc Subject Date Message-ID Priority X-Priority References Newsgroups In-Reply-To Content-Type)]
  imap_fetch_manual = RFC822.SIZE BODY[]
}

client AppleMail {
  count = 40%
  connection_max_count = 1
  imap_idle = yes
  imap_fetch_immediate = INTERNALDATE UID RFC822.SIZE FLAGS BODY.PEEK[HEADER.FIELDS (date subject from to cc message-id in-reply-to references x-priority x-uniform-type-identifier x-universally-unique-identifier)] MODSEQ
  imap_fetch_manual = BODYSTRUCTURE BODY.PEEK[]
}
```
:::

##### Generate Read Load (BODY FETCHs):

```sh
imaptest - user=terra.29.%d select=100 fetch2=100,0 logout=0 clients=10 \
  msgs=100000 no_pipelining users=400 no_tracking
```
