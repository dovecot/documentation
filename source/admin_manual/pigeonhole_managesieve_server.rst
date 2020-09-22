.. _pigeonhole_managesieve_server:

==============================
Pigeonhole ManageSieve Server
==============================

The :ref:`Pigeonhole project <sieve>` provides `Sieve
<http://sieve.info/>`__ support for Dovecot, which allows users to filter
incoming messages by writing scripts specified in the Sieve language (`RFC
5228 <https://tools.ietf.org/html/rfc5228>`__).
The Pigeonhole ManageSieve service is used to manage a user's Sieve
script collection. It has the following advantages over doing it directly via
filesystem:

* No need to let users log in via FTP/SFTP/etc, which could be difficult
  especially with virtual users.
* ManageSieve is a `standard protocol <https://tools.ietf.org/html/rfc5804>`__,
  so users can manage their scripts using (hopefully) user-friendly ManageSieve
  clients. Many webmails already include a ManageSieve client.
* Scripts are compiled before they are installed, which guarantees that the
  uploaded script is valid. This prevents a user from inadvertently installing
  a broken Sieve script.

Configuration and Use
=====================

* :ref:`Download and Installation
  <sieve_installation>`
* `Configuration
  <https://wiki.dovecot.org/Pigeonhole/ManageSieve/Configuration>`__
* `Troubleshooting
  <https://wiki.dovecot.org/Pigeonhole/ManageSieve/Troubleshooting>`__
* `Client Issues <https://wiki.dovecot.org/Pigeonhole/ManageSieve/Clients>`__
