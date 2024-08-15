---
layout: doc
title: SSL
dovecotlinks:
  secured_connections:
    hash: secured-connections
    text: secured connections
  ssl: SSL
  ssl_admin: SSL
  ssl_configuration:
    hash: configuration-overview
    text: SSL configuration
  ssl_ja3:
    hash: ja3-identifier
    text: JA3 string
---

# SSL/TLS Configuration

For more details see:

* [[link,ssl_admin]]
* [[setting,auth_allow_cleartext]]

## Configuration Overview

The most important SSL settings are:

```[dovecot.conf]
ssl = yes
# Preferred permissions: root:root 0444
ssl_cert = </etc/ssl/certs/dovecot.pem
# Preferred permissions: root:root 0400
ssl_key = </etc/ssl/private/dovecot.pem
```

::: warning
You must use the `<` prefix so Dovecot reads the cert/key from the file.
Without `<` Dovecot assumes that the certificate is directly included in
`dovecot.conf.`
:::

The certificate file can be world-readable, since it doesn't contain
anything sensitive (in fact it's sent to each connecting SSL client). The
key file's permissions should be restricted to only root (and possibly
ssl-certs group or similar if your OS uses such).

Dovecot opens both of these files while still running as root, so you don't
need to give Dovecot any special permissions to read them (in fact:
**do not give dovecot user any permissions to the key file**).

Settings for the SSL certificate and SSL secret key files:

```[dovecot.conf]
ssl_cert = </etc/dovecot/dovecot.crt
ssl_key = </etc/dovecot/dovecot.key
```

It's possible to keep the certificate and the key both in the same file:

```[dovecot.conf]
# Preferred permissions: root:root 0400
ssl_cert = </etc/ssl/dovecot.pem
ssl_key = </etc/ssl/dovecot.pem
```

For using different SSL certificates for different IP addresses you can put
them inside local {} blocks:

```[dovecot.conf]
local 10.0.0.1 {
  ssl_cert = </etc/dovecot/dovecot.crt
  ssl_key = </etc/dovecot/dovecot.key
}

local 10.0.0.2 {
  ssl_cert = </etc/dovecot/dovecot2.crt
  ssl_key = </etc/dovecot/dovecot2.key
}
```

If you need different SSL certificates for IMAP and POP3 protocols, you can put them inside protocol ``{}`` blocks:

```[dovecot.conf]
protocol imap {
  ssl_cert = </etc/dovecot/dovecot-imap.crt
  ssl_key = </etc/dovecot/dovecot-imap.key
}

protocol pop3 {
  ssl_cert = </etc/dovecot/dovecot-pop3.crt
  ssl_key = </etc/dovecot/dovecot-pop3.key
}
```

::: tip NOTE
It's important to note that `ssl = yes` must be set globally if
you require SSL for any protocol (or Dovecot will not listen on the
SSL ports), which in turn requires that a certificate and key are
specified globally even if you intend to specify certificates per protocol.
:::

Dovecot supports also using TLS SNI extension for giving different SSL
certificates based on the server name when using only a single IP address,
but the TLS SNI isn't yet supported by all clients so that may not be
very useful.

It's anyway possible to configure it by using
`local_name imap.example.com {}` blocks.

## How to Specify When SSL/TLS is Required

There are a couple of different ways to specify when SSL/TLS is required:

* [[setting,ssl,no]]: SSL/TLS is completely disabled.

* [[setting,ssl,yes]] and [[setting,auth_allow_cleartext,yes]]: SSL/TLS
  is offered to the client, but the client isn't required to use it. The
  client is allowed to login with cleartext authentication even when SSL/TLS
  isn't enabled on the connection. This is insecure, because the
  cleartext password is exposed to the internet.

* [[setting,ssl,yes]] and [[setting,auth_allow_cleartext,no]]: SSL/TLS
  is offered to the client, but the client isn't required to use it. The
  client isn't allowed to use cleartext authentication, unless SSL/TLS is
  enabled first. However, if non-cleartext authentication mechanisms are
  enabled they are still allowed even without SSL/TLS.

  Depending on how secure they are, the authentication is either fully
  secure or it could have some ways for it to be attacked.

