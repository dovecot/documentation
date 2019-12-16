.. _cassandra_metrics_json_output:

======================================
Cassandra Metrics JSON Output
======================================

This describes the format of the JSON output produced when the metrics configuration option is activated. 
Source: https://docs.datastax.com/en/developer/cpp-driver/2.2/api/struct.CassMetrics/

.. code-block:: none

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
