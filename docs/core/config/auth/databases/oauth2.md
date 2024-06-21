---
layout: doc
title: OAuth2
dovecotlinks:
  auth_oauth2: OAuth2 authentication database
---

# Open Authentication v2.0 Database (`oauth2`)

This database works with a OAuth2 ([[rfc,6749]])provider.

You are recommended to use `oauthbearer` (preferred) or `xoauth2`
[[link,authentication_mechanisms]] with this database.

The responses from endpoints must be JSON objects.

## Configuration

### Common

::: code-group
```[dovecot.conf]
auth_mechanisms = $auth_mechanisms oauthbearer xoauth2

passdb {
  driver = oauth2
  mechanisms = xoauth2 oauthbearer
  args = /etc/dovecot/dovecot-oauth2.conf.ext
}
```
:::

### Backend

#### Examples

##### Google

Configuration file example for
[Google](https://developers.google.com/identity/protocols/OAuth2):

```[dovecot.conf]
tokeninfo_url = https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=
introspection_url = https://www.googleapis.com/oauth2/v2/userinfo
#force_introspection = yes
username_attribute = email
tls_ca_cert_file = /etc/ssl/certs/ca-certificates.crt
```

##### WSO2 Identity Server
Configuration file example for
[WSO2 Identity Server](https://wso2.com/identity-and-access-management/):

```[dovecot.conf]
introspection_mode = post
introspection_url = https://client_id:client_secret@server.name:port/oauth2/introspect
username_attribute = username
tls_ca_cert_file = /etc/ssl/certs/ca-certificates.crt
active_attribute = active
active_value = true
```

##### Microsoft Identity Platform
Configuration file example for
[Microsoft Identity Platform](https://learn.microsoft.com/en-us/entra/identity-platform/userinfo):

```[dovecot.conf]
introspection_mode = auth
introspection_url = https://graph.microsoft.com/v1.0/me
# this can vary on your settings
username_attribute = mail
tls_ca_cert_file = /etc/ssl/certs/ca-certificates.crt
```

### Proxy

If you want to forward oauth2 authentication to your backend, you can use
various ways.

Without proxy authentication:

```[dovecot.conf]
passdb {
  driver = static
  args = nopassword=y proxy=y proxy_mech=%m ...
}
```

With proxy authentication, put into `dovecot-oauth2.conf.ext`:

```
pass_attrs = proxy=y proxy_mech=%m
```

#### Proxy with Password Grant

If you want to configure proxy to get token and pass it to backend:

::: code-group
```[dovecot.conf]
passdb {
  driver = oauth2
  mechanisms = oauthbearer xoauth2
  args = /usr/local/etc/dovecot/dovecot-oauth2.token.conf.ext
}

passdb {
  driver = oauth2
  mechanisms = plain login
  args = /usr/local/etc/dovecot/dovecot-oauth2.plain.conf.ext
}
```

```[dovecot-oauth2.token.conf.ext]
grant_url = http://localhost:8000/token
client_id = verySecretClientId
client_secret = verySecretSecret
tokeninfo_url = http://localhost:8000/oauth2?oauth=
introspection_url = http://localhost:8000/introspect
introspection_mode = post
use_grant_password = no
debug = yes
username_attribute = username
pass_attrs = pass=%{oauth2:access_token}
```

```[dovecot-oauth2.plain.conf.ext]
grant_url = http://localhost:8000/token
client_id = verySecretClientId
client_secret = verySecretSecret
introspection_url = http://localhost:8000/introspect
introspection_mode = post
use_grant_password = yes
debug = yes
username_attribute = username
pass_attrs = host=127.0.0.1 proxy=y proxy_mech=xoauth2 pass=%{oauth2:access_token}
```
:::

#### Local Validation

Local validation allows validating tokens without connecting to an oauth2
server.

This requires that key issuer supports JWT tokens ([[rfc,7519]]).

You can put the validation keys into any [[link,dict]].

The lookup key used is `/shared/<azp:default>/<alg>/<keyid:default>`.

If there is no `azp` element in token body, then `default` is used.

The `alg` field is always uppercased by Dovecot.

If there is no `kid` element in token header, `default` is used.

Keys are cached into memory when they are fetched; to evict them from cache
you need to restart Dovecot.

If you want to do key rotation, it is recommended to use a new key id.

Example:

```json
{
   "kid":"Zm9vb2Jhcgo",
   "alg":"ES256",
   "typ":"JWT"
}.{
    "sub":"testuser@example.org",
    "azp":"issuer.net-dovecot"
}
```

Would turn into: `/shared/issuer.net-dovecot/ES256/Zm9vb2Jhcgo`.

If using fs posix, key would be at
`/etc/dovecot/keys/issuer.net-dovecot/ES256/Zm9vb2Jhcgo`.

In key id and AZP field, `/` are escaped with `%2f` and `%` are escaped
with `%25` with any driver. This is because `/` is a dict key component
delimiter.

When using dict-fs driver, if the path starts with `.`, it will be escaped
using two more dots. So any `.` turns into `...`, and any `..` turns
into `....`.

For example:

```json
{
    "kid":""./../../../../etc,
    "alg":"ES256",
    "typ":"JWT"
}.{
    "sub":"testuser@example.org",
    "azp":"attack"
}
```

Would turn into:
`/etc/dovecot/keys/attack/ES256/...%2f....%2f....%2f....%2f....%2fetc%2fpasswd`.

Local validation can be enabled with other oauth2 options, so that if key
validation fails for non-JWT keys, then online validation is performed.

You can use local validation with password grants too. This will save you
introspection roundtrip to oauth2 server.

To use local validation, put into `dovecot-oauth2.conf.ext`:

```
introspection_mode = local
local_validation_key_dict = fs:posix:prefix=/etc/dovecot/keys/
```

Currently, Dovecot oauth2 library implements the following features of
JWT tokens:

* IAT checking
* NBF checking
* EXP checking
* ISS checking
* ALG checking
* SUB support
* AUD support
  :   AUD check checks client_id, not scope. If the token has scope field,
      this is checked for scope. KTY checking has been removed.
* AZP support

The following algorithms are supported

* HS256, HS384, HS512
* RS256, RS384, RS512
* PS256, PS384, PS512
* ES256, ES384, ES512

There is currently no support for EdDSA algorithms.

ES supports any curve supported by OpenSSL for this purpose.

### OpenID Discovery

Support for [[rfc,7628]] OpenID Discovery (OIDC) can be achieved with
`openid_configuration_url`. Setting this causes Dovecot to
report OIDC configuration URL as `openid-configuration` element in error JSON.

## Full Config Example

```
### OAuth2 password database configuration

## url for verifying token validity. Token is appended to the URL
# tokeninfo_url = http://endpoint/oauth/tokeninfo?access_token=

## introspection endpoint, used to gather extra fields and other information.
# introspection_url = http://endpoint/oauth/me

## How introspection is made, valid values are
##   auth = GET request with Bearer authentication
##   get  = GET request with token appended to URL
##   post = POST request with token=bearer_token as content
##   local = Attempt to locally validate and decode JWT token
# introspection_mode = auth

## Force introspection even if tokeninfo contains wanted fields
## Set this to yes if you are using active_attribute
# force_introspection = no

## Validation key dictionary, turns on local validation
# local_validation_key_dict =

## A space separated list of scopes of validity (optional)
# scope = something

## username attribute in response (default: email)
# username_attribute = email

## username normalization format (default: %Lu)
# username_format = %Lu

## Attribute name for checking whether account is disabled (optional)
# active_attribute =

## Expected value in active_attribute (empty = require present, but
## anything goes)
# active_value =

## Expected issuer(s) for the token (space separated list)
# issuers =


## URL to RFC 7628 OpenID Provider Configuration Information schema
# openid_configuration_url =

## Extra fields to set in passdb response (in passdb static style)
# pass_attrs =

## Timeout in milliseconds
# timeout_msecs = 0

## Enable debug logging
# debug = no

## Max parallel connections (how many simultaneous connections to open,
## increase this to increase performance)
# max_parallel_connections = 10

## Max pipelined requests (how many requests to send per connection,
## requires server-side support)
# max_pipelined_requests = 1

## HTTP request raw log directory
# rawlog_dir = /tmp/oauth2

## TLS settings
# tls_ca_cert_file = /path/to/ca-certificates.txt
# tls_ca_cert_dir = /path/to/certs/
# tls_cert_file = /path/to/client/cert
# tls_key_file = /path/to/client/key
# tls_cipher_suite = HIGH:!SSLv2
# tls_allow_invalid_cert = FALSE
```
