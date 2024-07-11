---
layout: doc
title: Limits
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
