---
layout: doc
title: OAuth2
dovecotlinks:
  auth_oauth2: OAuth2 Authentication Database
---

# Open Authentication v2.0 Database (`oauth2`)

This database works with a OAuth2 ([[rfc,6749]])provider.

You are recommended to use `oauthbearer` (preferred) or `xoauth2`
[[link,authentication_mechanisms]] with this database.

The responses from endpoints must be JSON objects.

[[changed,auth_oauth2_no_passdb_changed]]: The OAuth2 mechanism no longer uses
a passdb for token authentication. Password Grant still needs a oauth2 passdb.

## Settings

Oauth2 overrides some of the default HTTP client and SSL settings. You can
override these and any other HTTP client or SSL settings by placing them inside
the [[setting,oauth2]] named filter.

<SettingsComponent tag="oauth2" />

## Configuration

### Common

::: code-group
```[dovecot.conf]
auth_mechanisms = {
  oauthbearer = yes
  xoauth2 = yes
}

oauth2 {
  # ...
}
```
:::

### Backend

#### Examples

##### Google

Configuration file example for
[Google](https://developers.google.com/identity/protocols/OAuth2):

```[dovecot.conf]
oauth2 {
  tokeninfo_url = https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=
  introspection_url = https://www.googleapis.com/oauth2/v2/userinfo
  #force_introspection = yes
  username_attribute = email
}
```

##### WSO2 Identity Server
Configuration file example for
[WSO2 Identity Server](https://wso2.com/identity-and-access-management/):

```[dovecot.conf]
oauth2 {
  introspection_mode = post
  introspection_url = https://client_id:client_secret@server.name:port/oauth2/introspect
  username_attribute = username
  active_attribute = active
  active_value = true
}
```

##### Microsoft Identity Platform
Configuration file example for
[Microsoft Identity Platform](https://learn.microsoft.com/en-us/entra/identity-platform/userinfo):

```[dovecot.conf]
oauth2 {
  introspection_mode = auth
  introspection_url = https://graph.microsoft.com/v1.0/me
  # this can vary on your settings
  username_attribute = mail
  ssl_client_ca_file = /etc/ssl/certs/ca-certificates.crt
}
```

### Proxy

If you want to forward oauth2 authentication to your backend, you can use
various ways.

Without proxy authentication:

```[dovecot.conf]
passdb static {
  fields {
    nopassword = yes
    proxy = yes
    proxy_mech = %{mechanism}
        # ...
  }
}
```

With proxy authentication, put into `dovecot.conf`:

```[dovecot.conf]
oauth2 {
  # ...
  fields {
    proxy = y
    proxy_mech = %{mech}
  }
}
```

#### Proxy with Password Grant

If you want to configure proxy to get token and pass it to backend:

::: code-group
```[dovecot.conf]
oauth2 {
  client_id = verySecretClientId
  client_secret = verySecretSecret
  tokeninfo_url = http://localhost:8000/oauth2?oauth=
  introspection_url = http://localhost:8000/introspect
  introspection_mode = post
  username_attribute = username
  fields {
    pass = %{oauth2:access_token}
  }
}

passdb oauth2 {
  mechanisms_filter = plain login
  oauth2 {
    # inherit common oauth2 settings from the global scope
    grant_url = http://localhost:8000/token
    fields {
      host = 127.0.0.1
      proxy = y
      proxy_mech = xoauth2
      pass = %{passdb:token}
    }
  }
}
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

To use local validation, put into `dovecot.conf`:

```[dovecot.conf]
oauth2 {
  introspection_mode = local
  oauth2_local_validation {
    dict fs {
      fs posix {
        prefix=/etc/dovecot/keys/
      }
    }
  }
}
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
