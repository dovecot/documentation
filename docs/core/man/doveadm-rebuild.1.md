---
layout: doc
title: doveadm-rebuild
dovecotComponent: core
---

# doveadm-rebuild(1) - Commands related to rebuilding various aspects of mails matching given search query.

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **rebuild** \<command\>
  [**-S** *socket_path*]
  **-A** *search_query*

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **rebuild** \<command\>
  [**-S** *socket_path*]
  **-F** *file* *search_query*

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **rebuild** \<command\>
  [**-S** *socket_path*]
  **\-\-no-userdb-lookup** *search_query*

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **rebuild** \<command\>
  [**-S** *socket_path*]
  **-u** *user* *search_query*

## DESCRIPTION

The **rebuild attachments** command is used to rebuilds attachment
presence. [[man,doveadm]] will print the message's uid for each match.

When used with the **-A** or **-u** *wildcard* options,
[[man,doveadm]] will print the fields **username** and **uid** for
each matching message.

In the first form, [[man,doveadm]] will execute the **rebuild** action for
all users.

In the second form, the command will be performed for all users listed in
the given *file*.

In the third form, the command will be performed for the user contained in the
*USER* environment variable.

In the last form, only matching mails of the given *user* (s) will be
rebuilt

<!-- @include: global-options-formatter.inc -->

This command uses by default the output formatter **flow** (without the
*key* = prefix).

## OPTIONS

<!-- @include: option-A.inc -->

<!-- @include: option-F-file.inc -->

<!-- @include: option-no-userdb-lookup.inc -->

<!-- @include: option-S-socket.inc -->

<!-- @include: option-u-user.inc -->

## ARGUMENTS

*search_query*
:   Resets attachment indicator for messages matching this search query.
    See [[man,doveadm-search-query,,7]] for details.

## EXAMPLE

Rebuild user bob's attachment status:

```sh
doveadm rebuild attachments -u bob ALL
```
```
1
2
3
```

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
