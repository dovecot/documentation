#### Cassandra Fallback Consistency

A single failing Cassandra query no longer switches all the following queries
to the fallback consistency. Likely transient errors are first retried with
the primary consistency ([[setting,cassandra_primary_retry_count]]), and the
following queries switch to the fallback consistency only after
[[setting,cassandra_fallback_failure_threshold]] consecutive queries have
failed within [[setting,cassandra_fallback_window]]. See
[[link,sql_cassandra_fallback_consistency]].

To get the old behavior, set
[[setting,cassandra_fallback_failure_threshold,1]] and
[[setting,cassandra_primary_retry_count,0]].

While the fallback consistency is used, the maximum interval between the
periodic queries sent with the primary consistency was lowered from 60
seconds to 10 seconds.
