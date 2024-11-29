---
layout: doc
title: doveadm-mailbox
dovecotComponent: core
---

# doveadm-mailbox(1) - Commands related to handling mailboxes

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] *mailbox_cmd* [*options*] [*arguments*]

## DESCRIPTION

**doveadm mailbox** can be used to query and modify mailboxes.

<!-- @include: include/global-options-formatter.inc -->

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*mailbox*
:   Is the name of a *mailbox*, as visible to IMAP clients, except in
    UTF-8 format. The hierarchy separator between a parent and child
    mailbox is commonly '**/**' or '**.**', but this depends on your
    selected mailbox storage format and namespace configuration. The
    mailbox names may also require a namespace prefix.

## COMMANDS

### mailbox create

**doveadm** [*GLOBAL OPTIONS*] mailbox create [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-g** *guid*] [**-s**] *mailbox*...

This command is used to create one or more mailboxes. The mailbox format
of the created mailboxes depends on the *mail_location* setting, or the
user's *mail* field, returned by the userdb.

**-g** *guid*
:   Create the mailbox with the specified GUID.

**-s**
:   When this option was given, the created mailboxes will be also added
    to the user's subscriptions.

### mailbox cryptokey

**doveadm** [*GLOBAL OPTIONS*] mailbox cryptokey **export|generate|list|password**

This command is used to manage mail crypt plugin cryptographic keys.
Please see [[man,doveadm-mailbox-cryptokey]] for more details.

### mailbox delete

**doveadm** [*GLOBAL OPTIONS*] mailbox delete [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-s**] [**-r**] [**-e**] [**-Z**] *mailbox*...

This command deletes a mailbox and expunges all the messages it
contains. If the mailbox has any children, they won't be deleted, unless
**-r** is given.

**-r**
:   Delete mailboxes recursively

**-s**
:   Unsubscribe deleted mailboxes.

**-e**
:   Require mailboxes to be empty before deleting.

**-Z**
:   Delete the mailbox as efficiently as possible, but the user may not
    be in fully consistent state afterwards. For example quota may be
    wrong. This option is mainly useful when deleting the entire user.

### mailbox list

**doveadm** [*GLOBAL OPTIONS*] mailbox list [**-7** | **-8**] [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-s**] [*mailbox* ...]

To get an overview of existing mailboxes use this command. It's also
possible to use wildcards in the *mailbox* name.

When the **-s** option is present, only subscribed mailboxes will be
listed. Listed subscriptions may also contain mailboxes that are
already deleted.

**-7**
:   Lists the mailboxes with mUTF-7 encoding.

**-8**
:   Lists the mailboxes with UTF-8 encoding.

### mailbox metadata list

**doveadm** [*GLOBAL OPTIONS*] mailbox metadata list [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-s**] [**-p**] *mailbox* [*key-prefix*]

**-s**
:   Allows to specify *mailbox* "", which points to the server metadata
    instead of mailboxes' matadata. It has no effect if mailbox is anything
    else than an empty string.

**-p**
:   Prepend prefix.

*mailbox*
:   The target mailbox (mandatory). If **-s** is specified, the empty
    string "" can be used to indicate access to server metadata.

*key-prefix*
:   The key prefix to look for. All keys will be listed if not provided.

### mailbox metadata get

**doveadm** [*GLOBAL OPTIONS*] mailbox metadata get [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-s**] *mailbox* *key*

**-s**
:   Allows to specify *mailbox* "", which points to the server metadata
    instead of mailboxes' matadata. It has no effect if mailbox is anything
    else than an empty string.

*mailbox*
:   The target mailbox (mandatory). If **-s** is specified, the empty
    string "" can be used to indicate access to server metadata.

*key*
:   The key to retrieve.

### mailbox metadata set

**doveadm** [*GLOBAL OPTIONS*] mailbox metadata set [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-s**] *mailbox* *key* *value*

**-s**
:   Allows to specify *mailbox* "", which points to the server metadata
    instead of mailboxes' matadata. It has no effect if mailbox is anything
    else than an empty string.

*mailbox*
:   The target mailbox (mandatory). If **-s** is specified, the empty
    string "" can be used to indicate access to server metadata.

*key*
:   The key to set.

*value*
:   The value to set.

### mailbox metadata unset

**doveadm** [*GLOBAL OPTIONS*] mailbox metadata unset [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-s**] *mailbox* *key*

**-s**
:   Allows to specify *mailbox* "", which points to the server metadata
    instead of mailboxes' matadata. It has no effect if mailbox is anything
    else than an empty string.

*mailbox*
:   The target mailbox (mandatory). If **-s** is specified, the empty
    string "" can be used to indicate access to server metadata.

*key*
:   The key to unset.

### mailbox mutf7

**doveadm** [*GLOBAL OPTIONS*] mailbox mutf7 [**-7** | **-8**] *name*...

The **mailbox mutf7** command may be used to convert the international
mailbox *name* into a modified version of the UTF-7 encoding and vice
versa. See [[rfc,3501,5.1.3]] (Mailbox International Naming
Convention).

**-7**
:   Indicates that the *name*'s string representation is mUTF-7 encoded
    and it should be converted to UTF-8.

**-8**
:   Indicates that the *name*'s is UTF-8 encoded and should be converted
    to mUTF-7 (default).

*name*
:   One or more mailbox names that should be converted.

### mailbox path

**doveadm** [*GLOBAL OPTIONS*] mailbox path [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-s**] [**-t** *type*] *mailbox*

The **mailbox path** command returns the filesystem path for the given
mailbox.  By default, this is the path to the "index" directory.

