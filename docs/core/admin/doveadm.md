---
layout: doc
title: Doveadm
dovecotlinks:
  doveadm: Doveadm
  doveadm_error_codes:
    hash: error-exit-codes
    text: doveadm error codes
  doveadm_http_api:
    hash: http-api
    text: Doveadm HTTP API
---

# Doveadm

"Doveadm" is Dovecot's administrative tools.

They can be run either from the command line, via the doveadm protocol, or
via the doveadm HTTP API.

## Commands

See [[link,summary_doveadm]].

## Error/Exit Codes

The `doveadm` and `dovecot-lda` tools use mostly `sysexits.h` compatible
error codes.

| Code | Label | Status | Description |
| ---- | ----- | ------ | ----------- |
| 0 | | Success | |
| 2 | | Success, but mailbox changed during the sync | This code can be safely ignored during intermediate migrations (any changes will be captured during a subsequent sync).  For a final migration/cut-over, this error code indicates that the dsync command should be re-run to ensure that all changes made to the original mailbox are reflected in the new mailbox (i.e., a final migration should not be considered successful unless/until dsync returns 0). |
| 64 | EX_USAGE | Incorrect parameters | Dsync was called with wrong parameters. This should never be seen in production migration usage (absent a bug). |
| 65 | EX_DATAERR | Data error | Theoretically can happen, but should never happen in real-life usage. If seen, it should be handled as a failed migration, and details should be reported to Dovecot for further investigation. |
| 66 | EX_NOINPUT | Cannot open input | |
| 67 | EX_NOUSER  | User no longer exists in user DB | Either this user should not be migrated (since they no longer exist) and this user should be removed from the migration list, or there is some issue interacting with the local identity backend, in which case this migration should be treated as a temporary failure (i.e. retry and/or requeue). |
| 68 | EX_NOHOST | Hostname Unknown | Source or destination hostname is not known/resolvable. |
| 69 | EX_UNAVAILABLE | Service Unavailable | |
| 70 | EX_SOFTWARE | Internal Software Error | |
| 71 | EX_OSERROR  | System Error (e.g., system cannot fork) | Issue with operating system of host running dsync. |
| 72 | EX_OSFILE | Critical OS File Missing | Issue with operating system of host running dsync. |
| 73 | EX_CANTCREAT | Cannot create mailbox/message as user is out of quota | For migrations, this should not occur as new storage quotas should be equal/greater to the existing quota. If this error occurs, would possibly indicate an issue with the sync (i.e. duplicate message). In this case, the migration should be marked as failed and the user flagged for further investigation why the sync was unsuccessful. |
| 74 | EX_IOERR | Input/Output Error |
| 75 | EX_TEMPFAIL | Temporary failure | A temporary error that may be resolved by running the migration again. For migration purposes, if this code is returned dsync should be re-run. There should be some sort of maximum retry value defined; if exceeded, the account should either be marked as "error" or should be placed back in the queue to be attempted to be migrated at a later time. |
| 76 | EX_PROTOCOL | Remote error in protocol | |
| 77 | EX_NOPERM | Authentication failure | If authentication to the existing mail backend is via master user authentication, this error should not occur. If it does occur, there is a problem with the configuration (or, less likely, a bug in dsync) and all migrations should be suspended until the problem can be resolved. If authentication to the existing mail backend is via the user's current authentication credentials, this indicates that the credentials are no longer valid. This migration should be marked as either a temporary failure (if the authentication credentials are automatically updated when running the migration) or a permanent failure if there is no ability to obtain the new authentication credentials. Migrations into Dovecot (the new system) should be done via a master user, so this error should not be returned once the system is correctly configured. If this error still occurs and is triggered by a failure to connect to the new platform, all migrations should be suspended until the problem can be resolved. Note: EX_NOPERM error might also happen for other reasons, such as not having write permissions to a folder, but this shouldn't happen with dsync use in migration. |
| 78 | EX_CONFIG | Invalid Settings/Configuration | This error should not be obtained once the migration system is correctly configured, e.g. after testing the migration system in a staging environment. If this error occurs, all migrations should be suspended until the problem can be resolved. |
| 1003 | DOVEADM_EX_EXPIRED | Outdated/Expired | The command could not complete successfully because the requested contents are no longer valid or no longer up to date. [[added,doveadm_ex_expired_code]] |

### Other Issues:

* Folder renames if the names are invalid or too long.  dsync attempts to fix
  invalid folder names automatically. If the folder name is too long, a new
  generated GUID is given it as the name. A related issue is that if any
  renaming happens, the folder won't be synced incrementally because dsync
  doesn't realize that the folder was renamed (dsync is stateless).


## HTTP API

### Configuration

To be able to use doveadm HTTP API it's mandatory to configure either
[[setting,doveadm_password]] for doveadm or an [[setting,doveadm_api_key]].

To configure password for doveadm service in `dovecot.conf`:

