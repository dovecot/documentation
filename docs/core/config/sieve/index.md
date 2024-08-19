---
layout: doc
title: Sieve
dovecotlinks:
  sieve: Sieve
  sieve_extensions:
    hash: extensions
    text: Sieve extensions
  sieve_plugins:
    hash: extensions
    text: Sieve plugins
  sievec:
    hash: manually-compiling-sieve-scripts
    text: sievec
---

# Sieve

[Sieve](http://sieve.info/) support for Dovecot is provided by Pigeonhole,
which allows users to filter incoming messages by writing scripts specified
in the Sieve language ([[rfc,5228]]).

Sieve support is provided as a plugin for Dovecot's [[link,lda]] and
[[link,lmtp]] services.

The plugin implements a Sieve interpreter, which filters incoming messages
using a script specified in the Sieve language. The Sieve
script is provided by the user and, using that Sieve script, the user can
customize how incoming messages are handled. Messages can be delivered to
specific folders, forwarded, rejected, discarded, etc.

## Supported Features

The Sieve language has various extensions. You can find more information
about the extensions from the Sieve Mail Filtering Language Charter
or the [Sieve.info wiki page](http://sieve.info/).

::: info Note
Sieve doesn't support running external programs.
:::

### Extensions

The interpreter recognizes the following Sieve extensions:

| Extension | Default Enabled | Purpose |
| --------- | --------------- | ------- |
| `body` ([[rfc,5173]]) | **yes** | Allows evaluating the body of a message |
| `copy` ([[rfc,3894]]) | **yes** | Allows storing and forwarding messages without canceling the implicit keep |
| `date` ([[rfc,5260,4]]) | **yes** | Adds the ability to test date and time values in various ways |
| <code>[[link,sieve_duplicate,duplicate]]</code> ([[rfc,7352]]) | **yes** | Allows detecting duplicate message deliveries |
| <code>[[link,sieve_editheader,editheader]]</code> ([[rfc,5293]]) | no | Adds the ability to add and remove message header fields |
| `encoded-character` ([[rfc,5228,2.4.2.4]]) | **yes** | Allows encoding special characters numerically |
| <code>[[link,sieve_enotify,enotify]]</code> ([[rfc,5435]]) | **yes** | Provides the ability to send notifications by various means (currently only mailto) |
| `envelope` ([[rfc,5228,5.4]]) | **yes** | Allows evaluating envelope parts, i.e. sender and recipient |
| `environment` ([[rfc,5183]]) | **yes** | Allows testing against various labeled values from the execution environment |
| `extracttext` ([[rfc,5703,7]]) | **yes** | Allows extracting text from individual message MIME parts |
| `fileinto` ([[rfc,5228,4.1]]) | **yes** | Allows storing messages in folders other than INBOX |
| `foreverypart` ([[rfc,5703,3]]) | **yes** | Allows iterating through the message's MIME parts |
| `ihave` ([[rfc,5463]]) | **yes** | Adds the ability to test for support of Sieve extensions and dynamically invoke their use |
| `imap4flags` ([[rfc,5232]]) | **yes** | Allows adding IMAP flags to stored messages |
| `imapsieve` ([[rfc,6785]]) | no ([[plugin,imap-sieve]]) | Provides access to special environment items when executing at IMAP events |
| <code>[[link,sieve_include,include]]</code> ([[rfc,6609]]) | **yes** | Allows including other Sieve scripts |
| `index` ([[rfc,5260,6]])) | **yes** | Allows matching specific header field instances by index |
| `mailbox` ([[rfc,5490,3]]) | **yes** | Provides a mailbox existence check and allows creating mailboxes upon fileinto |
| `mboxmetadata` ([[rfc,5490]]) | no | Provides access to mailbox METADATA entries |
| `mime` ([[rfc,5703,4]]) | **yes** | Allows testing parts of structured MIME header fields |
| `regex` ([Draft](https://tools.ietf.org/html/draft-murchison-sieve-regex-08)) | **yes** | Provides regular expression match support |
| `reject` ([[rfc,5429,2.2]]) | **yes** | Allows rejecting messages with a rejection bounce message |
| `relational` ([[rfc,5231]]) | **yes** | Provides relational match support |
| `servermetadata` ([[rfc,5490]]) | no | Provides access to server METADATA entries |
| <code>[[link,sieve_spamtest,spamtest]]</code> ([[rfc,5235]]) | no | Implements a uniform way to test against headers added by spam filters |
| `subaddress` ([[rfc,5233]]) | **yes** | Allows testing against delimited elements of the local part of addresses |
| <code>[[link,sieve_vacation,vacation]]</code> ([[rfc,5230]]) | **yes** | Provides auto-responder functionality, e.g. for when the user is on vacation |
| <code>[[link,sieve_vacation,vacation-seconds]]</code> ([[rfc,6131]]) | no | Extends vacation extension with the ability to send vacation responses with intervals of seconds rather than days |
| <code>[[link,sieve_variables,variables]]</code> ([[rfc,5229]]) | yes | Adds variables support to the language |
| <code>[[link,sieve_virustest,virustest]]</code> ([[rfc,5235]]) | no | Implements a uniform way to test against headers added by virus scanners |

### Extensions (Dovecot)

The interpreter recognizes the following Dovecot-specific Sieve extensions:

| Extension | Default Enabled | Purpose |
| --------- | --------------- | ------- |
| [`vnd.dovecot.debug`](https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-debug.txt) | no | Allows logging debug messages |
| [`vnd.dovecot.environment`](https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-dovecot-environment.txt) | no | Extends the standard "environment" extension with extra items and a variables namespace for direct access |
| [`vnd.dovecot.execute`](https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-extprograms.txt) | no ([[plugin,sieve-extprograms]]) | Implements executing a pre-defined set of external programs with the option to process string data through the external program |
| [`vnd.dovecot.filter`](https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-extprograms.txt) | no ([[plugin,sieve-extprograms]]) | Implements filtering messages through a pre-defined set of external programs |
| [`vnd.dovecot.pipe`](https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-extprograms.txt) | no ([[plugin,sieve-extprograms]]) | Implements piping messages to a pre-defined set of external programs |
| [`vnd.dovecot.report`](https://raw.githubusercontent.com/dovecot/pigeonhole/main/doc/rfc/spec-bosch-sieve-report.txt) | no | Implements sending Messaging Abuse Reporting Format (MARF) reports ([[rfc,5965]]) |

### Obsolete Extensions

::: warning
These extensions are obsolete and have been removed.
:::

| Extension | Status | Purpose |
| --------- | ------ | ------- |
| `imapflags` ([obsolete draft](https://tools.ietf.org/html/draft-melnikov-sieve-imapflags-03)) | [[removed,sieve_ext_imapflags]] | Old version of imap4flags (for backwards compatibility with CMU Sieve) |
| `notify` ([obsolete draft](https://tools.ietf.org/html/draft-martin-sieve-notify-01)) | [[removed,sieve_ext_notify]] | Old version of enotify (for backwards compatibility with CMU Sieve) |

## Configuration

Basic configuration of the Sieve plugin can be found at [[plugin,sieve]].

## ManageSieve Server

To give users the ability to upload their own Sieve scripts to your server,
i.e. without the need for shell or FTP access, you can use the ManageSieve
protocol.

Dovecot provides a [[link,managesieve]] service to provide this protocol.

## Mailbox Names

### UTF7 vs. UTF8

Sieve uses UTF8 encoding for mailbox names, while IMAP uses
modified UTF7. This means that non-ASCII characters contained in mailbox
names are represented differently between IMAP and Sieve scripts. See
[[link,sieve_troubleshooting]].

### Separators and Prefixes

Regarding separators, you need to specify mailbox names in Sieve scripts
the same way as IMAP clients see them.

For example if you want to deliver mail to the "Customers" mailbox which
exists under "Work" mailbox:

### Maildir Default

Namespace with [[setting,namespace_prefix,""]],
[[setting,namespace_separator,.]]:

```
require "fileinto";
fileinto "Work.Customers";
```

### Courier Migration

Namespace with [[setting,namespace_prefix,INBOX.]],
[[setting,namespace_separator,.]]:

```
require "fileinto";
fileinto "INBOX.Work.Customers";
```

### mbox, dbox Default

Namespace with [[setting,namespace_prefix,""]],
[[setting,namespace_separator,/]]:

```
require "fileinto";
fileinto "Work/Customers";
```

## Manually Compiling Sieve Scripts

When the Sieve plugin executes a script for the first time (or after it
has been changed), it is compiled and stored in binary form (byte code)
to avoid compiling the script again for each subsequent mail delivery.

The Pigeonhole Sieve implementation uses the `.svbin` extension to
store compiled Sieve scripts (e.g. `.dovecot.svbin`). To store the
binary, the plugin needs write access in the directory in which the
script is located.

A problem occurs when a global script is encountered by the plugin. For
security reasons, global script directories are not supposed to be
writable by the user. Therefore, the plugin cannot store the binary when
the script is first compiled. Note that this doesn't mean that the old
compiled version of the script is used when the binary cannot be
written: it compiles and uses the current script version. The only real
problem is that the plugin will not be able to update the binary on
disk, meaning that the global script needs to be recompiled each time it
needs to be executed, i.e. for every incoming message, which is
inefficient.

To mitigate this problem, the administrator must manually pre-compile
global scripts using the `sievec` command line tool. For example:

```sh
sievec /var/lib/dovecot/sieve/global/
```

This is necessary for scripts listed in [[setting,sieve_global]],
[[setting,sieve_before]], and [[setting,sieve_after]] settings.

For global scripts that are only included in other scripts using the Sieve
include extension, this step is not necessary since included scripts
are incorporated into the binary produced for the main script.

## Compile and Runtime Logging

Log messages produced during script compilation or during script
execution are written to two locations by the LDA Sieve plugin:

- A log file is written in the same directory as the user's main
  private script (as specified by [[setting,sieve]]). This
  log file bears the name of that script file appended with ".log", e.g.
  `.dovecot.sieve.log`.

  If there are errors or warnings in the script, the messages are appended
  to that log file until it eventually grows too large (>10 kB currently).
  When that happens, the old log file is moved to a ".log.0" file and an
  empty log file is started.

  Informational messages are not written to this log file and the log
  file is not created until messages are actually logged, i.e. when an
  error or warning is produced. The log file name can be overridden with
  [[setting,sieve_user_log]].

- Messages that could be of interest to the system administrator are
  also written to the Dovecot logging facility (usually syslog). This
  includes informational messages that indicate what actions are
  executed on incoming messages. Compile errors encountered in the
  user's private script are not logged here.
