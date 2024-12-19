---
layout: doc
title: doveadm-service-stop
dovecotComponent: core
---

# doveadm-service-stop(1) - Stop Dovecot Services

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **service stop** *service* [*service* [...]]

## DESCRIPTION

**doveadm service stop** stops the listed Dovecot service processes.

<!-- @include: include/global-options-formatter.inc -->

## ARGUMENTS

*service*
:   The list of services to stop.

## EXAMPLES

```console
$ doveadm service stop stats
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
