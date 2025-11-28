---
layout: doc
title: Running with Docker
order: 8
---

# Running with Docker

Dovecot CE comes with Docker images published at https://hub.docker.com/r/dovecot/dovecot.

## Minimal setup

To run Dovecot you can start it with:

```console
docker run -p 143:31143 -p 993:31993 dovecot/dovecot:latest
```

This will expose IMAP and IMAPS ports, but all data is kept locally.

## Persisting mail data

To persist data, mount volume to `/srv/vmail`. Remember that this needs to be writable to UID 1000 internally.

Example:

```console
docker run -v /srv/vmail:/srv/vmail -p 143:31143 -p 993:31993 dovecot/dovecot:latest
```

## Configuring instance


These docker images are rootless since v2.4.0. This means they are ran with vmail (UID 1000).

To change configuration, put configuration drop-ins to `/etc/dovecot/conf.d`.

Example:

```console
docker run -v /etc/dovecot-config:/etc/dovecot/conf.d:ro -v /srv/vmail:/srv/vmail -p 143:31143 -p 993:31993 dovecot/dovecot:latest
```

POP3 service is not enabled by default, if you need pop3, place a pop3.conf drop-in to conf.d:

```
protocols {
  pop3 = yes
}
```

By default imap, submission, lmtp and sieve protocols are enabled.

### Authentication

The default auth configuration is in conf.d/auth.conf, which has
```
passdb static {
  password = $ENV:USER_PASSWORD
}
```

This is useful only for testing purposes and single-user instances. To configure multiple users or other authentication methods, you need to override this file.

### TLS configuration

Default certificate is expected at `/etc/dovecot/ssl/tls.crt` and key at `/etc/dovecot/ssl/tls.key`. You can override `conf.d/ssl.conf` to change this.

### Complex configuration

You can also override the entire `/etc/dovecot/dovecot.conf` file, just make sure you include `/etc/dovecot/vendor.d/rootless.conf` in your configuration either
direcly, or via include. This is not needed if you use the `-root` variant image.

## Listening ports

Since v2.4.1 ports are exposed as non-privileged ports. You need to map these
to the ports that you need.

### Exposed protocols

| Protocol    | Port  |
| ----------- | ----- |
| imap        | 31143 |
| imaps       | 31993 |
| pop3        | 31110 |
| pop3s       | 31995 |
| submissions | 31465 |
| submission  | 31587 |
| lmtps       | 31024 |
| managesieve | 34190 |
| HTTP API    |  8080 |
| Metrics     |  9090 |

## Running read-only

To run the system fully read-only, use:

```console
docker run --read-only --tmpfs /tmp --tmpfs /run/dovecot -v /srv/vmail:/srv/vmail --rm -it dovecot/dovecot:latest
```

Dovecot will need write permissions to `/tmp`, `/run/dovecot` and persistent mail storage at `/srv/vmail`.

## Running without Linux capabilities

By default, Dovecot needs `CAP_SYS_CHROOT` capability. To remove this requirements, you can prevent chrooting
by placing no-chroot.conf to `conf.d` directory:

```
service submission-login {
  chroot =
}
service imap-login {
  chroot =
}
service pop3-login {
   chroot =
}
service managesieve-login {
   chroot =
}
service imap-urlauth-login {
   chroot =
}
```

and run Dovecot using:

```console
docker run -v /etc/dovecot-config:/etc/dovecot/conf.d:ro --security-opt "no-new-privileges" --rm -it dovecot/dovecot:latest
```
