---
layout: doc
title: Caching
dovecotlinks:
  auth_caching: authentication caching
---

# Authentication Caching

Dovecot supports caching the results of [[link,passdb]] and [[link,userdb]]
lookups. The following rules apply to using the authentication cache:

- Data is used from the cache if it's not expired ([[setting,auth_cache_ttl]]
  setting)

  - If authentication fails this time, but it didn't fail last time,
    it's assumed that the password has changed and a database lookup
    is done.

- If a database lookup fails because of some internal error, but data
  still exists in the cache (even if expired), the cached data is used.
  This allows Dovecot to log in some users even if the database is
  temporarily down.

The authentication cache can be flushed by sending a SIGHUP to
dovecot-auth.

Sending SIGUSR2 to dovecot-auth makes it log the number of cache hits
and misses. You can use that information for tuning the cache size and
TTL.

## Settings

::: tip
It should be pretty safe to set very high TTLs, because the only field
that usually can change is the user's password, and Dovecot attempts to
catch those cases (see the rules above).
:::

<SettingsComponent tag="auth_cache" />

## Cache Keys

Usually only the username uniquely identifies a user, but in some setups
you may need something more, for example the remote IP address.

For SQL and LDAP lookups Dovecot figures this out automatically by using
all the used [[variable]] as the cache key. For example,
if your SQL query contains `%{protocol}`, `%{user}`, and `%{remote_ip}` the
cache entry is used only if all of them (service name, username and remote IP)
match for the new lookup.

With other databases Dovecot doesn't know what could affect caching, so
you have to tell Dovecot manually. The following databases require
specifying the cache key (via `cache_key`):

- [[link,auth_pam]]
- [[link,auth_bsd]]

For example if the PAM lookup depends on username and service, you can
use:

```[dovecot.conf]
passdb db1 {
  driver = pam
  args = cache_key=%{protocol}%{user} *
}
```

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
