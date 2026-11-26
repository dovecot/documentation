---
layout: doc
title: Caching
dovecotlinks:
  auth_caching: Authentication Caching
---

# Authentication Caching

Dovecot supports caching the results of [[link,passdb]] and [[link,userdb]]
lookups. The following rules apply to using the authentication cache:

- Data is used from the cache if it's not expired ([[setting,auth_cache_ttl]]
  setting)

  - If authentication fails this time, but it didn't fail last time,
    it's assumed that the password has changed and a database lookup
    is done.

- If a database lookup fails because of some internal error, the lookup
  fails. Expired cache entries are not used.

  [[changed,settings_auth_cache_ttl_changed]] Older versions used the
  expired cache entry if the database lookup failed with an internal error.
  This was meant to allow logins while the database was temporarily down,
  but it was rarely useful and not worth the security risk: expired entries
  stay in the cache until they are evicted, so with a large cache stale
  authentication data could have been used indefinitely.

The authentication cache can be flushed with the
[[doveadm,auth cache flush]] command.

The [[doveadm,auth cache status]] command shows the number
of cache hits and misses, hit ratio, and cache size. You can use that
information for tuning the cache size and TTL. Pass `--reset` to clear
the hit/miss counters after reading them.

## Settings

::: tip
Dovecot attempts to catch password changes (see the rules above), so the
cache TTL mainly controls how quickly other changes are noticed. For example
a user that was disabled in the database can still log in using the cached
data until the cache entry expires.
:::

<SettingsComponent tag="auth_cache" />

## Password Changing Scenarios

## Normal

1. User logs in with password X. The password X is added to cache and
   login succeeds.

2. Password is changed to Y.

3. User logs in with password Y. The cached password X doesn't match Y,
   but since the previous authentication was successful Dovecot does
   another backend passdb lookup to see if the password changed. It did,
   so the password Y is cached and login succeeds.

## Old Cached Password

1. User logs in with password X. The password X is added to cache and
   login succeeds.

2. Password is changed to Y.

3. User logs in with password X. The cached password X matches X, so
   login succeeds.

## Early Change

1. User logs in with password X. The password X is added to cache and
   login succeeds.

2. User logs in with password Y. The cached password X doesn't match Y,
   but since the previous authentication was successful Dovecot does
   another backend passdb lookup to see if the password changed. It
   didn't, so the login fails.

3. Password is changed to Y.

4. User logs in with password Y. The cached password X doesn't match Y
   and the previous authentication was unsuccessful, so Dovecot doesn't
   bother doing another backend passdb lookup (until cache TTL expires).
   The login fails.
