---
layout: doc
title: doveadm-process-status
dovecotComponent: core
---

# doveadm-process-status(1) - Show information about dovecot processes

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **process status** [*service* [...]]

## DESCRIPTION

**doveadm process status** produces a table with a line for each process,
containing the following details:

*name*
:   the name of the process

*pid*
:   the pid of the process

*available_count*
:   the number of further clients that can connect to the process

*total_count*
:   the number of connected clients

*idle_start*
:   timestamp when the process entered the idle status, 0 if active

*last_status_update*
:   timestamp of the latest update from the process

*last_kill_sent*
:   timestamp of the latest SIGINT signal sent to the process

*generation*
:   the configuration generation the process belongs to. This increases by one
    for every reload, so processes preserved from before a reload (see
    [[setting,service_shutdown_clients_timeout]]) have a smaller number than the
    current one.

*kill_time*
:   timestamp when the master process is going to signal the process next, or 0
    if it isn't going to. For a preserved process this is when its clients are
    disconnected.

<!-- @include: include/global-options-formatter.inc -->

## ARGUMENTS

*service* (optional)
:   Filters the processes according to the specified service or services.
    By default, all dovecot processes are listed.

## EXAMPLES

```sh
doveadm process status
```
```
name   pid    available_count total_count idle_start last_status_update last_kill_sent generation kill_time
stats  132400 999             5           0          1685365436         0              1          0
log    132356 971             29          0          1685352909         0              1          0
config 132357 999             6           0          1685365436         0              1          0
anvil  132355 1000            0           1685352908 1685352908         0              1          0
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]], [[man,doveadm-service-status]]
