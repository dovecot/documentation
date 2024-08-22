---
layout: doc
title: Converting Password Schemes
---

# Converting Password Schemes

## Introduction

Through the years computers are being faster and faster, and so with it
the encryption of passwords have to more secure. In this example we
convert passwords stored in MySQL with basic CRYPT-encryption to
SSHA256-encryption (Salted SHA256).

See [[link,password_schemes]] for a list of supported password schemes.

We used php to generate the new passwords, but you can use any language
you want

Alternative example can be found at:
https://kaworu.ch/blog/2016/04/20/strong-crypt-scheme-with-dovecot-postfixadmin-and-roundcube.

## Example

* Copy the CRYPT-passwords to a new field (newpassword) but with the prefix
  `{CRYPT}`. This might start you off in the right direction for
   mysql:
  `UPDATE 'your_table' SET field_name = CONCAT('{CRYPT}', field_name)`

* Change `dovecot-sql.conf`, so it will look at the new fields

  ::: details
  ```
  # Comment default_pass_scheme so dovecot will look at the prefix
  # default_pass_scheme = CRYPT

  # update your password_query so it will look at the new field
  # AND add a %w field in the query so we have the plain password in our
  # Enviroment ($PLAIN_PASS)
  password_query = SELECT id as user, newpassword as password, \
      home as userdb_home, uid as userdb_uid, gid as userdb_gid, \
	  '%w' as userdb_plain_pass FROM users WHERE id = '%u'

  # Alternatively, here is another config that worked for me with
  # SHA512-CRYPT (note: uncomment the lines relevant for your setup):
  #
  # driver = mysql
  # connect = host=127.0.0.1 user=mailauth password=secret dbname=postfixadmin
  # default_pass_scheme = SHA512-CRYPT
  # password_query = SELECT username AS user, password, CONCAT('/var/mail/vdomains/', maildir) as userdb_home, 'vmail' as userdb_uid, 'vmail' as userdb_gid, '%w' as userdb_plain_pass FROM mailbox WHERE username = '%u'
  # user_query = SELECT CONCAT('/var/mail/vdomains/', maildir) AS home, 'vmail' AS uid, 'vmail' AS gid, password FROM mailbox WHERE username = '%u' AND active = 1
  ```
  :::

* `dovecot.conf`:

  ```
  userdb db1 {
    driver = prefetch
  }
  ```

* Now reload dovecot, and see everything is still working.

* Make the postlogin-script (which is executed after login) and save it
  as `/usr/local/etc/popafter.sh`:

  ```sh
  #!/bin/sh
  /usr/local/etc/convertpw.php $USER $PLAIN_PASS
  exec "$@"
  ```

* Make the php-script which updates the password and save it as
`/usr/local/etc/convertpw.php`:

  ::: details
  ```php
  #!/usr/local/bin/php
  <?php
  $mysqlhost  = "localhost";
  $mysqluser  = "mysqlusername"; // username which is used to connect to the database
  $mysqlpass  = "mysqlpassword"; // password which is used to connect to the database
  $mysqldb    = "database";      // database where the passwords are stored
  $mysqltable = "users";         // table where the passwords are stored
  $idfield    = "id";            // fieldname where the userlogin is stored
  $passfield  = "newpassword";   // fieldname where the passwords is stored

  $user = $argv[1];
  $cur_password = $argv[2];
  function hexToAscii($hex){
      $strLength = strlen($hex);
      $returnVal = '';
      for($i=0; $i<$strLength; $i += 2) {
          $dec_val = hexdec(substr($hex, $i, 2));
          $returnVal .= chr($dec_val);
      }
      return $returnVal;
  }
  $link = mysql_connect ("$mysqlhost", "$mysqluser", "$mysqlpass")  or die ("Could not connect");
  @mysql_select_db("$mysqldb") or die( "Unable to select database");
  $result = mysql_query("SELECT $passfield FROM $mysqltable WHERE $idfield = '$user' AND $passfield like '{SSHA%'");
  if (mysql_num_rows($result)==0){
          $salt=substr(sha1(uniqid()),18,8);
          $salt_ascii = hexToAscii($salt);
          $new_query= "UPDATE $mysqltable SET $passfield='{SSHA256.hex}".hash('sha256',$cur_password.$salt_ascii).$salt."' WHERE $idfield='".$user."'";
          $res2 = mysql_query($new_query);
  }
  exit;
  ?>
  ```
  :::

* Update your `dovecot.conf` so it will use the scripts we just made:

  ```
  # insert these lines so dovecot uses our scripts
  service pop3 {
    executable = pop3 pop3-postlogin
  }

  service pop3-postlogin {
    executable = script-login /usr/local/etc/popafter.sh
    user = $default_internal_user
    unix_listener pop3-postlogin {
    }
  }
  ```

* Reload Dovecot.

As of now, each user which connects through POP will convert their password
to SSHA256.

If you look at the database you will see, for example,
`{SSHA256.hex}fb0e7f39c88c1d7017169f7f6b9cd6977d1e3291149382b90da4a390a31e81bab3cdced8`
instead of `{CRYPT}$1$.gvrgDqc$Slvoapz5zkpVmmJAxi.0k1`.

If you are using IMAP, you will need to add the same kind of commands
(i.e. imap-postlogin) to your config, too.

When every record is updated, you can update `dovecot.conf` (remove the
extra lines), and `dovecot-sql.conf` (remove the %w-part).

## SHA512-CRYPT

To use SHA512-CRYPT passwords use `/usr/local/etc/popafter.sh`:

