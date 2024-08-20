---
layout: doc
title: Dovecot LDA Examples
---

# Dovecot LDA Examples

## Exim

### System Users

Change the localuser router to use dovecot_delivery transport:

```
localuser:
  driver = accept
  check_local_user
# local_part_suffix = +* : -*
# local_part_suffix_optional
  transport = dovecot_delivery
```

`check_local_user` is required. It makes Exim execute the transport
with the user's UID and GID and it also sets HOME environment.

Next create a new transport for dovecot-lda:

```
dovecot_delivery:
  driver = pipe

  # Use /usr/lib/dovecot/dovecot-lda if using Debian's package.
  # You may or may not want to add -d $local_part@$domain depending on if
  # you need a userdb lookup done.
  command = /usr/local/libexec/dovecot/dovecot-lda -f $sender_address

  message_prefix =
  message_suffix =
  log_output
  delivery_date_add
  envelope_to_add
  return_path_add
  #group = mail
  #mode = 0660
  temp_errors = 64 : 69 : 70: 71 : 72 : 73 : 74 : 75 : 78
```

LDA is now running using the local user's UID and GID. The mail is delivered
to the location specified by [[setting,mail_location]].

Note that the above configuration doesn't do any [[link,userdb]] lookups, so
you can't have any per-user configuration. If you want that, see the
virtual user setup below.

### Virtual Users

Make sure that `check_local_user` isn't set in the router.

#### Single UID

Configure the transport to run as the user you want, for example vmail:

```
dovecot_virtual_delivery:
  driver = pipe
  command = /usr/local/libexec/dovecot/dovecot-lda -d $local_part@$domain  -f $sender_address
  # v1.1+: command = /usr/local/libexec/dovecot/dovecot-lda -d $local_part@$domain  -f $sender_address -a $original_local_part@$original_domain
  message_prefix =
  message_suffix =
  delivery_date_add
  envelope_to_add
  return_path_add
  log_output
  user = vmail
  temp_errors = 64 : 69 : 70: 71 : 72 : 73 : 74 : 75 : 78
```

You'll also need to have a master authentication socket and give vmail
user access to it. See [[link,lda]] for more information.

List of temp_errors can be found in `/usr/include/sysexits.h`.

#### Multiple UIDs

If you need multiple uids/gids you'll need to set dovecot-lda setuid
root. See [[link,lda]] for how to do this securely.

You could alternatively set `user = root`, but this requires that you
built Exim without root being in FIXED_NEVER_USERS list.

##### Multiple UIDs, without running dovecot-lda as root

In this mode, dovecot-lda won't be querying Dovecot's master socket,
instead trusting Exim to setup its execution environment. This means you
must set up Exim to get the UID, GID, Home directory from
LDAP/SQL/whatever. Here, we're setting them in the router and the
transport automatically inherits them.

###### Router Configuration

Insert the following router after your external delivery routers and
before your local system delivery routers.

This assumes you're using macros set elsewhere to handle your external
queries, as they can quickly become unwieldy to manage. Make sure you
adjust it to suit your installation first!

```
ldap_local_user:
  debug_print = "R: ldap_local_user for $local_part@$domain"
  driver = accept
  domains = +ldap_local_domains
  condition = LDAP_VIRT_COND
  router_home_directory = LDAP_VIRT_HOME
  user = LDAP_VIRT_UID
  group = LDAP_VIRT_GID
  #local_part_suffix = +* : -*
  #local_part_suffix_optional
  transport = dovecot_lda
```

###### Transport Configuration

This transport has been tested with Exim 4.69-9 and Dovecot 1:1.2.5-2
(backported) on Debian Lenny. You also have to set:

```
dovecot_lda:
  debug_print = "T: dovecot_lda for $local_part@$domain"
  driver = pipe
  # Uncomment the following line and comment the one after it if you want dovecot-lda to try
  # to deliver subaddresses into INBOX.{subaddress}. If you do this, uncomment the
  # local_part_suffix* lines in the router as well. Make sure you also change the separator
  # to suit your local setup.
  #command = /usr/lib/dovecot/dovecot-lda -e -k -m "INBOX|${substr_1:$local_part_suffix}" \
  command = /usr/lib/dovecot/dovecot-lda -e -k \
      -f "$sender_address" -a "$original_local_part@$original_domain"
  environment = USER=$local_part@$domain
  home_directory = /var/mail/home/$domain/$local_part
  umask = 002
  message_prefix =
  message_suffix =
  delivery_date_add
  envelope_to_add
  return_path_add
  log_output
  log_defer_output
  return_fail_output
  freeze_exec_fail
  #temp_errors = *
  temp_errors = 64 : 69 : 70 : 71 : 72 : 73 : 74 : 75 : 78
```

