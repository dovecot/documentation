.. _http_storages:

===============================================
HTTP-Based Object Storages
===============================================

The HTTP-based object storages use an HTTP URL to specify how the object
storage is accessed.

The parameters are specified as URL-style parameters, such as
http://url/?param1=value1&param2=value2.

Similarly the URL uses URL escaping, so for example if password is ``foo/bar``
the URL is http://user:foo%2fbar@example.com/.

Additionally, because Dovecot expands %variables inside plugin section, the
``%`` needs to be escaped. So the final string would be e.g.:

.. code-block:: none

  plugin {
    obox_fs = s3: https://user:foo%%2fbar@example.com/ # password is foo/bar
  }

The parameters common to all object storages include:

+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| Parameter                             |Description                                                                                                                    | Default      |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| absolute_timeout=<:ref:`time_msecs`>  |Maximum total time for an HTTP request to finish. Overrides all timeout configuration                                          | none         |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.3.0                                                                                                        |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| absolute_timeout_msecs=<ms>           |Maximum total time for an HTTP request to finish. Overrides all timeout configuration                                          | none         |
|                                       |                                                                                                                               |              |
|                                       |.. deprecated:: 2.3.0                                                                                                          |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| addhdr=<name>:<value>                 |Add the specified header to all HTTP requests.                                                                                 | none         |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.3.10 Can be specified multiple times.                                                                      |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| addhdrvar=<name>:<variable>           |Add the specified header to all HTTP requests and set the value to the expanded variables value.                               | none         |
|                                       |                                                                                                                               |              |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.3.10                                                                                                       |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| bucket=<n>                            |Used by some backends to specify the bucket to save the data into                                                              | none         |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| bulk_delete_limit=<n>                 |Number of deletes supported within the same bulk delete request. 0 disables bulk deletes. Note that this setting works only    | scality: 1000|
|                                       |for the backends that support bulk deletion.                                                                                   | swift: 10000 |
|                                       |                                                                                                                               | s3: 1000     |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.2.36                                                                                                       |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| bulk_delete=1                         |Set to 1 if backend supports  bulk deletes                                                                                     | v2.2: 0      |
|                                       |                                                                                                                               |              |
|                                       |.. deprecated:: 2.2.36                                                                                                         |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| connect_timeout=<:ref:`time_msecs`>   |Timeout for establishing a TCP connection                                                                                      | timeout      |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.3.0                                                                                                        |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| connect_timeout_msecs=<ms>            |Timeout for establishing a TCP connection                                                                                      | timeout_msecs|
|                                       |                                                                                                                               |              |
|                                       |.. deprecated:: 2.3.0                                                                                                          |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| delete_max_retries=<n>                |Max number of HTTP request retries for delete actions                                                                          | max_retries  |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| delete_timeout=<:ref:`time_msecs`>    |Timeout for sending a delete HTTP response                                                                                     | timeout      |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.3.0                                                                                                        |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| delete_timeout_msecs=<ms>             |Timeout for sending a delete HTTP response                                                                                     | timeout_msecs|
|                                       |                                                                                                                               |              |
|                                       |.. deprecated:: 2.3.0                                                                                                          |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| loghdr=<name>                         |Headers with the given name in HTTP responses are logged as part of any error, debug or warning messages related to the HTTP   | none         |
|                                       |request. These headers are also included in the http_request_finished event as fields prefixed with ``http_hdr_``.             |              |
|                                       |Can be specified multiple times.                                                                                               |              |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.3.10                                                                                                       |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| max_connect_retries=<n>               |Number of connect retries                                                                                                      | 2            |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| max_retries=<n>                       |Max number of HTTP request retries                                                                                             | 4            |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| no_trace_headers=1                    |Set to 1 to not add X-Dovecot-User or X-Dovecot-Session headers to HTTP request Useful to correlate object                     | 0            |
|                                       |storage requests to AS/Dovecot sessions. If not doing correlations via log aggregation, this is safe to disable.               |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| read_max_retries=<n>                  |Max number of HTTP request retries for read actions                                                                            | max_retries  |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| read_timeout=<:ref:`time_msecs`>      |Timeout for a receiving reada HTTP response                                                                                    | timeout      |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.3.0                                                                                                        |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| read_timeout_msecs=<ms>               |Timeout for a receiving reada HTTP response                                                                                    | timeout_msecs|
|                                       |                                                                                                                               |              |
|                                       |.. deprecated:: 2.3.0                                                                                                          |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| reason_header_max_length=<n>          |Maximum length for X-Dovecot-Reason HTTP header If header is present, it contains information why obox operation is being done | 0            |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| slow_warn=<:ref:`time_msecs`>         |Log a warning about any HTTP request that takes longer than this time                                                          | 5s           |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.3.0                                                                                                        |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| slow_warn_msecs=<ms>                  |Log a warning about any HTTP request that takes longer than this many milliseconds                                             | 5000         |
|                                       |                                                                                                                               |              |
|                                       |.. deprecated:: 2.3.0                                                                                                          |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| timeout=<:ref:`time_msecs`>           |Default timeout for HTTP responses, unless overwritten by the read/write/delete_timeout_msecs                                  | 10s          |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.3.0                                                                                                        |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| timeout_msecs=<ms>                    |Default timeout for HTTP responses, unless overwritten by the read/write/delete_timeout_msecs                                  | 10000        |
|                                       |                                                                                                                               |              |
|                                       |.. deprecated:: 2.3.0                                                                                                          |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| write_max_retries=<n>                 |Max number of HTTP request retries for write actions                                                                           | max_retries  |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| write_timeout=<:ref:`time_msecs`>     |Timeout for a write HTTP response                                                                                              | timeout      |
|                                       |                                                                                                                               |              |
|                                       |.. versionadded:: 2.3.0                                                                                                        |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+
| write_timeout_msecs=<ms>              |Timeout for a write HTTP response                                                                                              | timeout_msecs|
|                                       |                                                                                                                               |              |
|                                       |.. deprecated:: 2.3.0                                                                                                          |              |
+---------------------------------------+-------------------------------------------------------------------------------------------------------------------------------+--------------+

Dovecot sends the following HTTP headers towards storage. They should be logged for troubleshooting purposes:

* X-Dovecot-Username
* X-Dovecot-Session-Id
* X-Dovecot-Reason (v2.2.36.1+ and v2.3.5+)
