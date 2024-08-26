---
layout: doc
title: doveadm-service-status
dovecotComponent: core
---

# doveadm-service-status(1) - Show information about dovecot services

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **service status** [*service* [...]]

## DESCRIPTION

**doveadm service status** produces a table with a line for each service,
containing the following details:

*name*
:   the name of the service

*process_count*
:   the number of processes actually running for the service

*process_avail*
:   the number of additional processes that can be spawned for the service

*process_limit*
:   the maximum number of processes that can be active for the service

*client_limit*
:   the maximum number of connections that the service will handle
    simultaneously

*throttle_secs*
:   seconds to wait before launching another process when processes are dying
    unexpectedly early for the service

*exit_failure_last*
:   timestamp when the last process was terminated abnormally for the service

*exit_failures_in_sec*
:   number of abnormally terminated processes for the service in the last
    second

*last_drop_warning*
:   timestamp when the last time a "dropping client connections" warning was
    logged

*listen_pending*
:   if the master process is queuing connections that need to be dispatched

*listening*
:   if service is listening

*doveadm_stop*
:   if the service has been stopped by [[man,doveadm,stop]]

*process_total*
:   the total number of processes forked for the service since the service
    start.

<!-- @include: global-options-formatter.inc -->

## ARGUMENTS

*service* (optional)
:   Filters the list according to the specified service or services.
    By default, all dovecot services are listed.

## EXAMPLES

```console
$ doveadm service status

name: fs-auth
process_count: 0
process_avail: 0
process_limit: 1
client_limit: 1000
throttle_secs: 0
exit_failure_last: 0
exit_failures_in_sec: 0
last_drop_warning: 0
listen_pending: n
listening: y
doveadm_stop: n
process_total: 0

name: fs-server
```

<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]], [[man,doveadm-process-status]]
