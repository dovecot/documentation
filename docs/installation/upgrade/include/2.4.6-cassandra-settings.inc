#### New Cassandra Settings

New settings were added to configure the Cassandra driver. The defaults are
the same as the driver's previous behavior, except that the client now sends
[[setting,cassandra_application_name]] and
[[setting,cassandra_application_version]] to the server.

If the Cassandra cluster has multiple datacenters, it's recommended to set
[[setting,cassandra_local_datacenter]]. Otherwise the local datacenter is the
datacenter of whichever [[setting,cassandra_hosts]] host answers first.

| Setting | Notes |
| ------- | ----- |
| [[setting,cassandra_local_datacenter]] | Setting was added. |
| [[setting,cassandra_connections_per_host]] | Setting was added. |
| [[setting,cassandra_reconnect_policy]] | Setting was added. |
| [[setting,cassandra_reconnect_base_delay]] | Setting was added. |
| [[setting,cassandra_reconnect_max_delay]] | Setting was added. |
| [[setting,cassandra_tcp_keepalive]] | Setting was added. |
| [[setting,cassandra_token_aware_routing]] | Setting was added. |
| [[setting,cassandra_token_aware_shuffle_replicas]] | Setting was added. |
| [[setting,cassandra_latency_aware_exclusion_threshold]] | Setting was added. |
| [[setting,cassandra_latency_aware_scale]] | Setting was added. |
| [[setting,cassandra_latency_aware_retry_period]] | Setting was added. |
| [[setting,cassandra_latency_aware_update_rate]] | Setting was added. |
| [[setting,cassandra_latency_aware_min_measured]] | Setting was added. |
| [[setting,cassandra_dns_timeout]] | Setting was added. |
| [[setting,cassandra_request_queue_size]] | Setting was added. |
| [[setting,cassandra_application_name]] | Setting was added. |
| [[setting,cassandra_application_version]] | Setting was added. |
| [[setting,cassandra_client_id]] | Setting was added. |
| [[setting,cassandra_source_ip]] | Setting was added. |
