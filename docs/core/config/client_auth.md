---
layout: doc
title: Client Authentication
dovecotlinks:
  client_auth: client authentication
  client_auth_mechanism_selection:
    hash: mechanism-selection
    text: "client authentication: mechanism selection"
  client_auth_channel_binding:
    hash: channel-binding
    text: "client authentication: channel binding"
---

# Client Authentication

[[added,settings_client_auth_added]]

Dovecot doesn't only authenticate its own users. In several places it is
itself a client that logs into another server:

| Client | Settings filter | Notes |
| ------ | --------------- | ----- |
| [[link,imapc]] mailbox format | [[setting,imapc]] | Also used for migrations and shared mailboxes between backends. |
| [[link,pop3c]] mailbox format | [[setting,pop3c]] | |
| [[link,auth_imap,passdb imap]] | [[setting,imapc]] inside the `passdb` | The password given by the user is used as [[setting,client_auth_password]] automatically. |

All of them use the same `client_auth_*` settings and the same SASL client
implementation, which this page describes. The settings are placed inside the
client's filter, because the same setting names are shared by all the
clients:

```doveconf[dovecot.conf]
imapc {
  host = imap.example.com
  ssl = imaps
  client_auth_authzid = %{user}
  client_auth_password = secret
}
```

This is not to be confused with the [[link,authentication]] of Dovecot's own
users, nor with [[link,authentication_proxies]], where the passdb lookup
tells the login process where and how to log in.

## Identities and Password

SASL authentication has two identities:

* [[setting,client_auth_authid]] is the *authentication identity*: the user
  whose [[setting,client_auth_password]] is used to prove who the client is.
* [[setting,client_auth_authzid]] is the *authorization identity*: the user
  whose mails are accessed after the authentication.

For a regular login they are the same, so only
[[setting,client_auth_authzid]] needs to be set. An empty
[[setting,client_auth_authid]] means that the authorization identity is used
for authenticating as well. The two differ when logging in as a
[[link,auth_master_users,master user]]: the master user and its password are
the authentication identity and the actual user is the authorization
identity.

```doveconf[dovecot.conf]
imapc {
  client_auth_authid = masteruser
  client_auth_password = masteruser-secret
  client_auth_authzid = %{user}
}
```

Inside the [[setting,imapc]] and [[setting,pop3c]] filters
[[setting,client_auth_authzid]] defaults to `%{owner_user}`: the logged in
user, or the owner of a [[link,shared_mailboxes,shared namespace]].

The existence of the password is checked already when the client is
created, so a missing [[setting,client_auth_password]] for a mechanism that
needs one fails e.g. the namespace initialization for imapc, not only the
first connection. The `ANONYMOUS` and `EXTERNAL` mechanisms don't use a
password. For `OAUTHBEARER` and `XOAUTH2` the password is the bearer token.

## Mechanism Selection

The mechanism is chosen in one of three ways:

### Configured Mechanism List

Each [[setting,client_auth]] filter block declares a mechanism that the
client is allowed to use. The first configured mechanism that the server
also advertises is used, so the preferred mechanisms should be listed first.
Settings inside a block apply to that mechanism only, which allows e.g. a
different token for `OAUTHBEARER` than the password for `PLAIN`:

```doveconf[dovecot.conf]
imapc {
  host = imap.example.com
  ssl = imaps
  client_auth_authzid = %{user}

  client_auth SCRAM-SHA-256 {
    password = secret
  }
  client_auth OAUTHBEARER {
    password = vF9dft4qmTc2Nvb3RlckBhbHRhdmlzdGEuY29tCg==
  }
  client_auth PLAIN {
    password = secret
  }
}
```

If the server advertises none of the configured mechanisms, the login fails
with an error listing both the configured and the advertised mechanisms.
There is no fallback to the next mechanism if the authentication itself
fails, e.g. because of a wrong password.

### Explicit Mechanism

If [[setting,client_auth_mechanism]] is set directly inside the client's
filter, without any [[setting,client_auth]] blocks, that mechanism is used
without checking whether the server advertises it. This is mainly useful
when the server doesn't advertise its mechanisms correctly.

```doveconf[dovecot.conf]
pop3c {
  host = pop3.example.com
  client_auth_mechanism = PLAIN
  client_auth_authzid = %{user}
  client_auth_password = secret
}
```

### No Configured Mechanism

If neither is configured, the `PLAIN` mechanism is used if the server
advertises it, or if the server's mechanisms aren't known. For IMAP and POP3
the basic `LOGIN` command and `USER` + `PASS` commands are used instead
whenever the server allows them, so SASL support isn't required from the
server at all. If the server doesn't advertise `PLAIN`, the first advertised
mechanism that Dovecot supports and that works with a password is used.

If no mechanism and no identities are configured, there is nothing to
authenticate with. The connection fails with an "Authentication not
configured" error.

### Supported Mechanisms

See [[setting,client_auth_mechanism]] for the list. `GSSAPI` and `GSS-SPNEGO`
are currently available only for [[doveadm,auth test]] and
[[doveadm,auth login]], not for the clients listed above.

## Channel Binding

The `SCRAM-SHA-1-PLUS` and `SCRAM-SHA-256-PLUS` mechanisms bind the
authentication to the TLS connection, so that the credentials can't be
relayed through a man-in-the-middle. They require a TLS connection:
`tls-unique` channel binding is used with TLS 1.2 and `tls-exporter` with
TLS 1.3.

When the non-PLUS `SCRAM-SHA-1` or `SCRAM-SHA-256` mechanism is used over a
TLS connection, channel binding is used anyway if the server also advertises
the corresponding `-PLUS` mechanism, as required by [[rfc,5802]].

If the server doesn't advertise the `-PLUS` mechanism, the authentication is
done without channel binding, but Dovecot tells the server that it would have
supported channel binding. If the server actually does support it, the
`-PLUS` mechanism must have been removed from the advertised list by an
attacker, and the server fails the authentication.

The [[setting,client_auth]] filter names are matched against the server's
advertised mechanisms as-is. For example a server advertising only
`SCRAM-SHA-256-PLUS` doesn't match a `client_auth SCRAM-SHA-256 { }` filter,
so `client_auth SCRAM-SHA-256-PLUS { }` must be configured instead.

## Overrides

The filter-scoped settings are written with a `/` in overrides:

```sh
doveadm -o imapc_host=imap.example.com \
  -o imapc/client_auth_authzid=user@example.com \
  -o imapc/client_auth_password=secret \
  -o mail_driver=imapc -o mail_path= mailbox list -u user@example.com
```

```doveconf[dovecot.conf]
passdb static {
  fields {
    userdb_imapc/client_auth_authzid = %{user}
    userdb_imapc/client_auth_password = %{password}
  }
}
```

## Debugging

The client logs the mechanism selection and the identities it uses as debug
messages under the `sasl-client` event category, which is a child of the
client's own category:

```doveconf[dovecot.conf]
log_debug = category=sasl-client
```

For imapc, [[doveadm,mailbox list]] with the imapc settings given as `-o`
overrides (see [Overrides](#overrides)) is a quick way to test the login
without changing the running configuration.

## Settings

<SettingsComponent tag="client-auth" />
