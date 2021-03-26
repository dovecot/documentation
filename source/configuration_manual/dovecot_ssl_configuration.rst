.. _dovecot_ssl_configuration:

=========================
Dovecot SSL configuration
=========================

.. contents::
   :local:

The most important SSL settings are (in ``conf.d/10-ssl.conf``):

.. code::

  ssl = yes
  # Preferred permissions: root:root 0444
  ssl_cert = </etc/ssl/certs/dovecot.pem
  # Preferred permissions: root:root 0400
  ssl_key = </etc/ssl/private/dovecot.pem


.. Warning:: The ``<`` is mandatory. It indicates that the variable should contain contents of the file, instead of the file name. Not using it will cause an error.

The certificate file can be world-readable, since it doesn't contain anything sensitive (in fact it's sent to each connecting SSL client). The key file's permissions should be restricted to only root (and possibly ssl-certs group or similar if your OS uses such). 

Dovecot opens both of these files while still running as root, so you don't need to give Dovecot any special permissions to read them (in fact: **do not give dovecot user any permissions to the key file**).

It's possible to keep the certificate and the key both in the same file:

.. code::

  # Preferred permissions: root:root 0400
  ssl_cert = </etc/ssl/dovecot.pem
  ssl_key = </etc/ssl/dovecot.pem

It's also possible to use different certificates for IMAP and POP3. However its important to note that ``ssl = yes`` must be set globally if you require SSL for any protocol (or dovecot will not listen on the SSL ports), which in turn requires that a certificate and key are specified globally even if you intend to specify certificates per protocol.

The per protocol certificate settings override the global setting.:

.. code::

  protocol imap {
    ssl_cert = </etc/ssl/certs/imap.pem
    ssl_key = </etc/ssl/private/imap.pem
  }
  protocol pop3 {
    ssl_cert = </etc/ssl/certs/pop3.pem
    ssl_key = </etc/ssl/private/pop3.pem
  }

There are a couple of different ways to specify when SSL/TLS is required:

* ``ssl=no``: SSL/TLS is completely disabled.

* ``ssl=yes`` and ``disable_plaintext_auth=no``: SSL/TLS is offered to the client, but the client isn't required to use it. The client is allowed to login with plaintext authentication even when SSL/TLS isn't enabled on the connection. This is insecure, because the plaintext password is exposed to the internet.

* ``ssl=yes`` and ``disable_plaintext_auth=yes``: SSL/TLS is offered to the client, but the client isn't required to use it. The client isn't allowed to use plaintext authentication, unless SSL/TLS is enabled first. However, if non-plaintext authentication mechanisms are enabled they are still allowed even without SSL/TLS. 
  Depending on how secure they are, the authentication is either fully secure or it could have some ways for it to be attacked.

* ``ssl=required``: SSL/TLS is always required, even if non-plaintext authentication mechanisms are used. Any attempt to authenticate before SSL/TLS is enabled will cause an authentication failure.

  .. NOTE:: If you have only plaintext mechanisms enabled (e.g. auth { mechanisms = plain login } ), ``ssl=yes`` and ``ssl=required`` are completely equivalent because in either case the authentication will fail unless SSL/TLS is enabled first.

  .. NOTE:: With both ``ssl=yes`` and ``ssl=required`` it's still possible that the client attempts to do a plaintext authentication before enabling SSL/TLS, which exposes the plaintext password to the internet. 

             Dovecot attempts to indicate this to the IMAP clients via the LOGINDISABLED capability, but many clients still ignore it and send the password anyway. There is unfortunately no way for Dovecot to prevent this behavior. The POP3 standard doesn't have an equivalent capability at all, so the POP3 clients can't even know if the server would accept a plaintext authentication.

* The main difference between ``ssl=required`` and ``disable_plaintext_auth=yes`` is that if ``ssl=required``, it guarantees that the entire connection is protected against eavesdropping (SSL/TLS encrypts the rest of the connection), while ``disable_plaintext_auth=yes`` only guarantees that the password is protected against eavesdropping (SASL mechanism is encrypted, but no SSL/TLS is necessarily used). Nowadays you most likely should be using SSL/TLS anyway for the entire connection, since the cost of SSL/TLS is cheap enough. Using both SSL/TLS and non-plaintext authentication would be the ideal situation since it protects the plaintext password even against man-in-the-middle attacks.

  .. Note:: The plaintext authentication is always allowed (and SSL not required) for connections from localhost, as they're assumed to be secure anyway. This applies to all connections where the local and the remote IP addresses are equal. Also IP ranges specified by :ref:`setting-login_trusted_networks` setting are assumed to be secure.

