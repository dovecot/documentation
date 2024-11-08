---
layout: doc
title: doveconf
dovecotComponent: core
---

# doveconf(1) - Dovecot's configuration dumping utility

## SYNOPSIS

**doveconf**
  [**-adnPNx**]
  [**-c** *config-file*]
  [**-f** *filter*]

**doveconf**
  [**-n**]
  [**-c** *config-file*]
  *section_name* ...

**doveconf**
  [**-h**]
  [**-c** *config-file*]
  [**-f** *filter*]
  *setting_name* ...

## DESCRIPTION

**doveconf** reads and parses Dovecot's configuration files and converts
them into a simpler format used by the rest of Dovecot. All standalone
programs, such as [[man,dovecot]], will first get their settings by executing
doveconf.

For system administrators, **doveconf** is mainly useful for dumping the
configuration in easy human readable output.

## OPTIONS

**-a**
:   Show all settings with their currently configured values.

**-c** *config-file*
:   Read configuration from the given *config-file*. By default
    */etc/dovecot/dovecot.conf* will be used.

**-d**
:   Show the setting's default value instead of the one currently
    configured.

**-f** *filter*
:   Show the matching configuration for the specified *filter*
    condition. The *filter* option string has to be given as
    *name* **=** *value* pair. For multiple filter conditions the
    **-f** option can be supplied multiple times.

    Possible names for the *filter* are:
    :   **protocol**
        :   The protocol, e.g. imap or pop3

    :   **local_name**
        :   The local hostname for TLS SNI matching, e.g. mail.example.com.

            This matches filters which were configured like:
            :   **local_name mail.example.com { # special settings }**

    :   **local**
        :   The local hostname or IP address.

            This matches filters which were configured like:
            :   **local 1.2.3.0/24 { # special settings }**

    :   **remote**
        :   The client's hostname or IP address.

            This matches filters which were configured like:
            :   **remote 1.2.3.0/24 { # special settings }**

**-h**
:   Hide the setting's name, show only the setting's value.

**-n**
:   Show only settings with non-default values. This is the default behavior
    when no other parameters are given.

**-N**
:   Show settings with non-default values and explicitly set default values.

**-s**
:   Show also hidden settings. The hidden settings should not be changed
    normally.

**-P**
:   Show passwords and other sensitive values.

**-x**
:   Expand configuration variables (e.g. `$ENV:foo`) and show file contents
    (from e.g. `ssl_cert = \</etc/ssl/certs/dovecot.pem`).

*section_name*
:   Show only the current configuration of one or more specified sections.

*setting_name*
:   Show only the setting of one or more *setting_name* (s) with the
:   currently configured value. You can show a setting inside a section
:   using '/' as the section separator, e.g. service/imap/executable.

## EXAMPLE

When Dovecot was configured to use different settings for some
networks/subnets it is possible to show which settings will be applied
for a specific connection.

```sh
doveconf -f local=10.0.0.110 -f remote=10.11.1.2 -f protocol=pop3 -n
```

**doveconf** can be also used to convert v1.x configuration files into
v2.x format.

```sh
doveconf -n -c /oldpath/dovecot.conf > /etc/dovecot/dovecot.conf.new
```

Ask **doveconf** for a global setting:

```sh
doveconf mail_plugins
```
```
mail_plugins = quota
```

Ask **doveconf** for a protocol specific setting. Uses the **-h**
option, in order to hide the setting's name:

```sh
doveconf -h -f protocol=imap login_greeting
```
```
Dovecot ready.
```

Dump a whole configuration section:

```sh
doveconf service
```
```
service imap {
  ...
}
service pop3 {
  ...
}
```

Or dump only the imap service:

```sh
doveconf service/imap
```
```
service imap {
  ...
}
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
