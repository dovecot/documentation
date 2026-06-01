---
layout: doc
title: HAProxy
dovecotlinks:
  haproxy: HAProxy
  haproxy_tls_forward:
    hash: tls-termination-at-haproxy
    text: HAProxy TLS Termination
---

# HAProxy

[HAProxy (High Availability Proxy)](https://www.haproxy.org/) is a popular
open-source software TCP and HTTP Load Balancer and proxying solution.
It is available as a package on almost all Linux distros.

::: warning
Dovecot CE supports single-server operation only, so load balancing is not
applicable.

This page exists to document HAProxy-related features that exist in the
software.
:::

## HAProxy PROXY Protocol

When HAProxy forwards connections to Dovecot, it passes the original client IP
using the PROXY protocol. Dovecot accepts both PROXYv1 (text) and PROXYv2
(binary) headers; v2 is preferred because it carries optional TLS metadata
(TLV) and parses with less ambiguity. The examples below use PROXYv2.

Dovecot uses the PROXY header to log the real client address and apply
IP-based restrictions correctly.

HAProxy enables PROXYv2 forwarding with one of the following directives on the
`server` line:

- `send-proxy-v2` — sends client IP in the PROXYv2 header
- `send-proxy-v2-ssl` — additionally includes TLS metadata from the
  HAProxy-terminated session (cipher suite, SNI, etc.); used when HAProxy
  terminates client TLS
- `send-proxy-v2-ssl-cn` — like `send-proxy-v2-ssl`, but also forwards the
  client certificate Common Name as a PROXYv2 TLV. Dovecot uses the forwarded
  CN exactly as if it had terminated TLS itself: it becomes the
  `cert_username` passed to authentication, so SASL `EXTERNAL` (or any
  username-from-cert flow that relies on
  [[setting,ssl_server_cert_username_field]]) works through HAProxy. Use only
  when HAProxy is doing client-certificate authentication for you.

Dovecot must be configured to accept PROXY protocol headers:

- Set [[setting,inet_listener_haproxy,yes]] on the [[setting,inet_listener]].
- Set [[setting,haproxy_trusted_networks]] to the IP address(es) or CIDR
  range(s) of HAProxy. The value is a space-separated list and accepts CIDR
  notation, e.g. `haproxy_trusted_networks = 127.0.0.1 10.0.0.0/24
  2001:db8::/32`. If a client from an unlisted address connects to a `haproxy`
  listener, Dovecot logs a warning and disconnects the client.

## HAProxy TLS Termination {#tls-termination-at-haproxy}

This section describes how TLS can be handled when using HAProxy in front of
Dovecot, and the implications of different configurations.

::: info
The examples below show IMAP (port 993/143). The same configuration pattern
applies to POP3 (ports 995/110), Submission (ports 465/587), and ManageSieve
(port 4190) — adjust port numbers accordingly.
:::

### Recommended TLS Deployment

The recommended configuration is:

* Terminate client TLS at HAProxy
* Use TLS between HAProxy and Dovecot when they run on different hosts or
  share an untrusted network segment
* Forward TLS metadata to Dovecot via `send-proxy-v2-ssl`
* Optionally use mTLS for backend authentication
* Do not expose plaintext ports (143/110)

This provides:

* Consistent TLS handling at a single point
* End-to-end encryption (client → HAProxy → Dovecot)
* Reduced risk of configuration drift — no need to keep TLS certificates and
  policy in sync between HAProxy and Dovecot

::: info
Backend TLS only adds security when the HAProxy ↔ Dovecot path can be observed
or tampered with. When both run on the same host and traffic stays on
`127.0.0.1`, backend TLS adds CPU overhead with no threat-model benefit; a
plaintext connection to the backend is acceptable in that case.
:::

See [HAProxy → Dovecot with TLS](#haproxy-dovecot-with-tls-recommended) for the
full example.

### Backend Configurations

The following subsections cover the concrete HAProxy ↔ Dovecot backend
patterns. The first is the recommended deployment; the others are variants
or fallbacks.

#### HAProxy → Dovecot with TLS (Recommended)

HAProxy terminates client TLS and establishes a new TLS connection to Dovecot.

::: code-group
```haproxy[haproxy_tls_to_dovecot]
frontend imap_tls
    bind *:993 ssl crt /etc/haproxy/certs/example.pem
    mode tcp
    default_backend dovecot_imap_tls

backend dovecot_imap_tls
    mode tcp
    server dovecot1 10.0.0.1:993 ssl verify required ca-file /etc/haproxy/ca.pem send-proxy-v2-ssl
```

```doveconf[dovecot_tls_listener]
ssl = required

service imap-login {
  inet_listener imaps {
    port = 993
    haproxy = yes
    ssl = yes
  }
}

haproxy_trusted_networks = 10.0.0.0/24
```
:::

**Behavior:**

* TLS is terminated at HAProxy and re-established to Dovecot (`ssl verify required`).
* `send-proxy-v2-ssl` forwards the *client's* TLS session metadata (cipher suite, SNI) inside
  the PROXYv2 header — this is independent of the backend TLS connection.
* Dovecot sees the original client IP via PROXY protocol.
* Dovecot logs the session as TLS:

```
imap-login: Login: user=<user@example.com>, method=PLAIN, rip=203.0.113.5, lip=192.0.2.10, mpid=12345, TLS, session=<abc123>
```

**Advantages:**
* End-to-end encryption (client → HAProxy → Dovecot)
* Centralized TLS policy at HAProxy
* Certificate validation between HAProxy and Dovecot

**Disadvantages:**
* Two TLS handshakes per session (client→HAProxy and HAProxy→Dovecot); on a
  loopback interface this CPU cost buys no extra security (see note above).

##### Mutual TLS (mTLS) Between HAProxy and Dovecot

For additional security, HAProxy and Dovecot can authenticate each other using
client certificates. This ensures only trusted proxies can connect to Dovecot's
backend port.

::: warning
[[setting,ssl_server_request_client_cert,yes]] requests a client certificate from
**every** TCP connection on the listener. With HAProxy in front of Dovecot,
only HAProxy connects to this port, so this is safe. Do not copy this
listener block into a configuration exposed directly to end-user clients —
those clients will be asked for a certificate they do not have.
:::

::: code-group
```haproxy[haproxy_mtls]
# Line continuations with `\` require HAProxy 2.4+.
# On older versions, place all options on one line.
backend dovecot_imap_tls
    mode tcp
    server dovecot1 10.0.0.1:993 ssl verify required \
        ca-file /etc/haproxy/ca.pem \
        crt /etc/haproxy/client.pem \
        send-proxy-v2-ssl
        # Use send-proxy-v2-ssl-cn instead to also forward the client certificate CN
```

```doveconf[dovecot_mtls]
ssl = required
ssl_server_cert_file = /etc/dovecot/server.pem
ssl_server_key_file = /etc/dovecot/server.key

ssl_client_ca_file = /etc/dovecot/ca.pem
ssl_server_request_client_cert = yes

haproxy_trusted_networks = 10.0.0.0/24

service imap-login {
  inet_listener imaps {
    port = 993
    haproxy = yes
    ssl = yes
  }
}
```
:::

HAProxy presents a client certificate to Dovecot; Dovecot verifies it before
accepting the connection.

#### HAProxy → Dovecot Without TLS

HAProxy may forward plaintext connections to Dovecot after terminating TLS
from the client.

::: code-group
```haproxy[haproxy_plain_backend]
frontend imap_tls
    bind *:993 ssl crt /etc/haproxy/certs/example.pem
    mode tcp
    default_backend dovecot_imap

backend dovecot_imap
    mode tcp
    server dovecot1 10.0.0.1:143 send-proxy-v2
```

```doveconf[dovecot_plain_listener]
ssl = yes

haproxy_trusted_networks = 10.0.0.0/24

service imap-login {
  inet_listener imaps {
    port = 0
  }
  inet_listener imap {
    port = 143
    haproxy = yes
  }
}
```
:::

**Drawbacks:**
* Connection between HAProxy and Dovecot is unencrypted.
* Credentials and session data are exposed on the internal network.
* Only acceptable on strictly controlled local systems where the
  HAProxy–Dovecot path is trusted.

### Plaintext Client Connections (Port 143)

If a client connects on a plaintext port, HAProxy passes the connection
through without TLS termination.

::: tip Recommended
Do not expose a plaintext port at all when HAProxy is terminating TLS on the
TLS port. The configurations below apply only when a plaintext listener is
required.
:::

The [No STARTTLS](#no-starttls) and [Dovecot Provides STARTTLS](#dovecot-provides-starttls)
subsections below differ in whether Dovecot loads a TLS context.
The HAProxy side is independent: each layout can be combined with the
HAProxy-terminates-TLS frontend from the previous sections.

#### No STARTTLS

* Dovecot loads no TLS context ([[setting,ssl,no]]).
* The plaintext listener cannot advertise STARTTLS.
* Suitable when HAProxy terminates TLS on 993 and the 143 path is internal
  only; avoids splitting TLS configuration between HAProxy and Dovecot.

```doveconf
ssl = no

haproxy_trusted_networks = 10.0.0.0/24

service imap-login {
  inet_listener imap {
    port = 143
    haproxy = yes
  }
}
```

#### Dovecot Provides STARTTLS

* Dovecot is configured with a TLS context.
* STARTTLS is advertised on the plaintext listener.

::: warning
This configuration is functional but discouraged. TLS configuration is split
between HAProxy and Dovecot, so certificates and policies (like accepted ciphers) may diverge.
:::

```doveconf
ssl = yes
ssl_server_cert_file = /etc/dovecot/server.pem
ssl_server_key_file  = /etc/dovecot/server.key

haproxy_trusted_networks = 10.0.0.0/24

service imap-login {
  inet_listener imap {
    port = 143
    haproxy = yes
  }
}
```

See [[link,ssl_configuration]] for STARTTLS configuration details.

### Alternative: TCP Passthrough to allow Dovecot to handle TLS

If HAProxy should not terminate TLS, it can pass the raw TCP stream directly
to Dovecot. Dovecot handles TLS entirely; HAProxy cannot inspect traffic,
perform SNI-based routing, or do TLS offloading.

The PROXYv2 header is the only way for Dovecot to learn the original client IP.
Add `send-proxy-v2` on the
`server` line — without it the connection appears to come from HAProxy's
source address, and Dovecot loses client-IP visibility entirely.

::: code-group
```haproxy[haproxy_passthrough]
frontend imap_tls
    bind *:993
    mode tcp
    default_backend dovecot_imap_tls

backend dovecot_imap_tls
    mode tcp
    server dovecot1 10.0.0.1:993 send-proxy-v2
```

```doveconf[dovecot_passthrough]
ssl = required
ssl_server_cert_file = /etc/dovecot/server.pem
ssl_server_key_file  = /etc/dovecot/server.key

haproxy_trusted_networks = 10.0.0.0/24

service imap-login {
  inet_listener imaps {
    port = 993
    haproxy = yes
    ssl = yes
  }
}
```
:::

## Operational Notes

### Timeouts and IMAP IDLE

HAProxy `timeout client` / `timeout server` defaults (often 1 minute) are too
short for IMAP. Long-lived IDLE connections will be torn down by HAProxy long
before Dovecot's [[setting,imap_idle_notify_interval]] fires, which is the
most common HAProxy misconfiguration for mail deployments.

Set HAProxy timeouts larger than Dovecot's idle notify interval (default 2
minutes), e.g.:

```haproxy
defaults
    mode tcp
    timeout client  31m
    timeout server  31m
    timeout connect 5s
```

### Health Checks

The default HAProxy `check` directive performs a plain TCP connect, which is
fine for plaintext backends but fails immediately against an `imaps` backend
that expects a TLS ClientHello.

For a TLS backend, use `option ssl-hello-chk`:

```haproxy
backend dovecot_imap_tls
    mode tcp
    option ssl-hello-chk
    server dovecot1 10.0.0.1:993 check ssl verify required \
        ca-file /etc/haproxy/ca.pem send-proxy-v2-ssl
```

For a plaintext backend, a protocol-aware `tcp-check` matches the IMAP
greeting:

```haproxy
backend dovecot_imap
    mode tcp
    option tcp-check
    tcp-check expect string * OK
    server dovecot1 10.0.0.1:143 check send-proxy-v2
```

See also: [[link,secured_connections]], [[setting,haproxy_trusted_networks]].
