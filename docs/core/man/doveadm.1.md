---
layout: doc
title: doveadm
---

<style module>
.indent {
  padding-left: 30px;
}
</style>

# doveadm

## NAME

doveadm - Dovecot's administration utility

## SYNOPSIS

**doveadm** [**-DOkv**] [**-i** *instance-name*] [**-c** *config-file*] [**-o** *key*<!-- -->**=**<!-- -->*value* [ .. ]] [**-f** *formatter*] *command* [*command_options*] [*command_arguments*]

## DESCRIPTION

**doveadm** is the Dovecot administration tool. It can be used to
manage various parts of Dovecot, as well as access users' mailboxes.

Execute **doveadm help**, for a command usage listing.

<!-- @include: include/global-options-formatter.inc -->

## COMMANDS

These commands work directly with Dovecot's master process.

### reload

#### doveadm reload

<div :class="$style.indent">

Force [[man,dovecot]] to reload the configuration.

</div>

### stop

#### doveadm stop

<div :class="$style.indent">

Stop [[man,dovecot]] and all its child processes.

</div>

### ADDITIONAL MASTER COMMANDS

#### doveadm config

<div :class="$style.indent">

[[man,doveconf]], Dump Dovecot configuration.

</div>

#### doveadm exec

<div :class="$style.indent">

[[man,doveadm-exec]], Easily execute commands from Dovecot's libexec_dir.

</div>

#### doveadm instance

<div :class="$style.indent">

[[man,doveadm-instance]], Manage the list of running Dovecot instances.

</div>

#### doveadm kick

<div :class="$style.indent">

[[man,doveadm-kick]], Disconnect users by user name and/or IP address.

</div>

#### doveadm log

<div :class="$style.indent">

[[man,doveadm-log]], Locate, test or reopen Dovecot's log files.

</div>

#### doveadm penalty

<div :class="$style.indent">

[[man,doveadm-penalty]], Show current penalties.

</div>

#### doveadm proxy

<div :class="$style.indent">

[[man,doveadm-proxy]], Handle Dovecot proxy connections.

</div>

#### doveadm who

<div :class="$style.indent">

[[man,doveadm-who]], Show who is logged into the Dovecot server.

</div>

### AUTHENTICATION COMMANDS

#### doveadm auth

<div :class="$style.indent">

[[man,doveadm-auth]], Test authentication for a user.

</div>

#### doveadm pw

<div :class="$style.indent">

[[man,doveadm-pw]], Dovecot's password hash generator.

</div>

#### doveadm user

<div :class="$style.indent">

[[man,doveadm-user]], Perform a user lookup in Dovecot's userdbs

</div>

### MAILBOX COMMANDS

#### doveadm acl

<div :class="$style.indent">

[[man,doveadm-acl]], Manage Access Control List (ACL).

</div>

#### doveadm altmove

<div :class="$style.indent">

[[man,doveadm-altmove]], Move matching mails to the alternative storage.

</div>

#### doveadm backup

<div :class="$style.indent">

[[man,doveadm-sync]], Dovecot's one-way mailbox synchronization utility.

</div>

#### doveadm copy

<div :class="$style.indent">

[[man,doveadm-move]], Copy/move messages matching the given search query
into another mailbox.

</div>

#### doveadm deduplicate

<div :class="$style.indent">

[[man,doveadm-deduplicate]], Expunge duplicate messages.

</div>

#### doveadm dump

<div :class="$style.indent">

[[man,doveadm-dump]], Dump the content of Dovecot's binary mailbox index/log.

</div>

#### doveadm expunge

<div :class="$style.indent">

[[man,doveadm-expunge]], Expunge messages matching given search query.

</div>

#### doveadm fetch

<div :class="$style.indent">

[[man,doveadm-fetch]], Fetch messages matching given search query.

</div>

#### doveadm flags

<div :class="$style.indent">

[[man,doveadm-flags]], Add, remove or replace messages' flags.

</div>

#### doveadm force-resync

<div :class="$style.indent">

[[man,doveadm-force-resync]], Repair broken mailboxes, in case
Dovecot doesn't automatically do that.

</div>

#### doveadm fs

<div :class="$style.indent">

[[man,doveadm-fs]], Interact with the abstract mail storage filesystem.

</div>

#### doveadm fts

<div :class="$style.indent">

[[man,doveadm-fts]], Manipulate the Full Text Search (FTS) index.

</div>

#### doveadm import

<div :class="$style.indent">

[[man,doveadm-import]], Import messages matching given search query.

</div>

#### doveadm index

<div :class="$style.indent">

[[man,doveadm-index]], Index messages in a given mailbox.

</div>

#### doveadm mailbox

<div :class="$style.indent">

[[man,doveadm-mailbox]], Various commands related to handling mailboxes.

</div>

#### doveadm mailbox cryptokey

<div :class="$style.indent">

[[man,doveadm-mailbox-cryptokey]], Mail crypt plugin management.

</div>

#### doveadm move

<div :class="$style.indent">

[[man,doveadm-move]], Move messages matching the given search query
into another mailbox.

</div>

#### doveadm purge

<div :class="$style.indent">

[[man,doveadm-purge]], Remove messages with refcount=0 from mdbox
files.

</div>

#### doveadm quota

<div :class="$style.indent">

[[man,doveadm-quota]], Initialize/recalculate or show current quota usage.

</div>

#### doveadm rebuild

<div :class="$style.indent">

[[man,doveadm-rebuild]], Rebuild index metadata from message data.

</div>

#### doveadm save

<div :class="$style.indent">

[[man,doveadm-save]], Save email to users' mailboxes.

</div>

#### doveadm search

<div :class="$style.indent">

[[man,doveadm-search]], Show a list of mailbox GUIDs and message
UIDs matching given search query.

</div>

#### doveadm stats

<div :class="$style.indent">

[[man,doveadm-stats]], Inspect or reset stats.

</div>

#### doveadm sync

<div :class="$style.indent">

[[man,doveadm-sync]], Dovecot's two-way mailbox synchronization utility.

</div>

## EXIT STATUS

**doveadm** will exit with one of the following values:

**0**
:   Selected command was executed successful.

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

## ENVIRONMENT

**USER**
:   This environment variable is used to determine the *user* if a
    command accepts a *user* but none was specified.

## FILES

*/etc/dovecot/dovecot.conf*
:   Dovecot's main configuration file.

*/etc/dovecot/conf.d/10-mail.conf*
:   Mailbox locations and namespaces.

*/etc/dovecot/conf.d/90-plugin.conf*
:   Plugin specific settings.

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm-help]]
