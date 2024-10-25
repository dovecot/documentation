---
layout: doc
title: dovecot-sysreport
dovecotComponent: core
---

# dovecot-sysreport(1) - Dovecot's system report utility

## SYNOPSIS

**dovecot-sysreport**
  [**-h|-\-help**]
  [**-c|-\-core** [*binary*] *core* [...]]
  [**-d|-\-destination** *dest*]
  [**-k|-\-keeptemp**]

## DESCRIPTION

**dovecot-sysreport** is a utility that should be used to gather
information from the current system to be reported for dovecot bug
fixes. It will collect dovecot's ps output, service status, process
status, uptime command's output, error log, stats dump and if given, a
core file along with its binary dependencies.

## OPTIONS

**-h|-\-help**
:   Prints a help message.

**-c|-\-config** *root_config_file*
:   Sets the root file of the dovecot's configuration. If not set, it
    will be assumed to be in the default configuration path.

**-o|-\-core** [ *binary* ] *core* *[...]*
:   Includes core files along with their dependencies extracted from the
    specified binary file.

**-d|-\-destination** *dest*
:   Sets the file location which the report archive should be put to. The
    default value is
    dovecot-sysreport-\<hostname\>-\<current_timestamp\>.tar.gz in the
    current path.

**-k|-\-keeptemp**
:   If set, temp files would not be deleted at the end.

<!-- @include: include/reporting-bugs.inc -->
