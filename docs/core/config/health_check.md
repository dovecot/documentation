---
layout: doc
title: Health Checking
---

# Health Check Scripting

If you need dovecot to offer health-check functionality, use the health-check
service by extending it's configuration with a listener like this:

```[dovecot.conf]
service health-check {
  # this is the default configuration using the simple PING->PONG
  # example health-check.
  executable = script -p health-check.sh
  inet_listener health-check {
    port = 5001
  }
}
```

## Options

### `-e` Parameter

Define a list of environment variables which can be set by a request before
calling the health-check script.

Example: `script -e foo bar health-check.sh` sets `FOO=BAR` environment
variable.

### `-p` Parameter

Enables passthrough mode which allows to directly call a script without
any protocol and directly receive the output.

Be extremely careful when modifying the `health-check.sh` script or
implementing your own.

## Script-Protocol

If the passthrough mode is not enabled, the request must implement the
following protocol:

```
VERSION .. <lf>
[alarm=<secs> <lf>]
[env_<variable_name>=<variable_value> <lf>]
[env_<variable_name2>=<variable_value2> <lf>]
...
"noreply" | "-" (or anything really) <lf>

arg 1 <lf>
arg 2 <lf>
...
<lf>
DATA
```

If "alarm" is specified, it MUST be before "noreply".

If "noreply" isn't given, a "-" must be given.

### `arg`

Arguments that can be passed to the script.

### `env_<variable_name>`

Environment variables that have been marked as allowed by `-e`.

### `noreply`

Disable the success/fail answer by script executable itself.

### `VERSION`

The VERSION of script (AToW 4.0 eg "VERSION\\tscript\\t4\\t0\\n").

### `DATA`

Input to be passed to the script to be called.
