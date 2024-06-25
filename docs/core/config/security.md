---
layout: doc
title: Security
---

# Security

Dovecot has been designed with security in mind. It uses multiple processes
and privilege separation to isolate different parts from each others in case
a security hole is found from one part.

Additional things you can configure:

- Allocate each user their own UID and GID (see [[link,system_users]])

- Use a separate `dovecot-auth` user for authentication process (see
  [[link,system_users]])

- You can chroot authentication and mail processes (see [[link,chrooting]])

- There are some security related SSL settings (see [[link,ssl_configuration]])

- Set `first/last_valid_uid/gid` settings to contain only the range
  actually used by mail processes
