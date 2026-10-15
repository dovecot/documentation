---
layout: doc
title: Master Users
dovecotlinks:
  acl_master_users:
    hash: acls
    text: ACL Master Users
  auth_master_users: Master Users
  auth_master_passwords:
    hash: master-passwords
    text: Master Passwords
  auth_master_users_oauth2:
    hash: oauth2
    text: OAuth2 Master Users
---

# Master Users/Passwords

It is possible to configure "master" users who are able to log in as other
users.

It's also possible to directly log in as any user using a master password.

## Master Users

There are two ways for master users to log in as other users:

1. Give the login username in the [[link,authentication_mechanisms]]
   authorization ID field. With OAuth2 see [[link,auth_master_users_oauth2]].

2. Specify both the master username and the login username in the same
   username field. See [[setting,auth_master_user_separator]] for the format
   of the string.

Master users are configured by adding a new [[link,passdb]] with
`master=yes` setting. The users in the master passdb cannot log in as
themselves, only as other people. That means they don't need to exist in the
[[link,userdb]], because the userdb lookup is done only for the
user they're logging in as.

You should also add the `result_success=continue` setting to the master
passdb if possible. It means that Dovecot verifies that the login user really
exists before allowing the master user to log in. Without the setting, if a
nonexistent login username is given, depending on the configuration, it could
either return an internal login error (the userdb lookup failed) or create a
whole new user (with, e.g., [[link,auth_staticdb]]).

`result_success=continue` doesn't work with PAM or LDAP without
[[setting,passdb_ldap_bind,yes]], because both of them require knowing the user's password.

If you want master users to be able to log in as themselves, you'll need to
either add the user to the normal passdb or add the passdb to dovecot.conf
twice, with and without `master=yes`.

::: info
If the passdbs point to different locations, the user can have a
different password when logging in as other users than when logging in as
himself. This is a good idea since it can avoid accidentally logging in as
someone else.
:::

Usually it's better to have **only** a few special master users that are used
only to log in as other people. One example could be a special "spam" master
user that trains the users' spam filters by reading the messages from the
user's spam mailbox.

### ACLs

If [[plugin,acl]] plugin is enabled, the master user is still subject to
ACLs just like any other user, which means that by default the
master user has no access to any mailboxes of the user.

The options for handling this are:

1. Adding a global [[plugin,acl,ACL]] for the master user.

   You can create a `default ACL`, that applies to all mailboxes. See example
   below.

2. Set [[setting,acl_user,%{user}]]. This preserves the master_user for other
   purposes (e.g. `%{master_user}` variable).

3. Change userdb to return `userdb_fields { master_user=%{user} }`. This fully hides that master user login is
   being used.

Example configuration:

```doveconf[dovecot.conf]
auth_master_user_separator = *

passdb passwd-file {
  passwd_file_path = /etc/dovecot/passwd.masterusers
  master = yes
  result_success = continue
}

userdb passwd {
}
```

To grant the master user access to all mailboxes, add a global ACL to
`dovecot.conf` (see [[link,acl_global_file]]):

```doveconf[dovecot.conf]
acl user=masteruser {
  rights = lr
}
```

Where the `passwd.masterusers` file would contain the master usernames and
passwords:

```
admin:{SHA1}nU4eI71bcnBGqeO0t9tXvY1u5oQ=
admin2:{SHA1}i+UhJqb95FCnFio2UdWJu1HpV50=
```

One way to create this master file is to use the htaccess program as follows:

```sh
htpasswd -b -c -s passwd.masterusers user password
```

### SQL Example

The master passdb doesn't have to be passwd-file, it could be an SQL query as
well:

```doveconf[dovecot.conf]
sql_driver = mysql
mysql localhost {
}

auth_master_user_separator = *

passdb db1 {
  driver = sql
  query = SELECT password FROM users WHERE userid = '%{user}' and master_user = true
  master = yes
  result_success = continue
}

passdb db2 {
  driver = sql
  query = # ...
}

userdb sql {
  query = # ...
}
```

### Testing

```
# nc localhost 143
* OK Dovecot ready.
1 login loginuser*masteruser masterpass
1 OK Logged in.
```

If you had any problems, set [[setting,log_debug,category=auth]] and look at
the logs.

### OAuth2

[[added,auth_oauth2_master_login_added]]

With the OAUTHBEARER and XOAUTH2 mechanisms (see [[link,auth_oauth2]]) the
token authenticates the master user, so the master passdb doesn't verify any
password. It only decides whether the token's user may log in as the
requested user. A master login can be requested in two ways:

1. Send the login username as the OAUTHBEARER authorization ID, or as the
   XOAUTH2 user, together with the master user's token. A token for a
   different user than the requested login user is handled as a master
   login.

2. Use [[setting,auth_master_user_separator]], e.g. `loginuser*masteruser`
   with the master user's token. The master username must match the token's
   user.

Without master passdbs a token for a different user than the requested login
user fails as before. The login also fails if no master passdb accepts the
master user.

The master passdb must be able to look up the master user without a password,
so it can't be e.g. PAM. To restrict which users each master user may log in
as, use the `%{login_user}` variable in the master passdb lookup, e.g. in an
SQL query. The master user is still subject to ACLs, see above.

