---
layout: doc
title: sieve-filter
dovecotComponent: pigeonhole
---

# sieve-filter(1) - Pigeonhole's Sieve mailbox filter tool

::: warning
This tool is still experimental. Read this manual
carefully, and backup any important mail before using this tool. Also
note that some of the features documented here are not actually
implemented yet; this is clearly indicated where applicable.
:::

## SYNOPSIS

**sieve-filter** [*options*] *script-file* *source-mailbox* [*discard-action*]

## DESCRIPTION

The **sieve-filter** command is part of Pigeonhole ([[man,pigeonhole,,7]]),
which adds Sieve ([[rfc,5228]]) and ManageSieve ([[rfc,5804]]) support to
Dovecot ([[man,dovecot]]).

The Sieve language was originally meant for filtering messages upon
delivery. However, there are occasions when it is desirable to filter
messages that are already stored in a mailbox, for instance when a bug
in a Sieve script caused many messages to be delivered incorrectly.
Using the sieve-filter tool it is possible to apply a Sieve script on
all messages in a particular *source-mailbox*, making it possible to
delete messages, to store them in a different mailbox, to change their
content, and to change the assigned IMAP flags and keywords. Attempts to
send messages to the outside world are ignored by default for obvious
reasons, but, using the proper command line options, it is possible to
capture and handle outgoing mail as well.

If no options are specified, the sieve-filter command runs in a
simulation mode in which it only prints what would be performed, without
actually doing anything. Use the **-e** option to activate true script
execution. Also, the *source-mailbox* is opened read-only by default,
meaning that it normally always remains unchanged. Use the **-W** option
to allow changes in the *source-mailbox*.

Even with the **-W** option enabled, messages in the *source-mailbox*
are only potentially modified or moved to a different folder. Messages
are never lost unless a *discard-action* argument other than **keep**
(the default) is specified. If the Sieve filter decides to store the
message in the *source-mailbox*, where it obviously already exists, it
is never duplicated there. In that case, the IMAP flags of the original
message can be modified by the Sieve interpreter using the *imap4flags*
extension, provided that **-W** is specified. If the message itself is
modified by the Sieve interpreter (e.g. using the *editheader*
extension), a new message is stored and the old one is expunged.
However, if **-W** is omitted, the original message is left untouched
and the modifications are discarded.

## CAUTION

Although this is a very useful tool, it can also be very destructive
when used improperly. A small bug in your Sieve script in combination
with the wrong command line options could cause it to discard the wrong
e-mails. And, even if the *source-mailbox* is opened in read-only mode
to prevent such mishaps, it can still litter other mailboxes with
spurious copies of your e-mails if your Sieve script decides to do so.
Therefore, users are advised to read this manual carefully and to use
the simulation mode first to check what the script will do. And, of
course:

**MAKING A BACKUP IS IMPERATIVE FOR ANY IMPORTANT MAIL!**

## OPTIONS

**-c**\ *config-file*
:   Alternative Dovecot configuration file path.

**-C**
:   Force compilation. By default, the compiled binary is stored on disk.
    When this binary is found during the next execution of
    **sieve-filter** and its modification time is more recent than the
    script file, it is used and the script is not compiled again. This
    option forces the script to be compiled, thus ignoring any present
    binary. Refer to [[man,sievec]] for more information about Sieve
    compilation.

<!-- @include: include/option-d.inc -->

**-D**
:   Enable Sieve debugging.

**-e**
:   Turns on execution mode. By default, the sieve-filter command runs in
    simulation mode in which it changes nothing, meaning that no mailbox
    is altered in any way and no actions are performed. It only prints
    what would be done. Using this option, the sieve-filter command
    becomes active and performs the requested actions.

**-m**\ *default-mailbox*
:   The mailbox where the (implicit) **keep** Sieve action stores
    messages. This is equal to the *source-mailbox* by default.
    Specifying a different folder will have the effect of moving (or
    copying if **-W** is omitted) all kept messages to the indicated
    folder, instead of just leaving them in the *source-mailbox*. Refer
    to the explanation of the *source-mailbox* argument for more
    information on mailbox naming.

<!-- @include: include/option-o.inc -->

