.. _dovecot_proxy:

=================
Dovecot Proxy
=================

Dovecot supports proxying IMAP, POP3, Submission (v2.3+), LMTP, and ManageSieve connections to other hosts.  Their job is to simply look up the user's current site from passdb and proxy the connection to that site's Dovecot Director cluster. User is also typically authenticated at this stage.

The proxying can be done for all users, or only for some specific users. There are two ways to do the authentication:

1. Forward the password to the remote server. The proxy may or may not perform authentication itself. This requires that the client uses only cleartext authentication mechanism, or alternatively the proxy has access to users' passwords in cleartext.

2. Let Dovecot proxy perform the authentication and login to remote server using the proxy's master password. This allows client to use also non-cleartext authentication mechanism.

.. seealso:: :ref:`dovecot_cluster_architecture`