Multiple SSL certificates
^^^^^^^^^^^^^^^^^^^^^^^^^

Different certificates per algorithm
************************************

.. versionadded:: v2.2.31

You can specify alternative ssl certificate that will be used if the algorithm differs from the primary certificate. This is useful when migrating to e.g. ECDSA certificate.

.. code::

  ssl_alt_cert = </path/to/alternative/cert.pem
  ssl_alt_key = </path/to/alternative/key.pem

Different certificates per IP and protocol
******************************************

If you have multiple IPs available, this method is guaranteed to work with all clients.

.. code::

  local 192.0.2.10 { # instead of IP you can also use hostname, which will be resolved
    protocol imap {
      ssl_cert = </etc/ssl/dovecot/imap-01.example.com.cert.pem
      ssl_key = </etc/ssl/dovecot/imap-01.example.com.key.pem
    }

    protocol pop3 {
     ssl_cert = </etc/ssl/dovecot/pop-01.example.com.cert.pem
     ssl_key = </etc/ssl/dovecot/pop-01.example.com.key.pem
    }
  }

  local 192.0.2.20 {
    protocol imap {
      ssl_cert = </etc/ssl/dovecot/imap-02.example.com.cert.pem
      ssl_key = </etc/ssl/dovecot/imap-02.example.com.key.pem
    }

    protocol pop3 {
      ssl_cert = </etc/ssl/dovecot/pop-02.example.com.cert.pem
      ssl_key = </etc/ssl/dovecot/pop-02.example.com.key.pem
    }
  }

.. Note:: You will still need a top-level ``default`` ``ssl_key`` and ``ssl_cert`` as well, or you will receive errors.


.. code::

  # doveconf -n
  doveconf: Error: ssl enabled, but ssl_cert not set

With client TLS SNI (Server Name Indication) support
****************************************************

It is important to note that having multiple SSL certificates per IP will not be compatible with all clients, especially mobile ones. It is a TLS SNI limitation. See SSL/SNIClientSupport for list of clients known to (not) support SNI.

.. code-block:: none 

  local_name imap.example.org {
    ssl_cert = </etc/ssl/certs/imap.example.org.crt
    ssl_key = </etc/ssl/private/imap.example.org.key
  }
  local_name imap.example2.org {
    ssl_cert = </etc/ssl/certs/imap.example2.org.crt
    ssl_key = </etc/ssl/private/imap.example2.org.key
  }
  # ..etc..

Password protected key files
****************************

SSL key files may be password protected. There are two ways to provide Dovecot with the password:

 #. Starting Dovecot with ``dovecot -p`` asks the password. It's not stored anywhere, so this method prevents Dovecot from starting automatically at startup.
 #. ``ssl_key_password`` setting. Note that ``dovecot.conf`` is by default world-readable, so you probably shouldn't place it there directly. Instead you could store it in a different file, such as ``/etc/dovecot-private.conf`` containing:

.. code::

  ssl_key_password = secret

and then use ``!include_try /etc/dovecot-private.conf`` in the main ``dovecot.conf``.

Chained SSL certificates
************************

Put all the certificates in the ``ssl_cert`` file. For example when using a certificate signed by TDC the correct order is:

 #. Dovecot's public certificate
 #. TDC SSL Server CA
 #. TDC Internet Root CA
 #. Globalsign Partners CA

SSL security settings
*********************

When Dovecot starts up for the first time, it generates new 512bit and 1024bit Diffie Hellman parameters and saves them into ``<prefix>/var/lib/dovecot/ssl-parameters.dat``. Dovecot v2.1.x and older regenerated them every week by default, but because the extra security gained by the regeneration is quite small, Dovecot v2.2 disabled the regeneration feature completely.


