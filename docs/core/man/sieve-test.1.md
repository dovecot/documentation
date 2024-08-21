---
layout: doc
title: sieve-test
dovecotComponent: pigeonhole
---

# sieve-test(1) - Pigeonhole's Sieve script tester

## SYNOPSIS

**sieve-test** [*options*] *script-file* *mail-file*

## DESCRIPTION

The **sieve-test** command is part of Pigeonhole ([[man,pigeonhole,,7]]),
which adds Sieve ([[rfc,5228]]) and ManageSieve ([[rfc,5804]]) support to
Dovecot ([[man,dovecot]]).

Using the **sieve-test** command, the execution of Sieve scripts can be
tested. This evaluates the script for the provided message, yielding a
set of Sieve actions. Unless the **-e** option is specified, it does not
actually execute these actions, meaning that it does not store or
forward the message anywhere. Instead, it prints a detailed list of what
actions would normally take place. Note that, even when **-e** is
specified, no messages are ever transmitted to remote SMTP recipients.
The outgoing messages are always printed to **stdout** instead.

This is a very useful tool to debug the execution of Sieve scripts. It
can be used to verify newly installed scripts for the intended behaviour
and it can provide more detailed information about script execution
problems that are reported by the Sieve plugin, for example by tracing
the execution and evaluation of commands and tests respectively.

## OPTIONS

**-a** *orig-recipient-address*
:   The original envelope recipient address. This is what Sieve's
    envelope test will compare to when the "to" envelope part is
    requested. Some tests and actions will also use this as the script
    owner's e-mail address. If this option is omitted, the recipient
    address is retrieved from the "Envelope-To:", or "To:" message
    headers. If none of these headers is present either, the recipient
    address defaults to *recipient@example.com*.

**-c** *config-file*
:   Alternative Dovecot configuration file path.

**-C**
:   Force compilation. By default, the compiled binary is stored on disk.
    When this binary is found during the next execution of **sieve-test**
    and its modification time is more recent than the script file, it is
    used and the script is not compiled again. This option forces the
    script to be compiled, thus ignoring any present binary. Refer to
    [[man,sievec]] for more information about Sieve compilation.

**-D**
:   Enable Sieve debugging.

<!-- @include: option-d.inc -->

**-e**
:   Enables true execution of the set of actions that results from
    running the script. Use he **-o** parameter to specify the mail_driver,
    mail_path and other necessary storage settings. This allows actual delivery
    of messages can be tested. Note that this will not transmit any messages to
    remote SMTP recipients. Such actions only print the outgoing message to
    **stdout**.

**-f** *envelope-sender*
:   The envelope sender address (return path). This is what Sieve's
    envelope test will compare to when the "from" envelope part is
    requested. Also, this is where response messages are 'sent' to. If
    this option is omitted, the sender address is retrieved from the
    "Return-Path:", "Sender:" or "From:" message headers. If none of
    these headers is present either, the sender envelope address defaults
    to *sender@example.com*.

**-m** *default-mailbox*
:   The mailbox where the keep action stores the message. This is "INBOX"
    by default.

<!-- @include: option-o.inc -->

**-r** *recipient-address*
:   The final envelope recipient address. Some tests and actions will use
    this as the script owner's e-mail address. For example, this is what
    is used by the vacation action to check whether a reply is
    appropriate. If the **-r** option is omitted, the original envelope
    recipient address will be used instead (see **-a** option for more
    info).

**-s** *script-file*
:   Specify additional scripts to be executed before the main script.
    Multiple **-s** arguments are allowed and the specified scripts are
    executed sequentially in the order specified at the command line.

**-t** *trace-file*
:   Enables runtime trace debugging. Trace debugging provides detailed
    insight in the operations performed by the Sieve script. Refer to the
    runtime trace debugging section below. The trace information is
    written to the specified file. Using '-' as filename causes the trace
    data to be written to **stdout**.

**-T** *trace-option*
:   Configures runtime trace debugging, which is enabled with the **-t**
    option. Refer to the runtime trace debugging section below.

<!-- @include: option-u-user.inc -->

<!-- @include: option-x.inc -->

## ARGUMENTS

*script-file*
:   Specifies the script to (compile and) execute.

    Note that this tool looks for a pre-compiled binary file with a *.svbin*
    extension and with basename and path identical to the specified script.
    Use the **-C** option to disable this behavior by forcing the script to
    be compiled into a new binary.

*mail-file*
:   Specifies the file containing the e-mail message to test with.

## USAGE

### RUNTIME TRACE DEBUGGING

Using the **-t** option, the **sieve-test** tool can be configured to
print detailed trace information on the Sieve script execution to a file
or standard output. For example, the encountered commands, the performed
tests and the matched values can be printed.

The runtime trace can be configured using the **-T** option, which can
be specified multiple times. It can be used as follows:

**-T level=...**
:   Set the detail level of the trace debugging. One of the following
    values can be supplied:

    :   *actions* (default)
        :   Only print executed action commands, like keep, fileinto, reject
            and redirect.

    :   *commands*
        :   Print any executed command, excluding test commands.

    :   *tests*
        :   Print all executed commands and performed tests.

    :   *matching*
        :   Print all executed commands, performed tests and the values
            matched in those tests.

**-T debug**
:   Print debug messages as well. This is usually only useful for
    developers and is likely to produce messy output.

**-T addresses**
:   Print byte code addresses for the current trace output. Normally,
    only the current Sieve source code position (line number) is printed.
    The byte code addresses are equal to those listed in a binary dump
    produced using the **-d** option or by the [[man,sieve-dump]] command.

### DEBUG SIEVE EXTENSION

To improve script debugging, this Sieve implementation supports a custom
Sieve language extension called 'vnd.dovecot.debug'. It adds the
**debug_log** command that allows logging debug messages.

Example:

```
require "vnd.dovecot.debug";

if header :contains "subject" "hello" {
  debug_log "Subject header contains hello!";
}
```

Tools such as **sieve-test**, [[man,sievec]] and [[man,sieve-dump]] have
support for the vnd.dovecot.debug extension enabled by default and it is not
necessary to enable nor possible to disable the availability of the
debug extension with the **-x** option. The logged messages are written
to **stdout** in this case.

In contrast, for the actual Sieve plugin for the Dovecot LDA
([[man,dovecot-lda]]) the vnd.dovecot.debug extension needs to be
enabled explicitly using the [[setting,sieve_extensions]] or
[[setting,sieve_global_extensions]] setting. The messages
are then logged to the user's private script log file. If used in a
global script, the messages are logged through the default Dovecot
logging facility.

## EXIT STATUS

**sieve-test** will exit with one of the following values:

**0**
:   Execution was successful. (EX_OK, EXIT_SUCCESS)

**1**
:   Operation failed. This is returned for almost all failures. (EXIT_FAILURE)

**64**
:   Invalid parameter given. (EX_USAGE)

## FILES

*/etc/dovecot/dovecot.conf*
:   Dovecot's main configuration file.

*/etc/dovecot/conf.d/90-sieve.conf*
:   Sieve interpreter settings (included from Dovecot's main
    configuration file)

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,dovecot]], [[man,dovecot-lda]], [[man,sieve-dump]],
[[man,sieve-filter]], [[man,sievec]], [[man,pigeonhole,,7]]