**-t** *type*
:   Output the path to this mailbox location type.  One of:

    - **alt-dir**
    - **alt-mailbox**
    - **control**
    - **dir**
    - **index** (DEFAULT)
    - **index-cache**
    - **index-private**
    - **list-index**
    - **mailbox**

*mailbox*
:   The mailbox to query (mandatory).

### mailbox rename

**doveadm** [*GLOBAL OPTIONS*] mailbox rename [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-s**] *old_name* *new_name*

The **mailbox rename** command is used to rename the mailbox
*old_name* to *new_name*.

When the **-s** option is given, *old_name* will be unsubscribed and
*new_name* will be subscribed.

### mailbox status

**doveadm** [*GLOBAL OPTIONS*] mailbox status [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-t**] *fields* *mailbox*...

Show the **status** of one or more mailboxes. The *mailbox* name may
also contain wildcards.

This command uses by default the output *formatter* **flow**.

**-t**
:   Summarize the values of the status *fields* **messages**, **recent**,
    **unseen** and/or **vsize** of multiple mailboxes to a sum (total).

**fields**
:   Specify the status *fields* which should be shown.

    In order to specify multiple status *fields*, enclosed them in quotes.

    :   **all**
        :   This is a special status field name. It means show all of the
            following *fields*. When the **-t** option is present, it means
            show only the **messages**, **recent**, **unseen** and **vsize**
            *fields*.

    :   **guid**
        :   The *mailbox*'s globally unique identifier.

    :   **highestmodseq**
        :   The highest mod-sequence value of all messages in the *mailbox*.

    :   **messages**
        :   The number of messages in the *mailbox*.

    :   **recent**
        :   The number of messages with the \\Recent flag set.

    :   **uidnext**
        :   The next unique identifier value.

    :   **uidvalidity**
        :   The unique identifier validity value.

    :   **unseen**
        :   The message sequence number of the first unseen message in the
            *mailbox*.

    :   **vsize**
        :   The *mailbox*'s virtual size, computed with CRLF line terminators.

    :   **firstsaved**
        :   Saved time of the first mail in the mailbox.

### mailbox subscribe

**doveadm** [*GLOBAL OPTIONS*] mailbox subscribe [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *mailbox* *...*

This command is used to subscribe one or more mailboxes.

### mailbox unsubscribe

**doveadm** [*GLOBAL OPTIONS*] mailbox unsubscribe [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *mailbox* *...*

This command is used to unsubscribe one or more mailboxes.

### mailbox update

**doveadm** [*GLOBAL OPTIONS*] mailbox update [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-\-mailbox-guid** *guid*] [**-\-uid-validity** *uid*] [**-\-min-next-uid** *uid*] [**-\-min-first-recent-uid** *uid*] [**-\-min-highest-modseq** *seq*] [**-\-min-highest-pvt-modseq** *seq*] *mailbox* *...*

This command is used to set UID validity, next UID, first recent UID and
modification sequence values.

Usually this is only ever to be used during migration, or restoring
mailbox after disaster. Settings these values is highly discouraged, and
is not supported for all mail backends.

### mailbox cache purge

**doveadm** [*GLOBAL OPTIONS*] mailbox cache purge [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *mailbox* *...*

Purge the dovecot.index.cache file. Most importantly this frees up disk
space from mails that were already deleted. Normally there i no need to
run this command manually, because the compression is also run
automatically.

### mailbox cache decision

**doveadm** [*GLOBAL OPTIONS*] mailbox cache decision [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-\-all**] [**-\-fields** *list of fields*] [**-\-last-used** *unix timestamp*] [**-\-decision** *no|temp|yes*] *mailbox* *...*

This command is used to list or change caching decisions for field(s) in
mailbox(es). You can list decisions by leaving out decision and
last-used parameters.

**-\-all**
:   List or change all fields.

**-\-fields**
:   List or change these comma/space separated fields.

**-\-decision**
:   Set field caching decision. Yes means it's always cached. Temp means
    it's provisionally cached. No means the field is not cached.

**-\-last-used**
:   Set field's last used timestamp.

NOTE: This command cannot be used to add new fields to cache! You need
to first add them to configuration. Setting caching to no will not
immediately drop field from cache, it will stop adding the field to
cache.

### mailbox cache remove

**doveadm** [*GLOBAL OPTIONS*] mailbox cache remove [**-A** | **-u** *user* | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *search query*

Remove any matching mail(s) from cache.

WARNING! This command can erase ALL cached data, causing system
slowness.

See [[man,doveadm-search-query,,7]] for the search query syntax.

## EXAMPLE

List subscribed mailboxes, beginning with 'dovecot', of user bob:

```sh
doveadm mailbox list -s -u bob dovecot\*
```
```
dovecot
dovecot/pigeonhole
dovecot/pigeonhole/2.0
```

Now have a look at the status of user bob's dovecot mailboxes:

```sh
doveadm -f table mailbox status -u bob "messages vsize" dovecot\*
```
```
mailbox                                    messages vsize
dovecot                                    20501    93968492
dovecot/pigeonhole                         0        0
dovecot/pigeonhole/2.0                     47       323474
```

Converting an internationalized mailbox name from mUTF-7 to UTF-8 and
vice versa:

```sh
doveadm mailbox mutf7 -7 "~peter/mail/&U,BTFw-/&ZeVnLIqe-"
```
```
~peter/mail/台北/日本語
```
```sh
doveadm mailbox mutf7 ~peter/mail/台北/日本語
```
```
~peter/mail/&U,BTFw-/&ZeVnLIqe-
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
