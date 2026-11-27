---
layout: doc
title: Limits
dovecotlinks:
  limits: Dovecot Limits
---

# Dovecot Limits

Dovecot contains various configurable and built-in resource limits designed to
prevent overload and denial of service situations or enforce security
constraints.

This page lists those limits; general access policies (such as
UID/GID ranges or TLS protocol requirements) and performance tuning knobs are
not included here.

## Message Headers

There is a `10 MB` limit for a single message header block.

There is a `50 MB` limit for all header blocks in a message.

## MIME Parts

The maximum number of MIME parts per message is 10000.

A maximum of 100 MIME parts can be nested in the same hierarchy path.

## Search Query Nesting

[[added,imap_search_nesting_limit_added]]

IMAP `SEARCH`, `SORT` and `THREAD` queries and [[doveadm,search]] queries are
rejected with `Too much nesting in search query` when the search keys are
nested deeper than the process stack allows. The limit is derived from
`RLIMIT_STACK` and is 1024 levels with the common 8 MB default stack. See
[[link,imap_search_nesting_limit]] for the details and how to raise it.

## Settings

### Storage Size Limits

<SettingsComponent tag="storage_size_limits" level="3" :show_plugin="true" />

#### See Also

* [[link,quota_root]]
* [Sieve Limits](#sieve-limits)

### User Concurrency Limits

<SettingsComponent tag="user_concurrency_limits" level="3" :show_plugin="true" />

### Process and Memory Limits

<SettingsComponent tag="process_memory_limits" level="3" :show_plugin="true" />

### Authentication Failure Delays

<SettingsComponent tag="auth_limits" level="3" :show_plugin="true" />

### Mail and IMAP Limits

<SettingsComponent tag="mail_imap_limits" level="3" :show_plugin="true" />

### Mail Cache Limits

<SettingsComponent tag="mail_cache_limits" level="3" :show_plugin="true" />

### Submission Queue Limits

<SettingsComponent tag="submission_queue_limits" level="3" :show_plugin="true" />

### FTS Limits

<SettingsComponent tag="fts_limits" level="3" :show_plugin="true" />

### Sieve Limits

<SettingsComponent tag="sieve_limits" level="3" :show_plugin="true" />

### HTTP Limits

<SettingsComponent tag="http_limits" level="3" :show_plugin="true" />

### Database Queue Limits

<SettingsComponent tag="db_queue_limits" level="3" :show_plugin="true" />
