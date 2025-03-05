---
layout: doc
title: Issue Reporting
order: 50
dovecotlinks:
  ce_bug_report: Issue Reporting
---

# Issue Reporting

## Security Issues

Report security-related issues to:

* [Dovecot's YesWeHack Program](https://vdp.open-xchange.com/)
* security@dovecot.org

## Bugs

Bugs should be reported to the
[Dovecot mailing list](https://www.dovecot.org/mailing-lists/).

### Report Details

#### Technical Details

::: warning Recommended
You can provide most of the system related information with
[`dovecot-sysreport`](https://raw.githubusercontent.com/dovecot/core/master/src/util/dovecot-sysreport)
command.
:::

Provide Dovecot configuration produced by `dovecot -n`.

If the output does doesn't already show it, specify also:

* Dovecot version
* Operating system or Linux distribution name
* CPU architecture (x86 or something else?)
* Filesystem you used (especially if you use NFS or not)

::: tip
Don’t send the whole `dovecot.conf` file, it’s way too large especially
if you don’t remove the comments.
:::

#### Problem Description

Some kind of description of what you were doing and with what mail
(e.g., IMAP) client.

#### Reproducible Testcase

If the problem can be reproduced, it helps a lot if you can tell how. If it
happens only with a specific mail, add it as attachment if possible.

::: warning

Don't send sensitive details in your report.

You can hide all the actual mail data from messages using
[mbox-anonymize](https://dovecot.org/tools/mbox-anonymize.pl).
:::

### Debugging Crashes

See [[link,debug_core_dumps]].

### Debugging Hangs

See [[link,debug_hangs]].

### Debugging Clients

See [[link,debug_clients]].
