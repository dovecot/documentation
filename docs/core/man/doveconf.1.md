---
layout: doc
title: doveconf
dovecotComponent: core
---

# doveconf(1) - Dovecot's configuration dumping utility

## SYNOPSIS

**doveconf**
  [**-aCdFInPNUwx**]
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

**doveconf** reads and parses Dovecot's configuration files and converts them
into a simpler format used by the rest of Dovecot.

All standalone programs, such as [[man,dovecot]], will first get their settings
by executing doveconf, unless they can get the settings by connecting to the
config UNIX socket.

For system administrators, **doveconf** is mainly useful for dumping the
configuration in easy human readable output.

## OPTIONS

**-a**
:   Show all settings with their currently configured values.

**-C**
:   TODO (check full config).

**-c** *config-file*
:   Read configuration from the given *config-file*. By default
    */etc/dovecot/dovecot.conf* will be used.

**-d**
:   Show the setting's default value instead of the one currently
    configured.

**-F**
:   Show the configuration in a filter-based format, which is how Dovecot
    internally accesses it. This can be useful for debugging why configuration
    is not working as expected.

    The settings are grouped into different "structs", which are all accessed
    independently. A new struct is started in the output as `# struct_name`.

    Next is the list of filters, which begin with `:FILTER` followed by the
    filter in the event filter syntax. An empty filter matches everything.
    The filters are processed from end to beginning. The settings are taken
    from the first matching filter (i.e. the last in the output). Since not
    all filters have all settings defined, the processing continues until all
    settings have been found.

    Named list filter such as `protocols = imap pop3` are shown as
    `protocol/imap=yes` and `protocol/pop3=yes # stop list`. The "stop list"
    means that the value is not modified by any following filters that match.
    If the setting was defined as `protocols { imap=yes, pop3=yes }`, the
    "stop list" would be missing, because this setting is only adding the
    protocols, not replacing the list.

    Settings groups are included in `:INCLUDE` lines. The includes are
    processed last, after all filters have been applied, so all settings inside
    the groups can be overridden.

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

**-I**
:   TODO (dump config import).

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

**-U**
:   Ignore all unknown settings in config file.

**-w**
:   TODO (hide obsolete warnings).

**-x**
:   Expand configuration variables (e.g. `$ENV:foo`) and show file contents
    (from e.g. `ssl_server_key_password = </etc/ssl/password.txt`).

*section_name*
:   Show only the current configuration of one or more specified sections.

*setting_name*
:   Show only the setting of one or more *setting_name*(s) with the
    currently configured value. You can show a setting inside a section
    using `/` as the section separator, e.g. `service/imap/executable`.

## EXAMPLE

When Dovecot was configured to use different settings for some
networks/subnets it is possible to show which settings will be applied
for a specific connection.

```sh
doveconf -f local=10.0.0.110 -f remote=10.11.1.2 -f protocol=pop3 -n
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
