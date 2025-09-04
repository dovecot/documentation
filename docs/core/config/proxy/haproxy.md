---
layout: doc
title: HAProxy
dovecotlinks:
  haproxy: HAProxy
  haproxy_tls_forward:
    hash: tls-forwarding
    text: HAProxy TLS Forwarding
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

## TLS Forwarding

For Dovecot to recognize that TLS termination has been performed, you need to
configure haproxy to use
[PROXYv2](https://www.haproxy.org/download/1.8/doc/proxy-protocol.txt)
protocol with SSL attributes. For example:

```
server s1 127.0.0.1:143 send-proxy-v2-ssl
```

See also: [[link,secured_connections]].
