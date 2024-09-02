---
layout: doc
title: Prefetch
dovecotlinks:
  auth_prefetch: prefetch authentication database
---

# Prefetch User Database (`prefetch`)

Prefetch [[link,userdb]] can be used to combine passdb and userdb lookups
into a single lookup.

It's usually used with [[link,auth_sql]] and [[link,auth_ldap]].

Prefetch works by requiring that the passdb returns the userdb information
in [[link,passdb_extra_fields]] with `userdb_` prefixes.

For example if a userdb typically returns `uid`, `gid`, and `home`
fields, the passdb would have to return `userdb_uid`, `userdb_gid` and
`userdb_home` fields.

If you're using [[link,lda]] or [[link,lmtp]] you still need a valid userdb
which can be used to locate the users. You can do this by adding a normal
SQL/LDAP userdb **after the userdb prefetch**. The order of definitions is
significant. See below for examples.

## LDAP

`auth_bind=yes` with `auth_bind_userdn-template` is incompatible with
prefetch, because no passdb lookup is done then. If you want zero LDAP lookups,
you might want to use [[link,auth_staticdb]] instead of prefetch.

### Example

::: code-group
```[dovecot.conf]
passdb ldap {
  ...
  fields = {
    user        = %{ldap:uid}
    password    = %{ldap:userPassword}
    userdb_home = %{ldap:homeDirectory}
    userdb_uid  = %{ldap:uidNumber}
    userdb_gid  = %{ldap:gidNumber}
  }
}

userdb prefetch {
  driver = prefetch
}

# The userdb below is used only by LDA.
userdb ldap {
  ...
  fields = {
    home = %{ldap:homeDirectory}
    uid  = %{ldap:uidNumber}
    gid  = %{ldap:gidNumber}
  }
}
```
:::

## SQL

### Example

```[dovecot.conf]
sql_driver = mysql
mysql localhost {
}

passdb sql {
  query = SELECT userid AS user, password, home AS userdb_home, uid AS userdb_uid, gid AS userdb_gid \
    FROM users \
    WHERE userid = '%u'
  }
}

userdb prefetch {
}

# The userdb below is used only by lda.
userdb sql {
  query = SELECT home, uid, gid FROM users WHERE userid = '%u'
}
```
