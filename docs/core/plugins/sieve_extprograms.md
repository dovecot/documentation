---
layout: doc
title: sieve-extprograms
---

# Pigeonhole Sieve Extprograms Plugin (`sieve-extprograms`)

The "sieve_extprograms" plugin provides an extension to the Sieve
filtering language, adding new action commands for invoking a predefined
set of external programs.

Messages can be piped to or filtered through those programs and string
data can be input to and retrieved from those programs.

To mitigate the security concerns, the external programs cannot be chosen
arbitrarily; the available programs are restricted through administrator
configuration.

## Configuration

The plugin is activated by adding it to the [[setting,sieve_plugins]]
setting:

```
sieve_plugins = sieve_extprograms
```

This plugin registers the `vnd.dovecot.pipe`, `vnd.dovecot.filter`,
and `vnd.dovecot.execute` extensions with the Sieve interpreter.
However, these extensions are not enabled by default and thus need to be
enabled explicitly.

It is recommended to restrict the use of these extensions to global context
by adding these to the [[setting,sieve_global_extensions]] setting.

If personal user scripts also need to directly access external programs, the
extensions need to be added to the [[setting,sieve_extensions]] setting.

The commands introduced by the Sieve language extensions in this plugin
can directly pipe a message or string data to an external program
(typically a shell script) by forking a new process. Alternatively,
these can connect to a unix socket behind which a Dovecot script service
is listening to start the external program, e.g. to execute as a
different user or for added security.

The program name specified for the new Sieve `pipe`, `filter`, and
`execute` commands is used to find the program or socket in a
configured directory. Separate directories are specified for the sockets
and the directly executed binaries. The socket directory is searched
first. Since the use of "/" in program names is prohibited, it is not
possible to build a hierarchical structure.

Directly forked programs are executed with a limited set of environment
variables: `HOME`, `USER`, `SENDER`, `RECIPIENT`, and `ORIG_RECIPIENT`.
Programs executed through the script-pipe socket service currently have
no environment set at all.

If a shell script is expected to read a message or string data, it must
fully read the provided input until the data ends with EOF, otherwise
the Sieve action invoking the program will fail. The action will also
fail when the shell script returns a nonzero exit code. Standard output
is available for returning a message (for the filter command) or string
data (for the execute command) to the Sieve interpreter. Standard error
is written to the LDA log file.

The three extensions introduced by this plugin - `vnd.dovecot.pipe`,
`vnd.dovecot.filter` and `vnd.dovecot.execute` - each have separate
but similar configuration.

## Settings

<SettingsComponent plugin="sieve-extprograms" />

## Specification

