---
layout: doc
title: Penalty
dovecotlinks:
  auth_penalty: authentication penalty
---

# Authentication Penalty

Dovecot anvil process tracks authentication penalties for different IPs
to slow down brute force login attempts.

## Algorithm

- First auth failure reply will be delayed for 2 seconds (this happens
  even without auth penalty)

  - `AUTH_PENALTY_INIT_SECS` in `src/auth/auth-penalty.h`

- The delay will be doubled for 4 -> 8 seconds, and then the upper
  limit of 15 seconds is reached.

  - `AUTH_PENALTY_MAX_SECS` and `AUTH_PENALTY_MAX_PENALTY` in
    `src/auth/auth-penalty.h`

- If the IP is in [[setting,login_trusted_networks]] (e.g. webmail), skip any
  authentication penalties

- If the username+password combination is the same as one of the last
  10 login attempts, skip increasing authentication penalty.

  - `CHECKSUM_VALUE_PTR_COUNT` in `src/anvil/penalty.c`

  - The idea is that if a user has simply configured the password
    wrong, it shouldn't keep increasing the delay.

  - The username+password is tracked as the CRC32 of them, so there is
    a small possibility of hash collisions

## Problems

- It is still possible to do multiple auth lookups from the same IP in
  parallel.

- For IPv6 it currently blocks the entire /48 block, which may or may
  not be what is wanted.

  - `PENALTY_IPV6_MASK_BITS` in `auth-penalty.c`

## Disabling

Authentication penalty tracking can be disabled completely with:

```[dovecot.conf]
service anvil {
  unix_listener anvil-auth-penalty {
    mode = 0
  }
}
```
