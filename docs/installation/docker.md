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
docker run -v /etc/dovecot-config:/etc/dovecot/conf.d,ro -v /srv/vmail:/srv/vmail -p 143:31143 -p 993:31993 dovecot/dovecot:latest
```

Dovecot uses TLS certificates from `/etc/dovecot/ssl` directory. The full chain certificate name is expected to be `tls.crt`, and key file `tls.key`.

POP3 service is not enabled by default, if you need pop3, place a pop3.conf drop-in to conf.d:

```
protocols {
  pop3 = yes
}
```

By default imap, submission, lmtp and sieve protocols are enabled.

## Listening ports

Since v2.4.1 ports are exposed as non-privileged ports. You need to map these
to the ports that you need.

### Exposed protocols

| Protocol    | Port  |
| ----------- | ----- |
| imap        | 31143 |
| imaps       | 31993 |
| pop3        | 31110 |
| pop3s       | 31990 |
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

Dovecot will need write permissions to `/tmp`, `/run` and persistent mail storage at `/srv/vmail`.

## Running without Linux capabilities

By default, Dovecot needs `CAP_SYS_CHROOT` capability. To remove this requirements, you can prevent chrooting
by placing no-chroot.conf to drop-in directory:

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
docker run -v /etc/dovecot-config:/etc/dovecot/conf.d,ro --security-opt "no-new-privileges" --rm -it dovecot/dovecot:latest
```
