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

### sieve-imapsieve

The Sieve plugin is activated by adding it to the [[setting,sieve_plugins]]
setting:

```[dovecot.conf]
sieve_plugins = sieve_imapsieve
```

This plugin registers the `imapsieve` extension with the Sieve
interpreter. This extension is enabled implicitly, which means that it
does not need to be added to the [[setting,sieve_extensions]] setting.

## Settings

### imap-sieve

<SettingsComponent tag="imap_sieve" level="3" />

### sieve-imapsieve

There are no `dovecot.conf` settings for this plugin.
