====================================
SSL certificate importing to clients
====================================

You may import either the server's self-signed certificate or the CA
certificate (see :doc:`certificate_creation`).

Windows 11
----------

See `<https://learn.microsoft.com/en-us/dotnet/framework/wcf/feature-details/working-with-certificates>`__.

Mac OS X
--------

-  Doubleclick the certificate

-  Keychain should open

-  Add the certificate to X509 Anchors keychain

Apple Mail uses the OS X's certificate store.

Thunderbird
-----------

Preferences -> Privacy -> Security -> View Certificates -> Authorities
-> Import -> Trust this CA to identify email users.

Opera Mail
----------

Preferences -> Advanced > Security > Certificates > Import certificate
file.

Evolution
---------

Preferences -> Certificates -> Authorities -> Import -> Trust this CA to
identify email users.

Mutt
----

See `<https://gitlab.com/muttmua/mutt/-/wikis/MuttGuide/UseIMAP>`__.

Pine
----

`<http://www.madboa.com/geek/pine-ssl/>`__ tells a story how to do
this. Basically it seems to be:

1. Find out your OPENSSLDIR: ``openssl version -d``

2. Get a hash of your certificate:
   ``openssl x509 -in cert.pem -hash -noout``

3. Copy the certificate to ``$OPENSSLDIR/certs/$hash.0``

This probably works only for self-signed certificates.

KMail
-----

See `<https://docs.kde.org/stable5/en/kmail/kmail2/manual-configuration-quickstart.html>`__.

Claws Mail
----------

Configuration -> Edit accounts (Choose here your's one and press
'Edit'-button)

Account -> SSL -> Certificate for receiving->Browse
