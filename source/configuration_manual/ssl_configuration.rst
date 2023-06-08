.. _ssl_configuration:

========================
SSL Configuration
========================


For more details see:

* :ref:`ssl`
* :ref:`dovecot_ssl_configuration`
* :dovecot_core:ref:`auth_allow_cleartext`

.. code-block:: none

   ssl_cert = </etc/dovecot/dovecot.crt
   ssl_key = </etc/dovecot/dovecot.key

SSL certificate and SSL secret key files. You must use the ``<`` prefix so Dovecot reads the cert/key from the file. (Without ``<`` Dovecot assumes that the certificate is directly included in the ``dovecot.conf.``) 
For using different SSL certificates for different IP addresses you can put them inside local {} blocks: 

.. code-block:: none

   local 10.0.0.1 {
   ssl_cert = </etc/dovecot/dovecot.crt
   ssl_key = </etc/dovecot/dovecot.key
    }
    local 10.0.0.2 {
    ssl_cert = </etc/dovecot/dovecot2.crt
    ssl_key = </etc/dovecot/dovecot2.key
   }

If you need different SSL certificates for IMAP and POP3 protocols, you can put them inside protocol ``{}`` blocks : 

.. code-block:: none

    local 10.0.0.1 {
    protocol imap {
        ssl_cert = </etc/dovecot/dovecot-imap.crt
        ssl_key = </etc/dovecot/dovecot-imap.key
    }
    protocol pop3 {
        ssl_cert = </etc/dovecot/dovecot-pop3.crt
        ssl_key = </etc/dovecot/dovecot-pop3.key
    }
   }

Dovecot supports also using TLS SNI extension for giving different SSL certificates based on the server name when using only a single IP address, but the TLS SNI isn't yet supported by all clients so that may not be very useful. 

It's anyway possible to configure it by using ``local_name imap.example.com {}`` blocks.

.. _ssl_ja3:

JA3 identifier
--------------

.. dovecotadded:: 2.4.0,3.0.0

Dovecot supports calculating `JA3 hash <https://engineering.salesforce.com/tls-fingerprinting-with-ja3-and-ja3s-247362855967/>`__ for checking client TLS implementation.
This adds ``ssl_ja3`` and ``ssl_ja3_hash`` to :ref:`login variables <variables-login>`, to be used with :dovecot_core:ref:`login_log_format_elements`
and ``ssl_ja3_hash`` for :ref:`authentication variables <variables-auth>`, to be used with e.g. :ref:`authentication-auth_policy`.

To get JA3 values, you will need to use OpenSSL 1.1 or newer.

Common JA3 hash databases usually use values provided by HTTP clients. Since IMAP, POP3 etc. do not currently use some of these extensions,
you should not use these. They will not match.

Some examples for demonstration purposes only.

.. code:: none

  Mutt 2.2.9, TLS1.3, GnuTLS
     ja3=771,4866-4867-4865-4868-49196-52393-49325-49162-49195-49324-49161-49200-52392-49172-49199-49171-157-49309-53-156-49308-47-159-52394-49311-57-158-49310-51,5-10-11-13-22-23-35-51-43-65281-0-45,23-24-25-29-30-256-257-258-259-260,0
     ja3_hash=b7e9d913d85c071f5b806d59601e9b96

  OpenSSL 1.1.1n, TLS1.3
     ja3=771,4866-4867-4865-49196-49200-159-52393-52392-52394-49195-49199-158-49188-49192-107-49187-49191-103-49162-49172-57-49161-49171-51-157-156-61-60-53-47-255,11-10-35-22-23-13-43-45-51,29-23-30-25-24,0-1-2
     ja3_hash=c34a54599a1fbaf1786aa6d633545a60

  Thunderbird 102.4.2+build2-0ubuntu0.22.04.1, TLS1.3
     ja3=771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53,0-23-65281-10-11-35-5-51-43-13-45-21,29-23-24-25-256-257,0
     ja3_hash=3ed71a458200f4af79031644408b8e58
