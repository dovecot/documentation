---
layout: doc
title: Static
dovecotlinks:
  auth_staticdb: static authentication database
---

# Static Password Database (`static`)

## passdb

Static password database is typically used only for testing, proxying setups,
and perhaps some other special kind of setups.

::: danger
**Static passdb allows users to log in with any username.**
:::

For password you return either:

* `password=secret`: All users have `secret` as password.
* `nopassword`: Users can log in with any password.

You can return any other [[link,passdb_extra_fields]]. You can use
[[variable]] everywhere.

### Example

```[dovecot.conf]
passdb db1 {
  driver = static
  args = nopassword=y
  default_fields = proxy=y host=127.0.0.1
}
```

## userdb

Static user database can be used when you want to use only single UID and
GID values for all users, and their home directories can be specified with
a simple template.

The syntax is:

```[dovecot.conf]
userdb db1 {
  driver = static
  args = uid=<uid> gid=<gid> home=<dir template>
}
```

The home is optional. You can also return other [[link,userdb_extra_fields]].
You can use [[variable]] everywhere.

### LDA and passdb Lookup for User Verification

Unless your MTA already verifies that the user exists before calling
dovecot-lda, you'll most likely want dovecot-lda itself to verify the
user's existence.

Since dovecot-lda looks up the user only from the userdb, it of course
doesn't work with static userdb because there is no list of users.
Normally static userdb handles this by doing a passdb lookup instead.

This works with most passdbs, with [[link,auth_pam]] being the most notable
exception.

If you want to avoid this user verification, you can add
`allow_all_users=yes` to the args in which case the passdb lookup is skipped.

### Example

```[dovecot.conf]
userdb db1 {
  driver = static
  args = uid=500 gid=500 home=/home/%u
}
```
