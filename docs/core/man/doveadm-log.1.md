---
layout: doc
title: doveadm-log
dovecotComponent: core
---

# doveadm-log(1) - Locate, test or reopen Dovecot's log files

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **log errors** [**-s** *min_timestamp*]

**doveadm** [*GLOBAL OPTIONS*] **log find** [*directory*]

**doveadm** [*GLOBAL OPTIONS*] **log reopen**

**doveadm** [*GLOBAL OPTIONS*] **log test**

## DESCRIPTION

The **doveadm log** *commands* are used to locate and reopen the log
files of [[man,dovecot]]. It's also possible to test the configured
targets of the *log_path* settings.

<!-- @include: include/global-options.inc -->

## COMMANDS

### log errors

**doveadm** [*GLOBAL OPTIONS*] log errors [**-s** *min_timestamp*]

The **log errors** command is used to show the last - up to 1,000 -
errors and warnings. If no output is generated, no errors have occurred
since the last start.

**-s** *min_timestamp*
:   An integer value, representing seconds since the epoch - also known
    as Unix timestamp. When a min_timestamp was given, [[man,doveadm]]
    will only show errors occurred since that point in time.

### log find

**doveadm** [*GLOBAL OPTIONS*] log find [*directory*]

The **log find** command is used to show the location of the log files,
to which [[man,dovecot]]
logs its messages through **syslogd** (8) and [[man,doveadm]] could
not find any log files, you can specify the *directory* where your
syslogd writes its log files.

### log reopen

**doveadm** [*GLOBAL OPTIONS*] log reopen

This command causes **doveadm** to send a SIGUSR1 signal to master
process, which causes it to reopen all log files configured in the
*log_path*, *info_log_path* and *debug_log_path* settings. These
settings are configured in */etc/dovecot/conf.d/10-logging.conf*.

The master process also signals the log process to do the same. This
is mainly useful after manually rotating the log files.

### log test

**doveadm** [*GLOBAL OPTIONS*] log test

This command causes **doveadm** to write the message "This is Dovecot's
*priority* log (*timestamp*)" to the configured log files. The used
priorities are: **debug**, **info**, **warning**, **error** and
**fatal**.

## EXAMPLE

This example shows how to locate the log files used by [[man,dovecot]]:

```console
$ doveadm log find
Looking for log files from /var/log
Debug: /var/log/dovecot.debug
Info: /var/log/mail.log
Warning: /var/log/mail.log
Error: /var/log/mail.log
Fatal: /var/log/mail.log
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
