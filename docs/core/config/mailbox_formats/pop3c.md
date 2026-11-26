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

The login to the remote server is configured with the [[link,client_auth]]
settings inside the [[setting,pop3c]] filter.

## Configuration Example

Connect using STARTTLS to pop3.example.com:
```doveconf[dovecot.conf]
# In-memory index files:
mail_driver = pop3c
mail_path =

# OR, Store index files locally:
#mail_path = ~/pop3c

pop3c {
  host = pop3.example.com
  port = 110
  ssl = starttls
  client_auth_authzid = user@example.com
  client_auth_password = secret
}
```
