.. _pigeonhole_managesieve_server:

==============================
Pigeonhole ManageSieve Server
==============================

The `Pigeonhole project <https://wiki.dovecot.org/Pigeonhole>`_ provides `Sieve
<http://sieve.info/>`_ support for Dovecot, which allows users to filter
incoming messages by writing scripts specified in the Sieve language (RFC
5228). The Pigeonhole ManageSieve service is used to manage a user's Sieve
script collection. It has the following advantages over doing it directly via
filesystem:

* No need to let users log in via FTP/SFTP/etc, which could be difficult
  especially with virtual users.
* ManageSieve is a `standard protocol <https://tools.ietf.org/html/rfc5804>`_,
  so users can manage their scripts using (hopefully) user-friendly ManageSieve
  clients. Many webmails already include a ManageSieve client.
* Scripts are compiled before they are installed, which guarantees that the
  uploaded script is valid. This prevents a user from inadvertently installing
  a broken Sieve script.

Configuration and Use
=====================

* `Download and Installation
  <https://wiki.dovecot.org/Pigeonhole/Installation>`_
* `Configuration
  <https://wiki.dovecot.org/Pigeonhole/ManageSieve/Configuration>`_
* `Troubleshooting
  <https://wiki.dovecot.org/Pigeonhole/ManageSieve/Troubleshooting>`_
* `Client Issues <https://wiki.dovecot.org/Pigeonhole/ManageSieve/Clients>`_
