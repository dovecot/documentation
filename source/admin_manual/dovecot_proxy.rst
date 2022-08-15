.. _dovecot_proxy:

=================
Dovecot Proxy
=================

Dovecot supports proxying IMAP, POP3, Submission (v2.3+), LMTP, and ManageSieve connections to other hosts.  Their job is to simply look up the user's current site from passdb and proxy the connection to that site's Dovecot Director cluster. User is also typically authenticated at this stage.

The proxying can be done for all users, or only for some specific users. There are two ways to do the authentication:

1. Forward the password to the remote server. The proxy may or may not perform authentication itself. This requires that the client uses only cleartext authentication mechanism, or alternatively the proxy has access to users' passwords in cleartext.

2. Let Dovecot proxy perform the authentication and login to remote server using the proxy's master password. This allows client to use also non-cleartext authentication mechanism.

If the storage between sites is replicated, it's possible to do site failover. Deciding when to do a site failover can be either a manual process or it can be done via an automated watchdog. The failover shouldn't be done too quickly, because it will cause a large load spike when a lot of users start logging into the failover site where users have no local caches. So typically the watchdog script should wait at least 5 minutes to see if the network between sites comes back up before deciding that the other side is down.

Once it's decided that a site failover should be done, the passdb needs to be updated to switch the affected users' site to the fallback site. Normally this is done with LDAP passdb by keeping track of ``username -> virtual site ID`` and ``virtual site ID -> IP address``.

Each physical site would have about 10-100 virtual site IDs. On failover the failed site's virtual IDs' IP addresses are updated. This way only a few records are updated instead of potentially millions of user records. Having multiple virtual site IDs per physical site has two advantages:

1. If there are more than two physical sites, it allows distributing the failed site's users to multiple failover sites.

2. When the original site comes back up the users can be restored to it one virtual site at a time to avoid a load spike.

.. Note:: During a split brain both sites may decide that the other site isn't available and redirect all incoming connections to the local site. This means that both sites could modify the same mailbox simultaneously. With the Dovecot Object Storage backend this behavior is fine. When split brain is over the changes will be merged, so there is no data loss. The merging reduces the performance temporarily though, so it shouldn't be relied on during normal operation.

If you wish to reduce the amount of needed hardware, Dovecot Proxies don't necessarily need to be separated from Dovecot Directors. A single Dovecot instance can perform both operations. The only downside is that it slightly complicates understanding what the server is doing.

