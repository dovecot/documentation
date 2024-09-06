---
layout: doc
title: PAM
dovecotlinks:
  auth_pam: PAM authentication database
---

# PAM (`pam`)

This is the most common way to authenticate system users nowadays.

PAM is not itself a password database, but rather its configuration tells
the system how exactly to do the authentication. Usually this means using
the `pam_unix.so` module, which authenticates user from the system's
shadow password file.

Because PAM is not an actual database, only cleartext authentication
mechanisms can be used with PAM. PAM cannot be used as a [[link,userdb]]
either (although static user templates could be used to provide the same
effect).

Usually PAM is used with [[link,auth_passwd]] or [[link,auth_staticdb]].

Dovecot should work with Linux PAM, Solaris PAM, OpenPAM (FreeBSD),
and ApplePAM (Mac OS X).

## Settings

<SettingsComponent tag="passdb-pam" />

## Service Name

The PAM configuration is usually in the `/etc/pam.d/` directory, but some
systems may use a single file, `/etc/pam.conf`. By default Dovecot uses
dovecot as the PAM service name, so the configuration is read from
`/etc/pam.d/dovecot`. You can change this by setting the wanted service name
using [[setting,passdb_pam_service_name]]. You can also set the service to
`%{protocol}` in which case Dovecot automatically uses either `imap` or `pop3`
as the service, depending on the actual service the user is logging in to.

Examples:

* Use `/etc/pam.d/imap` and `/etc/pam.d/pop3`:

  ```[dovecot.conf]
  passdb pam {
    service_name = %{protocol}
  }
  ```

* Use `/etc/pam.d/mail`:

  ```[dovecot.conf]
  passdb pam {
    service_name = mail
  }
  ```

## PAM Sessions

By setting [[setting,passdb_pam_service_name,yes]] you can make Dovecot open a
PAM session and close it immediately. Some PAM plugins need this, for instance
`pam_mkhomedir`. With this parameter, `dovecot.conf` might look something like
this:

```[dovecot.conf]
passdb pam {
  session = yes
  service_name = dovecot
}
```

## PAM Credentials

By setting [[setting,passdb_pam_setcred,yes]] you can make Dovecot create PAM
credentials. Some PAM plugins need this. The credentials are never deleted
however, so using this might cause problems with other PAM plugins.

## Limiting the Number of PAM Lookups

Usually in other software, PAM is used to do only a single lookup in a process,
so PAM plugin writers haven't done much testing on what happens when multiple
lookups are done. Because of this, many PAM plugins leak memory and possibly
have some other problems when doing multiple lookups.

If you notice that PAM authentication stops working after some time, you
can limit the number of lookups done by the auth worker process before it
dies using the [[setting,passdb_pam_max_requests]] setting:

```[dovecot.conf]
passdb pam {
  max_requests = 100
}
```

The default `max_requests` value is 100.

## Username Changing

A PAM module can change the username.

## Making PAM Plugin Failure Messages Visible

You can replace the default "Authentication failed" reply with PAM's failure
reply by setting [[setting,passdb_pam_failure_show_msg]]:

```[dovecot.conf]
passdb pam {
  failure_show_msg = yes
}
```

This can be useful with e.g. `pam_opie` to find out which one time password
you're supposed to give:

```
1 LOGIN username otp
1 NO otp-md5 324 0x1578 ext, Response:
```

# Restrict IP-Addresses Allowed to Connect via PAM

You can restrict the IP-Addresses allowed to connect via PAM:

```[dovecot.conf]
passdb pam {
  fields {
    allow_nets = 10.1.100.0/23,2001:db8:a0b:12f0::/64
  }
}
```

## Caching

Dovecot supports caching password lookups by setting
[[setting,auth_cache_size]] to a non-zero value.

Examples:

```[dovecot.conf]
# 1MB auth cache size
auth_cache_size = 1024
passdb pam {
}
```

## Examples

### Linux

Here is an example `/etc/pam.d/dovecot` configuration file which uses
standard UNIX authentication:

```
auth      required        pam_unix.so nullok
account   required        pam_unix.so
```

### Solaris

For Solaris you will have to edit `/etc/pam.conf`.

Here is a working Solaris example (using [[setting,service_name,%L{service}]]
instead of the default `dovecot` service):

```
imap    auth       requisite   pam_authtok_get.so.1
imap    auth       required    pam_unix_auth.so.1
imap    account    requisite   pam_roles.so.1
imap    account    required    pam_unix_account.so.1
imap    session    required    pam_unix_session.so.1
pop3    auth       requisite   pam_authtok_get.so.1
pop3    auth       required    pam_unix_auth.so.1
pop3    account    requisite   pam_roles.so.1
pop3    account    required    pam_unix_account.so.1
pop3    session    required    pam_unix_session.so.1
```

### Mac OS X

On Mac OS X, the `/etc/pam.d/dovecot` file might look like this:

```
auth        required       pam_opendirectory.so try_first_pass
account     required       pam_nologin.so
account     required       pam_opendirectory.so
password    required       pam_opendirectory.so
```

...which, as the equivalent of `/etc/pam.d/login` on OS X 10.9. For very old
versions of OS X (e.g. 10.4), can be represented (where?) as the following in
the on that OS:

```[dovecot.conf]
passdb pam {
  service_name = login
}
```

On older versions of Mac OS X, "passwd" can be used as a userdb to fill
in UID, GID, and homedir information after PAM was used as a passdb, even
though Directory Services prevents "passdb passwd" from working as a
username/password authenticator.

This will provide full system user authentication with true homedir mail
storage, without resorting to a single virtual mail user or LDAP:

```[dovecot.conf]
userdb passwd {
}
```
