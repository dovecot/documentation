---
layout: doc
title: Rawlog
dovecotlinks:
  rawlog: rawlog
---

# Rawlog

Dovecot supports logging IMAP/POP3/LMTP/SMTP(submission) traffic (also
TLS/SSL encrypted). There are several possibilities for this:

1. [[setting,rawlog_dir]]

2. Pre-login \*-login process via `-R` parameter. See below.

3. For proxying (in \*-login processes), use
   [[setting,login_proxy_rawlog_dir]].

4. For lmtp, you need to use [[setting,lmtp_rawlog_dir]] and
   [[setting,lmtp_proxy_rawlog_dir]] settings.

5. For submission, you need to use [[setting,rawlog_dir]] and
   [[setting,submission_relay_rawlog_dir]] settings.

6. Using rawlog binary, which is executed as post-login script.
   This is the legacy method, which shouldn't be necessary anymore. See below.

## Pre-login Rawlog

The pre-login rawlog is used before IMAP, POP3, Submission or ManageSieve
client logs into the post-login process. Note that LMTP and doveadm protocols
don't have a pre-login process.

::: info
SSL/TLS sessions are currently not decrypted to rawlogs.
:::

You can enable pre-login rawlog for all users by telling the login processes
to log to a rawlog directory:

```[dovecot.conf]
service imap-login {
   executable = imap-login -R rawlogs
}
```

This attempts to write the rawlogs under `$base_dir/login/rawlogs` directory.
You need to create it first with enough write permissions:

```sh
mkdir /var/run/dovecot/login/rawlogs
chown dovenull /var/run/dovecot/login/rawlogs
chmod 0700 /var/run/dovecot/login/rawlogs
```

## rawlog Binary

This is the legacy method. [[setting,rawlog_dir]] is preferred nowadays.

This works by checking if `dovecot.rawlog/` directory exists in the logged in
user's home directory, and writing the traffic to `yyyymmdd-HHMMSS-pid.in`
and `.out` files. Each connection gets their own in/out files. Rawlog will
simply skip users who don't have the `dovecot.rawlog/` directory and the
performance impact for those users is minimal.

### Home Directory

::: info
For rawlog binary to work, your userdb must have returned a home directory
for the user.
:::

::: warning
The home directory must be returned by userdb, [[setting,mail_home]] won't
work.

Verify that [[doveadm,user,-u user@example.com]] returns the home directory,
for example:

```sh
doveadm user -u user@example.com
```
```
userdb: user@example.com
   user      : user@example.com
   uid       : 1000
   gid       : 1000
   home      : /home/user@example.com
```

In the above configuration, rawlog would expect to find
`/home/user@example.com/dovecot.rawlog/` directory writable by uid `1000`.
:::

If your userdb can't return a home directory directly, you can add:

```[dovecot.conf]
userdb {
  # ...
  default_fields = home=/home/%u
  # or temporarily even e.g. default_fields = home=/tmp/temp-home
}
```

You can also set `DEBUG` environment to have rawlog log an info message why
it's not doing anything:
[[setting,import_environment,$import_environment DEBUG=1]].

### Configuration

To enable rawlog binary, use post-login scripting:

```[dovecot.conf]
service imap {
  executable = imap postlogin
}

service pop3 {
  executable = pop3 postlogin
}

service postlogin {
  executable = script-login -d rawlog
  unix_listener postlogin {
  }
}
```

You can also give parameters to rawlog:

* `-b`: Write IP packet boundaries (or whatever read() sees anyway) to the
  log files. The packet is written between &lt;&lt;&lt; and &gt;&gt;&gt;.
* `-t`: Log a microsecond resolution timestamp at the beginning of each line.
* `-I`: Include IP address in the filename.
* `-f in`: Log only to `*.in` files.
* `-f out`: Log only to `*.out` files.
