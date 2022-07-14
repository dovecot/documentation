.. _ssl:

====
SSL
====

.. toctree::
  :maxdepth: 1

  certificate_creation

LetsEncrypt has a good primer on mail server SSL certificates, see https://www.eff.org/deeplinks/2019/01/encrypting-web-encrypting-net-primer-using-certbot-secure-your-mailserver.

SSL works pretty much the same universally, so for more information about SSL
you can see for example `Apache's documentation <http://httpd.apache.org/docs/2.2/ssl/>`_

SSL, TLS and STARTTLS confusion
-------------------------------

SSL and TLS terms are often used in confusing ways:

* SSL (Secure Sockets Layer) is the original protocol implementation. SSLv3 is
  still allowed by Dovecot, but it's rarely used. Some clients use SSL to mean
  that they're going to connect to the imaps (993), pop3s (995) or smtps (465)
  port, although they're still going to use TLSv1 protocol.

* TLS (Transport Layer Security) replaced the SSL protocol. TLSv1 protocol is
  used practically always nowadays. Some clients use TLS to mean that they're
  going to use STARTTLS command after connecting to the standard imap (143),
  pop3 (110) or smtp port (25/587). Nothing would prevent using SSLv3 protocol
  after STARTTLS command.

Unfortunately there doesn't seem to be any clear and simple way to refer to
these different meanings. SSL term is much more widely understood than TLS, so
Dovecot configuration and this documentation only talks about SSL when in fact
it means both SSL/TLS.

Originally SSL support was added to protocols by giving them a separate ``SSL
port`` (imaps, pop3s, etc.), where the SSL handshake starts immediately when
client connects, and only after the session is encrypted the regular protocol
handling begins.

Using two separate ports for plaintext and SSL connections was thought to be
wasteful and adds complexity for clients which may wish to make use of SSL when
it is advertised, so STARTTLS command was added and intended to deprecate the
SSL ports.

Clients using STARTTLS work by connecting to the regular unencrypted port and
immediately issue a STARTTLS command, after which the session is encrypted.
After SSL handshake there is no difference between SSL port initiated
connections and STARTTLS initiated connections.

SSL port deprecation never really happened, probably because of a few reasons:

* Some admins don't even know about STARTTLS.
* Some admins want to require SSL/TLS, but don't realize that this is also
  possible with STARTTLS (Dovecot has :dovecot_core:ref:`auth_allow_cleartext=no <auth_allow_cleartext>` and
  :dovecot_core:ref:`ssl=required <ssl>` settings).
* Some admins understand everything, but still prefer to allow only SSL ports
  (maybe with a firewall). This could be because it makes it easier to ensure
  that no information is leaked, because SSL/TLS handshake happens immediately.
  Some clients unfortunately try to do plaintext authentication without
  STARTTLS, even when IMAP server has told the client that it won't work.
  Besides, it requires fewer round-trips if you begin SSL upon connection when
  you know you want it, instead of connect, negotiate capabilities, insist on
  TLS, then start all over again inside the encrypted session.
* According to some reports (`like this
  <https://it.slashdot.org/story/14/11/11/2349244/isps-removing-their-customers-email-encryption>`_)
  STARTTLS can not guarantee encrypted delivery of mail.
