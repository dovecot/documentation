---
layout: doc
title: HTTP Client
dovecotlinks:
  lib_http_response_codes:
    hash: internal-http-response-codes
    text: "Dovecot HTTP Internal Response Codes"
---

# Dovecot HTTP Client

HTTP requests within Dovecot are performed using its internal HTTP client
(internally referred to as "lib-http").

## Internal HTTP Response Codes

Dovecot's lib-http uses custom HTTP response codes for some error
conditions.

In certain locations, e.g. [[link,lua_lib-http]], these codes may be visible
to an admin or in logging, so these response codes must be handled in the
same way that standard RFC codes are.

| Number | Code | Description |
| ------ | ---- | ----------- |
| 9000 | ABORTED | The request was aborted. |
| 9001 | INVALID_URL | Failed to parse HTTP target url. |
| 9002 | HOST_LOOKUP_FAILED | Failed to perform DNS lookup for the host. |
| 9003 | CONNECT_FAILED | Failed to setup any connection for the host and client settings allowed no more attempts. |
| 9004 | INVALID_REDIRECT | Service returned an invalid redirect response for this request. |
| 9005 | CONNECTION_LOST | The connection was lost unexpectedly while handling the request and client settings allowed no more attempts. |
| 9006 | BROKEN_PAYLOAD | The input stream passed to the request using http_client_request_set_payload() returned an error while sending the request. |
| 9007 | BAD_RESPONSE | The service returned a bad response. |
| 9008 | TIMED_OUT | The request timed out (either this was the last attempt or the absolute timeout was hit). |