::: warning
A master passdb that doesn't verify passwords (e.g. `nopassword=yes`) must be
limited to the OAuth2 mechanisms with [[setting,passdb_mechanisms_filter]].
Otherwise a password based mechanism, such as PLAIN with
`loginuser*masteruser`, accepts any password for the master user.
:::

```doveconf[dovecot.conf]
auth_mechanisms {
  oauthbearer = yes
  xoauth2 = yes
}

oauth2 {
  # ...
}

passdb passwd-file {
  passwd_file_path = /etc/dovecot/passwd.masterusers
  master = yes
  # The token is the master user's only credential
  mechanisms_filter = oauthbearer xoauth2
}
```

Where `passwd.masterusers` lists the master users without passwords:

```
admin:::::::nopassword=yes
```

## Master Passwords

You can configure a passdb which first performs authentication using the
master password. Then it continues to the primary passdb to verify that
the user exists and get other extra fields.

```doveconf[dovecot.conf]
# master password passdb
passdb static {
  password = master-password
  result_success = continue
}

# primary passdb
passdb pam {
}
```

### Advanced SQL Examples

For these examples, we will create 3 kinds of master users:

* Users who can read all email for all domains
* Users who can read all email for their domain only
* Users who can read email of domains listed in a separate ownership table.

We will use MySQL and create 2 tables with the following structure.

```sql
CREATE TABLE `users` (
    `uid` int(4) NOT NULL AUTO_INCREMENT,
    `user_name` varchar(80) NOT NULL,
    `domain_name` varchar(80) NOT NULL,
    `password` varchar(60) DEFAULT NULL,
    `last_login` datetime DEFAULT NULL,
    `masteradmin` tinyint(1) NOT NULL DEFAULT '0',
    `owns_domain` tinyint(1) NOT NULL DEFAULT '0',
    UNIQUE KEY `emaillookup` (`domain_name`,`user_name`),
    UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=995 DEFAULT CHARSET=utf8

CREATE TABLE `ownership` (
    `login_id` varchar(128) NOT NULL,
    `owned_object` varchar(128) NOT NULL,
    UNIQUE KEY `login_id_full` (`login_id`,`owned_object`),
    KEY `login_id` (`login_id`),
    KEY `owned_object` (`owned_object`),
    KEY `login_id_index` (`login_id`),
    KEY `owned_object_index` (`owned_object`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8
```

The `dovecot.conf` file for all 3 master user configurations will be as
follows:

```doveconf[dovecot.conf]
passdb db1 {
  driver = sql
  args = /etc/dovecot/ownership-sql.conf
  master = yes
  result_success = continue
}

passdb db2 {
  driver = sql
  args = /etc/dovecot/domain-owner-sql.conf
  master = yes
  result_success = continue
}

passdb db3 {
  driver = sql
  args = /etc/dovecot/masteradmin-sql.conf
  master = yes
  result_success = continue
}

passdb db4 {
  driver = sql
  args = /etc/dovecot/sql.conf
}
```

Before we get into the master user tricks, we start with normal email
authentication. The query for that is as follows:

```doveconf[dovecot.conf]
passdb sql {
  query = SELECT user_name, domain_name, password \
    FROM users \
    WHERE user_name = '%{user | username}' AND domain_name = '%{user | domain}'
}
```

In this first example, suppose you want to allow a few people to be
master users over all domains. These users will have the `masteradmin` field
set to `1`. The query would be:

```doveconf[dovecot.conf]
passdb sql {
  query = SELECT user_name, domain_name, password \
    FROM users \
    WHERE user_name = '%{user | username}' AND domain_name = '%{user | domain}' AND masteradmin='1'
}
```

In the second example, suppose you are hosting multiple domains and you
want to allow a few users to become master users of their domain only.

Your query would be as follows:

```doveconf[dovecot.conf]
passdb sql {
  query = SELECT user_name, domain_name, password \
    FROM users \
    WHERE user_name = '%{user | username}' AND domain_name = '%{user | domain}' AND owns_domain='1' AND '%{user | domain}'='%{login_domain}'
}
```

This will allow you to log in using `joe@dovecot.org*master@dovecot.org`
to read Joe's email if master@dovecot.org is flagged as the `domain_owner`.

In the third example, we have a table of owners. There are a list of pairs
between owner email addresses and domains that are owned. That way if a person
controls a lot of domains then they can view all the users in all the domains
they control. The query would be as follows:

```doveconf[dovecot.conf]
passdb sql {
  query = SELECT user_name, domain_name, password \
    FROM users, ownership \
    WHERE user_name = '%{user | username}' AND domain_name = '%{user | domain}' AND login_id='%{user}' AND owned_object='%{login_domain}'
}
```

If you really want to get tricky and efficient you can combine all 3 queries
into one giant query that does everything.

```doveconf[dovecot.conf]
passdb sql {
  query = SELECT user_name, domain_name, password \
    FROM users, ownership \
    WHERE user_name = '%{user | username}' AND domain_name = '%{user | domain}' \
      AND ( (masteradmin='1') OR (owns_domain='1' AND '%{user | domain}'='%{login_domain}') \
      OR (login_id='%{user}' and owned_object='%{login_domain}') ) \
    GROUP BY uid
}
```