```
doveadm_password = secretpassword
```

Or, if preferred to use separate key for doveadm HTTP API, then it can
be enabled by defining key in config:

```
doveadm_api_key = key
```

Enable the doveadm http listener:

```[dovecot.conf]
service doveadm {
  unix_listener doveadm-server {
    user = vmail
  }

  inet_listener {
    port = 2425
  }

  inet_listener http {
    port = 8080
    #ssl = yes # uncomment to enable https
  }
}
```

### Usage

Connecting to the endpoint can be done by using standard HTTP protocol and
authentication headers.

To get list the commands supported by the endpoint, the following example
commands can be used:

#### `X-Dovecot-API` Auth

```sh
curl -H "Authorization: X-Dovecot-API <base64 dovecot_api_key>" \
  http://host:port/doveadm/v1
```

#### Basic Auth

```sh
curl -H "Authorization: Basic <base64 doveadm:doveadm_password>" http://host:port/doveadm/v1
curl –u doveadm:password http://host:port/doveadm/v1
```

There is also https://github.com/dovecot/doveadm-http-cli that can be
used for accessing the API.

### API overview

All commands sent to the API needs to be posted in json format using
`Content-Type: application/json` in headers for the request type and the
JSON content as payload in format:

```json
[
    [
        "command1",
        {
            "parameter1": "value",
            "parameter2": "value",
            "parameter3": "value"
        },
        "tag1"
    ]
]
```

Multiple commands can be submitted in one json payload:

```json
[
    [
        "command1",
        {
            "parameter1": "value",
            "parameter2": "value"
        },
        "tag1"
    ],
    [
        "command2",
        {
            "parameter1": "value",
            "parameter2": "value"
        },
        "tag2"
    ]
]
```

::: warning
For now it is safest not to send multiple commands in one payload, as some
commands may kill the server in certain error conditions leaving you
without any response.

Also it is not guaranteed that the commands will be processed in order.
:::

::: info
All commands are case sensitive.
:::

### Example Session

Reload Dovecot configuration:

```json
[
    [
        "reload",
        {},
        "tag1"
    ]
]
```

Then we execute it with curl:

```sh
curl -v -u doveadm:secretpassword -X POST http://localhost:8080/doveadm/v1 \
  -H "Content-Type: application/json" -d '[["reload",{},"tag1"]]'
```

This is equivalent to the command [[doveadm,reload]].

Successful Response:

```json
[
    [
        "doveadmResponse",
        [],
        "tag1"
    ]
]
```

Failure Response:
```json
[
    [
        "error",
        {
            "exitCode": 68,
            "type": "exitCode"
        },
        "tag1"
    ]
]
```

## Mailbox Commands

These commands should be run on one of the Dovecot proxies. The proxy is then
responsible for forwarding the command to be run in the correct backend. This
guarantees that two backend servers don't attempt to modify the same user's
mailbox at the same time (which might cause problems).

::: warning [[changed,doveadm_mailbox_commands_user]]
All mail commands require providing `-u`, `-F` or `-A` parameter.

`USER` environment variable is no longer supported.

This will always be subject to user database lookup and requires access to
auth userdb socket.
:::

### doveadm fetch

See [[doveadm,fetch]].

Fetch mail contents or metadata.

#### doveadm search

[[doveadm,search]] does the same as [[doveadm,fetch,'mailbox-guid uid']].

It's useful for quick checks where you don't want to write the full fetch
command.

### doveadm copy

See [[doveadm,copy]].

Copy message to another folder, potentially to another user.

### doveadm deduplicate

See [[doveadm,deduplicate]].

Deduplicate mails either by their GUID or by `Message-Id:` header.

### doveadm expunge

See [[doveadm,expunge]].

Expunge mails (without moving to Trash).

### doveadm flags add/remove/replace

See [[doveadm,flags add]], [[doveadm,flags remove]],
[[doveadm,flags replace]].

Update IMAP flags for a mail

### doveadm force-resync

See [[doveadm,force-resync]].

Try to fix a broken mailbox (or verify that all is ok).

### doveadm index

See [[doveadm,index]].

Index any mails that aren't indexed yet.

Mainly useful if [[plugin,fts]] is enabled.

### doveadm mailbox create/delete/rename

See [[doveadm,mailbox create]], [[doveadm,mailbox delete]],
[[doveadm,mailbox rename]].

Modify folders.

### doveadm mailbox list

See [[doveadm,mailbox list]]

List user's folders.

### doveadm mailbox subscribe/unsubscribe

See [[doveadm,mailbox subscribe]], [[doveadm,mailbox unsubscribe]].

Modify IMAP folder subscriptions.

### doveadm mailbox status

See [[doveadm,mailbox status]]

Quickly lookup folder metadata (# of mails, # of unseen mails, etc.).

### doveadm move

See [[doveadm,move]].

Move message to another folder, potentially to another user.
