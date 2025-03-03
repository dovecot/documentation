---
layout: doc
title: Penalty
dovecotlinks:
  auth_penalty: authentication penalty
---

# Authentication Penalty

<!-- @include: include/anvil-overview.inc -->

## Algorithm

<!-- @include: include/anvil-algorithm.inc -->

## Problems

<!-- @include: include/anvil-problems.inc -->

## Disabling

Authentication penalty tracking can be disabled completely with:

```[dovecot.conf]
service anvil {
  unix_listener anvil-auth-penalty {
    mode = 0
  }
}
```
