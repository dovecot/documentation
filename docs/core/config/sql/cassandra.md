---
layout: doc
title: Cassandra
dovecotlinks:
  sql_cassandra: Cassandra configuration
---

# SQL Driver: Cassandra

Driver name `cassandra`.

Driver for Apache Cassandra CQL server.

To compile support for this driver, you need to have
[DataStax C/C++ driver](https://docs.datastax.com/en/developer/cpp-driver/)
and headers installed.

## Supported Options

### `connect_timeout`

* Default: `5s`
* Values: [[link,settings_types_time_msecs]]

Connection timeout.

### `dbname`

Alias for [`keyspace`](#keyspace).

### `debug_queries`

* Default: `no`
* Values: [[link,settings_types_boolean]]

Whether to log CQL queries.

::: info Note
This setting behaves differently than other boolean settings.
The feature is enabled by presence of the keyword in connect
string, so to disable this feature, you must remove the keyword
completely.
:::

### `delete_consistency`

* Default: `local-quorum`
* Values: [consistency](#cassandra-consistency)

Write consistency when deleting from the database.

### `delete_fallback_consistency`

* Default: `local-quorum`
* Values: [consistency](#cassandra-consistency)

Write consistency when deleting from the database fails with primary
consistency.

### `execution_retry_interval`

* Default: `0`
* Values: [[link,settings_types_time_msecs]]
* See Also: https://docs.datastax.com/en/developer/java-driver/4.13/manual/core/speculative_execution/

If the driver supports speculative execution policy, configures constant
speculative execution policy.

### `execution_retry_times`

* Default: `0`
* Values: [[link,settings_types_time_msecs]]
* See Also: https://docs.datastax.com/en/developer/java-driver/4.13/manual/core/speculative_execution/

If the driver supports speculative execution policy, configures constant
speculative execution policy.

### `heartbeat_interval`

* Default: `5s`
* Values: [[link,settings_types_time]]

How often to send keepalive packets to cassandra nodes.

### `host`

* Values: [[link,settings_types_string]]

Host or IP address to connect. Can appear multiple times.

### `idle_timeout`

* Default: `0`
* Values: [[link,settings_types_time_msecs]]

How long to idle before disconnecting.

### `keyspace`

* Values: [[link,settings_types_string]]

Specifies the keyspace name to use.

### `latency_aware_routing`

* Default: `no`
* Values: [[link,settings_types_boolean]]

When turned on, latency-aware routing tracks the latency of queries to
avoid sending new queries to poorly performing Cassandra nodes.

::: info Note
The feature is enabled by presence of the keyword in connect
string, so to disable this feature, you must remove the keyword completely.
:::

### `log_level`

* Default: `warn`
* Values: `critical`, `error`, `warn`, `info`, `debug`, `trace`

Driver log level.

### `log_retries`

* Default: `no`
* Values: [[link,settings_types_boolean]]

Whether to log about failed requests that are retried (which may or may
not succeed after the retry).

::: info Note
This setting behaves differently than other boolean settings.

The feature is enabled by presence of the keyword in connect
string, so to disable this feature, you must remove the keyword
completely.
:::

### `metrics`

* Values: [[link,settings_types_string]]
* See Also: [Cassandra Metrics](#cassandra-metrics)

Path where to write JSON metrics.

### `num_threads`

* Default: &lt;driver dependent&gt;
* Values: [[link,settings_types_uint]]

Set number of IO threads to handle query requests.

### `page_size`

* Default: `-1`
* Values: [[link,settings_types_uint]]

When a query returns many rows, it can be sometimes inefficient to return
them as a single response message. Instead, the driver can break the
results into pages which get returned as they are needed.

This setting controls the size of each page.

Set to `-1` to disable.

### `password`

* Values: [[link,settings_types_string]]

Password for authentication.

### `port`

* Default: `9042`
* Values: [[link,settings_types_uint]]

CQL port to use.

### `read_consistency`

* Default: `local-quorum`
* Values: [consistency](#cassandra-consistency)

Read consistency.

### `read_fallback_consistency`

* Default: `local-quorum`
* Values: [consistency](#cassandra-consistency)

Read consistency if primary consistency fails.

### `request_timeout`

* Default: `60s`
* Values: [[link,settings_types_time_msecs]]

How long to wait for a query to finish.

### `ssl_ca`

* Values: [[link,settings_types_string]]

Path to SSL certificate authority file to use to validate peer certificate.


### `ssl_cert_file`

* Values: [[link,settings_types_string]]

Path to a certificate file to use for authenticating against the remote
server.

### `ssl_private_key_file`

* Values: [[link,settings_types_string]]

Path to private key matching [`ssl_cert_file`](#ssl-cert-file)
to use for authenticating against the remote server.

### `ssl_verify`

* Default: `none`
* Values: `none`, `cert`, `cert-ip`, `cert-dns`

Configure the peer certificate validation method.

   Options:

| Method | Description |
| ------ | ----------- |
| `none` | Disables validation. |
| `cert` | Validate that the certificate is valid. |
| `cert-ip` | Validate that the certificate is valid and has Common Name or Subject Alternate Name for the IP address. |
| `cert-dns` | Validate that the certificate is valid and has Common Name or Subject Alternate Name that matches PTR resource record for the server's IP address. |

### `user`

* Values: [[link,settings_types_string]]

Username for authentication.

### `version`

* Default: &lt;depends on driver version&gt;
* Values: `3`, `4`, `5`

Cassandra protocol version to use. It is good idea to specify this to avoid
warnings about version handshake if the driver supports a higher protocol
version than the server.

::: info Note
If you want to use server-side prepared statements, you need to
use at least `4`.
:::

### `warn_timeout`

* Default: `5s`
* Values: [[link,settings_types_time_msecs]]

Emit warning if query takes longer than this.

### `write_consistency`

* Default: `local-quorum`
* Values: [consistency](#cassandra-consistency)

Write consistency when updating or inserting to the database.


### `write_fallback_consistency`

* Default: `local-quorum`
* Values: [consistency](#cassandra-consistency)

Write consistency when updating or inserting to the database fails with
primary consistency.

## Cassandra Consistency

Consistency levels in Cassandra can be configured to manage availability
versus data accuracy.

### Read Consistency

#### `any`

::: danger Note
Not supported for reads.
:::

#### `local-serial`

Allows reading the current (and possibly uncommitted) state of data without
proposing a new addition or update.

If a `SERIAL` read finds an uncommitted transaction in progress, it will
commit the transaction as part of the read.

Local serial is confined to datacenter.

#### `serial`

Allows reading the current (and possibly uncommitted) state of data without
proposing a new addition or update.

If a `SERIAL` read finds an uncommitted transaction in progress, it will
commit the transaction as part of the read.

#### `one`

Returns a response from the closest replica, as determined by the snitch.

#### `two`

Returns the most recent data from two of the closest replicas.

#### `three`

Returns the most recent data from three of the closest replicas.

#### `local-quorum`

Returns the record after a quorum of replicas in the current datacenter as
the coordinator has reported.

#### `quorum`

Returns the record after a quorum of replicas from all datacenters has
responded.

#### `each-quorum`

::: danger Note
Not supported for reads.
:::

#### `all`

Returns the record after all replicas have responded. The read operation
will fail if a replica does not respond.

### Write/Delete Consistency

#### `any`

At least one node must succeed in the operation.

#### `local-serial`

::: danger Note
Not supported for writes.
:::

#### `serial`

::: danger Note
Not supported for writes.
:::

#### `one`

Operation must be at least in commit log and one memory table of one replica.

#### `two`

Operation must be at least in commit log and one memory table of two replicas.

#### `three`

Operation must be at least in commit log and one memory table of three
replicas.

#### `local-quorum`

A write must be written to the commit log and memory table on a quorum of
replica nodes in the same datacenter as the coordinator.

#### `quorum`

A write must be written to the commit log and memory table on a quorum of
replica nodes across all datacenters.

#### `each-quorum`

A write must be written to the commit log and memory table on a quorum of
replica nodes in each datacenter.

#### `all`

A write must be written to the commit log and memtable on all replica nodes
in the cluster for that partition.

## Cassandra Metrics

This describes the format of the JSON output produced when the metrics configuration option is activated.

Source: https://docs.datastax.com/en/developer/cpp-driver/2.2/api/struct.CassMetrics/

::: details
```json
{
    "Requests": {
        # Minimum in microseconds
        "min": [Number: integer],
        # Maximum in microseconds
        "max": [Number: integer],
        # Mean in microseconds
        "mean": [Number: integer],
        # Standard deviation in microseconds
        "stddev": [Number: integer],
        # Median in microseconds
        "median": [Number: integer],
        # 75th percentile in microseconds
        "percentile_75th": [Number: integer],
        # 95th percentile in microseconds
        "percentile_95th": [Number: integer],
        # 98th percentile in microseconds
        "percentile_98th": [Number: integer],
        # 99th percentile in microseconds
        "percentile_99th": [Number: integer],
        # 99.9th percentile in microseconds
        "percentile_999th": [Number: integer],
        # Mean rate in requests per second
        "mean_rate": [Number: fraction],
        # 1 minute rate in requests per second
        "one_minute_rate": [Number: fraction],
        # 5 minute rate in requests per second
        "five_minute_rate": [Number: fraction],
        # 15 minute rate in requests per second
        "fifteen_minute_rate": [Number: fraction]
    },
    "stats": {
        # The total number of connections
        "total_connections": [Number: integer],
        # The number of connections available to take requests
        "available_connections": [Number: integer],
        # Occurrences when requests exceeded a pool's water mark
        "exceeded_pending_requests_water_mark": [Number: integer],
        # Occurrences when number of bytes exceeded a connection's water mark
        "exceeded_write_bytes_water_mark": [Number: integer]
    },
    "queries": {
        # Number of queries sent to Cassandra
        "sent": [Number: integer],
        # Number of successful responses
        "recv_ok": [Number: integer],
        # Number of requests that couldn’t be sent, because the local
        # Cassandra driver’s queue was full.
        "recv_err_queue_full": [Number: integer],
        # Number of requests that didn’t succeed because the Cassandra
        # driver couldn’t connect to the server.
        "recv_err_no_hosts": [Number: integer],
        # Number of requests that didn’t succeed because the Cassandra
        # driver timed out while waiting for response from server.
        "recv_err_client_timeout": [Number: integer],
        # Number of requests that didn’t succeed because the Cassandra
        # server reported a timeout communicating with other nodes.
        "recv_err_server_timeout": [Number: integer],
        # Number of requests which couldn’t succeed, because not enough
        # Cassandra nodes were available for the consistency level.
        "recv_err_server_unavailable": [Number: integer]
        # Number of requests which couldn’t succeed for other reasons.
        "recv_err_other": [Number: integer]
    },
    "errors": {
        # Occurrences of a connection timeout
        "connection_timeouts": [Number: integer],
        # [No description provided]
         "pending_request_timeouts": [Number: integer],
        # Occurrences of requests that timed out waiting for a connection
        "request_timeouts": [Number: integer]
    }
}
```
:::
