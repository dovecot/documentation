---
layout: doc
title: doveadm-fetch
dovecotComponent: core
---

# doveadm-fetch(1) - Fetch partial/full messages or message information

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **fetch**
  [**-S** *socket_path*]
  **-A** *fields* *search_query*

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **fetch**
  [**-S** *socket_path*]
  **-F** *file* *fields* *search_query*

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **fetch**
  [**-S** *socket_path*]
  **\-\-no-userdb-lookup** *fields* *search_query*

**doveadm** [*GLOBAL OPTIONS*] [**-f** *formatter*] **fetch**
  [**-S** *socket_path*]
  **-u** *user* *fields* *search_query*

## DESCRIPTION

**doveadm fetch** can be used to fetch messages' contents and metadata.
This can be useful for scripts and for debugging. If you want to fetch
messages one at a time, see [[man,doveadm-search]].

- Please respect your users' privacy.

<!-- @include: include/global-options-formatter.inc -->

This command uses by default the output formatter **pager**.

## OPTIONS

<!-- @include: include/option-A.inc -->

<!-- @include: include/option-F-file.inc -->

<!-- @include: include/option-no-userdb-lookup.inc -->

<!-- @include: include/option-S-socket.inc -->

<!-- @include: include/option-u-user.inc -->

## ARGUMENTS

*fields*
:   One or more result field names to display, if the *search_query*
    matches any messages. In order to specify multiple fields, enclose
    them in single or double quotes.

    Supported *fields* are:
    :   **binary**
        :   Message body in decoded format.

    :   **binary.\<section\>**
        :   Part of the body decoded, e.g. binary.1

    :   **body**
        :   The body of a message.

    :   **body.\<section\>**
        :   Part of the body, e.g. body.1

    :   **body.preview**
        :   Short preview of the body.

    :   **body.snippet**
        :   Old alias for preview.

    :   **date.received**
        :   Date and time of final delivery, when the message was delivered
            to a user's mailbox for the first time.

            The internal date and time of the source message, when the
            message was copied by the IMAP COPY command.

            The date-time attribute when present, otherwise the current
            time, when the message was saved by the IMAP APPEND command.

    :   **date.received.unixtime**
        :   date.received as unix timestamp.

    :   **date.saved**
        :   Date and time when the message was saved to mailbox.

    :   **date.saved.unixtime**
        :   date.saved as unix timestamp.

    :   **date.sent**
        :   Date and time of the message's Date: header.

    :   **date.sent.unixtime**
        :   date.sent as unix timestamp.

    :   **flags**
        :   A message's IMAP flags, e.g. \\Seen

    :   **guid**
        :   A message's globally unique identifier.

    :   **hdr**
        :   The header of the message.

    :   **hdr.\<name\>**
        :   Named header from the message.

    :   **imap.body**
        :   IMAP BODY output of the message (see [[rfc,3501]]).

    :   **imap.bodystructure**
        :   IMAP BODYSTRUCTURE output of the message (see [[rfc,3501]]).

    :   **imap.envelope**
        :   IMAP ENVELOPE output of the message (see [[rfc,3501]]).

    :   **mailbox**
        :   Name of the mailbox, in which the message is stored. The name is
            in UTF-8.

    :   **mailbox-guid**
        :   The globally unique identifier of the mailbox, in which the
            message is located.

    :   **modseq**
        :   Modification sequence number for the mail.

    :   **pop3.order**
        :   A message's order number within a mailbox.

    :   **pop3.uidl**
        :   A message's unique (POP3) identifier within a mailbox.

    :   **refcount**
        :   Mail reference count, mdbox only.

    :   **seq**
        :   A message's sequence number in a mailbox.

    :   **size.physical**
        :   A message's physical size.

    :   **size.virtual**
        :   A message's virtual size, computed with CRLF line terminators.

    :   **storageid**
        :   Mailbox driver specific ID for the mail.

    :   **text**
        :   The entire message (header and body).

    :   **text.utf8**
        :   The entire message (header and body) — UTF-8 encoded.

    :   **uid**
        : A message's unique (IMAP) identifier in a mailbox.

    :   **user**
        : A message owner's login name.

*search_query*
:   Fetch messages matching this search query. See
    [[man,doveadm-search-query,7]] for details.

## EXAMPLE

This example based on the first example from [[man,doveadm-search]]. We
are fetching the fields **mailbox** and **date.sent** from user bob's
mailbox with the guid "3a94c928d66ebe4bda04000015811c6a" for the
messages with the UIDs **8**, **25** and **45**.

```sh
doveadm fetch -u bob "mailbox date.sent" mailbox-guid 3a94c928d66ebe4bda04000015811c6a uid 8,25,45
```
```
mailbox: dovecot/pigeonhole/2.0
date.sent: 2010-01-19 01:17:41 (+0100)
^L
mailbox: dovecot/pigeonhole/2.0
date.sent: 2010-01-28 09:38:49 (+0100)
^L
mailbox: dovecot/pigeonhole/2.0
date.sent: 2010-03-28 18:41:14 (+0200)
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
