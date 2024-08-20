---
layout: doc
title: Login Referrals
dovecotlinks:
  auth_referral: login referrals
---

# Login Referrals

Login referrals are an IMAP extension specified by [[rfc,2221]].

Their purpose is to redirect clients to an different IMAP server in case
of hardware failures or organizational changes. No client action is needed
to invoke the LOGIN-REFERRALS capability: the redirection is triggered by
the server and occurs transparently.

::: danger
As stated by [[rfc,2221]], a man in the middle attack may use a rogue
'password catching' server to collect login data and redirect your clients
to their own rogue IMAP server. Although this would be avoided by enforcing
SSL/TLS. Login referrals are not supported by many clients, so you
probably don't want to use them anyway.
:::

Dovecot does NOT use login referrals by default.

## Configuration

::: info
The `host` field is also used by proxying. Login referrals are used
only if the `proxy` field isn't set.
:::

Login referrals can be used in two ways:

1. Tell the client to log into another server without allowing to log in
   locally.
2. Suggest the client to log into another server, but log it in anyway.

The following fields can be used to configure login referrals:

| Field | Description |
| ----- | ----------- |
| `host=<s>` | The destination server's hostname. This field is required for login referrals to be used. |
| `port=<s>` | The destination server's port. The default is `143`. |
| `destuser=<s>` | Tell client to use a different username when logging in. |
| `reason=<s>` | Optional reason to use as the reply to the login command. The default is "Logged in, but you should use this server instead." |

Using the above settings, you can suggest client to log in elsewhere. To
require it, you'll also have to return:

* `nologin`: User is not allowed to log in.
* `reason=<s>`: Optional reason. The default is "Try this server instead."

## Client Support

The following clients are known to support login referrals:

* Pine
* Outlook (but not Outlook Express)

## Examples

Forward user to another server after successful authentication (SQL):

```
password_query = SELECT password, host, 'Y' as nologin \
    FROM users WHERE userid = '%u'
```

Forward all users to another server without authentication:

```
password_query = SELECT NULL AS password, 'Y' AS nopassword \
    'imap2.example.com' AS host, \
    'This server is down, try another one.' AS reason, \
    'Y' AS nologin, 'Y' AS nodelay
```
