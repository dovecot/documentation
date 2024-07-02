---
layout: doc
title: Timeouts
---

# Timeouts

Dovecot has a lot of timeouts in various components. Most of them have
hardcoded values, because there's normally no need to change them.

## Protocol Proxies

- Dovecot proxy handles IMAP, POP3 and Submission pre-login timeouts and
  invalid error command handling the same as Dovecot backend.

  After login the proxy will continue proxying until the client or the
  backend disconnects.

- Connect timeout to backend is governed by [[setting,login_proxy_timeout]],
  which is 30 seconds by default.

  Can be overridden by `proxy_timeout` passdb extra field.

- After connection has been established, there's still a login timeout
  `CLIENT_LOGIN_TIMEOUT_MSECS = MASTER_LOGIN_TIMEOUT_SECS*1000` = 3 minutes
  ([`login-common/client-common.h`](https://github.com/dovecot/core/blob/main/src/login-common/client-common.h#L33)
  and
  [`lib-master/master-interface.h`](https://github.com/dovecot/core/blob/main/src/lib-master/master-interface.h#L120)).

## IMAP

- Before login:
  `CLIENT_LOGIN_TIMEOUT_MSECS = MASTER_LOGIN_TIMEOUT_SECS*1000` = 3 minutes
  (the same as proxies).

  - This may be shorter if all the available connections are in use
    `[[link,service_configuration,service imap-login { client_limit * process_limit }]]`.
	In that case the oldest non-logged in connection is disconnected.

- After login: `CLIENT_IDLE_TIMEOUT_MSECS` = 30 minutes (minimum required
  by [[rfc,2060,5.4]])

  - If IDLE command is started, Dovecot never disconnects. Only if the
    connection is lost there will be a disconnection. A dead
    connection is detected by Dovecot periodically sending "I'm still
    here" notifications to client ([[setting,imap_idle_notify_interval]],
    default every 2 minutes).

    - IMAP clients are supposed to send something before 30 minutes
      are up, but several clients don't do this. Some Outlook
      versions even stop receiving new mails entirely until manual
      intervention if IMAP server disconnects the client.

- Dovecot also disconnects an IMAP client that sends too many invalid
  commands:

  - Before login: Disconnect on 3rd invalid command (`CLIENT_MAX_BAD_COMMANDS`
    in [`imap-login/imap-login-client.c`](https://github.com/dovecot/core/blob/main/src/imap-login/imap-login-client.c#L29).

  - After login: Disconnect on 20th invalid command (`CLIENT_MAX_BAD_COMMANDS`
    in [`imap/imap-common.h`](https://github.com/dovecot/core/blob/main/src/imap/imap-common.h#L14).

## POP3

- Before login:
  `CLIENT_LOGIN_TIMEOUT_MSECS = MASTER_LOGIN_TIMEOUT_SECS*1000` = 3 minutes
  (same as proxies).

  - This may be shorter if all the available connections are in use
    (`service pop3-login { client_limit * process_limit }`). In that
    case the oldest non-logged in connection is disconnected.

- After login: `CLIENT_IDLE_TIMEOUT_MSECS` = 10 minutes
  ([`pop3/pop3-client.c`](https://github.com/dovecot/core/blob/main/src/pop3/pop3-client.c#L34).

- Dovecot also disconnects an POP3 client that sends too many invalid
  commands:

  - Before login: Disconnect on 3rd invalid command
    (`CLIENT_MAX_BAD_COMMANDS` in
    [`pop3-login/client.c`](https://github.com/dovecot/core/blob/main/src/pop3-login/client.c#L25).

  - After login: Disconnect on 20th invalid command
    (`CLIENT_MAX_BAD_COMMANDS` in
    [`pop3/pop3-client.c`](https://github.com/dovecot/core/blob/main/src/pop3/pop3-client.c#L33).

## Submission and LMTP

- Before login:
  `CLIENT_LOGIN_TIMEOUT_MSECS = MASTER_LOGIN_TIMEOUT_SECS*1000` = 3 minutes
  (submission, same as proxies).

  - This may be shorter if all the available connections are in use
    (`service submission-login { client_limit * process_limit }`). In that
    case the oldest non-logged in connection is disconnected.

- After login: `CLIENT_IDLE_TIMEOUT_MSECS` = 5 minutes for LMTP and 10
  minutes for Submission.
  [`lmtp/lmtp-client.c`](https://github.com/dovecot/core/blob/main/src/lmtp/lmtp-client.c#L28) and
  [`submission/submission-client.c`](https://github.com/dovecot/core/blob/main/src/submission/submission-client.c#L43).

- Dovecot also disconnects an SMTP client that sends too many invalid
  commands:

  - Before login: Disconnect on 10th invalid command.
    (`CLIENT_MAX_BAD_COMMANDS` in
    [`submission-login/client.c`](https://github.com/dovecot/core/blob/main/src/submission-login/client.c#L23).

  - After login: Disconnect on 20th invalid command
    (`CLIENT_MAX_BAD_COMMANDS` in
    [`submission/submission-client.c`](https://github.com/dovecot/core/blob/main/src/submission/submission-client.c#L40).
