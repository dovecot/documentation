.. _authentication-allow_nets:

======================
allow_nets extra field
======================

The allow_nets field is a comma separated list of IP addresses and/or networks
where the user is allowed to log in from. If the user tries to log in from
elsewhere, the authentication will fail the same way as if a wrong password was
given.

Example: ``allow_nets=127.0.0.0/8,192.168.0.0/16,1.2.3.4,4.5.6.7``.

IPv6 addresses are also allowed. IPv6 mapped IPv4 addresses (eg.
``::ffff:1.2.3.4``) are converted to standard IPv4 addresses before matching.
Example: ``allow_nets=::1,2001:abcd:abcd::0:0/80,1.2.3.4``

Using "local" matches any auth connection that doesn't have an IP address.
This usually means internal auth lookups from e.g. doveadm.
Example: ``allow_nets=127.0.0.0/8,local``

passwd-file example
===================

.. code-block:: none

  user:{plain}password::::::allow_nets=192.168.0.0/24

Keyword 'local'
===============

The keyword ``local`` is accepted for Non-IP connections like Unix socket. For
example, with a Postfix/LMTP delivery setup, you must include ``local`` for
Postfix to verify the email account:

.. code-block:: none

  passdb static {
    password = test
    fields  {
      allow_nets = local,127.0.0.1/32
    }
  }

Otherwise, you will see this error in the log:

.. code-block:: none

  [/var/run/dovecot/lmtp] said: 550 5.1.1 <test2@example.com> User doesn't exist: test2@example.com (in reply to RCPT TO command))