* [[setting,ssl,required]]: SSL/TLS is always required, even if
  non-cleartext authentication mechanisms are used. Any attempt to
  authenticate before SSL/TLS is enabled will cause an authentication
  failure.

  Note that this setting is unrelated to the STARTTLS command - either
  implicit SSL/TLS or STARTTLS command is allowed.

  ::: tip NOTE
  If you have only cleartext mechanisms enabled (e.g.
  [[setting,auth_mechanisms,plain login]] and
  [[setting,auth_allow_cleartext,no]], [[setting,ssl,yes]] and
  [[setting,ssl,required]] are completely equivalent because in either
  case the authentication will fail unless SSL/TLS is enabled first.
  :::

  ::: tip NOTE
  With both [[setting,ssl,yes]] and [[setting,ssl,required]], it's
  still possible that the client attempts to do a cleartext authentication
  before enabling SSL/TLS, which exposes the cleartext password to
  the internet.

  Dovecot attempts to indicate this to the IMAP clients via the
  LOGINDISABLED capability, but many clients still ignore it and send
  the password anyway. There is unfortunately no way for Dovecot to
  prevent this behavior. The POP3 standard doesn't have an equivalent
  capability at all, so the POP3 clients can't even know if the server
  would accept a cleartext authentication.
  :::

* The main difference between [[setting,ssl,required]] and
  [[setting,auth_allow_cleartext,no]] is that if
  [[setting,ssl,required]], it guarantees that the entire connection is
  protected against eavesdropping (SSL/TLS encrypts the rest of the
  connection), while [[setting,auth_allow_cleartext,no]] only guarantees
  that the password is protected against eavesdropping (SASL mechanism
  is encrypted, but no SSL/TLS is necessarily used). Nowadays you most
  likely should be using SSL/TLS anyway for the entire connection, since
  the cost of SSL/TLS is cheap enough. Using both SSL/TLS and
  non-cleartext authentication would be the ideal situation since it
  protects the cleartext password even against man-in-the-middle attacks.

  ::: tip NOTE
  The cleartext authentication mechanisms are always allowed (and SSL
  not required) for [secured connections](#secured-connections).
  :::

## Secured Connections

The value of [[setting,ssl]] influences whether a connection is considered
"secure".

* Dovecot-terminated TLS connections are always `secured`.

* [[link,haproxy_tls_forward]] are always `secured`.

  * This is true even if HAProxy isn't running on the same server as
    Dovecot, and the connection between HAProxy and Dovecot isn't secured.

    The reasoning here is that this kind of a configuration is most likely
    intentional. If such connection wasn't treated `secured`, it would
    prevent using `ssl=required` to enforce end clients to use TLS.

* Non-haproxy connections from localhost are always `secured`.

* Localhost connections from HAProxy server to HAProxy are always `secured`.

* Other connections from [[setting,login_trusted_networks]] are `secured`, but
  only if `ssl` setting is not `required`.

* Other connections from HAProxy are `secured`, but only if `ssl` setting is
  not `required`.

Connections that are `secured` are always allowed to use plaintext
authentication. Auth lookups will have the connection marked as `secured`,
which also affects the `%{secured}` variable (see [[variable]]).

## Multiple SSL Certificates

### Different Certificates per Algorithm

You can specify alternative SSL certificate that will be used if the
algorithm differs from the primary certificate. This is useful when
migrating to, e.g., ECDSA certificate.

```[dovecot.conf]
ssl_alt_cert = </path/to/alternative/cert.pem
ssl_alt_key = </path/to/alternative/key.pem
```

### Different Certificates per IP and Protocol

If you have multiple IPs available, this method is guaranteed to work with
all clients.

```[dovecot.conf]
# instead of IP you can also use hostname, which will be resolved
local 192.0.2.10 {
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
```

::: warning
You will still need a top-level default [[setting,ssl_key]] and
[[setting,ssl_cert]], or you will receive errors.
:::

### With Client TLS SNI (Server Name Indication) Support

The SNI mechanism allows a server to present different hosts via a common
connection, that the client can request by name. These are set up using the
[[link,settings_connection_filters,local_name]] filter.

It is important to note that having multiple SSL certificates per IP will
not be compatible with all clients, especially mobile ones. It is a TLS
SNI limitation.

```[dovecot.conf]
local_name imap.example.org {
  ssl_cert = </etc/ssl/certs/imap.example.org.crt
  ssl_key = </etc/ssl/private/imap.example.org.key
}

local_name imap.example2.org {
  ssl_cert = </etc/ssl/certs/imap.example2.org.crt
  ssl_key = </etc/ssl/private/imap.example2.org.key
}

# ..etc..
```

[[added,ssl_sni_settings_reload_added]]: A server can reload different SSL
certificates and other related settings using SNI (e.g.
[[setting,login_greeting]] or [[setting,postmaster_address]]). The reloading of
settings based on SNI is supported for IMAP, SMTP and LMTP.

#### Client Support

Clients confirmed working with TLS SNI:

* Thunderbird (Linux)
* [K-9 on Android][support-android-k9]
* Apple Mail (according to [Mail SSL SNI - cPanel][support-apple-mail])
* [Mutt][support-mutt]
* [NeoMutt][support-neomutt]

Not working Clients:

* Apple Mail (Mac OS X 10.10 and lower AND iOS 9.3 and lower)
* Outlook for Mac version 15 (according to
  [Mail SSL SNI - cPanel][support-apple-mail])
* Kindle Fire HD 8
* Outlook 2013

## Password Protected Key Files

SSL key files may be password protected. There are two ways to provide
Dovecot with the password:

1. Starting Dovecot with `dovecot -p` asks the password. It's not stored
   anywhere, so this method prevents Dovecot from starting automatically
   at startup.
2. [[setting,ssl_key_password]] setting. Note that `dovecot.conf` is by
   default world-readable, so you probably shouldn't place it there
   directly. Instead you could store it in a different file, such as
   `/etc/dovecot-private.conf` containing:

```[dovecot.conf]
ssl_key_password = secret
```

and then use `!include_try /etc/dovecot-private.conf` in the main
`dovecot.conf`.

## Chained SSL Certificates

Put all the certificates in the [[setting,ssl_cert]] file in this order:

1. Dovecot's public certificate
2. First Intermediate Certificate
3. Second Intermediate Certificate

Most CA providers these days provide a "full chain" certificate file,
which contains the required certificates in correct order.
You should use this.

## SSL security settings

You can specify path to DH parameters file using:

```[dovecot.conf]
ssl_dh = </path/to/dh.pem
```

This is fully optional, and most modern clients do not need this.

To generate new parameters file, you can use:

```sh
# This might take a very long time.
# Run it on a machine with sufficient entropy.
openssl dhparam 4096 > dh.pem
```

By default Dovecot's allowed ciphers list contains:

```
ssl_cipher_list = ALL:!kRSA:!SRP:!kDHd:!DSS:!aNULL:!eNULL:!EXPORT:!DES:!3DES:!MD5:!PSK:!RC4:!ADH:!LOW@STRENGTH
```

Disallowing more won't really gain any security for those using better
ciphers, but it does prevent people from accidentally using insecure
ciphers. See https://www.openssl.org/docs/manmaster/man1/ciphers.html for
a list of the ciphers.

For TLSv1.3 server ciphers should not longer be preferred:

```[dovecot.conf]
ssl_prefer_server_ciphers = no
```

## SSL verbosity

To make Dovecot log all the problems it sees with SSL connections:

```[dovecot.conf]
log_debug = category=ssl
```

Some errors might be caused by dropped connections, so it could be quite noisy.

## Client Certificate Verification/Authentication

If you want to require clients to present a valid SSL certificate, you'll
need these settings:

```[dovecot.conf]
ssl_ca = </etc/ssl/ca.pem
ssl_request_client_cert = yes

auth_ssl_require_client_cert = yes
# if you want to get username from certificate as well, enable this
#auth_ssl_username_from_cert = yes
```

The CA file should contain the certificate(s) followed by the matching CRL(s).

::: tip NOTE
The CRLs are required to exist. For a multi-level CA place the certificates
in this order:

1. Issuing CA cert
2. Issuing CA CRL
3. Intermediate CA cert
4. Intermediate CA CRL
5. Root CA cert
6. Root CA CRL
:::

The certificates and the CRLs have to be in PEM format. To convert a DER format CRL (e.g. http://crl.cacert.org/class3-revoke.crl) into PEM format, use:

```sh
openssl crl -in class3-revoke.crl -inform DER -outform PEM > class3-revoke.pem
```

With the above settings, if a client connects which doesn't present a
certificate signed by one of the CAs in the `ssl_ca` file, Dovecot won't
let the user log in. This could present a problem if you're using Dovecot
to provide SASL authentication for an MTA (such as Postfix) which is not
capable of supplying client certificates for SASL authentication.

If you need Dovecot to provide SASL authentication to an MTA without
requiring client certificates and simultaneously provide IMAP service
to clients while requiring client certificates, you can put
[[setting,auth_ssl_require_client_cert,yes]] inside of a protocol block as
shown below to make an exemption for SMTP SASL clients (such as Postfix).

```[dovecot.conf]
protocol !smtp {
  auth_ssl_require_client_cert=yes
}
```

You may also force the username to be taken from the certificate by
setting [[setting,auth_ssl_username_from_cert,yes]].

* The text is looked up from subject DN's specified field using OpenSSL's
  `X509_NAME_get_text_by_NID()` function.

* By default the `CommonName` field is used.

* You can change the field with [[setting,ssl_cert_username_field,name]]
  setting (parsed using OpenSSL's `OBJ_txt2nid()` function).
  `x500UniqueIdentifier` is a common choice.

You may also want to disable the password checking completely. Doing this
currently circumvents Dovecot's security model so it's not recommended to
use it, but it is possible by making the passdb allow logins using any
password (typically requiring `nopassword` extra field to be returned).

## Testing

Try out your new setup:

```sh
openssl s_client -servername mail.sample.com -connect mail.sample.com:pop3s
```

You should see something like this:

```
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
```

### Testing CA

The above test procedure returns:

```
Verify return code: 19 (self signed certificate in certificate chain)
```

which is expected result since test command omits option to verify CA
root certificate. The following commands will enable CA root certificate
validation.

#### Testing CA On Debian

On Debian derived distributions try:

```sh
openssl s_client -CApath /etc/ssl/certs -connect mail.sample.com:pop3s
```

#### Testing CA On RHEL

On Red Hat Enterprise Linux derived distributions try:

```sh
openssl s_client -CAfile /etc/pki/tls/cert.pem -connect mail.sample.com:pop3s
```

### Testing CA Success

Verify return code: 0 (ok)

### Client Connections

By default Dovecot uses OpenSSL's default system CAs to verify SSL
certificates for outgoing connections. This can be overridden by specifying
either [[setting,ssl_client_ca_dir]] or [[setting,ssl_client_ca_file]].

::: tip
Using [[setting,ssl_client_ca_dir]] is preferred because it uses less memory.
:::

```[dovecot.conf]
ssl_client_ca_dir = /path/to/pem/certificates
ssl_client_ca_file = /path/to/pem/bundle
```

## JA3 Identifier

[[added,ja3_identifier]]

Dovecot supports calculating [JA3 hash][ja3-hash] for checking client TLS
implementation.

This adds `ssl_ja3` and `ssl_ja3_hash` to [[variable,login]], to be used
with [[setting,login_log_format_elements]] and `ssl_ja3_hash` for
[[variable,auth]], to be used with, e.g., [[link,auth_policy]].

To get JA3 values, you will need to use OpenSSL 1.1 or newer.

Common JA3 hash databases usually use values provided by HTTP clients.
Since IMAP, POP3 etc. do not currently use some of these extensions,
you should not use these. They will not match.

Some examples for demonstration purposes only.

```
Mutt 2.2.9, TLS1.3, GnuTLS

  ja3=771,4866-4867-4865-4868-49196-52393-49325-49162-49195-49324-49161-49200-52392-49172-49199-49171-157-49309-53-156-49308-47-159-52394-49311-57-158-49310-51,5-10-11-13-22-23-35-51-43-65281-0-45,23-24-25-29-30-256-257-258-259-260,0
  ja3_hash=b7e9d913d85c071f5b806d59601e9b96

OpenSSL 1.1.1n, TLS1.3

  ja3=771,4866-4867-4865-49196-49200-159-52393-52392-52394-49195-49199-158-49188-49192-107-49187-49191-103-49162-49172-57-49161-49171-51-157-156-61-60-53-47-255,11-10-35-22-23-13-43-45-51,29-23-30-25-24,0-1-2
  ja3_hash=c34a54599a1fbaf1786aa6d633545a60

Thunderbird 102.4.2+build2-0ubuntu0.22.04.1, TLS1.3

  ja3=771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53,0-23-65281-10-11-35-5-51-43-13-45-21,29-23-24-25-256-257,0
  ja3_hash=3ed71a458200f4af79031644408b8e58
```

[ja3-hash]: https://engineering.salesforce.com/tls-fingerprinting-with-ja3-and-ja3s-247362855967
[support-apple-mail]: https://support.cpanel.net/hc/en-us/community/posts/19633051862807-Mail-SSL-SNI
[support-android-k9]: https://github.com/k9mail/k-9/pull/718
[support-mutt]: https://gitlab.com/muttmua/trac-tickets/-/blob/master/tickets/closed/3923-mutt_may_need_to_support_TLSs_Server_Name_Indiciation_SNI_fo.txt?ref_type=heads
[support-neomutt]: https://www.neomutt.org/feature/tls-sni
