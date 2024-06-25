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

::: tip Note
HAProxy is the recommended way to do software load balancing for Dovecot.

This page is not intended to be a comprehensive HAProxy manual; it is designed
to broadly explain how HAProxy can be used in a Dovecot-specific environment.
:::

The configuration is located at `/etc/haproxy/haproxy.cfg`.

## Frontends

A frontend defines how requests should be forwarded to backends. Frontends
are defined in the frontend section of the HAProxy configuration. Their
definitions are composed of the following components:

* A set of IP addresses and a port (e.g. `10.10.10.1, *:443`)
* ACLs
* `use_backend` rules, which define which backends to use depending on
  which ACL conditions are matched, and/or a `default_backend` rule that
  handles every other case.

An example of a front-end:

```
frontend front_dc_pop3
    bind             :1110
    mode             tcp
    default_backend  back_dc_pop3
```

This configures a frontend named `front_dc_pop3`, which handles all
incoming traffic on port 1110. This will send all traffic to the backends
defined by `back_dc_pop3`.

## Access Control Lists (ACL)

In relation to load balancing, ACLs are used to test some condition and
perform an action (e.g. select a server, or block a request) based on the
test result. 

This is similar in concept to an if-else snippet where execution takes
place based upon the success or failure of a particular block. Use of ACLs
allows flexible network traffic forwarding based on a variety of factors
like pattern-matching and the number of connections to a backend.

Example of an ACL:

```
acl url_stats path_beg /stats
```

This ACL is matched if the path of a request begins with `/stats`. This
would match a request of http://10.10.10.1/stats, for example.

Here, `url_stats` is just the label given to the pattern.

For more details on ACLs please refer to the official
[HAProxy documentation](https://www.haproxy.org/).

## TLS Forwarding

For Dovecot to recognize that TLS termination has been performed, you need to
configure haproxy to use
[PROXYv2](https://www.haproxy.org/download/1.8/doc/proxy-protocol.txt)
protocol with SSL attributes. For example:

```
server s1 127.0.0.1:143 send-proxy-v2-ssl
```

See also: [[link,secured_connections]].

## Backends

A backend is a set of servers that receives forwarded requests.

Backends are defined in the backend section of the HAProxy configuration. In
its most basic form, a backend can be defined by:

* Which load balance algorithm to use (mentioned below)
* A list of servers and ports

A backend can contain one or many servers. Adding more servers to your
backend will generally increase the both the reliability and load capacity
of the configured service by distributing the load over multiple servers. 

Here is an example of a two backend configurations, `back_dc_pop3` and
`back_dc_lmtp`, with two servers in each, listening for `pop3` and `lmtp`
traffic respectively:

```
backend back_dc_pop3
    mode     tcp
    balance  leastconn
    option   allbackups
    server   10.41.1.131 10.41.1.131:110 check inter 5s
    server   10.41.1.116 10.41.1.116:110 check inter 5s
 
backend back_dc_lmtp
    mode     tcp
    balance  leastconn
    option   allbackups
    server   10.41.1.131 10.41.1.131:24 check inter 5s
    server   10.41.1.116 10.41.1.116:24 check inter 5s
```

::: info Note
Details about load balancing methods and options are available in the
haproxy documentation if you need more information.
:::

## Health Checking

HAProxy uses health checks to determine if a backend server is available to
process requests. This avoids having to manually remove a server from
the backend if it becomes unavailable.

The default health check is to try to establish a TCP connection to the
server. E.g., it checks if the backend server is listening on the
configured IP address and port.

## Sample Configuration

HAProxy configured between Dovecot Backends and Scality sproxyd:

```
global
    log      127.0.0.1 local2
    chroot   /var/lib/haproxy
    pidfile  /var/run/haproxy.pid
    maxconn  60000
    user     haproxy
    group    haproxy
    daemon
    stats    socket /var/lib/haproxy/stats
   
defaults
   mode     http
   log      global
   option   httplog
   option   dontlognull
   option   http-server-close
   option   forwardfor except 127.0.0.0/8
   option   redispatch
   retries                  3
   timeout  http-request    1m
   timeout  queue           1m
   timeout  connect         10s
   timeout  client          1m
   timeout  server          1m
   timeout  http-keep-alive 10m
   timeout  check           10s
   maxconn                  5000
  
frontend  scality_in
    bind             :::81
    option           forwardfor
    option           httplog
    default_backend  scality_ring
  
    # Capture X-Dovecot-Reason, X-Dovecot-Username and
	# X-Dovecot-Session-Id headers
    capture request header X-Dovecot-Reason len 40
    capture request header X-Dovecot-Username len 40
    capture request header X-Dovecot-Session-Id len 70
  
backend scality_ring
    balance         roundrobin
    mode            http
    option          forwardfor
    option          httpchk
    default-server  inter 30s
    server          10.10.10.1 10.10.10.1:81 check
    server          10.10.10.2 10.10.10.2:81 check
    server          10.10.10.3 10.10.10.3:81 check
    server          10.10.10.4 10.10.10.4:81 check
    server          10.10.10.5 10.10.10.5:81 check
    server          10.10.10.6 10.10.10.6:81 check
```
