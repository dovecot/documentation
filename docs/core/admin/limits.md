---
layout: doc
title: Limits
---

# Dovecot Built-in Limits

Dovecot contains various built-in resource limits designed to prevent
denial of service situations. This page lists those limits.

::: todo
This list is currently incomplete.
:::

## Message Headers

There is a `10 MB` limit for a single message header block, and a `50 MB`
limit for all header blocks in a message.
