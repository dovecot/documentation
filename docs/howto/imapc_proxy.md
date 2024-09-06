---
layout: doc
title: imapc Proxy
---

# Dovecot imapc Proxy

Using Dovecot as a secure IMAP Proxy in front of Exchange, using
Exchange Authentication and IMAPC.

This is based on already having Dovecot already compiled and installed.

1. Create an unprivileged, non-system account user and group for the
   proxy, with a home directory. This needs to have a writable home
   directory, but no other privileges.

   ```sh
   useradd imapproxy
   ```

2. Verify that the user cannot login:

   ```sh
   grep imapproxy /etc/shadow
   ```

   You should see something like:

   ```
   imapproxy:!!:nnnn:0:nn:n:::
   ```

   The important part is the "!!". This indicates that the account is
   locked. If you don't see this, lockout the account (check man passwd)

3. Create `dovecot.conf`:

   ```[dovecot.conf]
   ## Dovecot configuration file

   mail_uid = imapproxy
   mail_gid = imapproxy

   protocols = imap

   listen = *, ::

   mail_driver = imapc
   mail_path = ~/imapc
   # Change the line below to reflect the IP address of your Exchange Server.
   imapc_host = 10.1.2.3
   imapc_port = 143

   passdb imap {
     # Change the line below to reflect the IP address of your Exchange Server.
     args = host=10.1.2.3
     default_fields = userdb_imapc_user=%u userdb_imapc_password=%w
   }

   userdb prefetch {
   }

   # /home/imapproxy is the home directory for the imapproxy user, and
   # %u is a subdir that will be automatically created for each IMAP user
   # when they connect
   mail_home = /home/imapproxy/%u

   auth_mechanisms = plain login

   # This is the auth service used by Postfix to do dovecot auth.
   service auth {
     unix_listener auth-userdb {
     }
     inet_listener {
       port = 12345
     }
   }

   ## SSL settings

   # These will need to ba adjusted to point to *your* certificates
   # The ssl_ca line refers to the intermediate certificate bundle which
   # may or may not be required by your SSL provider
   ssl_cert = </etc/pki/tls/certs/machine.example.org.crt
   ssl_key = </etc/pki/tls/private/machine.example.org.key
   ssl_ca = </etc/pki/tls/certs/gd_bundle.crt
   ssl_cipher_list = ALL:!LOW:!SSLv2:!EXP:!aNULL
   ```

Start dovecot and test it with openssl as:

```sh
openssl s_client -connect machine.example.org:143 -starttls imap
```

You should see a whole bunch of SSL information, and the last line
should say:

```
. OK Pre-login capabilities listed, post-login capabilities have more.
```

Next, type:

```
01 LOGIN username badpassword
```

You should then see:

```
01 NO [AUTHENTICATIONFAILED] Authentication failed
```

Next, type:

```
02 LOGIN username password
```

And should see a list similar to this:

```
* CAPABILITY IMAP4rev1 LITERAL+ SASL-IR LOGIN-REFERRALS ID ENABLE IDLE SORT SORT=DISPLAY THREAD=REFERENCES THREAD=REFS MULTIAPPEND UNSELECT CHILDREN NAMESPACE UIDPLUS LIST-EXTENDED I18NLEVEL=1 CONDSTORE QRESYNC ESEARCH ESORT SEARCHRES WITHIN CONTEXT=SEARCH LIST-STATUS FUZZY
02 OK Logged in
```

If you get this far, the proxy is working and is authenticating against
your exchange server.

## Postfix Configuration

My configuration is for a closed server that will never allow inbound
SMTP from unauthenticated clients, and authenticates inbound SMTP TLS
connections against the above Dovecot auth service, which in turn
authenticates against Exchange, which authenticates against Active
Directory.

This means that disabling an account in Active Directory, also disables
inbound and outbound mail access.

If this is what you want, add the following to your `/etc/postfix/main.cf`
file:

```[main.cf]
smtpd_sasl_type = dovecot
smtpd_sasl_path = inet:127.0.0.1:12345
smtpd_sasl_auth_enable = yes

smtpd_client_restrictions = permit_sasl_authenticated, reject
## Don't relay for anybody from or to anywhere, unless they authenticated

smtpd_recipient_restrictions = permit_sasl_authenticated reject

broken_sasl_auth_clients = yes
# Talk to outlook <= 2003 and O Express <=6

smtpd_tls_security_level = encrypt
smtpd_tls_received_header = yes

smtpd_tls_cert_file = /etc/pki/tls/certs/machine.example.org.crt
smtpd_tls_key_file = /etc/pki/tls/private/machine.example.org.key

smtpd_tls_CAfile = /etc/pki/tls/certs/gd_bundle.crt
# If your Certification Authority requires intermediate certificates,
# the bundle goes here.

tls_random_source = dev:/dev/urandom

smtpd_tls_auth_only = yes
# only allow auth if it's encrypted
```
