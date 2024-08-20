---
layout: doc
title: Dict Protocol
dovecotlinks:
  dict_protocol: Dovecot dict protocol
---

# Dovecot Dict Protocol

::: info
This document describes Dovecot Dict protocol v3.2 which is supported in
Dovecot v2.3.17+.

Dovecot Core v2.4.0 changed the version to v4, but it's otherwise compatible
with v3.2
:::

Dovecot's dict protocol is a line based protocol between the dict client and
server processes. The dict server receives lines containing commands and
responds to the client with results. Each line ends with an LF character and
the maximum line the client is allowed to send a command is 65536 (64KB of data).
There is no maximum length enforced for dict server's response.

Each command is in format:

```
<command short name><parameters separated with TAB>
```

The command short name is a single character and the rest of the line
containing the command parameters are followed immediately without any
whitespace in between.

Commands available in dict protocol and their corresponding short name:

| Command | Command Short Name |
| ------- | ------------------ |
| `HELLO` | `H` |
| `LOOKUP` | `L` |
| `ITERATE` | `I` |
| `BEGIN` | `B` |
| `COMMIT` | `C` |
| `ROLLBACK` | `R` |
| `SET` | `S` |
| `UNSET` | `U` |
| `ATOMIC_INC` | `A` |
| `TIMESTAMP` | `T` |

The reply from dict server is in the same format.

```
<result short status>(<optional extra values separated with TAB>)
```

Result statuses relevant for each command and their corresponding short name
explained in each command section.

Command parameters and extra result values are tab-escaped using the dovecot's
generic tab-escaping. Escaping is described in more details in
[[link,design_auth_protocol]].

After responses to certain commands, an execution duration summary line is also
sent to the client containing timestamp information about how long the command
took to finish. The commands that trigger this timestamp response are `LOOKUP`,
`ITERATE`, and `COMMIT`. Format of this line is as follows:

```
TAB<start sec>TAB<start usec>TAB<end sec>TAB<end usec>
```

Where the unix timestamp is `<sec>.<usec>` for each pair.

The connection starts by the client sending a `HELLO` message. The message
contains the initial handshake information.

```
C: H<major>TAB<minor>TAB<value type>TAB<obsolete user>TAB<dict name>
```

::: info
Prior to Dovecot v2.3.17, `user` was included in the initial handshake
but it's currently not used and the field is empty.
:::

The server then checks client's protocol version and can either accept the
handshake and proceed to response with OK or reject the `HELLO` and close the
connection.

If the handshake is accepted by server, the optional extra values
in the response line contain server's major and minor protocol versions (tab
separated). The client also checks the protocol version and can decide to
close the connection if versions do not match.

Currently, Dovecot's client and server check that they support the same major
version number. Minor version can be ignored.

Other dict commands and their line format is described as follows.

::: info
Prior to Dovecot v2.3.17 none of the following commands included the
username for which the dict operation is performed. Instead, the
username from the initial handshake message was used.
:::


## `LOOKUP` Command

Used to lookup a key value from dict.

```
C: L<key>TAB<user>
```

| Result Status | Status Short Name | Description |
| ------------- | ----------------- | ----------- |
| `OK` | `O` | Lookup was performed successfully and there was a single value for the key. Value is then appended to the response line. |
| `MULTI_OK` | `M` | Lookup was performed successfully and there were multiple values for the key. In this case all results are joined together with a tab and then double-escaped so the end result looks like a single value. Client would then need to unescape twice to get the list of values separated by tabs. |
| `NOTFOUND` | `N` | Lookup was performed successfully but no value was found with this key. |
| `FAIL` | `F` | Lookup failed due to an error. A tab-escaped error string is appended to the response line. |

## `ITERATE` Command

Used to iterate over a key path.

```
C: I<flags>TAB<max rows>TAB<path>TAB<user>
```

The iteration flag is a integer with following options, which can be `OR`ed
together.

| Flag | Value | Description |
| ---- | ----- | ----------- |
| `RECURSE` | `0x01` | Recurse to all the sub-hierarchies |
| `SORT_BY_KEY` | `0x02` | Sort returned results by key |
| `SORT_BY_VALUE` | `0x04` | Sort returned results by value |
| `NO_VALUE` | `0x08` | Don't return values, only keys |
| `EXACT_KEY` | `0x10` | Don't recurse at all. This is basically the same as LOOKUP command but it will return all of the rows instead of only the first one. |
| `FLAG_ASYNC` | `0x20` | Perform iteration asynchronously |

Possible responses include:

| Result Status | Status Short Name | Description |
| ------------- | ----------------- | ----------- |
| `OK` | `O` | Iteration was done successfully. Note that for each key-value pair A separate OK status is appended to the response line with the key following immediately and all values associated to it joined with tabs. |
| `FAIL` | `F` | Iteration failed due to an error. A tab-escaped error string is appended to the response line. |
| `ITER_FINISHED` | `<empty line>` | Iteration completed. This is sent after all key value pairs are added to the response. |

## `BEGIN` Command

Begins a dict transaction with the given ID.

```
C: B<id>TAB<user>
```
Note that transactions commands don't have replies with the exception of `COMMIT`.
After a transaction is successfully started, transaction operations i.e.
`SET`, `UNSET`, `ATOMIC_INC`, and `TIMESTAMP` can be used.

## `COMMIT` Command

Commit the transaction corresponding to the given ID.

```
C: C<transaction id>
```

Note that the transaction is looked up from the ID so no username is required.

Possible responses include:

| Result Status | Status Short Name | Description |
| ------------- | ----------------- | ----------- |
| `OK` | `O` | Commit was done successfully and all transaction operations completed. |
| `NOTFOUND` | `N` | Transaction ID specified in the commit was not found. |
| `WRITE_UNCERTAIN` | `W` | The transaction may or may not have succeeded (e.g. a write timeout occurred or the connection to dict backend was closed by the backend server). A tab-escaped error string is appended to the response line. |
| `FAIL` | `F` | Iteration failed due to an error. A tab-escaped error string is appended to the response line. |

## `ROLLBACK` Command

Rollback changes made in the transaction.

```
C: R<transaction id>
```

## `SET` Command

Set a value for the given key.

```
C: S<transaction id>TAB<key>TAB<value>
```

## `UNSET` Command

Unset a record in the dictionary given the key.

```
C: U<transaction id>TAB<key>
```

## `ATOMIC_INC` Command

Atomically increment numeric value of a key with the given increment value.
Note that the value is changed when transaction is being committed, so it's not
known beforehand what the value will become. The value is updated only
if it already exists.

```
C: A<transaction id>TAB<key>TAB<increment>
```

## `TIMESTAMP` Command

Set the unix timestamp for the given transaction. Note that this will set the
timestamp for the entire transaction. This must be set before any changes are
done and can't be changed afterwards. Currently only dict-sql with Cassandra
backend does anything with this.

```
C: T<transaction id>TAB<sec>TAB<nsec>
```
