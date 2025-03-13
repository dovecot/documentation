---
layout: doc
title: Active Directory LDAP
---

# Authentication Against Active Directory

When connecting to AD, you may need to use port 3268. Then again, not all LDAP
fields are available in port 3268. Use whatever works. See:
https://technet.microsoft.com/en-us/library/cc978012.aspx.

# LDAP Driver Configuration

::: code-group
```[dovecot.conf]
passdb ldap {
  ...
}
```
:::

This enables LDAP to be used as passdb.
The most important settings are:

- Configure how the LDAP server is reached.
(Active directory allows binding with username@domain):

::: code-group
```[dovecot.conf]
  ldap_uris = ldap://ldap.example.com
  ldap_auth_dn = cn=admin,dc=example,dc=com
  ldap_auth_dn_password = secret
  ldap_base = dc=example,dc=com
```
:::

- Use LDAP authentication binding for verifying users' passwords:

::: code-group
```[dovecot.conf]
passdb ldap {
  bind_userdn = %{user}
  bind = yes
}
```
:::

- Use auth worker processes to perform LDAP lookups in order to use multiple
concurrent LDAP connections. Otherwise only a single LDAP connection is used.

::: code-group
```[dovecot.conf]
(passdb|userdb) ... {
  use_worker = yes
}
```
:::

- Normalize the username to exactly the `mailRoutingAddress` field's value
regardless of how the [[setting,passdb_ldap_filter]] found the user:

::: code-group
```[dovecot.conf]
passdb ldap {
  fields {
      user     = %{ldap:mailRoutingAddress}
      password = %{ldap:userPassword}
      proxy    = y
      proxy_timeout = 10
  }
}
```
:::

- Returns userdb fields when prefetch userdb wasn't used (LMTP & doveadm).
The username is again normalized in case `user_filter` found it via some
other means:

::: code-group
```[dovecot.conf]
passdb ldap {
  fields {
    user = %{ldap:mailRoutingAddress}
    quota_storage_size = %{ldap:messageQuotaHard}B
  }
}
```
:::

- How to find the user for passdb lookup (this can be set specifically to
distinct values inside each [[setting,passdb]] / [[setting,userdb]] section):

::: code-group
```[dovecot.conf]
passdb ldap {
  filter = (mailRoutingAddress=%{user})
}
```
:::

- How to iterate through all the valid usernames:

::: code-group
```[dovecot.conf]
userdb ldap {
  filter = (mailRoutingAddress=%{user})
  iterate_filter = (objectClass=messageStoreRecipient)
  iterate_fields {
    user = %{ldap:mailRoutingAddress}
  }
}
```
:::
