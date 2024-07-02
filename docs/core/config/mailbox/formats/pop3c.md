---
layout: doc
title: pop3c
dovecotlinks:
  pop3c: pop3c
---

# Pop3c Mailbox Format

The pop3c storage accesses a remote POP3 server as if it were a regular
(local) Dovecot mailbox format.

The remote POP3 mailbox is visible as the INBOX folder on the Dovecot side.

## Settings

<SettingsComponent tag="pop3c" />

## Configuration Example

Connect using STARTTLS to pop3.example.com:
```[dovecot.conf]
# In-memory index files:
mail_location = pop3c:

# OR, Store index files locally:
#mail_location = pop3c:~/pop3c

pop3c_host = pop3.example.com
pop3c_password = secret
pop3c_port = 110
pop3c_ssl = starttls
pop3c_user = user@example.com
```
