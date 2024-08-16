---
layout: doc
title: doveadm
dovecotComponent: core
---

<style module>
.indent {
  padding-left: 30px;
}
</style>

# doveadm(1) - Dovecot's administration utility

## SYNOPSIS

**doveadm** [**-DOkv**] [**-i** *instance-name*] [**-c** *config-file*] [**-o** *key*<!-- -->**=**<!-- -->*value* [ .. ]] [**-f** *formatter*] *command* [*command_options*] [*command_arguments*]

## DESCRIPTION

**doveadm** is the Dovecot administration tool. It can be used to
manage various parts of Dovecot, as well as access users' mailboxes.

Execute **doveadm help**, for a command usage listing.

<!-- @include: global-options-formatter.inc -->

## COMMANDS

These commands work directly with Dovecot's master process.

### doveadm reload

Force [[man,dovecot]] to reload the configuration.

### doveadm stop

Stop [[man,dovecot]] and all its child processes.

## ADDITIONAL MASTER COMMANDS

### doveadm config

[[man,doveconf]], Dump Dovecot configuration.

### doveadm exec

[[man,doveadm-exec]], Easily execute commands from Dovecot's libexec_dir.

### doveadm instance

[[man,doveadm-instance]], Manage the list of running Dovecot instances.

### doveadm kick

[[man,doveadm-kick]], Disconnect users by user name and/or IP address.

### doveadm log

[[man,doveadm-log]], Locate, test or reopen Dovecot's log files.

### doveadm penalty

[[man,doveadm-penalty]], Show current penalties.

### doveadm proxy

[[man,doveadm-proxy]], Handle Dovecot proxy connections.

### doveadm who

[[man,doveadm-who]], Show who is logged into the Dovecot server.

## AUTHENTICATION COMMANDS

### doveadm auth

[[man,doveadm-auth]], Test authentication for a user.

### doveadm pw

[[man,doveadm-pw]], Dovecot's password hash generator.

### doveadm user

[[man,doveadm-user]], Perform a user lookup in Dovecot's userdbs

## MAILBOX COMMANDS

### doveadm acl

[[man,doveadm-acl]], Manage Access Control List (ACL).

### doveadm altmove

[[man,doveadm-altmove]], Move matching mails to the alternative storage.

### doveadm backup

[[man,doveadm-sync]], Dovecot's one-way mailbox synchronization utility.

### doveadm copy

[[man,doveadm-move]], Copy/move messages matching the given search query
into another mailbox.

### doveadm deduplicate

[[man,doveadm-deduplicate]], Expunge duplicate messages.

### doveadm dump

[[man,doveadm-dump]], Dump the content of Dovecot's binary mailbox index/log.

### doveadm expunge

[[man,doveadm-expunge]], Expunge messages matching given search query.

### doveadm fetch

[[man,doveadm-fetch]], Fetch messages matching given search query.

### doveadm flags

[[man,doveadm-flags]], Add, remove or replace messages' flags.

### doveadm force-resync

[[man,doveadm-force-resync]], Repair broken mailboxes, in case
Dovecot doesn't automatically do that.

### doveadm fs

[[man,doveadm-fs]], Interact with the abstract mail storage filesystem.

### doveadm fts

[[man,doveadm-fts]], Manipulate the Full Text Search (FTS) index.

### doveadm import

[[man,doveadm-import]], Import messages matching given search query.

### doveadm index

[[man,doveadm-index]], Index messages in a given mailbox.

### doveadm mailbox

[[man,doveadm-mailbox]], Various commands related to handling mailboxes.

### doveadm mailbox cryptokey

[[man,doveadm-mailbox-cryptokey]], Mail crypt plugin management.

### doveadm move

[[man,doveadm-move]], Move messages matching the given search query
into another mailbox.

### doveadm purge

[[man,doveadm-purge]], Remove messages with refcount=0 from mdbox
files.

### doveadm quota

[[man,doveadm-quota]], Initialize/recalculate or show current quota usage.

### doveadm rebuild

[[man,doveadm-rebuild]], Rebuild index metadata from message data.

### doveadm save

[[man,doveadm-save]], Save email to users' mailboxes.

### doveadm search

[[man,doveadm-search]], Show a list of mailbox GUIDs and message
UIDs matching given search query.

### doveadm stats

[[man,doveadm-stats]], Inspect or reset stats.

### doveadm sync

[[man,doveadm-sync]], Dovecot's two-way mailbox synchronization utility.

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

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm-help]]