```sh
#!/bin/sh
DOVECOTPW=$(doveadm pw -s SHA512-CRYPT -p $PLAIN_PASS)
/usr/local/etc/convertpw.php $USER $DOVECOTPW
exec "$@"
```

A variant that does not leak the password to the process list:

::: details
::: code-group
```sh[Script]
#!/bin/sh
NEWPASSWORD=$(doveadm pw -s SHA512-CRYPT <<EOF
$PLAIN_PASS
$PLAIN_PASS
EOF
)
/etc/dovecot/convert-password.php "$USER" "$NEWPASSWORD"
exec "$@"
```

```bash[Alternate Version]
#!/usr/local/bin/bash

# Here is an alterate version that I used with SHA512-CRYPT and bash
# (note: uncomment the lines relevant for your setup including the ones
# I added for debugging purposes if needed):
# echo "USER: $USER" >> /tmp/log
# echo "PLAIN-PASS: $PLAIN_PASS" >> /tmp/log
DOVECOTPW=$(/usr/local/bin/doveadm pw -s SHA512-CRYPT -p "$PLAIN_PASS")
# echo $DOVECOTPW >> /tmp/log
/usr/local/etc/convertpw.php $USER $DOVECOTPW
exec "$@"
# note: if enabled, some of the lines above will log passwords to /tmp/log.
# Create the file first, and delete it when no longer needed -
# this while approach is a security risk and should *never* be done in a
# production system. I had to use it for troubleshooting for a very
# limited period of time.
```

```[/usr/local/etc/convertpw.php]
#!/usr/bin/php
<?php
$mysqlhost  = "127.0.0.1";
$mysqluser  = "postfix";     // username which is used to connect to the database
$mysqlpass  = "password";    // password which is used to connect to the database
$mysqldb    = "postfix";     // database where the passwords are stored
$mysqltable = "mailbox";     // table where the passwords are stored
$idfield    = "username";    // fieldname where the userlogin is stored
$passfield  = "password";    // fieldname where the passwords is stored

$usr = $argv[1];
$dov = $argv[2];
function hexToAscii($hex){
    $strLength = strlen($hex);
    $returnVal = '';
    for($i=0; $i<$strLength; $i += 2) {
        $dec_val = hexdec(substr($hex, $i, 2));
        $returnVal .= chr($dec_val);
    }
    return $returnVal;
}
$link = mysql_connect ("$mysqlhost", "$mysqluser", "$mysqlpass")  or die ("Could not connect");
@mysql_select_db("$mysqldb") or die( "Unable to select database");
$result = mysql_query("SELECT $passfield FROM $mysqltable WHERE $idfield = '$usr' AND $passfield like '{SHA%'");
if (mysql_num_rows($result)==0){
    $salt=substr(sha1(uniqid()),18,8);
    $salt_ascii = hexToAscii($salt);
    $new_query= "UPDATE $mysqltable SET $passfield='".$dov."' WHERE $idfield='".$usr."'";
    $res2 = mysql_query($new_query);
}
exit;
?>
```
:::

# selinux

```sh
chcon -u system_u /usr/local/etc/convertpw.php
chcon -t bin_t /usr/local/etc/convertpw.php
chcon -u system_u /usr/local/etc/popafter.sh
chcon -t bin_t /usr/local/etc/popafter.sh
```

## Example for SHA512-Crypt with passwd-files

This example has been tested on Dovecot 2.2.19 in a virtual user setup.

Create a new service for the postlogin script and reference it in the
`imap` service section.

`/etc/dovecot/conf.d/10-master.conf`:

```
service imap {
  executable = imap imap-postlogin
  unix_listener imap-master {
    user = dovecot
  }
}

service imap-postlogin {
  executable = script-login /var/vmail/conf.d/scripts/postlogin.sh
  user = vmail
  unix_listener imap-postlogin {
  }
}
```

Enable the `plain_pass` variable in the auth-passwdfile configuration.

`/etc/dovecot/conf.d/auth-passwdfile.conf.ext`:

```
passdb db1 {
  driver = passwd-file
  auth_username_format = %u
  passwd_file_path = /var/vmail/auth.d/%d/passwd
}

userdb db1 {
  driver = passwd-file
  auth_username_format = %u
  passwd_file_path = /var/vmail/auth.d/%d/passwd
  default_fields = plain_pass=%w
}
```

This script will act on all users for a particular domain specified via
the `MIGRATE_DOMAIN` variable.

`/var/vmail/conf.d/scripts/postlogin.sh`:

```sh
#!/bin/sh
# Split out domain part from $USER user@domain
MAIL_ALIAS=${USER%@*}
MAIL_DOMAIN=${USER#*@}
MIGRATE_DOMAIN="domain.tld"

case "$MAIL_DOMAIN" in
    $MIGRATE_DOMAIN)
    DOVECOTPW=$(/usr/bin/doveadm pw -s SHA512-CRYPT -p "$PLAIN_PASS")
    echo "user: $USER" >> /tmp/log
    echo $DOVECOTPW >> /tmp/log
    ;;
esac

exec "$@"
```

Exemplary directory permissions (Setup is using `vmail` context for
the users):

```sh
ls -l /var/vmail/conf.d/scripts/
```
```
-r-x------ 1 vmail vmail 322 Nov 23 09:58 postlogin.sh
```
```sh
ls -l /tmp/log
```
```
-rw------- 1 vmail root 1160 Nov 23 10:27 /tmp/log
```
