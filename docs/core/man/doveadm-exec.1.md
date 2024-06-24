---
layout: doc
title: doveadm-exec
dovecotComponent: core
---

# doveadm-exec(1) - Easily execute commands from Dovecot's libexec directory.

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **exec** *binary* [*binary arguments*]

## DESCRIPTION

This command allows administrators and local users to simply execute
commands from within */usr/libexec/dovecot*. So for example a logged in system
user could start a pre-authenticated imap session, using the command:
**doveadm exec imap**. An administrator would use the command
**doveadm exec imap -u** *username*.

<!-- @include: include/global-options.inc -->

## ARGUMENTS

*binary*
:   the name of an executable located in */usr/libexec/dovecot*.

*binary arguments*
:   options and arguments, which will be passed through to the *binary*.

## EXAMPLE

This example demonstrates how to deliver a message from a file to a
user's mailbox.

```console
$ doveadm exec dovecot-lda -d user@example.net -f admin@example.net < ~/stuff/welcome.msg
```

<!-- @include: include/reporting-bugs.inc -->

SEE ALSO

[[man,doveadm]]
