.. _dovecot_proxy:

=================
Dovecot Proxy
=================

Dovecot supports proxying IMAP, POP3, Submission (v2.3+), LMTP, and ManageSieve
connections to other hosts. The proxies jobs are typically:

 * Handle SSL/TLS encryption
 * Authenticate the user
 * Find out the user's current backend and proxy the connection there

The proxying can be done for all users, or only for some specific users. There are two ways to do the authentication:

#. Forward the password to the remote server. The proxy may or may not perform
   authentication itself. This requires that the client uses only cleartext
   authentication mechanism, or alternatively the proxy has access to users'
   passwords in cleartext.

#. Let Dovecot proxy perform the authentication and login to remote server
   using the proxy's master password. This allows client to use also
   non-cleartext authentication mechanism.

.. seealso:: :ref:`dovecot_cluster_architecture`
