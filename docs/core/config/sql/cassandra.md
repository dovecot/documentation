---
layout: doc
title: Cassandra
dovecotlinks:
  sql_cassandra: Cassandra configuration
  sql_cassandra_consistency:
    hash: consistency
    text: "Cassandra: Consistency"
  sql_cassandra_metrics:
    hash: metrics
    text: "Cassandra: Metrics"
---

# SQL Driver: Cassandra

Driver name `cassandra`.

Driver for Apache Cassandra CQL server.

To compile support for this driver, you need to have
[DataStax C/C++ driver](https://docs.datastax.com/en/developer/cpp-driver/index.html)
and headers installed.

## Settings

<SettingsComponent tag="sql-cassandra" />

## Consistency

Consistency levels in Cassandra can be configured to manage availability
versus data accuracy.

### Read Consistency

#### `any`

::: danger
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

::: danger
Not supported for reads.
:::

#### `all`

Returns the record after all replicas have responded. The read operation
will fail if a replica does not respond.

### Write/Delete Consistency

#### `any`

At least one node must succeed in the operation.

#### `local-serial`

::: danger
Not supported for writes.
:::

#### `serial`

::: danger
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

## Metrics

This describes the format of the JSON output produced when the metrics
configuration option is activated.

Source: https://docs.datastax.com/en/developer/cpp-driver/latest/api/struct.CassMetrics/index.html

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
