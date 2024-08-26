---
layout: doc
title: doveadm-search-query
dovecotComponent: core
---

# doveadm-search-query(7) - Overview of search queries for doveadm mailbox commands

## DESCRIPTION

Several [[man,doveadm]] commands use a *search_query* in order to act
only on matching messages. This manual page describes all *SEARCH KEYS*,
which can be used in a *search_query*. The query is mostly compatible
with the IMAP SEARCH command parameters, although there are some
differences.

Each *search_query* consists at least of one *SEARCH KEY*. Most of the
*SEARCH KEYS* require an argument. All *SEARCH KEYS* are
case-insensitive. The shortest valid *search_query* is **ALL**. For
example:

```console
$ doveadm search ALL
```

Multiple search query expressions will be combined with the **AND**
operator by default. To find all messages that are new and greater than
50 kilobyte, one can use:

```console
$ doveadm search NEW LARGER 50k
```

**OR**-ed *SEARCH KEYS* have to be written in parenthesis, when mixing
ANDs and ORs. Shells commonly require escaping for parentheses. To find
messages that were saved on the "13th of April 2007" AND have the \\Seen
and/or \\Flagged flag set, one can use for example:

```console
$ doveadm search SAVEDON 2007-04-13 \( SEEN OR FLAGGED \)
```

It's also possible to specify the mailbox, in which should be searched.
Use either the keyword **mailbox** and the name of the mailbox or the
keyword **mailbox-guid** and the mailbox's globally unique identifier in
the *search_query*. To find all messages in the mailbox with the GUID
"44f68b13ce97044b837f000035ca9452" use:

```console
$ doveadm search mailbox-guid 44f68b13ce97044b837f000035ca9452 ALL
```

To list all deleted messages in the "Trash" folder use:

```console
$ doveadm search mailbox Trash DELETED
```

## SEARCH KEYS

The following search keys from the specification of IMAP version 4
revision 1 (see: [[rfc,3501,6.4.4]]) are supported:

*sequence-set*
:   Matches messages with the given sequence numbers. The
    *sequence-set* may be a single UID. Can be a sequence range,
    written as *from*:*to*, e.g. **100**:**125**. As comma separated
    list of sequences, e.g. **11,50,4**. It's also possible to combine
    multiple sequences, e.g. **1,3,5,7,10:20**. Using ***** selects
    the last mail in the mailbox.

    For example 1:100 matches the first 100 mails and 101:200 the next
    second hundred mails. 1,5,* matches the first, the fifth and the
    last email.

**ALL**
:   Matches all messages.

**ANSWERED**
:   Matches messages with the IMAP flag \\Answered set.

**BCC** *string*
:   Matches messages, which contain *string* in the BCC field of the
    message's IMAP envelope structure.

**BEFORE** *date specification*
:   Matches messages with an internal date before *date specification*.

**BODY** *string*
:   Matches messages, which contain *string* in the body part.

**CC** *string*
:   Matches messages, which contain *string* in the CC field of the
    message's IMAP envelope structure.

**DELETED**
:   Matches messages with the IMAP flag \\Deleted set.

**DRAFT**
:   Matches messages with the IMAP flag \\Draft set.

**FLAGGED**
:   Matches messages with the IMAP flag \\Flagged set.

**FROM** *string*
:   Matches messages, which contain *string* in the FROM field of the
    message's IMAP envelope structure.

**HEADER** *field* *string*
:   Matches messages, which either have the named header *field*, when
    empty *string* was given. Or messages, where the given header
    *field*'s value contains the specified *string*.

**KEYWORD** *keyword*
:   Matches messages with the given IMAP *keyword* (e.g. $Forwarded) flag
    set.

**LARGER** *size*
:   Matches messages that are larger than the specified *size*.

**MAILBOX** *name*
:   Matches messages in the mailbox with the specified *name*.

**MAILBOX-GUID** *guid*
:   Matches messages in the mailbox with the specified *guid*.

**NEW**
:   Matches messages, which have the IMAP flag \\Recent set **but not**
    the IMAP flag \\Seen.

**NOT** *search key*
:   Inverse matching - matches massages, where the search doesn't match
    the specified *search key* or its value.

**OLD**
:   Matches messages, which do not have the IMAP flag \\Recent set.

**ON** *date specification*
:   Matches messages whose internal date matches the given *date
    specification*.

*search key* **OR** *search key*
:   Matches messages where one of the OR-ed search keys matches.

    Note: IMAP4rev1 uses the syntax: **OR** *search key search key*

