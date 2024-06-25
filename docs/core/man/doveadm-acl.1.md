---
layout: doc
title: doveadm-acl
---

# doveadm-acl

## NAME

doveadm-acl - Manage Access Control List (ACL)

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **acl** *command* [*OPTIONS*] [*ARGUMENTS*]

## DESCRIPTION

The **doveadm acl** *COMMANDS* can be used to execute various Access
Control List related actions.

<!-- @include: include/global-options-formatter.inc -->

This command uses by default the output formatter **table**.

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*id*
:   The id (identifier) is one of:

    * **group-override** = *group_name*
    * **user** = *user_name*
    * **owner**
    * **group** = *group_name*
    * **authenticated**
    * **anyone**
    * **anonymous**, which is an alias for anyone

    The ACLs are processed in the precedence given above, so for
    example if you have given read-access to a group, you can still
    remove that from specific users inside the group.

    Group-override identifier allows you to override users' ACLs.
    Probably the most useful reason to do this is to temporarily
    disable access for some users. For example:

    ```
    user=timo rw
    group-override=tempdisabled
    ```

   Now if timo is a member of the tempdisabled group, he has no access
   to the mailbox. This wouldn't be possible with a normal group
   identifier, because the **user=timo** would override it.

*mailbox*
:   The name of the mailbox, for which the ACL manipulation should be
    done. It's also possible to use the wildcard characters "*****"
    and/or "**?**" in the mailbox name.

*right*
:   Dovecot ACL right name. This isn't the same as the IMAP ACL letters,
    which aren't currently supported.

    Here is a mapping of the IMAP ACL letters to Dovecot ACL names:
    :   **l -> lookup**
        :   *Mailbox* is visible in mailbox list. *Mailbox* can be
            subscribed to.

    :   **r -> read**
        :   *Mailbox* can be opened for reading.

    :   **w -> write**
        :   Message flags and keywords can be changed, except **\Seen**
            and **\Deleted**.

    :   **s -> write-seen**
        :   **\Seen** flag can be changed.

    :   **t -> write-deleted**
        :   **\Deleted** flag can be changed.

    :   **i -> insert**
        :   Messages can be written or copied to the *mailbox*.

    :   **p -> post**
        :   Messages can be posted to the *mailbox* by **dovecot-lda**,
            e.g. from Sieve scripts.

    :   **e -> expunge**
        :   Messages can be expunged.

    :   **k -> create**
        :   Mailboxes can be created/renamed directly under this
            *mailbox* (but not necessarily under its children, see
	    [[link,acl_inheritance]].
            Note: Renaming also requires the delete right.

    :   **x -> delete**
        :   *Mailbox* can be deleted.

    :   **a -> admin**
        :   Administration rights to the *mailbox* (currently: ability to
            change ACLs for *mailbox*).

## COMMANDS

### acl add

**doveadm** [*GLOBAL OPTIONS*] acl add [**-u** *user* | **-A** | **-F** *file* || **\-\-no-userdb-lookup**] [**-S** *socket_path*] *mailbox id* *right* [*right* ...]

Add ACL rights to the *mailbox*/*id*. If the *id* already exists, the
existing rights are preserved.

### acl debug

**doveadm** [*GLOBAL OPTIONS*] acl debug [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *mailbox*

This command can be used to debug why a shared mailbox isn't accessible
to the user. It will list exactly what the problem is.

### acl delete

**doveadm** [*GLOBAL OPTIONS*] acl delete [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *mailbox id*

Remove the whole ACL entry for the *mailbox*/*id*.

### acl get

**doveadm** [*GLOBAL OPTIONS*] acl get [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] [**-m**] *mailbox*

Show all the ACLs for the *mailbox*.

### acl recalc

**doveadm** [*GLOBAL OPTIONS*] acl recalc [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*]

Make sure the *user*'s shared mailboxes exist correctly in the
*acl_shared_dict*.

### acl remove

**doveadm** [*GLOBAL OPTIONS*] acl remove [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *mailbox id* *right* [*right* ...]

Remove the specified ACL rights from the *mailbox*/*id*. If all rights
are removed, the entry still exists without any rights.

### acl rights

**doveadm** [*GLOBAL OPTIONS*] acl rights [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *mailbox*

Show the *user*'s current ACL rights for the *mailbox*.

### acl set

**doveadm** [*GLOBAL OPTIONS*] acl set [**-u** *user* | **-A** | **-F** *file* | **\-\-no-userdb-lookup**] [**-S** *socket_path*] *mailbox id* *right* [*right* ...]

Set ACL rights to the *mailbox*/*id*. If the *id* already exists, the
existing rights are replaced.

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]

Additional resources:

- [[link,acl_inheritance]]
