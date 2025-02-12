---
layout: doc
title: doveadm-user
dovecotComponent: core
---

# doveadm-user(1) - Perform a user lookup in Dovecot's userdbs

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **user**
  [**-a** *userdb_socket_path*]
  [**-f** *field*]
  [**-u**]
  [**-x** *auth_info*]
  *user*...

## DESCRIPTION

The **user** command is used to perform a user lookup - to show what
information Dovecot sees about the *user* (s), or if it exists at all
in the configured *userdb* (s).

The *auth_info* may be useful when the userdb is for example a SQL
database and you are using %variables, like **%{protocol}** or **%{local_ip}**,
in the *userdb_sql_query* setting. Or when you have configured the userdb in a
way like this:

```
userdb passwd-file {
  passwd_file_path = /etc/%{protocol}.passwd
}
```

<!-- @include: include/global-options.inc -->

## OPTIONS

**-a** *userdb_socket_path*
:   This option is used to specify an absolute path to an alternative
    UNIX domain socket.

    By default [[man,doveadm]] will use the socket */rundir/auth-userdb*.
    The socket may be located in another directory, when the default
    *base_dir* setting was overridden in */etc/dovecot/dovecot.conf*.

**-f** *field*
:   When this option and the name of a userdb field is given,
    [[man,doveadm]] will show only the value of the specified field.

**-u**
:   When this option is given, [[man,doveadm]] will only show values
    from the *userdb*. Without -u parameter if any of the *uid*, *gid*,
    *home* or *mail_path* fields are missing, their defaults are taken from
    configuration file.

<!-- @include: include/option-x.inc -->

## ARGUMENTS

*user*
:   Is a *user*'s login name. Depending on the configuration, a login
    name may be for example **jane** or **john@example.com**. It's also
    possible to use '**\***' and '**?**' wildcards (e.g. `-u
    \*@example.org`).

## EXAMPLE

Perform a user lookup for the users jane and john@example.com:

```sh
doveadm user jane john@example.com
```
```
userdb: jane
  uid       : 8001
  gid       : 8001
  home      : /home/jane
  mail_path : ~/sdbox
  plugins   : sieve
  quota_storage_size: 150M

userdb: john@example.com
  home      : /srv/mail/8/70312/79832
  uid       : 79832
  gid       : 70312
  mail_path : ~/mdbox
```

User lookup, using wildcards:

```sh
doveadm user \*.?oe@example.net
```
```
jane.doe@example.net
judy.roe@example.net
john.doe@example.net
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
