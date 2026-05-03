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

[HAProxy (High Availability Proxy)](https://www.haproxy.org/), is a popular
open source software "TCP and HTTP" Load Balancer and proxying solution.
It is available as a package on almost all Linux distros.

::: warning
Dovecot CE supports single-server operation only, so load balancing is not
applicable.

This page exists to document HAProxy-related features that exist in the
software.
:::

## HAproxy PROXY protocol

When HAProxy forwards connections to Dovecot, it passes the original client IP using the PROXY protocol (PROXYv2). Dovecot uses this to log the real client address and apply IP-based restrictions correctly.

## HAProxy TLS Termination

This section describes how TLS can be handled when using HAProxy in front of Dovecot, and the implications of different configurations.

### HAProxy TLS forwarding directives

HAProxy uses the `send-proxy-v2` or `send-proxy-v2-ssl` directive on the `server` line:

- `send-proxy-v2` — sends client IP in the PROXYv2 header
- `send-proxy-v2-ssl` — additionally includes TLS metadata (whether the client used TLS, the cipher suite, the SNI, etc.)

Dovecot must be configured to accept PROXY protocol headers:

- Set `haproxy = yes` on the listener
- Set `haproxy_trusted_networks` to the IP address(es) of HAProxy — Dovecot rejects PROXY headers from any unlisted address

## Recommended Deployment

The recommended configuration is:

* Use TLS termination at HAProxy
* Use TLS between HAProxy and Dovecot
* Send TLS metadata to Dovecot (`send-proxy-v2-ssl`)
* Optionally use mTLS for backend authentication
* Avoid exposing plaintext ports (143/110)

This provides:

* Consistent TLS handling at a single point
* End-to-end encryption (client → HAProxy → Dovecot)
* Reduced risk of configuration drift

See [HAProxy → Dovecot with TLS](#haproxy-dovecot-with-tls-recommended) for the full example.

### TLS Termination at HAProxy

In this mode, HAProxy terminates TLS from the client and forwards the connection to Dovecot.

It is **recommended** to use TLS also between HAProxy and Dovecot to preserve end-to-end encryption.

::: info
The examples below show IMAP (port 993/143). The same configuration pattern applies to POP3 (ports 995/110), Submission (ports 465/587), and ManageSieve (port 4190) — adjust port numbers accordingly.
:::

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
    server dovecot1 127.0.0.1:993 ssl verify required ca-file /etc/haproxy/ca.pem send-proxy-v2-ssl
```

```doveconf[dovecot_tls_listener]
# ssl = required: HAProxy always connects via TLS, so Dovecot can enforce it
ssl = required

service imap-login {
  inet_listener imaps {
    port = 993
    haproxy = yes
    ssl = yes
  }
}

haproxy_trusted_networks = 127.0.0.1
```
:::

**Behavior:**

* TLS is terminated at HAProxy and re-established to Dovecot.
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
* Dovecot does not advertise STARTTLS on this listener, so clients cannot use it.

#### Mutual TLS (mTLS) Between HAProxy and Dovecot

For additional security, HAProxy and Dovecot can authenticate each other using client certificates. This ensures only trusted proxies can connect to Dovecot's backend port.

::: code-group
```haproxy[haproxy_mtls]
backend dovecot_imap_tls
    mode tcp
    server dovecot1 127.0.0.1:993 ssl verify required \
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

service imap-login {
  inet_listener imaps {
    port = 993
    haproxy = yes
    ssl = yes
  }
}

haproxy_trusted_networks = 127.0.0.1
```
:::

HAProxy presents a client certificate to Dovecot; Dovecot verifies it before accepting the connection.

### HAProxy → Dovecot Without TLS (Not Recommended)

HAProxy may forward plaintext connections to Dovecot after terminating TLS from the client.

::: code-group
```haproxy[haproxy_plain_backend]
backend dovecot_imap
    mode tcp
    server dovecot1 127.0.0.1:143 send-proxy-v2
```

```doveconf[dovecot_plain_listener]
haproxy_trusted_networks = 127.0.0.1
service imap-login {
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
* Only acceptable on strictly controlled local systems where the HAProxy–Dovecot path is trusted.

### Plaintext Client Connections (Port 143)

If a client connects on a plaintext port, HAProxy passes the connection through without TLS termination.

Two configurations are possible:

#### Dovecot Provides STARTTLS

* Dovecot is configured with TLS.
* STARTTLS is advertised to clients.

::: warning
This configuration is functional but discouraged. TLS configuration is split between HAProxy and Dovecot, so certificates and policies may diverge.
:::

#### No TLS at all

* Dovecot has TLS disabled.
* No encryption is available to clients.

::: warning
This configuration is not recommended.
:::

### Alternative: TCP Passthrough to allow Dovecot handle TLS

If HAProxy should not terminate TLS, it can pass the raw TCP stream directly to Dovecot. Dovecot handles TLS entirely; HAProxy cannot inspect traffic or perform TLS offloading.

::: code-group
```haproxy[haproxy_passthrough]
frontend imap_tls
    bind *:993
    mode tcp
    default_backend dovecot_imap_tls

backend dovecot_imap_tls
    mode tcp
    server dovecot1 127.0.0.1:993
```
:::

See also: [[link,secured_connections]].