.. Note:: Since v2.3.3+ Diffie-Hellman parameters have been made optional, and you are encouraged to disable non-ECC DH algorithms completely.

From and up to version 2.2, you can specify the wanted DH parameters length using:

.. code::

  ssl_dh_parameters_length = 2048

From version 2.3, you must specify path to DH parameters file using:

.. code::

  ssl_dh = </path/to/dh.pem

To generate new parameters file, you can use:

.. code::

  # This might take a very long time. Run it on a machine with sufficient entropy.
  openssl dhparam 4096 > dh.pem

You can also convert an old v2.2 parameters file with command:

.. code::

  dd if=/path/to/ssl-parameters.dat bs=1 skip=88 | openssl dhparam -inform DER

This should work most of the times. If not, generate new file.

By default Dovecot's allowed ciphers list contains:

.. code::

  ssl_cipher_list = ALL:!kRSA:!SRP:!kDHd:!DSS:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK:!RC4:!ADH:!LOW@STRENGTH

Disallowing more won't really gain any security for those using better ciphers, but it does prevent people from accidentally using insecure ciphers. See https://www.openssl.org/docs/manmaster/man1/ciphers.html for a list of the ciphers.

You should usually prefer server ciphers and their order, so setting

.. code::

  ssl_prefer_server_ciphers = yes

is recommended.

SSL verbosity
*************

.. code::

  verbose_ssl = yes

This will make Dovecot log all the problems it sees with SSL connections. Some errors might be caused by dropped connections, so it could be quite noisy.

Client certificate verification/authentication
**********************************************

If you want to require clients to present a valid SSL certificate, you'll need these settings:

.. code::

  ssl_ca = </etc/ssl/ca.pem
  ssl_verify_client_cert = yes

  auth_ssl_require_client_cert = yes
  # if you want to get username from certificate as well, enable this
  #auth_ssl_username_from_cert = yes

The CA file should contain the certificate(s) followed by the matching CRL(s). 

.. Note:: The CRLs are required to exist. For a multi-level CA place the certificates in this order:

#. Issuing CA cert
#. Issuing CA CRL
#. Intermediate CA cert
#. Intermediate CA CRL
#. Root CA cert
#. Root CA CRL

