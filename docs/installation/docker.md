---
layout: doc
title: Running with Docker
order: 8
dovecotlinks:
  docker_debug:
    hash: running-as-debug-testing-install
    text: Docker Container Debugging/Testing
---

# Running with Docker

Dovecot CE comes with Docker images published at https://hub.docker.com/r/dovecot/dovecot.

## Image flavors

Currently we provide aarch64 and amd64 architecture for the images. There are three kinds of images:

Image naming follows pattern `<VERSION>{,-dev,-root}`, where version can be latest or exact published version.

Images are based on Debian slim image, distribution is occasionally upgraded when new versions are released.

### dovecot/dovecot:latest

This is a hardened rootless image, which runs everything as vmail user, and minimal amount of binaries installed. This image
uses non-standard ports, see [Listening ports](#listening-ports) for more information.

Linux capability `CAP_SYS_CHROOT` is needed for the container, unless chrooting is disabled by placing `no-chroot.conf` drop-in to `conf.d`:

```doveconf
service imap-login {
  chroot =
}

service pop3-login {
  chroot =
}

service submission-login {
  chroot =
}

service managesieve-login {
  chroot =
}

service imap-urlauth-login {
  chroot =
}
```

### dovecot/dovecot:latest-dev

This is the same as latest, but without hardening. It still runs rootless with vmail, and if you want to drop `CAP_SYS_CHROOT`, you still need to add the same configuration drop-in.

### dovecot/dovecot:latest-root

This image is suitable for running as root, which means there will be different users like `dovenull`, `dovecot` and `vmail` used.
Also listening ports will be default ports, and not the non-privileged ones.

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

POP3 service is not enabled by default, if you need pop3, place a `pop3.conf` drop-in to `conf.d`:

```doveconf
protocols {
  pop3 = yes
}
```

By default imap, submission, lmtp and sieve protocols are enabled.

### Authentication

The default auth configuration is in `conf.d/auth.conf`, which has
```doveconf
passdb static {
  password = $ENV:USER_PASSWORD
}
```

This is useful only for testing purposes and single-user instances. To configure multiple users or other authentication methods, you need to override this file.

### TLS configuration

Default certificate is expected at `/etc/dovecot/ssl/tls.crt` and key at `/etc/dovecot/ssl/tls.key`. You can override `conf.d/ssl.conf` to change this.

### Complex configuration

You can also override the entire `/etc/dovecot/dovecot.conf` file, just make sure you include `/etc/dovecot/vendor.d/rootless.conf` in your configuration either
direcly, or with `!include` directive. This is not needed if you use the `-root` variant image.

## Listening ports

Since v2.4.1 ports are exposed as non-privileged ports. You need to map these
to the ports that you need. For latest-root image, the ports are standard, and this does not apply.

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

## Running as Debug/Testing Install

To run the Docker image as a test install, a password needs to be set - by
default, the Docker image does not allow authentication.

To quickly setup a local system to test IMAP:

```console
docker run --rm --name dovecot-test -p 31143:31143 -e USER_PASSWORD=password --pull always dovecot/dovecot:latest-dev
```

This command:
- Exposes IMAP (non-secure) only on port 31143
- Allows any username to authenticate with "password"
- Attempts to use/download the latest version of the container
- Names the container as "dovecot-test"
- All data will be removed when the container exits
- Provides shell access to the container (requires `latest-dev`)

To run a command on the container (for example, doveadm):

```console
docker exec -it dovecot-test doveadm
```

For shell access to the container:

```console
docker exec -it dovecot-test bash
```
