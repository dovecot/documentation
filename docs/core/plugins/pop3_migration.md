---
layout: doc
title: pop3-migration
---

# POP3 Migration Plugin (`pop3-migration`)

The pop3-migration plugin is used to preserve POP3 UIDLs.

When dsync is handling IMAP INBOX and requests a POP3 UIDL, the plugin
connects to the POP3 server and figures out which IMAP messages match
the POP3 messages and returns the appropriate POP3 UIDL.

The plugin works by matching POP3 messages to IMAP messages. This isn’t
always trivial with some servers, which can keep the POP3 and IMAP messages
in different order or include more than just IMAP INBOX messages in the
POP3 messages.

::: danger
Always do a test migration to verify that POP3 UIDLs are preserved
correctly. If the UIDL format is wrong, all the mails have to be re-migrated.
:::

::: tip
See Also:
* [[link,migration]].
:::

## Configuration

This plugin requires a pop3c namespace configured for accessing the source
POP3 server. For example:

```[dovecot.conf]
namespace pop3c {
  prefix = POP3-MIGRATION-NS/
  separator = /
  location = pop3c:
  inbox = no
  list = no
  hidden = yes
}
```

## Settings

<SettingsComponent plugin="pop3-migration" />
