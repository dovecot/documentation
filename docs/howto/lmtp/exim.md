---
layout: doc
title: Exim
---

# Dovecot LMTP and Exim

Exim provides support for LMTP over UNIX sockets using the
[LMTP transport](http://www.exim.org/exim-html-current/doc/html/spec_html/ch-the_lmtp_transport.html).

Your distribution may not provide this; run `exim -bV` and check for
'lmtp' in 'Transports:'.

Support for LMTP over TCP sockets is provided by the
[SMTP transport](http://www.exim.org/exim-html-current/doc/html/spec_html/ch-the_smtp_transport.html).

## Using LMTP over UNIX Socket

Use this configuration if Dovecot runs on the same host as exim.

::: code-group
```[router]
local_user:
    debug_print = "R: local_user for $local_part@$domain"
    driver = accept
    domains = +local_domains
    check_local_user
    transport = dovecot_lmtp
    cannot_route_message = Unknown user
```

```[transport]
dovecot_lmtp:
    driver = lmtp
    socket = /var/run/dovecot/lmtp
    #maximum number of deliveries per batch, default 1
    batch_max = 200
    #allow suffixes/prefixes (default unset)
    rcpt_include_affixes
```
:::

## Using LMTP over TCP Socket

::: code-group
```[router]
local_user:
    transport = dovecot_lmtp
    domains = +local_domains
    driver = manualroute
    # Set IP appropriate to your setup.
    route_list = "* 192.168.1.0 byname"
    #if destination server is the local host enable this
    #self = send
```

```[transport]
dovecot_lmtp:
    driver = smtp
    #allow suffixes/prefixes (default unset)
    rcpt_include_affixes
    protocol = lmtp
    # Set port appropriate to your setup.
    port = 2525
```
:::

## Stripping Domain

If you are using a userdb which does not have domain names, you may need
to add a setting to `dovecot.conf`:

```
protocol lmtp {
  ...
  # use %n to strip away the domain part
  auth_username_format = %n
}
```

Symptoms:

- Exim says something like "LMTP error after RCPT ... 550 ... User
  doesn't exist user@domain"

- Dovecot verbose log says something like "auth-worker(9048):
  passwd(user@domain): unknown user"

## Verifying Recipients Using LMTP

You can use callout verification to avoid accepting mail for addresses
which do not exist in Dovecot.

Below is a config snippet which could be used in `acl_smtp_rcpt` to
achieve this:

```
deny
    message = invalid recipient
    domains = +local_domains
    !verify = recipient/callout=no_cache
```

For more information on address verification, see
http://www.exim.org/exim-html-current/doc/html/spec_html/ch-access_control_lists.html#SECTaddressverification.

## Delivering Mails Case Insensitively

::: WARNING
Just use this setup if all your login names contain only lower case
characters! (On Linux see `/etc/adduser.conf` under NAME_REGEX variable).
:::

Exim retains the case of the local part. Dovecot's LMTP *may* fail
looking up an incorrect cased local part in your userdb. You can solve
this problem by extending the *protocol lmtp* section:

```[dovecot.conf]
protocol lmtp {
  ...
  # use %Ln to strip away the domain part
  auth_username_format = %Lu
}
```

(If you don't mind allowing case insensitive logins for dovecot
authentication, you may set [[setting,auth_username_format]] in the global
configuration accordingly and renounce the above change).

In case you prefer to configure exim to lower case the local part
instead, add a router just before your local delivery router:

```
lowercase_local:
    debug_print = "R: lower case local_part for local delivery"
    driver = redirect
    redirect_router = local_user
    data = ${lc:${local_part}}
```

Make sure to reference the name you have chosen for your local delivery
router within *redirect_router*.
