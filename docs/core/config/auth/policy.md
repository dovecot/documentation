---
layout: doc
title: Policy
dovecotlinks:
  auth_policy: authentication policy
  auth_policy_configuration:
    hash: configuration
    text: Auth Policy Configuration
---

# Authentication Policy

Dovecot supports interfacing with an external authentication policy server.

This server can be used to decide whether the connecting user is permitted,
tarpitted or outright rejected.

While dovecot can do tarpitting and refusal on its own, this feature adds
support for making cluster-wide decisions to make it easier to deter and
defeat brute force attacks.

## Configuration

The auth-policy server is a core feature and does not require plugin(s)
to work. To activate this feature, you need to configure it.

Auth policy overrides some of the default HTTP client settings:
* [[setting,http_client_request_absolute_timeout,2s]]
* [[setting,http_client_max_idle_time,10s]]
* [[setting,http_client_max_parallel_connections,100]]
* [[setting,http_client_user_agent,dovecot/auth-policy-client]]

You can override these and any other HTTP client or SSL settings by placing
them inside [[setting,auth_policy]] [[link,settings_syntax_named_filters]].

<SettingsComponent tag="auth_policy" />

### Required Minimum Configuration

```[dovecot.conf]
auth_policy_server_url = http://example.com:4001/
auth_policy_hash_nonce = localized_random_string

# OPTIONAL settings
#auth_policy_server_api_header = Authorization: Basic <base64-encoded value>
#auth_policy_server_timeout_msecs = 2000
#auth_policy_hash_mech = sha256
#auth_policy_request_attributes = login=%{requested_username} pwhash=%{hashed_password} remote=%{rip} device_id=%{client_id} protocol=%s
#auth_policy_reject_on_fail = no
#auth_policy_hash_truncate = 12
#auth_policy_check_before_auth = yes
#auth_policy_check_after_auth = yes
#auth_policy_report_after_auth = yes
```

## Password Hash Algorithm

To generate the hash, you concatenate nonce, login name, nil byte,
and password and run it through the hash algorithm once. The hash is
truncated when truncation is set to non-zero. The hash is truncated by
first choosing bits from MSB to byte boundary (rounding up), then
right-shifting the remaining bits.

```
hash = H(nonce||user||'\x00'||password)
bytes = round8(bits*8)
hash = HEX(hash[0:bytes] >> (bytes-bits*8))
```

## Request Attributes

Auth policy server requests are JSON requests. The JSON format can be
specified with [[setting,auth_policy_request_attributes]].

The syntax is key=value pairs, and key can contain one or more `/` to
designate that a JSON object should be made.

Examples:

::: code-group
```[Configuration]
login=%{orig_username} pwhash=%{hashed_password} remote=%{real_rip}
```

```json[JSON Result]
{
    "login": "john.doe",
    "pwhash": "1234",
    "remote": "127.0.0.1"
}
```
:::


::: code-group
```[Configuration]
login=%{orig_username} pwhash=%{hashed_password} remote=%{real_rip} attrs/cos=%{userdb:cos}
```

```json[JSON Result]
{
    "login": "john.doe",
    "pwhash": "1234",
    "remote": "127.0.0.1",
    "attrs": {
        "cos": "premium"
    }
}
```
:::

### IMAP ID

You can include IMAP ID command result in auth policy requests, by using
`%{client_id}`, which will expand to IMAP ID command arglist.

You must set [[setting,imap_id_retain,yes]] for this to work.

## List of Fields

All fields supported by [[variable,auth]] can be used.

In addition, you can use following fields:

### `hashed_password`

User's password hashed with
[password hash algorithm](#password-hash-algorithm).

### `requested_username`

Username for regular logins.

For master user logins, this is the requested login username (not the master
username).

### `fail_type`

[[added,auth_policy_fail_type]]

The reason request failed. Results:

| Result | Description |
| ------ | ----------- |
| `internal` | Dovecot internal processing error. |
| `credentials` | The user's credentials were wrong. |
| `account` | Account is not known. |
| `expired` | User's password is expired. |
| `disabled` | Account was disabled. |
| `policy` | Login was rejected by policy server. |

### `tls`

TLS protection level.

Always available.

### `policy_reject`

[[deprecated,auth_policy_reject]]

Obsolete field indicating whether the request was rejected by policy server.

### `success`

Overall indicator whether the request succeeded or not.

## Expected Response

```json
{
    "status": -1,
    "msg": "go away"
}
```

`status` values are explained below.

## Mode of Operation

### Auth Policy check: Authentication 'Before' userdb/passdb

First query is done **before** password and user databases are
consulted. This means that any userdb/passdb attributes are left empty.

The command used here is `allow` and will appear on the URL as
`command=allow`.

`status` result values:

- `-1`: Reject

- `0`: Accept

- `(Any other positive value)`: Tarpit for this number of seconds.

### Auth Policy Check: Authentication 'After' Successful userdb/passdb Lookup

Second lookup is done **after** authentication succeeds.

The command used here is `allow` and will appear on the URL as
`command=allow`.

`status` result values:

- `-1`: Authentication fail

- `>= 0`: Authentication succeed

### Auth Policy Check: Reporting After Authentication Succeeds

A report request is sent at end of authentication.

The command used here is `report` and will appear on the URL as
`command=report`.

The `status` result value is ignored.

The JSON request is sent with two additional attributes:

#### `success`

Boolean true/false depending on whether the overall authentication succeeded

#### `policy_reject`
Boolean true/false whether the failure was due to policy server

## Compatible Auth Policy Servers

- [OX Abuse Shield](https://oxpedia.org/wiki/index.php?title=AppSuite:OX_Abuse_Shield)
