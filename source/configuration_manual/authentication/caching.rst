.. _authentication-caching:

=================================
Caching of authentication results
=================================

Dovecot supports caching the results of password and user database
lookups. The following rules apply to using the authentication cache:

-  Data is used from the cache if it's not expired
   (:dovecot_core:ref:`auth_cache_ttl` setting)

   -  If authentication fails this time, but it didn't fail last time,
      it's assumed that the password has changed and a database lookup
      is done.

-  If a database lookup fails because of some internal error, but data
   still exists in the cache (even if expired), the cached data is used.
   This allows Dovecot to log in some users even if the database is
   temporarily down.

The authentication cache can be flushed by sending a SIGHUP to
dovecot-auth.

Sending SIGUSR2 to dovecot-auth makes it log the number of cache hits
and misses. You can use that information for tuning the cache size and
TTL.

Settings
--------

The settings related to the authentication cache are:

:dovecot_core:ref:`auth_cache_size`
   Authentication cache size, 0 disables caching
   (default). A typical passdb cache entry is around 50 bytes and a
   typical userdb cache entry is around 100-200 bytes, depending on the
   amount of information your user and password database lookups return.

:dovecot_core:ref:`auth_cache_ttl`
   Time to live in seconds for cache entries. A
   cache entry is no longer used (except for internal failures) if it
   was created more than this many seconds ago. Entries are removed from
   the cache only when the cache is full and a new entry is to be added.

:dovecot_core:ref:`auth_cache_negative_ttl`
   If a passdb or userdb lookup didn't return any data (i.e. the user
   doesn't exist), it's also stored in the cache as a negative entry.
   This setting allows you to give negative entries a different TTL.
   0 disables negative caching completely.

:dovecot_core:ref:`auth_cache_verify_password_with_worker`
   Password hash verifications are done by the auth master process by
   default. Setting this to "yes" moves the verification to auth-worker
   processes. This allows distributing the hash calculations to multiple
   CPU cores, which could make sense if strong hashes are used. (v2.2.34+)

It should be pretty safe to set very high TTLs, because the only field
that usually can change is the user's password, and Dovecot attempts to
catch those cases (see the rules above).

Cache keys
----------

Usually only the username uniquely identifies a user, but in some setups
you may need something more, for example the remote IP address. For SQL
and LDAP lookups Dovecot figures this out automatically by using all the
used :ref:`variables <config_variables>` as the cache key. For example
if your SQL query contains ``%{protocol}``, ``%{user}`` and ``%{remote_ip}`` the cache entry is used only
if all of them (service name, username and remote IP) match for the new lookup.

With other databases Dovecot doesn't know what could affect caching, so
you have to tell Dovecot manually. The following databases require
specifying the cache key:

-  pam

-  bsdauth

For example if the bsdauth lookup depends on username and service, you can
use:

::

   passdb bsdauth {
     args = cache_key=%{protocol}%u *
   }

Password changing scenarios
---------------------------

Normal scenario:

1. User logs in with password X. The password X is added to cache and
   login succeeds.

2. Password is changed to Y.

3. User logs in with password Y. The cached password X doesn't match Y,
   but since the previous authentication was successful Dovecot does
   another backend passdb lookup to see if the password changed. It did,
   so the password Y is cached and login succeeds.

Using old cached password scenario:

1. User logs in with password X. The password X is added to cache and
   login succeeds.

2. Password is changed to Y.

3. User logs in with password X. The cached password X matches X, so
   login succeeds.

Early change scenario:

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
