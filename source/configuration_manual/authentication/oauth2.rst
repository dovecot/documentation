.. _authentication-oauth2:

=================================
Open Authentication v2.0 database
=================================

.. dovecotadded:: 2.2.28

This database works with a oauth2 provider such as google or facebook. You are
recommended to use xoauth2 or oauthbearer :ref:`authentication-authentication_mechanisms` with
this. The responses from endpoints must be JSON objects.

.. dovecotchanged:: 2.4.0,3.0.0

  OAuth2 mechanism no longer uses a passdb for token authentication. Grant password still
  needs a oauth2 passdb.

Configuration
^^^^^^^^^^^^^

Common
******

In ``dovecot.conf`` put

.. code-block:: none

  auth_mechanisms {
    oauthbearer = yes
    xoauth2 = yes
  }

  auth_oauth2_config_file = etc/dovecot/dovecot-oauth2.conf.ext

Backend
*******

Configuration file example for `Google
<https://developers.google.com/identity/protocols/OAuth2>`_

.. code-block:: none

  tokeninfo_url = https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=
  introspection_url = https://www.googleapis.com/oauth2/v2/userinfo
  #force_introspection = yes
  username_attribute = email

Configuration file example for `WSO2 Identity Server
<https://wso2.com/identity-and-access-management/>`_

.. code-block:: none

  introspection_mode = post
  introspection_url = https://client_id:client_secret@server.name:port/oauth2/introspect
  username_attribute = username
  active_attribute = active
  active_value = true

Configuration file example for `Microsoft Identity Platform <https://learn.microsoft.com/en-us/entra/identity-platform/userinfo>`

.. code-block:: none

  introspection_mode = auth
  introspection_url = https://graph.microsoft.com/v1.0/me
  # this can vary on your settings
  username_attribute = mail
  tls_ca_cert_file = /etc/ssl/certs/ca-certificates.crt

Proxy
*****

If you want to forward oauth2 authentication to your backend, you can use
various ways

Without proxy authentication

.. code-block:: none

  passdb static {
    args = nopassword=y proxy=y proxy_mech=%m ...
  }

or with proxy authentication, put into ``dovecot-oauth2.conf.ext``

.. code-block:: none

  pass_attrs = proxy=y proxy_mech=%m


Proxy with password grant
*************************

.. dovecotadded:: 2.3.6

If you want to configure proxy to get token and pass it to backend

passdb settings

.. code-block:: none

  auth_oauth2_config_file = /usr/local/etc/dovecot/dovecot-oauth2.token.conf.ext

  passdb oauth2 {
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

.. dovecotadded:: 2.3.11

Local validation allows validating tokens without connecting to an oauth2 server.
This requires that key issuer supports JWT tokens (:rfc:`7519`).

You can put the validation keys into any :ref:`dictionary <dict>`.
The lookup key used is ``/shared/<azp:default>/<alg>/<keyid:default>``.
If there is no ``azp`` element in token body, then default is used.
The ``alg`` field is always uppercased by Dovecot.
If there is no ``kid`` element in token header, ``default`` is used.
Keys are cached into memory when they are fetched, to evict them from cache you need to restart Dovecot.
If you want to do key rotation, it is recommended to use a new key id.

Example:

.. code:: javascript

   {"kid":"Zm9vb2Jhcgo","alg":"ES256","typ":"JWT"}.{"sub":"testuser@example.org","azp":"issuer.net-dovecot"}

Would turn into

::

   /shared/issuer.net-dovecot/ES256/Zm9vb2Jhcgo

And would expect, when using fs posix, key at

::

   /etc/dovecot/keys/issuer.net-dovecot/ES256/Zm9vb2Jhcgo


In key id and AZP field, ``/`` are escaped with ``%2f`` and ``%`` are escaped with ``%25`` with any driver.
This is because ``/`` is a dict key component delimiter.

.. dovecotchanged:: 2.3.14.1

When using dict-fs driver, if the path starts with ``.`` it will be escaped using two more dots.
So any ``.`` turns into ``...``, and any ``..`` turns into ``....``.

For example, token

.. code:: javascript

  {"kid":""./../../../../etc,"alg":"ES256","typ":"JWT"}.{"sub":"testuser@example.org","azp":"attack"}

Would turn into

::

  /etc/dovecot/keys/attack/ES256/...%2f....%2f....%2f....%2f....%2fetc%2fpasswd


Local validation can be enabled with other oauth2 options,
so that if key validation fails for non-JWT keys,
then online validation is performed.

You can use local validation with password grants too.
This will save you introspection round to oauth2 server.

To use local validation, put into ``dovecot-oauth2.conf.ext``

.. code-block:: none

  introspection_mode = local
  local_validation_key_dict = fs:posix:prefix=/etc/dovecot/keys/

Currently Dovecot oauth2 library implements the following features of JWT tokens:

* IAT checking
* NBF checking
* EXP checking
* ISS checking
* ALG checking
* SUB support
* AUD support (this is checked against scope, if provided)
* AZP support

.. dovecotchanged:: 2.3.21  AUD check now checks client_id, not scope. If the token has scope field, this is checked for scope. KTY checking has been removed completely.

The following algorithms are supported

* HS256, HS384, HS512
* RS256, RS384, RS512
* PS256, PS384, PS512
* ES256, ES384, ES512

There is currently no support for EdDSA algorithms.
ES supports any curve supported by OpenSSL for this purpose.

OpenID.Discovery
****************

.. dovecotadded:: 2.3.16

Support for :rfc:`7628` OpenID Discovery (OIDC) can be achieved with
``openid_configuration_url`` setting. Setting this causes Dovecot to report OIDC configuration URL as ``openid-configuration`` element in error JSON.

.. dovecotchanged:: 2.3.21 OAuth2 error handling was made to always use OAUTH2 mechanisms errors, so ``openid-configuration`` would be emitted always.


Full config file
****************

Oauth2 overrides some of the default HTTP client and SSL settings:

 * :dovecot_core:ref:`ssl_prefer_server_ciphers` = yes
 * :dovecot_core:ref:`http_client_user_agent` = dovecot-oauth2-passdb/DOVECOT_VERSION
 * :dovecot_core:ref:`http_client_max_idle_time` = 60s
 * :dovecot_core:ref:`http_client_max_parallel_connections` = 10
 * :dovecot_core:ref:`http_client_max_pipelined_requests` = 1
 * :dovecot_core:ref:`http_client_request_max_attempts` = 1

You can override these and any other HTTP client or SSL settings by placing
them inside :dovecot_core:ref:`oauth2` named filter.

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

  ## Use worker to verity token
  # blocking = yes
