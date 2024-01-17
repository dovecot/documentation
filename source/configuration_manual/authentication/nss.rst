.. _authentication-nss:

=====
 NSS
=====

.. dovecotdeprecated:: 2.3.0

.. NOTE:: This userdb is probably useless with Dovecot v2.0.12+, since it uses
          ``getpwnam_r()``, which supports error reporting.

Usually `NSS <https://en.wikipedia.org/wiki/Name_Service_Switch>`_ is used
with :ref:`authentication-passwd` userdb, but it has one problem:

   * It can't distinguish between temporary and permanent errors.

So if you're using e.g. ``nss_ldap`` and your LDAP database is down, all userdb
lookups may return ``user doesn't exist`` errors. This is especially bad if
you're using :ref:`lda`, which causes the mails to be bounced back to sender.

The NSS userdb works around this problem by loading the NSS modules and calling
them itself. This is a bit kludgy, and it probably works only with Linux.

This userdb has two parameters:

* **service=<name>**: This parameter is required. The name specifies what NSS
  module to use, for example ``ldap``.
* **blocking=no** causes the lookups to be done in auth master processes
  instead of in worker processes.

Example
=======

.. code-block:: none

  userdb db1 {
    driver = nss
    args = service=ldap
  }
