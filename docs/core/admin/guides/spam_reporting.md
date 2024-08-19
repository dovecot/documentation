---
layout: doc
title: Spam Reporting
---

# Spam Reporting

::: tip Note 
This page describes the recommended way of implementing spam/ham reporting
within Dovecot.

This is not the only possible solution, but matches the behavior of many
clients and is entirely self-contained within the server.
:::

Spam/not-spam reporting within Dovecot (IMAP) can be handled by the user
action of moving a message into (or out of) a defined Spam mailbox.

## Configuration 

Spam reporting messages are handled via [[plugin,imap-sieve]].
A global configuration script is used to capture the event of moving
messages in/out of the Spam mailbox.

::: warning
**You cannot run scripts anywhere you want.**

Sieve allows you to only run scripts under
[[setting,sieve_&gt;extension&lt;_bin_dir,sieve_pipe_bin_dir]]. You
can't use `/usr/local/bin/my-sieve-filter.sh`, you have to put the
script under `sieve_pipe_bin_dir` and use `my-sieve-filter.sh` in the
script instead.
:::

The Spam mailbox is defined and reported to the MUA via a Special-Use flag.

### External Reporting

In this setup, the sieve scripts the script send the reported message using
[[rfc,5965]] compliant spam reporting format to an external reporting
e-mail address, using the
[report extension](https://raw.githubusercontent.com/dovecot/pigeonhole/master/doc/rfc/spec-bosch-sieve-report.txt).

#### Configuration

::: code-group
```[dovecot.conf]
# Display \Junk special-flag for Spam mailbox
namespace inbox {
  mailbox Spam {
    auto = create
    special_use = \Junk
  }
}

# Setup actions based on message movement
protocol imap {
  mail_plugins = $mail_plugins imap_sieve
}
   
plugin {
  sieve_plugins = sieve_imapsieve
  sieve_implicit_extensions = +vnd.dovecot.report
   
  # From elsewhere to Spam folder
  imapsieve_mailbox1_name = Spam
  imapsieve_mailbox1_causes = COPY
  imapsieve_mailbox1_before = file:/etc/dovecot/report-spam.sieve

  # From Spam folder to elsewhere
  imapsieve_mailbox2_name = *
  imapsieve_mailbox2_from = Spam
  imapsieve_mailbox2_causes = COPY
  imapsieve_mailbox2_before = file:/etc/dovecot/report-ham.sieve
}
   
# Needed to send message to external mail server
submission_host = 127.0.0.1:587
```

```[/etc/dovecot/report-spam.sieve]
require "vnd.dovecot.report";
   
report "abuse" "User added this message to the Spam folder." "spam-report@example.com";
```

```[/etc/dovecot/report-ham.sieve]
require "vnd.dovecot.report";
require "environment";
require "imapsieve";
   
if environment "imap.mailbox" "Trash" {
  # Putting spam in Trash mailbox is not significant
  stop;
}
   
if environment "imap.mailbox" "Spam" {
  # Copying mail inside Spam mailbox is not significant
  stop;
}
   
report "not-spam" "User removed this message from the Spam folder." "ham-report@example.com";
```
:::

### Local Reporting

In this setup, the sieve scripts pass the reported message to local binaries
to do classification.

#### Caveats and Possible Pitfalls

- INBOX name is case-sensitive

- [[plugin,imap-sieve]] will **only** apply to IMAP. It **will not** apply
  to LDA or LMTP. Use [[link,sieve]] normally for LDA/LMTP.

- With this configuration, moving mails will slow down due to learn
  being done per email. If you want to avoid this, you need to think of
  something else. Probably piping things into a FIFO or perhaps using a
  socket based worker might work better.

- Please read [[link,sieve]] and [[link,sieve_configuration]] to
  understand sieve configuration better.

- Please read [[link,sieve_plugins]] for more information about sieve
  extensions.

- If you run SpamAssassin trough Amavis and you use a virtual users
  setup, you should instead configure SpamAssassin to use
  MySQL/PostgreSQL as a backend, unless you want a headache with file
  permissions and lock files.

  See: https://docs.iredmail.org/store.spamassassin.bayes.in.sql.html.

  In this case, the `-u` parameter passed to `sa-learn` (and the
  relevant sieve variables) is obsolete and can be safely removed.

- Reloading Dovecot doesn't activate changes in this configuration,
  you'll need to perform a full restart.

#### Configuration

::: code-group
```[dovecot.conf]
# Display \Junk special-flag for Spam mailbox
namespace inbox {
  mailbox Spam {
    auto = create
    special_use = \Junk
  }
}

# Setup actions based on message movement
protocol imap {
  mail_plugins = $mail_plugins imap_sieve
}
   
plugin {
  sieve_plugins = sieve_imapsieve
  sieve_implicit_extensions = +vnd.dovecot.report
   
  # From elsewhere to Spam folder
  imapsieve_mailbox1_name = Spam
  imapsieve_mailbox1_causes = COPY
  imapsieve_mailbox1_before = file:/etc/dovecot/report-spam.sieve

  # From Spam folder to elsewhere
  imapsieve_mailbox2_name = *
  imapsieve_mailbox2_from = Spam
  imapsieve_mailbox2_causes = COPY
  imapsieve_mailbox2_before = file:/etc/dovecot/report-ham.sieve

  sieve_pipe_bin_dir = /usr/lib/dovecot/sieve
  sieve_global_extensions = +vnd.dovecot.pipe +vnd.dovecot.environment
}
```

```[/etc/dovecot/report-spam.sieve]
require ["vnd.dovecot.pipe", "copy", "imapsieve", "environment", "variables"];

if environment :matches "imap.user" "*" {
  set "username" "${1}";
}

# "sa-learn-spam.sh" MUST live in /usr/lib/dovecot/sieve
pipe :copy "sa-learn-spam.sh" [ "${username}" ];
```

```[/etc/dovecot/report-ham.sieve]
require ["vnd.dovecot.pipe", "copy", "imapsieve", "environment", "variables"];

if environment :matches "imap.mailbox" "*" {
  set "mailbox" "${1}";
}

if string "${mailbox}" "Trash" {
  stop;
}

if environment :matches "imap.user" "*" {
  set "username" "${1}";
}

# "sa-learn-ham.sh" MUST live in /usr/lib/dovecot/sieve
pipe :copy "sa-learn-ham.sh" [ "${username}" ];
```
:::

### Shell Scripts

#### SpamAssassin

::: warning **Untested**
spamc interaction scripts are not tested yet.
:::

::: code-group
```sh[sa-learn-spam.sh]
#!/bin/sh
# you can also use tcp/ip here, consult spamc(1)
exec /usr/bin/spamc -u ${1} -L spam
```

```sh[sa-learn-ham.sh]
#!/bin/sh
# you can also use tcp/ip here, consult spamc(1)
exec /usr/bin/spamc -u ${1} -L ham
```
:::

You can also use sa-learn.

Note that using sa-learn often incurs significant start-up time for
every message. This can cause "lockout" of the user until all the
processes sequentially complete, potentially tens of seconds or minutes.
If spamd is being used and the administrator is willing to accept the
potential security issues of allowing unauthenticated learning of
spam/ham, spamd can be invoked with the `--allow-tell` option and spamc
with the `--learntype=` option. Please consult the man pages of spamd and
spamc for further details.

::: code-group
```sh[sa-learn-spam.sh]
#!/bin/sh
exec /usr/bin/sa-learn -u ${1} --spam
```

```sh[sa-learn-ham.sh]
#!/bin/sh
exec /usr/bin/sa-learn -u ${1} --ham
```
:::

#### dspam

::: code-group
```sh[sa-learn-spam.sh]
#!/bin/sh
exec /usr/bin/dspam --client --user ${1} --class=spam --source=error
```

```sh[sa-learn-ham.sh]
#!/bin/sh
exec /usr/bin/dspam --client --user ${1} --class=innocent --source=error
```
:::

::: warning **CRLF handling**
dspam may fail to read the mail if it contains CRLF line endings. Add
the **Broken lineStripping** option in dspam.conf if needed.
:::

#### rspamd

By default, rspamd does global learning. If you want per-user
classification, or something more complex, see
https://rspamd.com/doc/configuration/statistic.html

Alternative scripts can be found from
https://github.com/darix/dovecot-sieve-antispam-rspamd/

::: code-group
```sh[sa-learn-spam.sh]
#!/bin/sh
exec /usr/bin/rspamc -h /run/rspamd/worker-controller.socket -P <secret> learn_spam
```

```sh[sa-learn-ham.sh]
#!/bin/sh
exec /usr/bin/rspamc -h /run/rspamd/worker-controller.socket -P <secret> learn_ham
```
:::

Before running following commands, make sure `dovecot.conf` has all the
sieve configuration you want. Then run following commands:

```sh
sievec /etc/dovecot/sieve/report-spam.sieve
sievec /etc/dovecot/sieve/report-ham.sieve
chmod +x /etc/dovecot/sieve/sa-learn-ham.sh /etc/dovecot/sieve/sa-learn-spam.sh
```

Now your learn scripts should be invoked when you move mails between
folders.

## Debugging

To debug, you need to import "vnd.dovecot.debug" extension. Then you can
put in your Sieve script, when required (variables supported):

```
debug_log "something"
```