The certificates and the CRLs have to be in PEM format. To convert a DER format CRL (e.g. http://crl.cacert.org/class3-revoke.crl) into PEM format, use:

.. code::

  openssl crl -in class3-revoke.crl -inform DER -outform PEM > class3-revoke.pem

With the above settings if a client connects which doesn't present a certificate signed by one of the CAs in the ``ssl_ca`` file, Dovecot won't let the user log in. This could present a problem if you're using Dovecot to provide SASL authentication for an MTA (such as Postfix) which is not capable of supplying client certificates for SASL authentication. If you need Dovecot to provide SASL authentication to an MTA without requiring client certificates and simultaneously provide IMAP service to clients while requiring client certificates, you can put ``auth_ssl_require_client_cert=yes`` inside of a protocol block as shown below to make an exemption for SMTP SASL clients (such as Postfix).

.. code::

  protocol !smtp {
    auth_ssl_require_client_cert=yes
  }

You may also force the username to be taken from the certificate by setting ``auth_ssl_username_from_cert=yes``.

* The text is looked up from subject DN's specified field using OpenSSL's ``X509_NAME_get_text_by_NID()`` function.

* By default the ``CommonName`` field is used.

* You can change the field with ``ssl_cert_username_field=name`` setting (parsed using OpenSSL's ``OBJ_txt2nid()`` function). ``x500UniqueIdentifier`` is a common choice.

You may also want to disable the password checking completely. Doing this currently circumvents Dovecot's security model so it's not recommended to use it, but it is possible by making the passdb allow logins using any password (typically requiring `nopassword extra field to be returned <https://wiki.dovecot.org/PasswordDatabase/ExtraFields>`_).

Testing
^^^^^^^
Try out your new setup:

.. code::

  openssl s_client -servername mail.sample.com -connect mail.sample.com:pop3s

You should see something like this:

.. code::

   CONNECTED(00000003)
   depth=2 /O=Root CA/OU=http://www.cacert.org/CN=CA Cert Signing Authority/emailAddress=support@cacert.org
   verify error:num=19:self signed certificate in certificate chain
   verify return:0
   ---
   Certificate chain
   0 s:/CN=mail.example.com
     i:/O=CAcert Inc./OU=http://www.CAcert.org/CN=CAcert Class 3 Root
   1 s:/O=CAcert Inc./OU=http://www.CAcert.org/CN=CAcert Class 3 Root
     i:/O=Root CA/OU=http://www.cacert.org/CN=CA Cert Signing Authority/emailAddress=support@cacert.org
   2 s:/O=Root CA/OU=http://www.cacert.org/CN=CA Cert Signing Authority/emailAddress=support@cacert.org
     i:/O=Root CA/OU=http://www.cacert.org/CN=CA Cert Signing Authority/emailAddress=support@cacert.org
   ---
   Server certificate
   -----BEGIN CERTIFICATE-----
   MIIE1DCCArygAwIBAgIDAMBPMA0GCSqGSIb3DQEBBAUAMFQxFDASBgNVBAoTC0NB
   Y2VydCBJbmMuMR4wHAYDVQQLExVodHRwOi8vd3d3LkNBY2VydC5vcmcxHDAaBgNV
   BAMTE0NBY2VydCBDbGFzcyAzIFJvb3QwHhcNMTAxMjIwMTM1NDQ1WhcNMTIxMjE5
   MTM1NDQ1WjAmMSQwIgYDjksadnjkasndjksandjksandjksandj5YXJlYS5vcmcw
   ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC3jOX3FC8wVqnb2r65Sfvk
   cYUpJhlbhCfqPdN41c3WS0y1Jwwum1q4oMAJvdRnD5TMff1+fqTFy3lS1sYxIXiD
   kBRo478eNqzXHMpBOqbvKjYp/UZgWUNA9ebI1nQtwd7rnjmm/GrtyItjahCsgzDS
   qPAie+mXYzuT49ZoG+Glg7/R/jDcLMcJY0d5eJ7kufB1RLhvRitZD4FEbJVehqhY
   aevf5bLk1BNFhzRBfLXmv6u/kfvWf2HjGAf0aFhaQyiAldDgnZrvaZOFjkToJk27
   p9MguvwGmbciao0DmMjcJhQ0smclFwy8Kj98Tz+nTkfAlU8jJdb1J/tIatJdpSRh
   AgMBAAGjgdwwgdkwDAYDVR0TAQH/BAIwADA0BgNVHSUELTArBggrBgEFBQcDAgYI
   KwYBBQUHAwEGCWCGSAGG+EIEAQYKKwYBBAGCNwoDAzALBgNVHQ8EBAMCBaAwMwYI
   KwYBBQUHAQEEJzAlMCMGCCsGAQUFBzABhadodHRwOi8vb2NzcC5jYWNlcnQub3Jn
   LzBRBgNVknsadkjasnjdksandjksandjsnNlY3VyaXR5YXJlYS5vcmegKQYIKwYB
   BQUHCAWgHQwbbWFpbC5qb2ludC5zZWN1cml0eWFyZWEub3JnMA0GCSqGSIb3DQEB
   BQUAA4ICAQAX8ceObvUZNKYTlNQ/cv0BiA1XweRsVNca1ILACNLdVPR9mvf+aXCh
   ODkHaZAmGngj1DfD4fJsTbaydGWSPeVH91Qi9F+Pi6szhsxylI83NKbuXihcenuG
   twnte8aIb5FelVHttLQPSKRR62E8YmDWk3KYivuFAuZqDaGnWc5yeneTBpsGter/
   4awqsgymBK2YEg1HIWMPaRBvwzCVN/yUyWhFH9Nj11f/xgZE87VXrjLHWT/73i2Z
   S4uIZ2KHQUYuxMGldgpXm+QxFM8DGA6z1T1oPCVfW85cezlfr8QVvX6SXZrAUNL0
   3D5YPzQuevW+5CrqnGA+F5ff4mBMl8R8Sg0+0LoLqt5PbpGyTt9vS1INZCdfvtIA
   /d7Ae7Xp9W8FVRqd7tvNMIy3ZA0/wNMDUczkhC/YtvHfMELpjtMJAGF15OtO7Vik
   V+FZnBP1Yd7760dtEmd6bF8vjcXCvDdxwGtcAehAUpIgAWvkHHOt8+H56tkFENAP
   /ZpJ+Wr+K3lxkkG+BN1bucxMuAdVyTpFyZfKDHRXIO/5e0hpPOaTO+obD3kifzdh
   yy7KmdKvDclHTiPuonJBzEXeM3JQBjcDHbMSyA6+38yBcso27h9VqCQJB2cZmSlW
   ArS/9wt2X21KgeuGHlTZ/8z9gXAjQKXhDYECWWd6LkWl98ZDBihslQ==
   -----END CERTIFICATE-----
   subject=/CN=mail.example.com
   issuer=/O=CAcert Inc./OU=http://www.CAcert.org/CN=CAcert Class 3 Root
   ---
   No client certificate CA names sent
   ---
   SSL handshake has read 5497 bytes and written 293 bytes
   ---
   New, TLSv1/SSLv3, Cipher is DHE-RSA-AES256-SHA
   Server public key is 2048 bit
   Secure Renegotiation IS supported
   Compression: zlib compression
   Expansion: zlib compression
   SSL-Session:
    Protocol  : TLSv1
    Cipher    : DHE-RSA-AES256-SHA
    Session-ID: 114A22BE4625B33F6893124ACF640AE0628B48B5039E90B3B9A20ADF7FA691F3
    Session-ID-ctx:
    Master-Key: B8A55EC91A060575CFB29503FBF7160C2DC8BCBFE02D20A7F704882F72D8D00272D8D002CE5CCC4B94A492F43ED8F
    Key-Arg   : None
    TLS session ticket:
    0000 - 86 c7 46 63 a5 b6 48 74-16 d8 e0 a7 e2 64 e8 89   ..Fc..Ht.....d..
    0010 - 97 90 59 4b 57 f3 e2 b3-e2 d2 88 90 a8 aa b4 44   ..YKW..........D
    0020 - ea 24 08 5e b4 14 7f e1-2a 1a 1c 40 ca 85 e7 41   .$.^....*..@...A
    0030 - 9d 0d a8 4c f7 e3 db 1e-ef da 53 9c fe 43 cc 62   ...L......S..C.b
    0040 - 79 b6 ad ea 9d cf ca b2-37 41 b7 0f ea 7d 59 e8   y.......7A...}Y.
    0050 - 10 01 a0 eb dc c2 63 66-56 54 6a e8 3a 4b 93 49   ......cfVTj.:K.I
    0060 - 77 da e4 4b 21 e8 30 7e-bf 10 91 3a 2c f9 59 80   w..K!.0~...:,.Y.
    0070 - 01 1f 36 0b 92 85 67 55-c8 86 1d 44 b1 6f 0d ae   ..6...gU...D.o..
    0080 - 15 36 b6 49 3a ef 94 9a-ef 6d 27 f0 80 20 43 09   .6.I:....m'.. C.
    0090 - be 70 c5 30 15 3b 93 c6-c1 4c e9 7f 5c 34 98 dd   .p.0.;...L..\4..

    Compression: 1 (zlib compression)
    Start Time: 1292857721
    Timeout   : 300 (sec)
    Verify return code: 19 (self signed certificate in certificate chain)
   ---
   +OK Dovecot ready.

Testing CA
**********

The above test procedure returns:

.. code::

  Verify return code: 19 (self signed certificate in certificate chain)

which is expected result since test command omits option to verify CA root certificate. The following commands will enable CA root certificate validation.

Testing CA On Debian
********************

On Debian derived distributions try:

.. code::

  openssl s_client -CApath /etc/ssl/certs -connect mail.sample.com:pop3s

Testing CA On RHEL
******************

On Red Hat Enterprise Linux derived distributions try:

.. code::

  openssl s_client -CAfile /etc/pki/tls/cert.pem -connect mail.sample.com:pop3s

Testing CA Success
******************

   Verify return code: 0 (ok)

Client connections
******************

.. versionadded:: v2.3.4 

Dovecot uses default system CAs for outgoing connections.

.. code::

  ssl_client_ca_dir = /path/to/pem/certificates
  ssl_client_ca_file = /path/to/pem/bundle
