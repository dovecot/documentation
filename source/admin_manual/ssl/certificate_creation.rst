SSL certificate creation
========================

Self-signed SSL certificates
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Self-signed SSL certificates are the easiest way to get your SSL server working. However unless you take some action to prevent it, **this is at the cost of security**:

 * The first time the client connects to the server, it sees the certificate and asks the user whether to trust it. The user of course doesn't really bother verifying the certificate's fingerprint, so a man-in-the-middle attack can easily bypass all the SSL security, steal the user's password and so on.
 * If the client was lucky enough not to get attacked the first time it connected, the following connections will be secure as long as the client had permanently saved the certificate. Some clients do this, while others have to be manually configured to accept the certificate.

The only way to be fully secure is to import the SSL certificate to client's (or operating system's) list of trusted CA certificates prior to first connection. See [[SSL/CertificateClientImporting]] how to do it for different clients.

Self-signed certificate creation
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Dovecot includes a script to build self-signed SSL certificates using OpenSSL. In the source distribution this exists in https://dovecot.org/tools/mkcert.sh. Binary installations usually create the certificate automatically when installing Dovecot and don't include the script.

The SSL certificate's configuration is taken from https://dovecot.org/doc/dovecot-openssl.cnf file. Modify the file before running mkcert.sh. Especially important field is the CN (Common Name) field, which should contain your server's host name. The clients will verify that the CN matches the connected host name, otherwise they'll say the certificate is invalid. It's also possible to use wildcards (eg. \*.domain.com) in the host name. They should work with most clients.

By default the certificate is created to ``/etc/ssl/certs/dovecot.pem`` and the private key file is created to ``/etc/ssl/private/dovecot.pem``. Also by default the certificate will expire in 365 days. If you wish to change any of these, modify the ``mkcert.sh`` script.

Certificate Authorities
^^^^^^^^^^^^^^^^^^^^^^^

The correct way to use SSL is to have each SSL certificate signed by an Certificate Authority (CA). The client has a list of trusted Certificate Authorities, so whenever it sees a new SSL certificate signed by a trusted CA, it will automatically trust the new certificate without asking the user any questions.

There are two ways to get a CA signed certificate: get it from an external CA, or create your own CA.

The clients have a built-in list of trusted CAs, so getting it from one of those CAs will have the advantage of the certificate working without any client configuration. There are already-trusted-CAs where you can buy the certificate, and there are already-trusted-CAs where you can get your certificate for free. On the other hand, if you create your own CA, you'll have to install the CA certificate to all the clients (see `certificate_client_importing`.

So the two options end up being three:

 # Get it from an external CA (which already have the public keys installed on the clients, so the clients trust the CA)
 # # Purchase the certificate.
 # # Get a free certificate.
 # Create your own CA (in this case you'll have to add the CA public keys into the clients, as you are bot trusted by default)

If you choose "1.2", there is https://letsencrypt.org/| where you need to do some technical effort to demonstrate to a robot that you own the domains for which the certificate is issued. Let's encrypt is an initiative of the Internet Security Research Group (ISRG), with board members from Cisco, Mozilla and the University of Michigan among others and technical advisors from Akamai, Google, Electronic Frontier Foundation, Internet Society and independents among others. Let's encrypt CA is trusted by default by many clients. If you can control the entries in your DNS, you'll be able to demonstrate to the robot that "you are you" for domain-based identities. See https://www.eff.org/deeplinks/2019/01/encrypting-web-encrypting-net-primer-using-certbot-secure-your-mailserver. 

If you choose "2", there are multiple different tools for managing your own CA. The simplest way is to use a CA managing tool as `gnoMint <https://gnomint.sourceforge.net/>`_ or `TinyCA <https://opsec.eu/src/tinyca/>`_. However, if you need to tailor the properties of the CA, you always can use OpenSSL, very much customizable, but however a bit cumbersome.

