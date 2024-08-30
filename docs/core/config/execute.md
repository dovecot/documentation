---
layout: doc
title: Execute Scripts
dovecotlinks:
  execute_scripts: Execute Scripts
  execute_unix:
    hash: execute-unix
    text: "execute: UNIX Sockets"
  execute_tcp:
    hash: execute-tcp
    text: "execute: TCP Sockets"
  execute_fork:
    hash: execute-fork
    text: "execute: Fork and Execute"
---

# Execute Scripts

Some features, e.g. [[link,welcome]] execute an external script.
This is configured with the [[setting,execute]] settings. Currently only
a single script execution at a time is supported.

Supported script execution drivers are:

| Name | Description |
| --- | --- |
| [[link,execute_unix,unix]] | Connect to UNIX socket. |
| [[link,execute_tcp,tcp]] | Connect to TCP socket. |
| [[link,execute_fork,fork]] | Fork and execute the script directly. |

## UNIX Sockets

Execute the script via a script service listening on a UNIX socket. The service
must execute the `script` binary to provide the proper communication API.

Example:

```[dovecot.conf]
execute test-script {
  #driver = unix # default
  args = hello %{user}
}
service test-script-service {
  execute = script /usr/local/bin/test-script.sh one
  unix_listener test-script {
    path = 0666
  }
}
```

The `test-script.sh` is executed with parameters `one hello <username>`.

## TCP sockets

Execute the script via a script service listening on a TCP socket. The service
must execute the `script` binary to provide the proper communication API.

Example:

```[dovecot.conf]
execute localhost:12345 {
  driver = tcp # default
  args = hello %{user}
}
service test-script-service {
  execute = script /usr/local/bin/test-script.sh one
  inet_listener {
    port = 12345
  }
}
```

The `test-script.sh` is executed with parameters `one hello <username>`.

## Fork and Execute

Fork the process and execute the script directly.

Example:

```[dovecot.conf]
execute /usr/local/bin/test-script.sh {
  driver = fork
  args = hello %{user}
}
```

The `test-script.sh` is executed with parameters `hello <username>`.

## Execute Settings

<SettingsComponent tag="execute" />
