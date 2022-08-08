.. _ssl_configuration:

========================
SSL Configuration
========================


For more details see:

* :ref:`ssl`
* :ref:`dovecot_ssl_configuration`
: :dovecot_core:ref:`auth_allow_cleartext`

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
