```doveconf[dovecot.conf]
  namespace inbox {
    inbox = yes
    mailbox Drafts {
      auto = subscribe
      special_use = \Drafts
    }
    mailbox Junk {
      auto = subscribe
      special_use = \Junk
    }
    mailbox Sent {
      auto = subscribe
      special_use = \Sent
    }
    mailbox Trash {
      auto = subscribe
      special_use = \Trash
    }
  }
```