**RECENT**
:   Matches messages with the IMAP flag \\Recent set.

**SEEN**
:   Matches messages with the IMAP flag \\Seen set.

**SENTBEFORE** *date specification*
:   Matches messages with a Date: header before *date specification*.

**SENTON** *date specification*
:   Matches messages with a Date: header matching the given *date
    specification*.

**SENTSINCE** *date specification*
:   Matches messages with a Date: header matching or after the given
    *date specification*.

**SINCE** *date specification*
:   Matches messages whose internal date is within or after the given
    *date specification*.

**SMALLER** *size*
:   Matches messages with a size smaller than the given *size*.

**SUBJECT** *string*
:   Matches messages, which contain *string* in the SUBJECT field of the
    message's IMAP envelope structure.

**TEXT** *string*
:   Matches messages, which contain *string* in the message headers or
    body.

**TO** *string*
:   Matches messages, which contain *string* in the TO field of the
    message's IMAP envelope structure.

**UID** *sequence-set*
:   Matches messages with the given IMAP UID(s). See the **sequence-set**
    description for details on it. For example **1:10,100:200,***
    matches the UIDs from 1 to 10, 100 to 200 and also the last mail.

**UNANSWERED**
:   Matches messages, which do not have the IMAP flag \\Answered set.

**UNDELETED**
:   Matches messages, which do not have the IMAP flag \\Deleted set.

**UNDRAFT**
:   Matches messages, which do not have the IMAP flag \\Draft set.

**UNFLAGGED**
:   Matches messages, which do not have the IMAP flag \\Flagged set.

**UNKEYWORD** *keyword*
:   Matches messages, which do not have the given IMAP *keyword* flag set

**UNSEEN**
:   Matches messages, which do not have the IMAP flag \\Seen set.

## DOVEADM SEARCH KEYS

Additional search keys, provided by [[man,doveadm]].

**SAVEDBEFORE** *date specification*
:   Matches messages, which were saved before *date specification*.

**SAVEDON** *date specification*
:   Matches messages whose save date matches the given *date
    specification*.

**SAVEDSINCE** *date specification*
:   Matches messages with a save date matching or after the given *date
    specification*.

## DATE SPECIFICATION

[[man,doveadm]] supports a few additional *date specification* formats.
They can be used anywhere, where a *date specification* value is
obligatory.

*dd-mon-yyyy*
:   Default IMAP4rev1 date format.

    Date components:
    :   *day*
        :   the day of month: **1**-**31**.

    :   *month*
        :   the abbreviated month name: **Jan**, **Feb**, **Mar**, **Apr**,
            **May**, **Jun**, **Jul**, **Aug**, **Sep**, **Oct**, **Nov**, or
            **Dec**.

    :   *year*
        :   four digits of year, e.g. **2007**.

    For example the "13th of April 2007" will be represented as **13-Apr-2007**.

*dd-mon-yyyy hh:mm:ss [+-]zzzz*
:   Default IMAP4rev1 date-time format. See *dd-mon-yyyy* above for the date
    format.

    Time format components:
    :   *hh*
        :   the hour

    :   *mm*
        :   the minute

    :   *ss*
        :   the second

    :   *[+-]zzzz*
        :   the timezone as hhmm, e.g. **+0530**, **-0700**

*interval*
:   Combination of a positive integer *number* and a *time unit*.

    Available *time units* are:
    :   **weeks**
        :   abbreviated: **w**

    :   **days**
        :   abbreviated: **d**

    :   **hours**
        :   abbreviated: **h**

    :   **mins**
        :   abbreviated: **m**

    :   **secs**
        :   abbreviated: **s**

    To match messages from last week, you may specify for example:
    **since 1w**, **since 1weeks** or **since 7days**.

*Unix timestamp*
:   A 10 digit Unix timestamp, seconds since the 1st of January 1970,
    00:00:00 UTC. For example the "13th of April 2007" will be
    represented as **1176418800**.

*YYYY-MM-DD*
:   Extended ISO-8601 calendar date format. For example the "13th of
    April 2007" will be represented as **2007-04-13**.

## SIZE

[[man,doveadm]] provides also an additional *size* representation
format. The following formats can be used anywhere, where a *size* value
is obligatory.

*octets*
:   The message size in octets, as specified in the IMAP4rev1 specification.

*size*
:   The message size in **B** (byte), **k** (kilobyte), **M**
    (megabyte), **G** (gigabyte) or **T** (terabyte).
    To match messages, bigger than 1 megabyte, you may specify for
    example: **larger 1M** or **larger 1024k**.


<!-- @include: reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
