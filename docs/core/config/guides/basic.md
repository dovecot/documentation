---
layout: doc
title: Basic Configuration
---

# Basic Configuration

This page describes some basic configuration in `dovecot.conf` that are
generally useful for most installations.

## General Settings

### Protocols

Enable [[setting,protocols]] you intend to serve:

```
protocols = imap pop3 lmtp sieve
```

### Process Titles

Show state information in process titles (in `ps` output) by setting
[[setting,verbose_proctitle]]:

```
verbose_proctitle = yes
```

## Storage Node Configuration

These are settings for Dovecot nodes that are accessing mail storage
("backends").

### Shutdown Clients

By default, all active sessions will be shut down when Dovecot is reloaded or
restarted. Setting [[setting,shutdown_clients,no]] is dangerous as existing
sessions are then not killed when Dovecot is restarted or reloaded. This can
have serious consequences if, for example, storage-related settings are
changed, as user connection will be using both old and new configuration at
the same time. Thus, it is recommended to use:

```
shutdown_clients = yes
```

### Memory Allocation

Allocate all memory larger than 128 kB using mmap(). This allows the OS to
free the memory afterwards. This is important for storage nodes because
there can be a lot of long-running imap and pop3 processes.

```
import_environment = $import_environment MALLOC_MMAP_THRESHOLD_=131072
```

See [[setting,import_environment]].

## Proxy Node Configuration

These are settings for Dovecot nodes that are proxying traffic.

### Login Trusted Networks

Include proxy's IP addresses/network so they can pass through the
session ID and the client's original IP address.

```
login_trusted_networks = 10.0.0.0/8
```

See [[setting,login_trusted_network]].

### LMTP Proxying

Enable LMTP to do proxying by doing passdb lookups (instead of only
userdb lookups).

```
lmtp_proxy = yes
```

See [[setting,lmtp_proxy]].

### Disconnect Delay

Avoid load spikes caused by reconnecting clients after a backend server has
died or been restarted.

Instead of disconnecting all the clients at the same time, the
disconnections are spread over longer time period.

```
login_proxy_max_disconnect_delay = 30 secs
```

See [[setting,login_proxy_max_disconnect_delay]].

### Doveadm

[[setting,doveadm_ssl]] setting can be used to specify SSL mode to use
when doing doveadm proxying.

Can be overridden with ssl and starttls [[link,authentication_proxies]] flags.

When using starttls, do not add [[setting,ssl,yes]] to doveadm service's
`inet_listener` block.

```
#doveadm_ssl = no
```

This configures the doveadm server's password ([[setting,doveadm_password]]).
It can be used to access users' mailboxes and do various other things, so
it should be kept secret.

```
#doveadm_password =
```

These settings configure the doveadm port ([[setting,doveadm_port]] when
acting as doveadm client and doveadm server.

```
doveadm_port = 24245

service doveadm {
  inet_listener {
    port = 24245
  }
}
```

### LMTP

This setting configures the LMTP port to use.

```
service lmtp {
  inet_listener lmtp {
    port = 24
  }
}
```

### IMAP/POP3 login

These 3 settings configure the login processes to be in
"high performance mode", as explained in [[link,login_processes]].

The `4` should be changed to the number of CPU cores on the server.

```
service imap-login {
  service_count = 0
  client_limit = 10000
  process_min_avail = 4
  process_limit = 4
}

service pop3-login {
  service_count = 0
  client_limit = 10000
  process_min_avail = 4
  process_limit = 4
}
```

The `client_limit` setting should be increased to be as high as needed.

The max number of connections per server is `client_limit * process_limit`,
so 40k connections in the above configuration.
