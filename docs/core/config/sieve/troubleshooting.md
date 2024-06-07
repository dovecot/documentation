---
layout: doct
title: Troubleshooting
dovecotlinks:
  sieve_troubleshooting: Sieve troubleshooting
---

# Sieve Troubleshooting

This page explains how to approach problems with Sieve.

## Common Problems

Common configuration problems and their solutions are described here.

### Sieve Scripts are not Executed

When Sieve scripts are not being executed, there are several
possibilities:

#### Your MTA is not using Dovecot LDA or LMTP

Sieve scripts are executed by the Dovecot [[link,lda]] and/or the Dovecot
[[link,lmtp]] service. Thus, you first need to check whether LDA or LMTP are
actually being used.

At least one of these is supposed to be called/accessed from your [[link,mta]]
e.g. Exim or Postfix, for local message delivery. Most MTAs have
their own local delivery agent, and without explicit configuration
this is what is used. In that case, your Sieve scripts are simply
ignored.

When you set [[setting,log_debug,category=sieve]] in your configuration,
your logs will show details of LDA and/or LMTP execution.

The following is an example of the first few log lines of an LDA delivery:

```
dovecot: lda: Debug: Loading modules from directory: /usr/lib/dovecot/modules
dovecot: lda: Debug: Module loaded: /usr/lib/dovecot/modules/lib90_sieve_plugin.so
dovecot: lda(hendrik): Debug: Effective uid=1000, gid=1000, home=/home/hendrik
dovecot: lda(hendrik): Debug: Namespace inbox: type=private, prefix=, sep=, inbox=yes, hidden=no, list=yes, subscriptions=yes location=
```

The first lines show that LDA has found and loaded the Sieve plugin
module. Then it shows for what user it is delivering and where his
INBOX is located. LMTP produces similar log lines. If you don't see
lines such as the above, your MTA is probably not using Dovecot for
local delivery. You can verify whether Dovecot is working correctly
by executing `dovecot-lda` manually.

#### The Sieve plugin is not Enabled

The Dovecot [[link,lda]] and [[link,lmtp]] services do not provide Sieve
support by default.

Sieve support is provided as a separate plugin that needs to be enabled
by adding it to [[setting,mail_plugins]] in the `protocol lda {...}` section
for the LDA and the `protocol lmtp {...}` section for LMTP. If this
is omitted, Sieve scripts are ignored. See [[plugin,sieve]].

Without actually running LDA, you can also check if executing
`doveconf -f service=lda mail_plugins` includes "sieve".

#### The Sieve plugin is misconfigured or the involved Sieve scripts contain errors

If there is a configuration error or when a Sieve script cannot be
compiled and executed, an error is always logged.

### Mailbox Names with non-ASCII Characters Cause Problems

This problem most often manifests with the following error message:

```
error: msgid=<234234.234234@example.com>: failed to store into mailbox 'INBOX/Co&APY-rdineren' (INBOX/Co&-APY-rdineren): Mailbox doesn't exist: INBOX.Co&-APY-rdineren.
```

The Sieve script causing this error contained the following command:

```
fileinto "INBOX/Co&APY-rdineren";
```

The specified mailbox contains the non-ASCII character 'ö'.

Unfortunately, the author of this script used the wrong encoding. This
is modified UTF-7 such as used by IMAP. However, Sieve expects UTF-8 for
mailbox names. Depending on version and configuration, Dovecot uses
modified UTF-7 internally. The Sieve interpreter expects UTF-8 and
converts that to UTF-7 when necessary.

When the mailbox is encoded in
UTF-7 by the user, the '&' will just be escaped into '&-' during the
UTF-7 conversion, yielding an erroneous mailbox name for Dovecot. That
is what causes the error message presented above.

Instead, the `fileinto` command should have looked as follows:

```
fileinto "INBOX/Coördineren";
```

The old CMUSieve plugin did use UTF-7 for folder names. Therefore, this
problem could have emerged after migrating from CMUSieve to Pigeonhole.
