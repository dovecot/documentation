.. _authentication-oauth2:

=================================
Open Authentication v2.0 database
=================================

.. versionadded:: v2.2.28

This database works with a oauth2 provider such as google or facebook. You are
recommended to use xoauth2 or oauthbearer :ref:`authentication-authentication_mechanisms` with
this. The responses from endpoints must be JSON objects.

Configuration
^^^^^^^^^^^^^

Common
******

In ``dovecot.conf`` put

.. code-block:: none

  auth_mechanisms = $auth_mechanisms oauthbearer xoauth2

  passdb {

  driver = oauth2
    mechanisms = xoauth2 oauthbearer
    args = /etc/dovecot/dovecot-oauth2.conf.ext
  }

Backend
*******

Configuration file example for `Google
<https://developers.google.com/identity/protocols/OAuth2>`_

.. code-block:: none

  tokeninfo_url = https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=
  introspection_url = https://www.googleapis.com/oauth2/v2/userinfo
  #force_introspection = yes
  username_attribute = email
  tls_ca_cert_file = /etc/ssl/certs/ca-certificates.crt

Configuration file example for `WSO2 Identity Server
<https://wso2.com/identity-and-access-management/>`_

.. code-block:: none

  introspection_mode = post
  introspection_url = https://adminuser:adminpass@server.name:port/oauth2/introspect
  username_attribute = username
  tls_ca_cert_file = /etc/ssl/certs/ca-certificates.crt
  active_attribute = active
  active_value = true

Proxy
*****

If you want to forward oauth2 authentication to your backend, you can use
various ways

Without proxy authentication

.. code-block:: none

  passdb {
    driver = static
    args = nopasssword=y proxy=y proxy_mech=%m ...
  }

or with proxy authentication, put into ``dovecot-oauth2.conf.ext``

.. code-block:: none

  pass_attrs = proxy=y proxy_mech=%m


Proxy with password grant
*************************

.. versionadded:: v2.3.6

If you want to configure proxy to get token and pass it to backend

passdb settings

.. code-block:: none

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

put into ``dovecot-oauth2.token.conf.ext``

.. code-block:: none

  driver = oauth2
    mechanisms = oauthbearer xoauth2
    args = /usr/local/etc/dovecot/dovecot-oauth2.token.conf.ext
  }

  passdb {
    driver = oauth2
    mechanisms = plain login
    args = /usr/local/etc/dovecot/dovecot-oauth2.plain.conf.ext
  }

put into ``dovecot-oauth2.token.conf.ext``

.. code-block:: none

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

put into ``dovecot-oauth2.plain.conf.ext``

.. code-block:: none

  grant_url = http://localhost:8000/token
  client_id = verySecretClientId
  client_secret = verySecretSecret
  introspection_url = http://localhost:8000/introspect
  introspection_mode = post
  use_grant_password = yes
  debug = yes
  username_attribute = username
  pass_attrs = host=127.0.0.1 proxy=y proxy_mech=xoauth2 pass=%{oauth2:access_token}

Local validation
****************

.. versionadded:: 2.3.11

Local validation allows validating tokens without connecting to an oauth2 server.
This requires that key issuer supports `JWT tokens (RFC 7519) <https://tools.ietf.org/html/rfc7519>`_.

You can put the validation keys into any `dictionary <https://wiki.dovecot.org/Dictionary>`.
The lookup key used is ``/shared/keyid``. If there is no ``kid`` element in token, ``default`` is used.
Keys are cached into memory when they are fetched, to evict them from cache youu need to restart dovecot.
If you want to do key rotation, it is recommended to use a new key id.

Local validation can be enabled with other oauth2 options,
so that if key validation fails for non-JWT keys,
then online validation is performed.

You can use local validation with password grants too.
This will save you introspection round to oauth2 server.

To use local validation, put into ``dovecot-oauth2.conf.ext``

.. code-block:: none

  introspection_mode = local
  local_validation_key_dict = fs:posix:prefix=/etc/dovecot/keys/

Currently dovecot oauth2 library implements the following features of JWT tokens:

 * IAT checking
 * NBF checking
 * EXP checking
 * SUB support
 * AUD support (this is checked against scope, if provided)

The following algorithms are supported

  * HS256, HS384, HS512
  * RS256, RS384, RS512
  * PS256, PS384, PS512
  * ES256, ES384, ES512

There is currently no support for EdDSA algorithms.
ES supports any curve supported by OpenSSL for this purpose.

Full config file
******************

.. code-block:: none

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

  ## Expected value in active_attribute (empty = require present, but anything goes)
  # active_value =

  ## Extra fields to set in passdb response (in passdb static style)
  # pass_attrs =

  ## Timeout in milliseconds
  # timeout_msecs = 0

  ## Enable debug logging
  # debug = no

  ## Max parallel connections (how many simultaneous connections to open)
  # max_parallel_connections = 1

  ## Max pipelined requests (how many requests to send per connection, requires server-side support)
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