Read the
[specification](https://github.com/dovecot/pigeonhole/blob/master/doc/rfc/spec-bosch-sieve-extprograms.txt)
for detailed information on how to use the new language extensions.

## Configuration Examples

### Socket Service for "pipe" and "execute"

```
plugin {
  sieve = ~/.dovecot.sieve

  sieve_plugins = sieve_extprograms
  sieve_global_extensions = +vnd.dovecot.pipe +vnd.dovecot.execute

  # pipe sockets in /var/run/dovecot/sieve-pipe
  sieve_pipe_socket_dir = sieve-pipe

  # execute sockets in /var/run/dovecot/sieve-execute
  sieve_execute_socket_dir = sieve-execute
}

service sieve-pipe-script {
  # This script is executed for each service connection
  executable = script /usr/lib/dovecot/sieve-extprograms/sieve-pipe-action.sh

  # use some unprivileged user for execution
  user = dovenull

  # socket name is program-name in Sieve (without sieve-pipe/ prefix)
  unix_listener sieve-pipe/sieve-pipe-script {
  }
}

service sieve-execute-action {
  # This script is executed for each service connection
  executable = script /usr/lib/dovecot/sieve-extprograms/sieve-execute-action.sh

  # use some unprivileged user for execution
  user = dovenull

  # socket name is program-name in Sieve (without sieve-execute/ prefix)
  unix_listener sieve-execute/sieve-execute-action {
  }
}
```

### Direct Execution for "pipe" and "filter"

```
plugin {
  sieve = ~/.dovecot.sieve

  sieve_plugins = sieve_extprograms
  sieve_global_extensions = +vnd.dovecot.pipe +vnd.dovecot.filter

  # This directory contains the scripts that are available for the pipe command.
  sieve_pipe_bin_dir = /usr/lib/dovecot/sieve-pipe

  # This directory contains the scripts that are available for the filter
  # command.
  sieve_filter_bin_dir = /usr/lib/dovecot/sieve-filter
}
```

### Test Incoming Message

This simple example shows how to use the "vnd.dovecot.execute" extension
to perform some sort of test on the incoming message.

::: code-group
```[dovecot.conf]
plugin {
  sieve_extensions = +vnd.dovecot.execute

  sieve_plugins = sieve_extprograms
  sieve_execute_bin_dir = /usr/lib/dovecot/sieve-execute
}
```

```[Sieve Script]
require "vnd.dovecot.execute";

if not execute :pipe "hasfrop.sh" {
    discard;
    stop;
}
```

```sh[hasfrop.sh]
# Something that reads the whole message and inspects it for some
# property. Not that the whole message needs to be read from input!
N=`cat | grep -i "FROP"` # Check it for the undesirable text "FROP"
if [ ! -z "$N" ]; then
    # Result: deny
    exit 1;
fi

# Result: accept
exit 0
```
:::

At the location `/usr/lib/dovecot/sieve-execute`, create the
executable script `hasfrop.sh`.

In this example, the `hasfrop.sh` checks whether the message contains
the literal text "FROP" anywhere in the message. The Sieve script shown
above discards the message if this scripts ends with an exit code other
than 0, which happens when "FROP" was found.

### Query/Update MySQL

This example shows how to use the `vnd.dovecot.execute` extension for
querying/updating a MySQL database. This is used to redirect messages
only once every 300s for a particular sender.

Note that this particular use case could also be implemented using the Sieve
[[link,sieve_duplicate]].

::: code-group
```[dovecot.conf]
plugin {
  sieve_extensions = +vnd.dovecot.execute

  sieve_plugins = sieve_extprograms
  sieve_execute_bin_dir = /usr/lib/dovecot/sieve-execute
}
```

```[Sieve Script]
require ["variables", "copy", "envelope", "vnd.dovecot.execute"];

# put the envelope-from address in a variable
if envelope :matches "from" "*" { set "from" "${1}"; }

# execute the vacationcheck.sh program and redirect the message based on
# its exit code
if execute :output "vacation_message" "vacationcheck.sh" ["${from}","300"]
{
    redirect :copy "foo@bar.net";
}
```

```sh[vacationcheck.sh]
USER=postfixadmin
PASS=pass
DATABASE=postfixadmin

# DB STRUCTURE
#CREATE TABLE `sieve_count` (
#  `from_address` varchar(254) NOT NULL,
#  `date` datetime NOT NULL
#) ENGINE=InnoDB DEFAULT CHARSET=latin1;
#
#ALTER TABLE `sieve_count`
#  ADD KEY `from_address` (`from_address`);

MAILS=$(mysql -u$USER -p$PASS $DATABASE --batch --silent -e "SELECT count(*) as ile FROM sieve_count WHERE from_address='$1' AND DATE_SUB(now(),INTERVAL $2 SECOND) < date;")
ADDRESULT=$(mysql -u$USER -p$PASS $DATABASE --batch --silent -e "INSERT INTO sieve_count (from_address, date) VALUES ('$1', NOW());")

# uncomment below to debug
# echo User $1 sent $MAILS in last $2 s >> /usr/lib/dovecot/sieve-pipe/output.txt
# echo Add result : $ADDRESULT >> /usr/lib/dovecot/sieve-pipe/output.txt
# echo $MAILS

if [ "$MAILS" = "0" ]
then
    exit 0
fi

exit 1
```
:::

At the location `/usr/lib/dovecot/sieve-execute`, create the
executable script `vacationcheck.sh`.

In this example, the `vacationcheck.sh` script needs two parameters:
the sender address and a time interval specified in seconds. The time
interval is used to specify the minimum amount of time that needs to have
passed since the sender was last seen. If the script returns exit code 0,
then message is redirected in the Sieve script shown above.
