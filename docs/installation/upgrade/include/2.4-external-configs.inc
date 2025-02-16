#### External Configuration Files

v2.3 configured sql, ldap and some other features using `.conf.ext`
external configuration files. These have been replaced by regular settings,
which can be used in the same place where they used to be referred to before.
For example:

::: code-group
```[dovecot-2.3.conf]
passdb {
  driver = mysql
  args = /etc/dovecot/dovecot-sql.conf.ext
}
```

```[dovecot-2.3-sql.conf.ext]
connect = host=127.0.0.1 user=mysql_user pass=mysql_pass
password_query = SELECT password FROM users WHERE user = '%u'
```

```[dovecot-2.4.conf.ext]
# Use these mysql settings globally. These could be also inside passdb sql {}
mysql 127.0.0.1 {
  user = mysql_user
  pass = mysql_pass
}
sql_driver = mysql

passdb sql {
  query = SELECT password FROM users WHERE user = '%{user}'
}
```
:::

 * [[link,auth_sql]]
 * [[link,auth_ldap]]
 * [[link,auth_oauth2]]
