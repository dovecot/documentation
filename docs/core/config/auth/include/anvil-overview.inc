Dovecot anvil process tracks authentication penalties for different IPs
to slow down brute force login attempts. The penalty is increased after failed
logins until a maximum value, unless [[link,passdb_extra_field_nodelay]] is
used. The penalty is applied for the IP before passdb lookups are done, so
the delay might exist even with `nodelay` if it is not used for all
authentication attempts for the IP.
