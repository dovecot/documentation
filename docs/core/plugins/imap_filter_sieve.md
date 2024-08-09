---
layout: doc
title: imap-filter-sieve
---

# IMAP FILTER=SIEVE Plugin (`imap-filter-sieve`)

Normally, Sieve filters can either be applied at initial mail delivery
or triggered by certain events in the Internet Message Access Protocol
(IMAPSIEVE; [[rfc,6785]]).

The user can configure which Sieve scripts to run at these instances, but it
is not possible to trigger the execution of Sieve scripts manually.
However, this could be very useful; e.g, to test new Sieve rules and to
re-filter messages that were erroneously handled by an earlier version
of the Sieve scripts involved.

Pigeonhole provides the `imap_filter_sieve` plugin, which provides a
vendor-defined IMAP extension called `FILTER=SIEVE`. This adds a new
`FILTER` command that allows applying a mail filter (a Sieve script)
on a set of messages that match the specified IMAP searching criteria.

This plugin implements the latest draft of the
[FILTER=SIEVE Sieve Extension](https://github.com/dovecot/pigeonhole/blob/master/doc/rfc/draft-bosch-imap-filter-sieve-00.txt).
This plugin is experimental and the specification is likely to change.
Use the specification included in your current release to obtain the
matching specification for your release.

The plugin is included in the Pigeonhole package and are therefore implicitly
compiled and installed with Pigeonhole itself.

## Settings

There are no `dovecot.conf` settings for this plugin.

## Configuration

The IMAP FILTER Sieve plugin is activated by adding it to the
[[setting,mail_plugins]] setting for the imap protocol:

```[dovecot.conf]
protocol imap {
  mail_plugins = $mail_plugins imap_filter_sieve
}
```

Note that enabling this plugin allows users to specify the Sieve script
content as a parameter to the `FILTER` command, not just run existing
stored scripts.

This plugin uses the normal configuration settings used by the [[link,lda]]
Sieve plugin at delivery.

The [[setting,sieve_before]] and [[setting,sieve_after]] scripts
are currently ignored by this plugin.