You need to have [[link,home_directories_for_virtual_users]] set
to have duplicate database enabled, among other reasons.

## Postfix

This page contains only information specific to using LDA with Postfix,
see [[link,lda]] for more information about using the LDA itself.

### System Users

If you wish you use `dovecot-lda` for all system users on a single
domain mail host you can do it by editing `mailbox_command` parameter
in `/etc/postfix/main.cf`
([`postconf(5)`](http://www.postfix.org/postconf.5.html)):

```
mailbox_command = /usr/local/libexec/dovecot/dovecot-lda -f "$SENDER" -a "$RECIPIENT"
#  or
mailbox_command = /usr/libexec/dovecot/dovecot-lda -f "$SENDER" -a "$RECIPIENT"
#  or
mailbox_command = /usr/lib/dovecot/dovecot-lda -f "$SENDER" -a "$RECIPIENT"
#  or wherever it was installed in your system.
```

Then run `postfix reload`.

- This command doesn't do a [[link,userdb]] lookup. If you want that (e.g.,
  for per-user quota lookups) you need to add `-d "$USER"` parameter.

- Postfix runs `mailbox_command` with both the uid and gid of the
  destination user. This may not allow `dovecot-lda` to write a lock
  file in `/var/mail`. When this directory is writable by a
  privileged group (say `main`, see the option
  [[setting,mail_privileged_group]]), we can use the setgid permission
  bit on the `dovecot-lda` executable:

  ```sh
  chgrp mail /usr/lib/dovecot/dovecot-lda
  chmod 2755 /usr/lib/dovecot/dovecot-lda
  ```

  Alas, these permission will disappear if you update Dovecot.

  A more robust way to do so is to compile a relay program
  `/etc/postfix/dovecot-lda-relay` that has the setgid permission and
  execs the real `dovecot-lda`.

  ```sh
  cd /etc/postfix
  cat >dovecot-lda-relay.c <<EOF
  #include <unistd.h>
  char *pgm = "/usr/lib/dovecot/dovecot-lda";  /* wherever dovecot-lda is located */
  int main(int argc, char**argv) { argv[0]=pgm; execv(pgm,argv); return 10; }
  EOF
  gcc -o dovecot-lda-relay dovecot-lda-relay.c
  chown root:mail dovecot-lda-relay
  chmod 2755 dovecot-lda-relay
  ```

  Then, simply invoke `/etc/postfix/dovecot-lda-relay` instead of
  `dovecot-lda` in `mailbox_command`.

- Postfix's `mailbox_size_limit` setting applies to all files that
  are written via dovecot-lda. The default is 50 MB, so dovecot-lda
  can't write **any** files larger than that, including mbox files or
  log files. This shows up only in Dovecot's logs:

  ```
  dovecot-lda(user): write() failed with mbox file /home/user/mail/foo: File too large (process was started with ulimit -f limit)
  ```

- If you have trouble seeing anything in Dovecot's logs, see [[link,lda]].

### Virtual Users

Dovecot LDA is very easy to use on large scale installations with
Postfix virtual domains support, just add a `dovecot` service in
`/etc/postfix/master.cf` ([`master(5)`](http://www.postfix.org/master.5.html)):

```
dovecot   unix  -       n       n       -       -       pipe
  flags=DRhu user=vmail:vmail argv=/usr/local/libexec/dovecot/dovecot-lda -f ${sender} -d ${recipient}
```

An example using address extensions (i.e. user+extension@domain.com (don't
forget to define the proper recipient_delimiter in Postfix's main.cf))
to deliver to the folder 'extension' in your maildir (If you wish to
preserve the case of `${extension}`, remove the `hu`
[flags](http://www.postfix.org/pipe.8.html), and be sure to utilize
[[variable]] in your `dovecot.conf` for mail locations and other
configuration parameters that are expecting lower case):

```
dovecot unix    -       n       n       -       -      pipe
  flags=DRhu user=vmail:vmail argv=/usr/local/libexec/dovecot/dovecot-lda -f ${sender} -d ${user}@${nexthop} -m ${extension}

# or if you have a INBOX/ namespace prefix:
dovecot unix    -       n       n       -       -      pipe
  flags=DRhu user=vmail:vmail argv=/usr/local/libexec/dovecot/dovecot-lda -f ${sender} -d ${user}@${nexthop} -m INBOX/${extension}
```

This example ignores address extensions (ie user+extension@domain.com
delivers just like user@domain.com ), but still shows the original
address for Sieve:

```
dovecot   unix  -       n       n       -       -       pipe
  flags=DRhu user=vmail:vmail argv=/usr/lib/dovecot/dovecot-lda -f ${sender} -a ${original_recipient} -d ${user}@${nexthop}
```

Replace `vmail` above with your virtual mail user account.

Then set `virtual_transport` to `dovecot` in `/etc/postfix/main.cf`:

```
dovecot_destination_recipient_limit = 1
virtual_mailbox_domains = your.domain.here
virtual_transport = dovecot
```

And remember to run `postfix reload`.

#### Virtual Users with Multiple uids/gids

If you need multiple uids/gids you'll need to set dovecot-lda setuid
root or invoke it through sudo. See [[link,lda]] for how to do this securely.

### Postfix with a NFS mail store

If you are experiencing problems with dovecot-lda processes hanging when
delivering to an NFS mail store, it's likely that the dovecot-lda
process is hanging while waiting for free locks. The occurrence of this
can be greatly reduced, if not eradicated, by forcing Postfix to only
deliver to the same recipient one at a time.

```
dovecot_destination_concurrency_limit = 1
```

### Prevent Backscatter

To prevent backscatter you should configure Postfix to reject mail for
nonexistent recipients.

This is the default behaviour (`smtpd_reject_unlisted_recipient = yes`)
so there's no need to set "reject_unlisted_recipient" in any of your
restriction. But: Postfix must know if a recipient exists. Depending on
how you've configured Dovecot and Postfix this can be done several ways.

#### System Users

If you only use local system users this is no problem - all valid
recipients can be found in the local password or alias database.

#### Virtual users (static)

When you use virtual users and domains you should maintain a list of
valid recipients. The relevant settings are:

**virtual_alias_maps, virtual_mailbox_maps**

For static verification you can maintain the content of the files
yourself. For every recipient or alias you need one entry. Example:

**virtual_alias_maps**

`name_recipient@example.com  external@example.net`

**virtual_mailbox_maps**

```
name@example.com  OK
recipient@example.com  available
```

Don't forget to run "postmap" afterwards.

::: info
If you use the Dovecot LDA or LMTP it doesn't matter what you
use behind the recipient address. Use "OK", the full name of the user or
else.
:::

#### Virtual users (dynamic)

Do you already use a database (MySQL, PostgreSQL) for Dovecot? Use the
same source for Postfix. You only have to to define a valid sql query
for Postfix. Example:

```
virtual_mailbox_maps = proxy:mysql:/etc/postfix/virtual_mailbox_maps.cf
```

**virtual_mailbox_maps.cf**

```
user = mysql-user
password = mysql-password
hosts = unix:/var/run/mysql/mysqld.sock
dbname = mailserver
query = SELECT name FROM mailbox WHERE email='%s'
```

This query will return the value of the filed "name" from table
"mailbox" if the email address of the recipient matches the email from
the field "email". This is enough for Postfix because Postfix must only
know if the recipient exists. The value doesn't matter. When you use a
database (or LDAP) there's no need to manually maintain a file with
valid recipients.

::: info
If you use "relay_domains" instead of "virtual_mailbox_domains" you have
to use "relay_recipient_maps" instead of "virtual_mailbox_maps".
:::

### Dynamic address verification with LMTP

Uou can also use LMTP and the Postfix setting
"reject_unverified_recipient" for dynamic address verification. It's
really nice because Postfix doesn't need to query an external datasource
(MySQL, LDAP...). Postfix maintain a local database with existing/non
existing addresses (you can configure how long positive/negative results
should be cached).

To use LMTP and dynamic address verification you must first get Dovecot
working. Then you can configure Postfix to use LMTP and set
"reject_unverified_recipient" in the smtpd_recipient_restrictions.

On every incoming email Postfix will probe if the recipient address
exists. You will see similar entries in your logfile:

```
Recipient address rejected: undeliverable address: host tux.example.com[private/dovecot-lmtp] said: 550 5.1.1 < tzknvtr@example.com > User doesn't exist: tzknvtr@example.com (in reply to RCPT TO command); from=< cnrilrgfclra@spammer.org > to=< tzknvtr@example.com >
```

If the recipient address exists (status=deliverable) Postfix accepts the
mail.

::: info
You cannot use "reject_unverified_recipient" with "pipe" so this doesn't
work with the Dovecot LDA "deliver".
:::

## qmail

### System Users

The delivery command you need is

```sh
|/var/qmail/bin/preline -f /usr/local/libexec/dovecot/dovecot-lda
```

(You may need to adjust the paths to match your qmail and dovecot
installations.) The `preline` command will add the `Return-Path:`
and `Delivered-To:` lines, because `dovecot-lda` doesn't recognize
qmail's environment variables.

For site-wide usage, put that in `/var/qmail/control/defaultdelivery`
(assuming you installed qmail according to
[LWQ](http://www.lifewithqmail.org/lwq.html)). Or, save it as
`.qmail` in selected users' home directories.

### Virtual Users

Add the `-d` parameter to specify the destination username:

```sh
|/var/qmail/bin/preline -f /usr/local/libexec/dovecot/dovecot-lda -d $EXT@$USER
```

## Sendmail

The following describes how to configure Sendmail to use `dovecot-lda`
where `root` permission is not granted and Dovecot runs under a single
user ID. It may need some adjustment for more typical setups. Other
assumptions are that Sendmail is configured for virtual hosting and that
local-system mail delivery is not handled by `dovecot-lda`.

Allowing that `sendmail.mc` has `MAILER(procmail)dnl` included, edit
`sendmail.cf` adding these lines after the `Mprocmail` definition:

```
######################*****##############
###   DOVECOT Mailer specification    ###
##################*****##################
Mdovecot,   P=/usr/local/libexec/dovecot/dovecot-lda, F=DFMPhnu9,
            S=EnvFromSMTP/HdrFromSMTP, R=EnvToSMTP/HdrFromSMTP,
            T=DNS/RFC822/X-Unix,
            A=/usr/local/libexec/dovecot/dovecot-lda -d $u
```

If you're using `sendmail.mc` then put the lines above into a new file
`/usr/share/sendmail-cf/mailer/dovecot.m4` and put `MAILER(dovecot)`
into your `sendmail.mc`.

Another method of doing the above is by editing your `hostname.mc`
with the following three lines:

```
FEATURE(`local_procmail', `/usr/local/libexec/dovecot/dovecot-lda',`/usr/local/libexec/dovecot/dovecot-lda -d $u')
MODIFY_MAILER_FLAGS(`LOCAL', `-f')
MAILER(procmail)
```

After editing `hostname.mc` with the above, be sure to remake your
`hostname.cf` file.

If `sendmail` runs under a different non-`root` UID via

- `define('confRUN_AS_USER', 'sendmail')dnl`

in `sendmail.mc`, then the `env_put(t_strconcat("RESTRICT\_` lines in
`deliver.c` must be commented-out.

Now add a `virtualdomain.example.com vmail:vmail` line for each virtual
domain to `mailertable.cf` and run
`makemap hash mailertable.db < mailertable.cf`. The `dovecot` (or
some other random text) after the colon character is required, else
`sendmail` will fail to pass command arguments to `dovecot-lda`
correctly. Make sure all the virtual domains are in the
`virtuserdomains` file.

Summing up all previous experience, one may keep all virtual user
accounts under one system account.

The sendmail's "U=" mailer option with changing the owner of lda (to
"keeper" here for instance):

```
-rwxr-xr-x. 1 keeper mail 14536 Dec  7 16:43 /usr/libexec/dovecot/dovecot-lda
```

allows to run virtual users under one system account without applying
SUID.

Sendmail can pass a user account to LDA with or without the domain.
Passing a user name without the domain can be achieved with S=/R=
rewriting rules of the local mailer. Finally, into
`/usr/share/sendmail-cf/mailer/dovecot.m4` goes the block of lines:

```
Mdovecot,      P=/usr/libexec/dovecot/dovecot-lda,
               F=l59DFMPhnuS,
               S=EnvFromL/HdrFromL, R=EnvToL/HdrToL,
               M=51200000,
               U=keeper:mail,
               T=DNS/RFC822/X-Unix,
               A=/usr/libexec/dovecot/dovecot-lda -d $u
```

Sendmail's `dovecot.m4` can be a bit more complex.
