---
layout: doc
title: Limits
dovecotlinks:
  limits: Dovecot Limits
---

# Dovecot Limits

Dovecot contains various configurable and built-in resource limits designed to
prevent denial of service situations. This page lists those limits.

::: todo
This list is currently incomplete.
:::

## Storage Size Limits

<SettingsComponent tag="storage_size_limits" level="5" />

### See Also

* [[link,quota_root]]

## User Concurrency Limits

<SettingsComponent tag="user_concurrency_limits" level="5" />

## Memory Limits

 * [[link,service_vsz_limit]]
 * [[link,service_process_limit]]
 * [[link,service_client_limit]]

## Message Headers

There is a `10 MB` limit for a single message header block, and a `50 MB`
limit for all header blocks in a message.

## MIME Parts

Maximum number of MIME parts per message is 10000. A maximum of 100 MIME parts
can be nested in the same hierarchy path.

## Search Query Nesting

[[added,imap_search_nesting_limit_added]]

IMAP `SEARCH`, `SORT` and `THREAD` queries and [[doveadm,search]] queries are
rejected with `Too much nesting in search query` when the search keys are
nested deeper than the process stack allows. The limit is derived from
`RLIMIT_STACK` and is 1024 levels with the common 8 MB default stack. See
[[link,imap_search_nesting_limit]] for the details and how to raise it.
