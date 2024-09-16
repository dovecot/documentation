---
layout: doc
title: doveadm-stats
dovecotComponent: core
---

# doveadm-stats(1) - Inspect or reset stats

## SYNOPSIS

**doveadm stats dump** [ **-s \<stats socket path\>** ] **\<type\>** [ **\<filter\>** ]

**doveadm stats top** [ **-s \<stats socket path\>** ] [ **-b** ] [ **sort** *\<field\>* ]

**doveadm stats reset** [ **-s \<stats socket path\>** ]

**doveadm stats add** [ **-\-description** *\<string\>* ] [ **-\-exporter** *\<name\>* ] [ **-\-exporter-include** *\<field\>* ] [ **-\-fields** *\<fields\>* ] [**-\-group_by** *\<fields\>* ] **\<name\>** *\<filter\>*

**doveadm stats remove** *\<name\>*

**doveadm stats reopen**

## DESCRIPTION

**doveadm stats dump** is used to output statistics

**doveadm stats top** is used to monitor statistics

**doveadm stats reset** is used to reset statistics

**doveadm stats add** is used to add metrics to statistics

**doveadm stats remove** is used to remove metrics from statistics

**doveadm stats reopen** is used to reopen any file exporter files.

## OPTIONS

**-s** *socketpath*
:   Sets stats socket path

**-b**
:   Show disk input/output bytes

## ARGUMENTS

**dump** accepts following types: command, session, user, domain, ip and
global.

Filter can be

**user=\<wildcard\>**
:   Match given user.

**domain=\<wildcard\>**
:   Match given DNS domain name

**session=\<str\>**
:   Match session identifier

**ip=\<ip\>[/\<mask\>]**
:   Match local or remote IP

**since=\<timestamp\>**
:   Match session start time

**connected**
:   Show only connected sessions

**top** accepts any valid field name to sort along with.

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
