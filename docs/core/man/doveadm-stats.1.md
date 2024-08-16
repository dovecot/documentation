---
layout: doc
title: doveadm-stats
dovecotComponent: core
---

# doveadm-stats(1) - Inspect or reset stats

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **stats add** [ **-\-description** *\<string\>* ] [ **-\-exporter** *\<name\>* ] [ **-\-exporter-include** *\<fields\>* ] [ **-\-fields** *\<fields\>* ] [**-\-group_by** *\<fields\>* ] *name* *\<filter\>*

**doveadm** [*GLOBAL OPTIONS*] **stats dump** [ **-s** *\<stats socket path\>* ] [ **-r** ] [ **-f** *\<fields\>* ]

**doveadm** [*GLOBAL OPTIONS*] **stats top** [**-s \<stats socket path\>**] [**-b**] [**sort** *\<field\>*]

**doveadm** [*GLOBAL OPTIONS*] **stats remove** [ *\<name\>* ]

**doveadm** [*GLOBAL OPTIONS*] **stats reopen**

## DESCRIPTION

Commands to inspect and edit Dovecot stats/metrics generation.

<!-- @include: include/global-options.inc -->

## COMMANDS

### stats add

**doveadm** [*GLOBAL OPTIONS*] **stats add** [ **-\-description** *\<string\>* ] [ **-\-exporter** *\<name\>* ] [ **-\-exporter-include** *\<fields\>* ] [ **-\-fields** *\<fields\>* ] [**-\-group_by** *\<fields\>* ] *name* *\<filter\>*

**doveadm stats add** is used to add metrics to statistics.

#### OPTIONS

**--description** *\<string\>*
:   Human-readable description of the metric. This is included in the HELP text
    sent to OpenMetrics.

**--exporter** *\<name\>*
:   Export events matching the filter with this event exporter.
    If empty, the events are used only for statistics, and no exporting is done.

**--exporter-include** *\<fields\>*
:   Specifies which parts of the event are exported to the serialized event.
    The fields are space-separated.

**--fields** *\<fields\>*
:   A list of fields included in the metric. All events have a default `duration`
    field that does not need to be listed explicitly.

**--group-by** *\<fields\>*
:   Creates a new group_by for dynamically generating sub-metrics based on the
    specified field's values.

#### ARGUMENTS

*name*
:   Metric name.

*filter*
:   Filter options:

    - **user=\<wildcard\>**
      :   Match user.

    - **domain=\<wildcard\>**
      :   Match DNS domain name.

    - **session=\<str\>**
      :   Match session identifier.

    - **ip=\<ip\>[/\<mask\>]**
      :   Match local or remote IP.

    - **since=\<timestamp\>**
      :   Match session start time.

    - **connected**
      :   Show only connected sessions.

### stats dump

**doveadm** [*GLOBAL OPTIONS*] **stats dump** [ **-s** *\<stats socket path\>* ] [ **-r** ] [ **-f** *\<fields\>* ]

**doveadm stats dump** is used to output statistics.

#### OPTIONS

**-f**
:   TODO

**-r**
:   Resets statistics after dumping.

**-s** *socketpath*
:   Stats socket path.

### stats remove

**doveadm** [*GLOBAL OPTIONS*] **stats remove** [ *\<name\>* ]

**doveadm stats remove** is used to remove metrics from statistics.

#### ARGUMENTS

*name*

:   The metric name to remove.

### stats reopen

**doveadm** [*GLOBAL OPTIONS*] **stats reopen**

**doveadm stats reopen** is used to reopen any file exporter files.

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
