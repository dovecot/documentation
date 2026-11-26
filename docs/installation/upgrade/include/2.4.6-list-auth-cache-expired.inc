 * Expired authentication cache entries are no longer used when the passdb or
   userdb lookup fails with an internal error. This fallback was meant to
   allow logins while the database is temporarily down, but it was rarely
   useful and not worth the security risk of using stale authentication data
   indefinitely with a large cache. [[setting,auth_cache_ttl]] is now the
   maximum time that cached data is used. During a database outage logins
   fail after the cache entries have expired.
