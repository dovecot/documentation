---
layout: doc
title: imap-sieve
---

# IMAPSieve Plugin (`imap-sieve`)

As defined in the base specification ([[rfc,5228]]), the Sieve language is
used only during delivery. However, in principle, it can be used at any
point in the processing of an email message.

[[rfc,6785]] defines the use of Sieve
filtering in IMAP, operating when messages are created or their
attributes are changed. This feature extends both Sieve and IMAP.

Therefore, Pigeonhole provides both an IMAP plugin and a Sieve plugin.

The `sieve_imapsieve` plugin implements the `imapsieve` extension
for the Sieve filtering language, adding functionality for using Sieve
scripts from within IMAP.

The `imap_sieve` plugin for IMAP adds the
`IMAPSIEVE` capability to the `imap` service. The basic
`IMAPSIEVE` capability allows attaching a Sieve script to a mailbox
for any mailbox by setting a special IMAP METADATA entry. This way,
users can configure Sieve scripts that are run for IMAP events in their
mailboxes.

Beyond the standard, the Pigeonhole implementation also adds the ability
for administrators to configure Sieve scripts outside the user's
control, that are run either before or after a user's script if there is
one.

::: warning
The `imapsieve` extension can only be used in a Sieve script
that is invoked from IMAP. When it is used in the active delivery
script, it will cause runtime errors. To make a Sieve script suitable
for both delivery and IMAP, the availability of the extension can be
tested using the `ihave` test ([[rfc,5463]]) as usual.
:::

## Configuration

### imap-sieve

The IMAP plugin is activated by adding it to the
[[setting,mail_plugins]] setting for the imap protocol:

```[dovecot.conf]
protocol imap {
  mail_plugins {
    imap_sieve = yes
  }
}
```

This will only enable support for administrator scripts.

User scripts are only supported when a Sieve URL is additionally configured
using the [[setting,imapsieve_url]] setting. This URL points to the
[[link,managesieve]] server that users need to use to upload their Sieve
scripts. This URL will be shown to the client in the IMAP CAPABILITY
response as `IMAPSIEVE=<URL>`.

User scripts are retrieved from the user's
[[link,sieve_storage_type_personal,personal]] storage by name ([[rfc,6785]]),
which requires no additional configuration.

Script storages for administrator scripts are defined in
[[setting,sieve_script]] blocks with [[setting,sieve_script_type]]
[[link,sieve_storage_type_before,before]] or
[[link,sieve_storage_type_after,after]]. These execute administrator scripts
before or after the user's personal script, respectively. The
[[setting,sieve_script_cause]] setting for the administrator storages used by
the `imap_sieve` plugin must include the cause of the IMAP event ([[rfc,6785]]):
either `append`, `copy`, or `flag`. The [[setting,sieve_script_cause]] setting
can list several causes together, including the default `delivery`, which in
that case means that those administrator scripts are also executed at delivery.

The applicability of administrator scripts can be limited to a destination
mailbox by placing the corresponding [[setting,sieve_script]] blocks inside
a [[setting,mailbox]] block for that mailbox. For a source mailbox, limiting the
applicability of administrator scripts can similarly be achieved by placing the
corresponding [[setting,sieve_script]] blocks inside a
[[setting,imapsieve_from]] block with that mailbox name. The [[setting,mailbox]]
and [[setting,imapsieve_from]] blocks can be nested when both are required.

The `imap_sieve` plugin defines an additional
[[link,sieve_storage_type,script storage type]] called `copy-source-after`.
Administrator scripts in such storages only apply when the cause is `copy` and
are executed for the message in the source mailbox after the Sieve scripts for
the corresponding message in the destination mailbox successfully finish
executing. This does not apply to moved messages, since the message is removed
from the source mailbox in that case.

### sieve-imapsieve

The Sieve plugin is activated by adding it to the [[setting,sieve_plugins]]
setting:

```[dovecot.conf]
sieve_plugins {
  sieve_imapsieve = yes
}
```

This plugin registers the `imapsieve` extension with the Sieve
interpreter. This extension is enabled implicitly, which means that it
does not need to be added to the [[setting,sieve_extensions]] setting.

## Example Configuration

```[dovecot.conf]]]
imapsieve_from Spam {
  sieve_script ham {
    type = before
    cause = copy
    path = /etc/dovecot/sieve/ham.sieve
  }
}
mailbox Spam {
  sieve_script spam {
    type = before
    cause = copy
    path = /etc/dovecot/sieve/spam.sieve
  }
}
```

## Settings

### imap-sieve

<SettingsComponent tag="imap-sieve" level="3" />

### sieve-imapsieve

There are no `dovecot.conf` settings for this plugin.
