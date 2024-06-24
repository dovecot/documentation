---
layout: doc
title: dovecot-lda
dovecotComponent: core
---

# dovecot-lda - Dovecot's local mail delivery agent

## SYNOPSIS

**dovecot-lda** [**-ek**] [**-a** *address*] [**-c** *config_file*] [**-d** *username*] [**-f** *envelope_sender*] [**-m** *mailbox*] [**-o** *setting=value*] [**-p** *path*]

## DESCRIPTION

The **dovecot-lda** is a local mail delivery agent which takes mail from
an MTA and delivers it to a user's mailbox, while keeping Dovecot index
files up to date.

Main features of the **dovecot-lda** are:

* Mailbox indexing during mail delivery, providing faster mailbox access later
* Quota enforcing by the quota plugin
* Sieve language support by the Pigeonhole sieve plugin

## OPTIONS

Options accepted by **dovecot-lda**:

**-a** *address*
:   Destination address (e.g. user+ext@domain). Default is the same as
    *username*.

**-c** *config_file*
:   Alternative configuration file path.

**-d** *username*
:   Destination *username*. If given, the user information is looked up
    from userdb. Typically used with virtual users, but not necessarily
    with system users.

**-e**
:   If mail gets rejected, write the rejection reason to stderr and exit
    with status 77 (EX_NOPERM). The default is to send a rejection mail
    ourself.

**-f** *envelope_sender*
:   Envelope sender address.

**-k**
:   Don't clear all environment at startup.

**-m** *mailbox*
:   Destination mailbox (default is **INBOX**). If the mailbox doesn't
    exist, it will not be created (unless the *lda_mailbox_autocreate*
    setting is set to **yes**). If a message couldn't be saved to the
    *mailbox* for any reason, it's delivered to **INBOX** instead.

**-o** *setting* **=** *value*
:   Overrides the configuration *setting* from
    */etc/dovecot/dovecot.conf* and from the userdb with the given
    *value*. In order to override multiple settings, the **-o** option
    may be specified multiple times.

**-p** *path*
:   Path to the mail to be delivered instead of reading from stdin. If
    using maildir the file is hard linked to the destination if possible.
    This allows a single mail to be delivered to multiple users using
    hard links, but currently it also prevents deliver from updating
    cache file so it shouldn't be used unless really necessary.

## EXIT STATUS

**dovecot-lda** will exit with one of the following values:

**0**
:   Delivery was successful. (EX_OK)

**64**
:   Invalid parameter given. (EX_USAGE)

**67**
:   Recipient user not known. (EX_NOUSER)

**77**
:   **-e** option was used and mail was rejected. Typically this happens
    when user is over quota and **quota_full_tempfail = no** is
    configured. (EX_NOPERM)

**75**
:   A temporary failure. This is returned for almost all failures. See
    the log file for details. (EX_TEMPFAIL)

## FILES

*/etc/dovecot/dovecot.conf*
:   Dovecot's main configuration file.

*/etc/dovecot/conf.d/10-mail.conf*
:   Mailbox locations and namespaces.

*/etc/dovecot/conf.d/15-lda.conf*
:   LDA specific settings.

*/etc/dovecot/conf.d/90-plugin.conf*
:   Plugin specific settings.

*/etc/dovecot/conf.d/90-quota.conf*
:   Quota configuration.

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]

Related MTA specific documentation:

- Postfix:
   - **postconf**(5), **transport**(5), **pipe**(8)

- Exim:
  - https://exim.org/exim-html-current/doc/html/spec_html/ch16.html
  - https://exim.org/exim-html-current/doc/html/spec_html/ch24.html
  - https://exim.org/exim-html-current/doc/html/spec_html/ch29.html