**-q**\ *output-mailbox*\ **[not implemented yet]**
:   Store outgoing e-mail into the indicated *output-mailbox*. By
    default, the sieve-filter command ignores Sieve actions such as
    redirect, reject, vacation and notify, but using this option outgoing
    messages can be appended to the indicated mailbox. This option has no
    effect in simulation mode. Flags of redirected messages are not
    preserved.

**-Q**\ *mail-command*\ **[not implemented yet]**
:   Send outgoing e-mail (e.g. as produced by redirect, reject and
    vacation) through the specified program. By default, the sieve-filter
    command ignores Sieve actions such as redirect, reject, vacation and
    notify, but using this option outgoing messages can be fed to the
    **stdin** of an external shell command. This option has no effect in
    simulation mode. Unless you really know what you are doing, **DO NOT
    USE THIS TO FEED MAIL TO SENDMAIL!**.

**-s**\ *script-file*\ **[not implemented yet]**
:   Specify additional scripts to be executed before the main script.
    Multiple **-s** arguments are allowed and the specified scripts are
    executed sequentially in the order specified at the command line.

<!-- @include: include/option-u-user.inc -->

**-v**
:   Produce verbose output during filtering.

**-W**
:   Enables write access to the *source-mailbox*. This allows (re)moving
    the messages from the *source-mailbox*, changing their contents, and
    changing the assigned IMAP flags and keywords.

<!-- @include: include/option-x.inc -->

## ARGUMENTS

*script-file*
:   Specifies the Sieve script to (compile and) execute.

    Note that this tool looks for a pre-compiled binary file with a *.svbin*
    extension and with basename and path identical to the specified script.
    Use the **-C** option to disable this behavior by forcing the script to
    be compiled into a new binary.

*source-mailbox*
:   Specifies the source mailbox containing the messages that the Sieve
    filter will act upon.

    This is the name of a mailbox, as visible to IMAP clients, except in
    UTF-8 format. The hierarchy separator between a parent and child mailbox
    is commonly '**/**' or '**.**', but this depends on your selected
    mailbox storage format and namespace configuration. The mailbox names
    may also require a namespace prefix.

    This mailbox is not modified unless the **-W** option is specified.

*discard-action*
:   Specifies what is done with messages in the *source-mailbox* that
    where not kept or otherwise stored by the Sieve script; i.e. those
    messages that would normally be discarded if the Sieve script were
    executed at delivery. The *discard-action* parameter accepts one of
    the following values:

    :   **keep**\ (default)
        :   Keep discarded messages in source mailbox.

    :   **move**\ *mailbox*
        :   Move discarded messages to the indicated *mailbox*. This is for
            instance useful to move messages to a Trash mailbox. Refer to the
            explanation of the *source-mailbox* argument for more information
            on mailbox naming.

    :   **delete**
        :   Flag discarded messages as \\DELETED.

    :   **expunge**
        :   Expunge discarded messages, meaning that these are removed
            irreversibly when the tool finishes filtering.

    When the **-W** option is not specified, the *source-mailbox* is
    immutable and the specified *discard-action* has no effect. This
    means that messages are at most *copied* to a new location. In
    contrast, when the **-W** is specified, messages that are
    successfully stored somewhere else by the Sieve script are **always**
    expunged from the *source-mailbox*, with the effect that these are
    thus *moved* to the new location. This happens irrespective of the
    specified *discard-action*. Remember: only discarded messages are
    affected by the specified *discard-action*.

<!-- TODO:
## EXAMPLES

FIXME
-->

## EXIT STATUS

**sieve-filter** will exit with one of the following values:

**0**
:   Sieve filter applied successfully. (EX_OK, EXIT_SUCCESS)

**64**
:   Command line usage error.

**65**
:   Data format error or operation is not possible.

**67**
:   User does not exist.

**68**
:   Input file, address or other resource does not exist.

**73**
:   Cannot create output file.

**75**
:   There was some temporary error, check logs.

**76**
:   Protocol error during remote host connection.

**77**
:   Permission error.

**78**
:   Configuration error.

**127**
:   Unknown error.

## FILES

*/etc/dovecot/dovecot.conf*
:   Dovecot's main configuration file.

*/etc/dovecot/conf.d/90-sieve.conf*
:   Sieve interpreter settings (included from Dovecot's main
    configuration file)

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,dovecot]], [[man,dovecot-lda]], [[man,sieve-dump]],
[[man,sieve-test]], [[man,sievec]], [[man,pigeonhole,,7]]
