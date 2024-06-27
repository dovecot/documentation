---
layout: doc
title: doveadm-dump
dovecotComponent: core
---

# doveadm-dump(1) - Dump the content of Dovecot's binary mailbox index/log

## SYNOPSIS

**doveadm** [*GLOBAL OPTIONS*] **dump** [**-t** *type*] *path* [ *type-specific args* ]

## DESCRIPTION

Dovecot uses several binary index and log files in order to improve
performance for accessing mails. For some mailbox formats, such as sdbox
and mdbox, the index files are part of the format itself. For details
about index files, see [](/developers/design/indexes/index_format_main).

**doveadm dump** is used to show the contents of those mailbox index/log
files, in human readable format. This is mainly useful for Dovecot
developers when debugging some problem.

<!-- @include: include/global-options.inc -->

## OPTIONS

**-t** *type*
:   the file type of the file to be dumped. If the *type* was omitted,
    [[man,doveadm]] tries to detect the type of *path*.

    *type* can be:

    :    **dbox**
         :    => m.*n* (sdbox or mdbox mailbox file)

    :    **fts-expunge-log**
         :    Dump the list of expunged mails in *dovecot-expunges.log*.

    :    **fts-flatcurve**
         :    Dump the keywords indexed in *fts-flatcurve* indexes directory
              and their frequencies.

    :    **imap-compress**
         :    Decompress an IMAP traffic log, which contains data compressed
              using the IMAP COMPRESSION extension.

    :    **dcrypt-file**
         :    Dump metadata of a dcrypt encrypted file.

             *type-specific args*
             :    **private_key**=*/path*
                  :   to decrypt file contents.
             :    **password**=*secret*
                  :   to decrypt private key.

    :    **dcrypt-key**
         :    Dump metadata of a dcrypt key.

              *type-specific args*
              :   **private_key**=*/path*
                  :   to decrypt file contents.
              :   **password**=*secret*
                  :   to decrypt private key.
              :   **dump**=*pem|dovecot|jwk*
                  :   to specify format to dump in.

    :    **index**
         :    => dovecot.index, dovecot.map.index

              *type-specific args*
              :    **uid**=*number*
                  :   Dump only message with UID

    :    **log**
         :    => dovecot.index.log, dovecot.map.index.log

    :    **mailboxlog**
         :    => dovecot.mailbox.log

    :    **thread**
         :    => dovecot.index.thread

## ARGUMENTS

*path*
:   The path to the corresponding dbox storage, index or log file. If
    only a directory is specified, doveadm tries to detect the type of
    files under it and dumps them.

## EXAMPLE

Look at the contents of a mailbox's index:

```console
$ doveadm dump ~/Maildir/.work/
```

<!-- @include: include/reporting-bugs.inc -->

## SEE ALSO

[[man,doveadm]]
